import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGetDiagnosticResultsQuery, useGetSessionQuery, useGetOverviewDetailQuery, useGetOverviewQuestionsQuery } from '@/store/api/interviewApi'
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { AlertCircle, ArrowLeft, CheckCircle, XCircle, AlertTriangle, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/utils/cn'

function formatCriteriaVal(val: unknown, isRtl: boolean): string {
  if (val === null || val === undefined) return '-'
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>
    const raw = String(obj.response ?? obj.value ?? JSON.stringify(val))
    if (raw === 'yes') return isRtl ? 'بله' : 'Yes'
    if (raw === 'no') return isRtl ? 'خیر' : 'No'
    return raw
  }
  const s = String(val)
  if (s === 'yes') return isRtl ? 'بله' : 'Yes'
  if (s === 'no') return isRtl ? 'خیر' : 'No'
  return s
}

function formatOverviewValue(value: unknown, question: { choices?: { value?: string; label?: string; label_en?: string; label_fa?: string }[] | null }, isRtl: boolean): string {
  if (value === null || value === undefined || value === '') return '-'
  const strVal = String(value)

  if (question.choices && question.choices.length > 0) {
    const choice = question.choices.find((c) => String(c.value) === strVal)
    if (choice) {
      if (isRtl && choice.label_fa) return choice.label_fa
      if (choice.label_en) return choice.label_en
      if (choice.label) return choice.label
    }
  }

  if (strVal === 'true') return isRtl ? 'بله' : 'Yes'
  if (strVal === 'false') return isRtl ? 'خیر' : 'No'

  return strVal
}

export function InterviewResultsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const sessionId = Number(id)
  const isRtl = i18n.language === 'fa'
  const [overviewOpen, setOverviewOpen] = useState(false)

  const { data: resultsData, isLoading, error } = useGetDiagnosticResultsQuery(sessionId)
  const { data: session } = useGetSessionQuery(sessionId)
  const overviewId = session?.overview_id
  const { data: overview } = useGetOverviewDetailQuery(overviewId!, { skip: !overviewId })
  const { data: overviewQuestions } = useGetOverviewQuestionsQuery({ lang: isRtl ? 'fa' : 'en' })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
      </div>
    )
  }

  const results = resultsData?.results || []
  const metCount = results.filter((r) => r.is_met).length

  const sectionIcons: Record<string, string> = {
    demographic: '👤',
    illness_history: '🩺',
    treatment_history: '💊',
    medical: '🏥',
    suicidal: '⚠️',
    other: '📋',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('results.title')}</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            {t('results.description')}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(`/interview/${id}/report`)} disabled>
          <AlertCircle className="ml-2 h-4 w-4" />
          {t('results.fullReport')}
        </Button>
      </div>

      {/* ---- Overview Answers Section ---- */}
      {overview && overviewQuestions && (
        <Card>
          <button
            type="button"
            onClick={() => setOverviewOpen(!overviewOpen)}
            className="w-full text-left"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="h-5 w-5 text-[hsl(var(--primary))]" />
                  {isRtl ? 'اطلاعات زمینه‌ای بیمار' : 'Patient Background Information'}
                </CardTitle>
                {overviewOpen ? (
                  <ChevronUp className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                )}
              </div>
            </CardHeader>
          </button>
          {overviewOpen && (
            <CardContent className="space-y-6">
              {overviewQuestions.sections.map((section) => {
                const sectionAnswers = section.questions.filter((q) => q.key in overview.answers && overview.answers[q.key] !== '' && overview.answers[q.key] !== null && overview.answers[q.key] !== undefined)
                if (sectionAnswers.length === 0) return null
                return (
                  <div key={section.id}>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[hsl(var(--foreground))]">
                      <span>{sectionIcons[section.id] || '📄'}</span>
                      <span>{isRtl && section.title_fa ? section.title_fa : section.title}</span>
                    </h3>
                    <div className="divide-y divide-[hsl(var(--border))] rounded-lg border border-[hsl(var(--border))]">
                      {sectionAnswers.map((q) => {
                        const answerVal = overview.answers[q.key]
                        const displayVal = formatOverviewValue(answerVal, q, isRtl)
                        const questionText = isRtl && q.text_fa ? q.text_fa : q.text
                        return (
                          <div key={q.key} className="flex items-start justify-between gap-4 px-4 py-2.5 text-sm">
                            <span className="text-[hsl(var(--muted-foreground))] flex-1">{questionText}</span>
                            <span className="font-medium text-[hsl(var(--foreground))] shrink-0 max-w-[50%] text-left" dir="ltr">{displayVal}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
              {overviewQuestions.sections.every(
                (s) => !s.questions.some((q) => q.key in overview.answers && overview.answers[q.key] !== '' && overview.answers[q.key] !== null && overview.answers[q.key] !== undefined)
              ) && (
                <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-4">
                  {isRtl ? 'اطلاعات زمینه‌ای ثبت نشده است.' : 'No background information recorded.'}
                </p>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* ---- Diagnostic Results (only for completed sessions) ---- */}
      {resultsData && results.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-[hsl(var(--muted-foreground))]">
            {t('results.noResults')}
          </CardContent>
        </Card>
      )}
      {resultsData && results.length > 0 && (
        <>
          {results.map((result) => {
            const name = isRtl && result.disorder_name_fa ? result.disorder_name_fa : result.disorder_name
            return (
              <Card key={result.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {result.is_met ? (
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400 dark:text-red-500" />
                      )}
                      {name}
                    </CardTitle>
                    <span className="text-xs text-[hsl(var(--muted-foreground))] font-mono">
                      {result.diagnosis_code}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.is_met && result.severity && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[hsl(var(--muted-foreground))]">
                        {t('results.severity')}:
                      </span>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          result.severity === 'severe'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            : result.severity === 'moderate'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        )}
                      >
                        {result.severity === 'severe'
                          ? t('results.severe')
                          : result.severity === 'moderate'
                          ? t('results.moderate')
                          : t('results.mild')}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-[hsl(var(--muted-foreground))]">
                    <span>
                      {t('results.symptomsMet')}: {result.symptoms_met_count}
                    </span>
                    {result.is_current !== undefined && (
                      <span>
                        {result.is_current ? t('results.current') : t('results.lifetime')}
                      </span>
                    )}
                  </div>

                  {result.is_met && result.criteria_details && Object.keys(result.criteria_details).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">{t('results.criteria')}:</h4>
                      <div className="space-y-1">
                        {Object.entries(result.criteria_details).map(([key, val]) => (
                          <div key={key} className="flex items-center gap-2 text-sm">
                            <span className="text-[hsl(var(--muted-foreground))]">{key}:</span>
                            <span>{formatCriteriaVal(val, isRtl)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.confirmation_status && (
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">
                      {t('results.confirmationStatus')}: {result.confirmation_status}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                {t('results.diagnosticSummary')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {t('results.diagnosisCount')}: <strong>{metCount}</strong> / {results.length}
              </p>
            </CardContent>
          </Card>
        </>
      )}

      <div className="flex gap-4 pb-8">
        <Button onClick={() => navigate('/sessions')}>
          <ArrowLeft className="ml-2 h-4 w-4" />
          {t('results.backToSessions')}
        </Button>
        <Button variant="outline" onClick={() => navigate('/interview')}>
          {t('results.newInterview')}
        </Button>
      </div>
    </div>
  )
}