import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  useGetSessionQuery,
  useGetModuleQuestionsQuery,
  useGetSessionProgressQuery,
  useSubmitAnswerMutation,
  useCompleteSessionMutation,
} from '@/store/api/interviewApi'
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react'
import { cn } from '@/utils/cn'
import { getErrorMessage } from '@/utils/error'
import type { Question, SubmitAnswerRequest } from '@/types'

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
  const [submitAnswer, { isLoading: isSubmitting }] = useSubmitAnswerMutation()
  const [completeSession, { isLoading: isCompleting }] = useCompleteSessionMutation()
  const lastNextQidRef = useRef<string | null>(null)

  // Set module code from session
  useEffect(() => {
    if (session?.current_module_code) {
      setCurrentModuleCode(session.current_module_code)
    }
  }, [session?.current_module_code])

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
      const res = await submitAnswer({ sessionId, ...body }).unwrap()
      if (res.next_question) {
        const nextQid = res.next_question.question_id
        lastNextQidRef.current = nextQid
        const fullQ = findQuestion(nextQid)
        if (fullQ) {
          setCurrentQuestion(fullQ)
        } else {
          // Different module — extract module code from question_id prefix (e.g. "A1" → "A", "C_intro" → "C")
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
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-[hsl(var(--muted-foreground))]">
          {t('interview.sessionError')}
        </p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/interview')}>
          {t('common.back')}
        </Button>
      </div>
    )
  }

  // Phase check — redirect to overview if session isn't in diagnostic phase
  if (session.phase !== 'diagnostic') {
    return (
      <div className="flex flex-col items-center justify-center py-20 max-w-md mx-auto text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-amber-500" />
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
  const options = q.response_options || []
  const currentModuleName = isRtl && q.module_name_fa ? q.module_name_fa : q.module_name || ''
  const progressPercent = progress?.progress_percent ?? 0

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold leading-tight">
            {currentModuleName || `${t('interview.module')} ${currentModuleCode}`}
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {session.patient_name}
          </p>
        </div>
        <span
          className={cn(
            'px-3 py-1 rounded-full text-xs font-medium',
            session.status === 'in_progress'
              ? 'bg-yellow-100 text-yellow-800'
              : session.status === 'completed'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          )}
        >
          {session.status === 'in_progress'
            ? t('interview.inProgress')
            : session.status === 'completed'
            ? t('interview.completed')
            : session.status}
        </span>
      </div>

      {/* Progress */}
      {progress && (
        <>
          <div className="w-full bg-[hsl(var(--secondary))] rounded-full h-2">
            <div
              className="bg-[hsl(var(--primary))] h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">
            {progress.answered_total} / {progress.total_questions_in_module} (
            {Math.round(progressPercent)}%)
          </p>
        </>
      )}

      {/* Error */}
      {localError && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {localError}
        </div>
      )}

      {/* Question */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg leading-relaxed whitespace-pre-line">
              {questionText}
            </CardTitle>
            <span className="shrink-0 text-xs text-[hsl(var(--muted-foreground))] font-mono">
              {q.question_id}
            </span>
          </div>
          {criteriaText && (
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2 italic">
              {t('interview.criteria')}: {criteriaText}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {q.input_type === 'radio' && options.length > 0 && (
            <div className="space-y-2">
              {options.map((opt) => {
                const label = isRtl && opt.label_fa ? opt.label_fa : opt.label
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleAnswer({ selected_option_id: opt.id })}
                    disabled={isSubmitting}
                    className="w-full text-right rounded-lg border p-3 text-sm transition-all hover:shadow-sm disabled:opacity-50 border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]"
                  >
                    {label}
                  </button>
                )
              })}
            </div>
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
                const val = Number(fd.get('numeric_response'))
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

      <div className="flex justify-center pb-8">
        <Button variant="outline" onClick={handleComplete} isLoading={isCompleting}>
          <CheckCircle className="ml-2 h-4 w-4" />
          {t('interview.complete')}
        </Button>
      </div>
    </div>
  )
}