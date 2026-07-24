import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGetDiagnosticResultsQuery } from '@/store/api/interviewApi'
import { Button, Card, CardHeader, CardTitle, CardContent, PageLoader } from '@/components/ui'
import { AlertCircle, ArrowLeft, CheckCircle, XCircle, AlertTriangle, ChevronDown, Info } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { DiagnosticResultItem, DiagnosticQuestionInfo, ModuleGroupResult } from '@/types'

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

function severityClass(severity: string | null): string {
  if (severity === 'severe') return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  if (severity === 'moderate') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
  return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
}

function getSeverityLabel(severity: string | null, t: (key: string) => string): string {
  if (severity === 'severe') return t('results.severe')
  if (severity === 'moderate') return t('results.moderate')
  return t('results.mild')
}

function QuestionNotesPopover({
  question,
  isRtl,
}: {
  question: DiagnosticQuestionInfo
  isRtl: boolean
}) {
  const [open, setOpen] = useState(false)
  const note = isRtl && question.notes_fa ? question.notes_fa : question.notes

  if (!note) return null

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        className="inline-flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className={cn(
              'absolute z-20 mt-1 w-72 p-3 rounded-lg shadow-lg backdrop-blur-md bg-black/5 dark:bg-white/5 text-xs leading-relaxed',
              isRtl ? 'left-0' : 'right-0'
            )}
          >
            {note}
          </div>
        </>
      )}
    </div>
  )
}

