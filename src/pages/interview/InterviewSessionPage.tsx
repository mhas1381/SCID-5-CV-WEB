import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  useGetSessionQuery,
  useGetModuleQuestionsQuery,
  useGetSessionProgressQuery,
  useSubmitAnswerMutation,
  useCompleteSessionMutation,
  useNavigateSessionMutation,
  useContinueSessionMutation,
  useUpdateSessionMutation,
} from '@/store/api/interviewApi'
import { useElapsedTime } from '@/hooks/useElapsedTime'
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { AlertCircle, CheckCircle, Loader2, ArrowLeft, ChevronRight, FileText, Play } from 'lucide-react'
import { cn } from '@/utils/cn'
import { getErrorMessage } from '@/utils/error'
import { toEnglishDigits } from '@/utils/string'
import type { Question, SubmitAnswerRequest, SessionResponse } from '@/types'

export function InterviewSessionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const sessionId = Number(id)
  const lang = i18n.language as 'en' | 'fa'
  const isRtl = lang === 'fa'

  const {
    data: session,
    isLoading: sessionLoading,
    error: sessionError,
  } = useGetSessionQuery(sessionId)
  const { data: progress } = useGetSessionProgressQuery(sessionId, {
    skip: !session || session.phase !== 'diagnostic',
  })

  const [currentModuleCode, setCurrentModuleCode] = useState<string | null>(null)
  const { data: moduleQuestions } = useGetModuleQuestionsQuery(currentModuleCode!, {
    skip: !currentModuleCode,
  })

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')
  const [submitAnswer, { isLoading: isSubmitting }] = useSubmitAnswerMutation()
  const [completeSession, { isLoading: isCompleting }] = useCompleteSessionMutation()
  const [navigateSession, { isLoading: isNavigating }] = useNavigateSessionMutation()
  const [continueSession, { isLoading: isContinuing }] = useContinueSessionMutation()
  const [updateSession] = useUpdateSessionMutation()
  const isTimerActive = session?.status === 'in_progress'
  const { displayTime: elapsedDisplay } = useElapsedTime({
    sessionId,
    initialElapsed: session?.elapsed_time ?? 0,
    isActive: isTimerActive,
    onUpdate: useCallback(
      (elapsed: number) => {
        updateSession({ id: sessionId, elapsed_time: elapsed })
      },
      [sessionId, updateSession],
    ),
  })
  const lastNextQidRef = useRef<string | null>(null)
  const syncedNullRef = useRef(false)

  // Build answered question history from session.responses
  const answeredOrder = useMemo(() => {
    if (!session?.responses) return [] as SessionResponse[]
    return [...session.responses].sort(
      (a, b) => new Date(a.answered_at).getTime() - new Date(b.answered_at).getTime()
    )
  }, [session?.responses])

  const answeredQuestionIds = useMemo(
    () => answeredOrder.map((r) => r.question_id_str),
    [answeredOrder]
  )

  const canGoPrev = answeredQuestionIds.length > 0

  // Load note text from existing response when question changes
  useEffect(() => {
    const existing = session?.responses?.find(
      (r) => r.question_id_str === currentQuestion?.question_id
    )
    setNoteText(existing?.text_response || '')
  }, [currentQuestion?.question_id, session?.responses])

  // Set module code from session (with fallback for corrupted sessions)
  useEffect(() => {
    if (session?.current_module_code) {
      setCurrentModuleCode(session.current_module_code)
    } else if (session?.phase === 'diagnostic') {
      if (session.current_question_id) {
        // Derive module code from question_id prefix (e.g., "A1" → "A")
        const modCode = session.current_question_id.charAt(0).toUpperCase()
        if (modCode) setCurrentModuleCode(modCode)
      } else {
        // Fallback: start from module A
        setCurrentModuleCode('A')
      }
    }
  }, [session?.current_module_code, session?.current_question_id, session?.phase])

  // Find current question when module questions load
  useEffect(() => {
    if (moduleQuestions && moduleQuestions.length > 0 && !currentQuestion) {
      // Only use these questions if they belong to the current module
      // (prevents using stale data during module transitions)
      const loadedCode = moduleQuestions[0]?.module_code
      if (loadedCode && loadedCode !== currentModuleCode) return

      // Try the session's current_question_id first
      if (session?.current_question_id) {
        const found = moduleQuestions.find(
          (q) => q.question_id === session.current_question_id
        )
        if (found) {
          setCurrentQuestion(found)
          lastNextQidRef.current = null
          return
        }
      }
      // Fallback: use next_qid from the last answer response
      if (lastNextQidRef.current) {
        const found = moduleQuestions.find(
          (q) => q.question_id === lastNextQidRef.current
        )
        if (found) {
          setCurrentQuestion(found)
          lastNextQidRef.current = null
          return
        }
      }
      // Last resort: first question in module
      setCurrentQuestion(moduleQuestions[0])
      // If backend had no current_question, sync it via navigate
      if (!session?.current_question_id && !syncedNullRef.current) {
        syncedNullRef.current = true
        navigateSession({ sessionId, question_id: moduleQuestions[0].question_id })
      }
    }
  }, [moduleQuestions, session?.current_question_id, currentModuleCode])

  const findQuestion = useCallback(
    (questionId: string) =>
      moduleQuestions?.find((q) => q.question_id === questionId) ?? null,
    [moduleQuestions]
  )

  const handleAnswer = async (body: SubmitAnswerRequest) => {
    if (!currentQuestion) return
    setLocalError(null)
    try {
      const res = await submitAnswer({ sessionId, question_id: currentQuestion.question_id, ...body }).unwrap()
      if (res.next_question) {
        const nextQid = res.next_question.question_id
        lastNextQidRef.current = nextQid
        const fullQ = findQuestion(nextQid)
        if (fullQ) {
          setCurrentQuestion(fullQ)
        } else {
          const nextModuleCode = nextQid.charAt(0)
          if (nextModuleCode && nextModuleCode !== currentModuleCode) {
            setCurrentModuleCode(nextModuleCode)
            setCurrentQuestion(null)
          }
        }
      } else if (res.session_status === 'completed') {
        navigate(`/interview/${sessionId}/results`)
      }
    } catch (err: any) {
      const msg = getErrorMessage(err, t('interview.answerError'))
      setLocalError(msg)
      toast.error(msg)
    }
  }

  const handlePrev = async () => {
    if (!canGoPrev) return
    // Navigate to the most recently answered question
    const prevId = answeredQuestionIds[answeredQuestionIds.length - 1]
    if (!prevId) return
    setLocalError(null)
    try {
      const res = await navigateSession({ sessionId, question_id: prevId }).unwrap()
      const q = res.current_question
      if (q) {
        const fullQ = findQuestion(q.question_id)
        if (fullQ) {
          setCurrentQuestion(fullQ)
        } else {
          const modCode = q.question_id.charAt(0)
          setCurrentModuleCode(modCode)
          setCurrentQuestion(null)
        }
      }
    } catch (err: any) {
      const msg = getErrorMessage(err, t('interview.answerError'))
      setLocalError(msg)
      toast.error(msg)
    }
  }

  const handleComplete = async () => {
    setLocalError(null)
    try {
      await completeSession(sessionId).unwrap()
      navigate(`/interview/${sessionId}/results`)
    } catch (err: any) {
      const msg = getErrorMessage(err, t('interview.completeError'))
      setLocalError(msg)
      toast.error(msg)
    }
  }

  const handleContinue = async () => {
    setLocalError(null)
    setCurrentQuestion(null)
    try {
      await continueSession(sessionId).unwrap()
    } catch (err: any) {
      const msg = getErrorMessage(err, t('sessions.continueError'))
      setLocalError(msg)
      toast.error(msg)
    }
  }

  // ---- Render logic ----

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
      </div>
    )
  }

  if (sessionError || !session) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
        <p className="text-[hsl(var(--muted-foreground))]">
          {t('interview.sessionError')}
        </p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/interview')}>
          {t('common.back')}
        </Button>
      </div>
    )
  }

  // Show continue prompt for completed sessions
  if (session.status === 'completed' && session.phase === 'diagnostic') {
    return (
      <div className="flex flex-col items-center justify-center py-20 max-w-md mx-auto text-center space-y-4">
        <CheckCircle className="h-12 w-12 text-green-500 dark:text-green-400" />
        <h2 className="text-lg font-semibold">{t('sessions.status_completed')}</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('interview.completedPrompt')}</p>
        <div className="flex gap-3">
          <Button onClick={handleContinue} isLoading={isContinuing}>
            <Play className="ml-2 h-4 w-4" />
            {t('sessions.continue')}
          </Button>
          <Button variant="outline" onClick={() => navigate(`/interview/${sessionId}/results`)}>
            {t('interview.viewResults')}
          </Button>
        </div>
      </div>
    )
  }

  // Phase check — redirect to overview if session isn't in diagnostic phase
  if (session.phase !== 'diagnostic') {
    return (
      <div className="flex flex-col items-center justify-center py-20 max-w-md mx-auto text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-amber-500 dark:text-amber-400" />
        <h2 className="text-lg font-semibold">
          {t('interview.notInDiagnosticPhase')}
        </h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {t('interview.completeOverviewFirst')}
        </p>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate(`/interview/${sessionId}/overview`)}
          >
            <ArrowLeft className="ml-2 h-4 w-4" />
            {t('interview.goToOverview')}
          </Button>
          <Button variant="outline" onClick={() => navigate('/interview')}>
            {t('common.back')}
          </Button>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
        <span className="mr-3 text-[hsl(var(--muted-foreground))]">
          {t('common.loading')}
        </span>
      </div>
    )
  }

  const q = currentQuestion
  const questionText = isRtl && q.text_fa ? q.text_fa : q.text
  const criteriaText =
    isRtl && q.criteria_text_fa ? q.criteria_text_fa : q.criteria_text

  // Parse criteria text into parts
  let criteriaPart = ''
  let notePart = ''
  if (criteriaText) {
    const noteMarker = isRtl ? 'نکته:' : 'Note:'
    const noteIdx = criteriaText.indexOf(noteMarker)
    if (noteIdx !== -1) {
      criteriaPart = criteriaText.slice(0, noteIdx).trim().replace(/^معیار:\s*/i, '').trim()
      notePart = criteriaText.slice(noteIdx + noteMarker.length).trim()
    } else {
      criteriaPart = criteriaText.replace(/^معیار:\s*/i, '').trim()
    }
  }

  const options = q.response_options || []
  const currentModuleName = isRtl && q.module_name_fa ? q.module_name_fa : q.module_name || ''
  const progressPercent = progress?.progress_percent ?? 0

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold leading-tight">
            {currentModuleName || `${t('interview.module')} ${currentModuleCode}`}
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {session.patient_name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium',
              session.status === 'in_progress'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                : session.status === 'completed'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
            )}
          >
            {session.status === 'in_progress'
              ? t('interview.inProgress')
              : session.status === 'completed'
              ? t('interview.completed')
              : session.status}
          </span>
          <span className="text-xs text-[hsl(var(--muted-foreground))] font-mono tabular-nums">
            {Math.floor(elapsedDisplay / 60)}:{String(elapsedDisplay % 60).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Progress */}
      {progress && (
        <div className="flex-shrink-0">
          <div className="w-full bg-[hsl(var(--secondary))] rounded-full h-2">
            <div
              className="bg-[hsl(var(--primary))] h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))] text-center mt-1">
            {progress.answered_total} / {progress.total_questions_in_module} (
            {Math.round(progressPercent)}%)
          </p>
        </div>
      )}

      {/* Error */}
      {localError && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 flex-shrink-0 dark:bg-red-950 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {localError}
        </div>
      )}

      {/* Question Card — fills remaining space */}
      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <CardHeader className="overflow-y-auto flex-1 min-h-0">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-2xl leading-relaxed whitespace-pre-line">
              {questionText}
            </CardTitle>
            <span className="shrink-0 text-xs text-[hsl(var(--muted-foreground))] font-mono">
              {q.question_id}
            </span>
          </div>
          {(criteriaPart || notePart) && (
            <div className="mt-4 flex flex-row gap-3 items-stretch">
              {criteriaPart && (
                <div className="flex-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
                  <div className="h-1 bg-[hsl(var(--primary))]" />
                  <div className="p-3">
                    <span className="text-xs font-bold text-[hsl(var(--primary))] uppercase tracking-wider">
                      {isRtl ? 'معیار' : 'Criterion'}
                    </span>
                    <p className="mt-1 text-sm text-[hsl(var(--foreground))] leading-relaxed">
                      {criteriaPart}
                    </p>
                  </div>
                </div>
              )}
              {notePart && (
                <div className="flex-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
                  <div className="h-1 bg-orange-500" />
                  <div className="p-3">
                    <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                      {isRtl ? 'نکته' : 'Note'}
                    </span>
                    <p className="mt-1 text-sm text-[hsl(var(--foreground))] leading-relaxed">
                      {notePart}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardHeader>

        <hr className="border-[hsl(var(--border))] flex-shrink-0" />

        <CardContent className="flex-shrink-0 space-y-3 pt-4">
          {q.input_type === 'radio' && options.length > 0 && (
            <>
              {options.length === 2 ? (
                <div className="flex flex-row gap-3">
                  {options.map((opt) => {
                    const label = isRtl && opt.label_fa ? opt.label_fa : opt.label
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleAnswer({ selected_option_id: opt.id, text_response: noteText || undefined })}
                        disabled={isSubmitting}
                        className="flex-1 flex flex-col items-center justify-center gap-2 rounded-xl border-2 py-10 px-4 text-lg font-semibold transition-all hover:shadow-md disabled:opacity-50 border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/5"
                      >
                        <span>{label}</span>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  {options.map((opt) => {
                    const label = isRtl && opt.label_fa ? opt.label_fa : opt.label
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleAnswer({ selected_option_id: opt.id, text_response: noteText || undefined })}
                        disabled={isSubmitting}
                        className="w-full text-right rounded-xl border-2 py-4 px-4 text-base font-semibold transition-all hover:shadow-md disabled:opacity-50 border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/5"
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              )}
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder={isRtl ? 'یادداشت روانشناس (اختیاری)' : 'Clinician note (optional)'}
                className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-4 py-3 text-sm min-h-[120px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] resize-none"
              />
            </>
          )}

          {q.input_type === 'radio' && options.length === 0 && (
            <div className="text-center py-4">
              <Button
                onClick={() => handleAnswer({ text_response: '' })}
                isLoading={isSubmitting}
              >
                {t('interview.continue')}
              </Button>
            </div>
          )}

          {(q.input_type === 'text' || q.input_type === 'textarea') && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const fd = new FormData(e.currentTarget)
                const val = fd.get('text_response') as string
                if (val.trim()) handleAnswer({ text_response: val })
              }}
              className={q.input_type === 'text' ? 'flex gap-2' : 'space-y-2'}
            >
              {q.input_type === 'text' ? (
                <input
                  name="text_response"
                  type="text"
                  className="flex-1 rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
                  placeholder={t('common.type')}
                />
              ) : (
                <textarea
                  name="text_response"
                  className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm min-h-[100px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
                  placeholder={t('common.type')}
                />
              )}
              <Button type="submit" size="sm" isLoading={isSubmitting}>
                {t('common.submit')}
              </Button>
            </form>
          )}

          {q.input_type === 'number' && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const fd = new FormData(e.currentTarget)
                const rawVal = (fd.get('numeric_response') as string) || ''
                const val = Number(toEnglishDigits(rawVal))
                if (!isNaN(val)) handleAnswer({ numeric_response: val })
              }}
              className="flex gap-2"
            >
              <input
                name="numeric_response"
                type="number"
                className="flex-1 rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
              />
              <Button type="submit" size="sm" isLoading={isSubmitting}>
                {t('common.submit')}
              </Button>
            </form>
          )}

          {q.input_type === 'date' && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const fd = new FormData(e.currentTarget)
                const val = fd.get('date_response') as string
                if (val) handleAnswer({ date_response: val })
              }}
              className="flex gap-2"
            >
              <input
                name="date_response"
                type="date"
                className="flex-1 rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
              />
              <Button type="submit" size="sm" isLoading={isSubmitting}>
                {t('common.submit')}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Bottom navigation */}
      <div className="flex justify-between items-center flex-shrink-0 pb-4 gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={handlePrev}
          disabled={!canGoPrev || isNavigating}
          isLoading={isNavigating}
        >
          <ChevronRight className="ml-2 h-5 w-5" />
          {isRtl ? 'قبلی' : 'Prev'}
        </Button>
        <Button variant="outline" size="lg" onClick={handleComplete} isLoading={isCompleting}>
          <CheckCircle className="ml-2 h-5 w-5" />
          {t('interview.complete')}
        </Button>
      </div>
    </div>
  )
}