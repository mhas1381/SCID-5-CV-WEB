import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  useGetSessionQuery,
  useGetOverviewQuestionsQuery,
  useGetPatientOverviewsQuery,
  useGetOverviewDetailQuery,
  useCreateOverviewMutation,
  useCompleteOverviewMutation,
  useUpdateSessionMutation,
  interviewApi,
} from '@/store/api/interviewApi'
import { useAppDispatch } from '@/hooks/useAppStore'
import { useElapsedTime } from '@/hooks/useElapsedTime'
import { Button, Card, CardHeader, CardTitle, CardContent, PageLoader } from '@/components/ui'
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle, Clock } from 'lucide-react'
import { getErrorMessage } from '@/utils/error'
import { cn } from '@/utils/cn'
import type { OverviewSection, OverviewQuestion } from '@/types'

export function OverviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { t, i18n } = useTranslation()
  const sessionId = Number(id)
  const lang = i18n.language as 'en' | 'fa'

  const { data: session, isLoading: sessionLoading, error: sessionError } = useGetSessionQuery(sessionId)
  const { data: overviewQuestions, isLoading: questionsLoading } = useGetOverviewQuestionsQuery({ lang })
  const [createOverview, { isLoading: isSaving }] = useCreateOverviewMutation()
  const [completeOverview, { isLoading: isCompleting }] = useCompleteOverviewMutation()
  const [updateSession] = useUpdateSessionMutation()

  // Load existing incomplete overview answers on mount (for resume)
  const { data: patientOverviews } = useGetPatientOverviewsQuery(session?.patient!, {
    skip: !session?.patient,
  })
  const latestOverviewId = patientOverviews?.results
    .filter((o) => !o.is_completed)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.id
  const { data: existingOverview } = useGetOverviewDetailQuery(latestOverviewId!, {
    skip: !latestOverviewId,
  })

  // Start elapsed timer from the overview page
  const isTimerActive = session?.status !== 'completed' && session?.status !== 'abandoned'
  const { displayTime: elapsedDisplay, flush: flushElapsed } = useElapsedTime({
    sessionId,
    initialElapsed: session?.elapsed_time ?? 0,
    isActive: isTimerActive,
    onUpdate: (elapsed) => {
      updateSession({ id: sessionId, elapsed_time: elapsed })
    },
  })

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    if (m >= 60) {
      const h = Math.floor(m / 60)
      return `${h}:${String(m % 60).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }
    return `${m}:${String(s).padStart(2, '0')}`
  }

  const [answers, setAnswers] = useState<Record<string, string | boolean | number>>({})
  const [error, setError] = useState<string | null>(null)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)

  useEffect(() => {
    if (overviewQuestions) {
      const defaults: Record<string, string | boolean | number> = {}
      for (const section of overviewQuestions.sections) {
        for (const q of section.questions) {
          if (q.input_type === 'radio') defaults[q.key] = ''
          else if (q.input_type === 'number') defaults[q.key] = 0
          else defaults[q.key] = ''
        }
      }
      const saved = existingOverview?.answers || {}
      const restored: Record<string, string | boolean | number> = {}
      for (const key of Object.keys(defaults)) {
        const val = saved[key]
        restored[key] = val !== undefined && val !== null ? val : defaults[key]
      }
      setAnswers((prev) => {
        const merged = { ...restored, ...prev }
        return Object.keys(defaults).length > 0 ? merged : prev
      })
    }
  }, [overviewQuestions, existingOverview])

  const sections = overviewQuestions?.sections || []
  const currentSection = sections[currentSectionIndex]
  const isFirstSection = currentSectionIndex === 0
  const isLastSection = currentSectionIndex === sections.length - 1
  const progressPercent = sections.length > 0 ? ((currentSectionIndex + 1) / sections.length) * 100 : 0

  const handleSubmit = async () => {
    if (!session) return
    setError(null)
    try {
      await createOverview({ patientId: session.patient, data: { answers } }).unwrap()
      await completeOverview(sessionId).unwrap()
      // Refetch session data before navigating so InterviewSessionPage
      // doesn't briefly show "complete overview first" with stale data
      await dispatch(
        interviewApi.endpoints.getSession.initiate(sessionId, { forceRefetch: true })
      )
      navigate(`/interview/${sessionId}`)
    } catch (err: any) {
      setError(getErrorMessage(err, t('interview.overviewError')))
    }
  }

  const saveCurrentProgress = async () => {
    if (!session) return
    flushElapsed()
    try {
      await createOverview({ patientId: session.patient, data: { answers } }).unwrap()
    } catch {
      // Silently save progress — errors shouldn't block navigation
    }
  }

  const goNext = async () => {
    if (isLastSection) {
      handleSubmit()
    } else {
      await saveCurrentProgress()
      setCurrentSectionIndex((i) => i + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goBack = async () => {
    await saveCurrentProgress()
    setCurrentSectionIndex((i) => i - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (sessionLoading || questionsLoading) {
    return <PageLoader />
  }

  if (sessionError || !session || !overviewQuestions) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
        <p className="text-[hsl(var(--muted-foreground))]">{t('interview.sessionError')}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/interview')}>
          {t('common.back')}
        </Button>
      </div>
    )
  }

  if (!sections.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-12 w-12 text-amber-500 dark:text-amber-400 mb-4" />
        <p className="text-[hsl(var(--muted-foreground))]">
          {t('interview.noQuestionsAvailable') || 'No overview questions available. Please contact your administrator.'}
        </p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/interview')}>
          {t('common.back')}
        </Button>
      </div>
    )
  }

  const renderField = (q: OverviewQuestion) => {
    const value = answers[q.key] ?? ''
    const set = (val: string | boolean | number) => setAnswers((prev) => ({ ...prev, [q.key]: val }))

    switch (q.input_type) {
      case 'text':
        return (
          <input
            type="text"
            value={value as string}
            onChange={(e) => set(e.target.value)}
            className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
          />
        )
      case 'textarea':
        return (
          <textarea
            value={value as string}
            onChange={(e) => set(e.target.value)}
            className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm min-h-[80px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
          />
        )
      case 'number':
        return (
          <input
            type="number"
            value={value as number}
            onChange={(e) => set(Number(e.target.value))}
            className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
          />
        )
      case 'date':
        return (
          <input
            type="date"
            value={value as string}
            onChange={(e) => set(e.target.value)}
            className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
          />
        )
      case 'radio':
      case 'boolean':
      case 'select':
        return (
          <div className="space-y-2">
            {(q.choices && q.choices.length > 0 ? q.choices : [
              { value: 'yes', label_en: 'Yes', label_fa: 'بله' } as any,
              { value: 'no', label_en: 'No', label_fa: 'خیر' } as any,
            ]).map((choice: any) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => set(choice.value)}
                className={cn(
                  'w-full text-right rounded-lg border p-3 text-sm transition-all',
                  value === choice.value
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5'
                    : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]'
                )}
              >
                {choice.label_fa && lang === 'fa' ? choice.label_fa : (choice.label_en || choice.label)}
              </button>
            ))}
          </div>
        )
      default:
        return (
          <input
            type="text"
            value={value as string}
            onChange={(e) => set(e.target.value)}
            className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
          />
        )
    }
  }

  const sectionTitle = currentSection ? (lang === 'fa' && currentSection.title_fa ? currentSection.title_fa : currentSection.title) : ''

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('interview.overviewTitle')}</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            {t('interview.overviewDescription')}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/interview')}>
          <ArrowLeft className="ml-2 h-4 w-4" />
          {t('common.back')}
        </Button>
      </div>

      {/* Section stepper */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
          <span>{sectionTitle}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(elapsedDisplay)}
            </span>
            <span>{currentSectionIndex + 1} / {sections.length}</span>
          </div>
        </div>
        <div className="w-full bg-[hsl(var(--secondary))] rounded-full h-2">
          <div
            className="bg-[hsl(var(--primary))] h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center gap-0">
          {sections.map((s, i) => {
            const sTitle = lang === 'fa' && s.title_fa ? s.title_fa : s.title
            return (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentSectionIndex(i)}
                className={cn(
                  'flex-1 text-center py-1 text-[10px] font-medium transition-all border-b-2 truncate px-1',
                  i === currentSectionIndex
                    ? 'text-[hsl(var(--primary))] border-[hsl(var(--primary))]'
                    : 'text-[hsl(var(--muted-foreground))] border-transparent hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--muted-foreground))]'
                )}
              >
                {sTitle}
              </button>
            )
          })}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{sectionTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {[...(currentSection?.questions || [])]
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((q) => {
              const label = lang === 'fa' && q.text_fa ? q.text_fa : q.text
              return (
                <div key={q.key}>
                  <label className="block text-sm font-medium mb-2">
                    {label}
                    {q.required && <span className="text-red-500 dark:text-red-400 mr-1">*</span>}
                  </label>
                  {renderField(q)}
                </div>
              )
            })}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pb-8">
        <Button
          variant="outline"
          onClick={goBack}
          disabled={isFirstSection}
        >
          <ArrowRight className="ml-2 h-4 w-4" />
          {t('common.previous')}
        </Button>

        <Button
          onClick={goNext}
          isLoading={isLastSection && (isSaving || isCompleting)}
        >
          {isLastSection ? (
            <>{t('interview.overviewSubmit')} <CheckCircle className="mr-2 h-4 w-4" /></>
          ) : (
            <>{t('common.next')} <ArrowLeft className="mr-2 h-4 w-4" /></>
          )}
        </Button>
      </div>
    </div>
  )
}