function DisorderCard({
  result,
  isRtl,
  t,
}: {
  result: DiagnosticResultItem
  isRtl: boolean
  t: (key: string) => string
}) {
  const [expanded, setExpanded] = useState(false)
  const name = isRtl && result.disorder_name_fa ? result.disorder_name_fa : result.disorder_name
  const questions = result.questions ?? []

  return (
    <div className="rounded-lg border border-l-4 bg-card text-card-foreground shadow-sm overflow-hidden"
      style={{ borderLeftColor: result.is_met ? 'hsl(142, 76%, 36%)' : 'hsl(var(--border))' }}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          {result.is_met ? (
            <CheckCircle className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
          ) : (
            <XCircle className="h-5 w-5 shrink-0 text-red-400 dark:text-red-500" />
          )}
          <span className="font-semibold text-sm">{name}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-[hsl(var(--muted-foreground))] font-mono">
            {result.diagnosis_code}
          </span>
          <ChevronDown className={cn(
            'h-4 w-4 transition-transform text-[hsl(var(--muted-foreground))]',
            expanded && 'rotate-180'
          )} />
        </div>
      </button>
      {expanded && (
        <div className="border-t px-4 pb-4 pt-3 space-y-3">
          {result.is_met && result.severity && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-[hsl(var(--muted-foreground))]">
                {t('results.severity')}:
              </span>
              <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', severityClass(result.severity))}>
                {getSeverityLabel(result.severity, t)}
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
              <h4 className="text-sm font-medium mb-1">{t('results.criteria')}:</h4>
              <div className="space-y-0.5">
                {Object.entries(result.criteria_details).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    <span className="text-[hsl(var(--muted-foreground))]">{key}:</span>
                    <span>{formatCriteriaVal(val, isRtl)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {questions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">{t('results.questions')}:</h4>
              <div className="space-y-1">
                {questions.map((q) => {
                  const qText = (isRtl && q.text_fa ? q.text_fa : q.text).replace(/\\n/g, '\n')
                  const criteriaText = (isRtl && q.criteria_text_fa ? q.criteria_text_fa : q.criteria_text).replace(/\\n/g, '\n')
                  const respLabel = isRtl && q.response_label_fa ? q.response_label_fa : q.response_label
                  const hasDetail = Boolean(criteriaText && qText !== criteriaText)
                  return (
                    <QuestionItem key={q.question_id} question={q} qText={qText} criteriaText={criteriaText} hasDetail={hasDetail} respLabel={respLabel} isRtl={isRtl} t={t} />
                  )
                })}
              </div>
            </div>
          )}

          {result.confirmation_status && (
            <div className="text-xs text-[hsl(var(--muted-foreground))]">
              {t('results.confirmationStatus')}: {result.confirmation_status}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function QuestionItem({
  question,
  qText,
  criteriaText,
  hasDetail,
  respLabel,
  isRtl,
  t,
}: {
  question: DiagnosticQuestionInfo
  qText: string
  criteriaText: string
  hasDetail: boolean
  respLabel: string | null
  isRtl: boolean
  t: (key: string) => string
}) {
  const [expanded, setExpanded] = useState(false)
  const displayText = (!expanded && hasDetail) ? criteriaText : qText

  return (
    <div className="flex items-start gap-2 text-sm py-0.5">
      <span className="font-mono text-xs text-[hsl(var(--muted-foreground))] shrink-0 mt-0.5">
        {question.question_id}
      </span>
      <span className="flex-1 min-w-0">
        <span className={cn(!expanded && hasDetail ? '' : 'line-clamp-2')}>{displayText}</span>
        {hasDetail && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-[hsl(var(--primary))] hover:underline mt-0.5 block"
          >
            {expanded
              ? (isRtl ? 'نمایش خلاصه' : 'Show less')
              : (isRtl ? 'نمایش کامل' : 'Show more')}
          </button>
        )}
        <span className={cn(
          'inline-block mt-0.5 text-xs font-medium',
          question.response_value === 'yes' || question.response_label === 'YES'
            ? 'text-green-600 dark:text-green-400'
            : question.response_value === 'no' || question.response_label === 'NO'
            ? 'text-red-500 dark:text-red-400'
            : 'text-[hsl(var(--muted-foreground))]'
        )}>
          {respLabel || question.response_value || t('results.noResponse')}
        </span>
        {question.text_response && (
          <span className="block mt-1 text-xs text-[hsl(var(--muted-foreground))] italic border-l-2 border-[hsl(var(--border))] pl-2">
            {question.text_response}
          </span>
        )}
      </span>
      <QuestionNotesPopover question={question} isRtl={isRtl} />
    </div>
  )
}

function ModuleAccordion({
  module,
  isRtl,
  t,
}: {
  module: ModuleGroupResult
  isRtl: boolean
  t: (key: string) => string
}) {
  const hasMet = module.results.some((r) => r.is_met)
  const metCount = module.results.filter((r) => r.is_met).length
  const modName = isRtl && module.module_name_fa ? module.module_name_fa : module.module_name

  return (
    <details
      className="group rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden"
    >
      <summary className="flex items-center justify-between p-4 cursor-pointer list-none hover:bg-accent/50 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-0 -rotate-90 text-[hsl(var(--muted-foreground))]" />
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-sm font-bold shrink-0">
            {module.module_code}
          </span>
          <span className="font-semibold">{modName}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {hasMet && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              <CheckCircle className="h-3 w-3" />
              {metCount} {t('results.diagnoses')}
            </span>
          )}
          {!hasMet && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
              <XCircle className="h-3 w-3" />
              {t('results.ruledOut')}
            </span>
          )}
        </div>
      </summary>
      <div className="border-t px-4 pb-4 pt-3 space-y-3">
        {module.results.map((result) => (
          <DisorderCard key={result.id} result={result} isRtl={isRtl} t={t} />
        ))}
      </div>
    </details>
  )
}

export function InterviewResultsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const sessionId = Number(id)
  const isRtl = i18n.language === 'fa'

  const { data: resultsData, isLoading } = useGetDiagnosticResultsQuery(sessionId)

  if (isLoading) {
    return <PageLoader />
  }

  const modules = resultsData?.modules || []
  const allResults = modules.flatMap((m) => m.results)
  const metCount = allResults.filter((r) => r.is_met).length

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

      {resultsData && modules.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-[hsl(var(--muted-foreground))]">
            {t('results.noResults')}
          </CardContent>
        </Card>
      )}

      {resultsData && modules.length > 0 && (
        <>
          <div className="space-y-3">
            {modules.map((mod) => (
              <ModuleAccordion key={mod.module_code} module={mod} isRtl={isRtl} t={t} />
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                {t('results.diagnosticSummary')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {t('results.diagnosisCount')}: <strong>{metCount}</strong> / {allResults.length}
              </p>
            </CardContent>
          </Card>
        </>
      )}

      <div className="flex gap-4 pb-8">
        <Button onClick={() => navigate('/sessions')}>
          <ArrowLeft className={cn('h-4 w-4', isRtl ? 'ml-2' : 'mr-2')} />
          {t('results.backToSessions')}
        </Button>
        <Button variant="outline" onClick={() => navigate('/interview')}>
          {t('results.newInterview')}
        </Button>
      </div>
    </div>
  )
}