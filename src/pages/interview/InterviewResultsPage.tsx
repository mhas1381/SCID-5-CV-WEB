import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  useGetSessionQuery,
  useGetDiagnosticResultsQuery,
  useConfirmDiagnosticResultMutation,
  useConfirmAllDiagnosticResultsMutation,
  useSubmitSystemFeedbackMutation,
} from '@/store/api/interviewApi'
import { Button, Card, CardHeader, CardTitle, CardContent, PageLoader } from '@/components/ui'
import {
  ArrowLeft,
  Check,
  X,
  CheckCircle,
  XCircle,
  ChevronDown,
  Info,
  User,
  FileText,
  Download,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatDate } from '@/utils/date'
import { downloadSessionPdf } from '@/utils/download'
import { getErrorMessage } from '@/utils/error'
import type { DiagnosticResultItem, DiagnosticQuestionInfo, ModuleGroupResult, AgreementData } from '@/types'

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

function getConfirmationLabel(
  status: string | null,
  t: (key: string) => string,
  isRtl: boolean
): string {
  if (!status) return ''
  const map: Record<string, string> = {
    CONFIRMED: isRtl ? 'تأیید شده' : 'Confirmed',
    PROVISIONAL: isRtl ? 'احتمالی' : 'Provisional',
    RULED_OUT: isRtl ? 'رد شده' : 'Ruled out',
  }
  return map[status] ?? status
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
  onConfirm,
  isConfirming,
}: {
  result: DiagnosticResultItem
  isRtl: boolean
  t: (key: string) => string
  onConfirm: (result: DiagnosticResultItem, action: 'confirm' | 'unconfirm' | 'disagree') => void
  isConfirming: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const name = isRtl && result.disorder_name_fa ? result.disorder_name_fa : result.disorder_name
  const questions = result.questions ?? []

  return (
    <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl shadow-[var(--glass-shadow)] border-l-4 overflow-hidden"
      style={{ borderLeftColor: result.is_met ? 'hsl(142, 76%, 36%)' : 'hsl(var(--border))' }}>
      <div className="w-full flex flex-wrap items-center gap-2 px-4 py-3 hover:bg-accent/50 transition-colors">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 shrink-0"
        >
          {result.is_met ? (
            <CheckCircle className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
          ) : (
            <XCircle className="h-5 w-5 shrink-0 text-red-400 dark:text-red-500" />
          )}
        </button>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onConfirm(result, result.clinician_confirmed ? 'unconfirm' : 'confirm')
            }}
            disabled={isConfirming}
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
              result.clinician_confirmed
                ? 'border-green-500/50 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : 'border-[var(--glass-border)] text-[hsl(var(--muted-foreground))] hover:border-green-500/50 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900 dark:hover:text-green-300'
            )}
          >
            <Check className="h-3.5 w-3.5" />
            {result.clinician_confirmed ? t('results.approveActive') : t('results.approve')}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onConfirm(result, result.clinician_disagreed ? 'unconfirm' : 'disagree')
            }}
            disabled={isConfirming}
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
              result.clinician_disagreed
                ? 'border-red-500/50 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                : 'border-[var(--glass-border)] text-[hsl(var(--muted-foreground))] hover:border-red-500/50 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900 dark:hover:text-red-300'
            )}
          >
            <X className="h-3.5 w-3.5" />
            {result.clinician_disagreed ? t('results.rejectActive') : t('results.reject')}
          </button>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 min-w-0 text-left flex-1"
        >
          <span className="font-semibold text-sm">{name}</span>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-[hsl(var(--muted-foreground))] font-mono">
            {result.diagnosis_code}
          </span>
          <ChevronDown className={cn(
            'h-4 w-4 transition-transform text-[hsl(var(--muted-foreground))]',
            expanded && 'rotate-180'
          )} />
        </div>
      </div>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(result.criteria_details).map(([key, val]) => {
                  const raw = typeof val === 'object' ? String((val as Record<string, unknown>).response ?? (val as Record<string, unknown>).value ?? '') : String(val)
                  const isYes = raw === 'yes' || raw === 'true'
                  const isNo = raw === 'no' || raw === 'false'
                  return (
                    <div key={key} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/30 border">
                      <span className={cn('h-2.5 w-2.5 rounded-full shrink-0', isYes ? 'bg-green-500' : isNo ? 'bg-red-400' : 'bg-muted-foreground/30')} />
                      <span className="text-[hsl(var(--muted-foreground))] shrink-0">{key}:</span>
                      <span>{formatCriteriaVal(val, isRtl)}</span>
                    </div>
                  )
                })}
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
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                {t('results.confirmationStatus')}: {getConfirmationLabel(result.confirmation_status, t, isRtl)}
              </span>
              {result.clinician_confirmed && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  <CheckCircle className="h-3 w-3" />
                  {t('results.confirmed')}
                </span>
              )}
              {result.clinician_disagreed && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                  <XCircle className="h-3 w-3" />
                  {t('results.disagreed')}
                </span>
              )}
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
    <div className="flex items-start gap-2 text-sm p-3 rounded-lg bg-muted/50 border">
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
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-0.5',
          question.response_value === 'yes' || question.response_label === 'YES'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
            : question.response_value === 'no' || question.response_label === 'NO'
            ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
            : 'bg-muted text-[hsl(var(--muted-foreground))]'
        )}>
          {respLabel || question.response_value || t('results.noResponse')}
        </span>
        {question.text_response && (
          <span className="block mt-1.5 text-xs text-[hsl(var(--muted-foreground))] italic bg-muted/30 rounded px-2 py-1">
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
  onConfirm,
  confirmingResultId,
}: {
  module: ModuleGroupResult
  isRtl: boolean
  t: (key: string) => string
  onConfirm: (result: DiagnosticResultItem, action: 'confirm' | 'unconfirm' | 'disagree') => void
  confirmingResultId: number | null
}) {
  const hasMet = module.results.some((r) => r.is_met)
  const metCount = module.results.filter((r) => r.is_met).length
  const modName = isRtl && module.module_name_fa ? module.module_name_fa : module.module_name

  return (
    <details
      className="group rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl shadow-[var(--glass-shadow)] overflow-hidden"
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
          <DisorderCard
            key={result.id}
            result={result}
            isRtl={isRtl}
            t={t}
            onConfirm={onConfirm}
            isConfirming={confirmingResultId === result.id}
          />
        ))}
      </div>
    </details>
  )
}

function getCategoryLabel(
  category: string,
  t: (key: string) => string,
  isRtl: boolean
): string {
  const map: Record<string, string> = {
    true_positive: t('results.truePositive'),
    true_negative: t('results.trueNegative'),
    false_positive: t('results.falsePositive'),
    false_negative: t('results.falseNegative'),
  }
  const label = map[category] ?? category
  const match = category === 'true_positive' || category === 'true_negative'
  return isRtl
    ? `${label} (${match ? '✓ مطابق' : '✗ نامطابق'})`
    : `${label} (${match ? '✓ match' : '✗ mismatch'})`
}

function ValidityCard({
  agreement,
  isRtl,
  t,
}: {
  agreement: AgreementData
  isRtl: boolean
  t: (key: string) => string
}) {
  const percent = agreement.agreement_percent
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const barColor =
    percent === null || percent === undefined
      ? 'bg-[hsl(var(--muted))]'
      : percent >= 75
        ? 'bg-green-500'
        : percent >= 50
          ? 'bg-yellow-500'
          : 'bg-red-500'

  const categories = [
    { key: 'true_positive', count: agreement.true_positive },
    { key: 'true_negative', count: agreement.true_negative },
    { key: 'false_positive', count: agreement.false_positive },
    { key: 'false_negative', count: agreement.false_negative },
  ]

  const itemsByCategory = (key: string) =>
    agreement.items.filter((item) => item.category === key)

  const toggleCategory = (key: string) =>
    setOpenCategory((cur) => (cur === key ? null : key))

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[hsl(var(--primary))]" />
            {t('results.validity')}
          </CardTitle>
          {percent !== null && percent !== undefined && (
            <span className={cn(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold',
              percent >= 75
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : percent >= 50
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            )}>
              {percent}%
            </span>
          )}
        </div>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {t('results.validityDescription')}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {percent !== null && percent !== undefined ? (
          <>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${percent}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {categories.map(({ key, count }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleCategory(key)}
                  disabled={count === 0}
                  className={cn(
                    'rounded-lg border p-3 text-center transition-colors',
                    openCategory === key
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5'
                      : 'hover:bg-accent/50',
                    count === 0 && 'opacity-50'
                  )}
                >
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {getCategoryLabel(key, t, isRtl)}
                  </p>
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {t('results.agreementTotal')}: 0
          </p>
        )}

        {openCategory && itemsByCategory(openCategory).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">{getCategoryLabel(openCategory, t, isRtl)}</h4>
            {itemsByCategory(openCategory).map((item) => {
              const name = isRtl && item.disorder_name_fa ? item.disorder_name_fa : item.disorder_name
              const isMatch = item.category === 'true_positive' || item.category === 'true_negative'
              return (
                <div
                  key={item.criteria_id}
                  className={cn(
                    'flex items-center justify-between gap-2 rounded-lg border p-3 text-sm',
                    isMatch ? 'border-green-500/40 bg-green-50/60 dark:bg-green-950/20' : 'border-red-500/40 bg-red-50/60 dark:bg-red-950/20'
                  )}
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{name}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] font-mono">
                      {item.diagnosis_code}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-xs">
                    <span className={cn('inline-flex items-center gap-1', item.preexisting ? 'text-green-600 dark:text-green-400' : 'text-[hsl(var(--muted-foreground))]')}>
                      {isRtl ? 'دستی: ' : 'Manual: '}
                      {item.preexisting ? '✓' : '✗'}
                    </span>
                    <span className={cn('inline-flex items-center gap-1', item.system_met ? 'text-green-600 dark:text-green-400' : 'text-[hsl(var(--muted-foreground))]')}>
                      {isRtl ? 'سامانه: ' : 'System: '}
                      {item.system_met ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {agreement.items.length > 0 && (
          <button
            type="button"
            onClick={() => setOpenCategory(openCategory === 'all' ? null : 'all')}
            className="text-xs text-[hsl(var(--primary))] hover:underline"
          >
            {openCategory === 'all'
              ? t('results.hideAllItems')
              : `${t('results.agreementItems')} (${agreement.items.length})`}
          </button>
        )}
        {openCategory === 'all' &&
          agreement.items
            .filter((item) => item.category !== null)
            .map((item) => {
              const name = isRtl && item.disorder_name_fa ? item.disorder_name_fa : item.disorder_name
              const isMatch = item.category === 'true_positive' || item.category === 'true_negative'
              return (
                <div
                  key={item.criteria_id}
                  className={cn(
                    'flex items-center justify-between gap-2 rounded-lg border p-3 text-sm',
                    isMatch ? 'border-green-500/40 bg-green-50/60 dark:bg-green-950/20' : 'border-red-500/40 bg-red-50/60 dark:bg-red-950/20'
                  )}
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{name}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] font-mono">
                      {item.diagnosis_code}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-xs">
                    <span className={cn('inline-flex items-center gap-1', item.preexisting ? 'text-green-600 dark:text-green-400' : 'text-[hsl(var(--muted-foreground))]')}>
                      {isRtl ? 'دستی: ' : 'Manual: '}
                      {item.preexisting ? '✓' : '✗'}
                    </span>
                    <span className={cn('inline-flex items-center gap-1', item.system_met ? 'text-green-600 dark:text-green-400' : 'text-[hsl(var(--muted-foreground))]')}>
                      {isRtl ? 'سامانه: ' : 'System: '}
                      {item.system_met ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              )
            })}
      </CardContent>
    </Card>
  )
}

function FeedbackCard({
  sessionId,
  t,
}: {
  sessionId: number
  t: (key: string) => string
}) {
  const [content, setContent] = useState('')
  const [submitFeedback, { isLoading }] = useSubmitSystemFeedbackMutation()

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error(t('results.feedbackEmpty'))
      return
    }
    try {
      await submitFeedback({ content, session_id: sessionId, feedback_type: 'general' }).unwrap()
      toast.success(t('results.feedbackSuccess'))
      setContent('')
    } catch (err) {
      toast.error(getErrorMessage(err, t('results.feedbackError')))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[hsl(var(--primary))]" />
          {t('results.feedback')}
        </CardTitle>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {t('results.feedbackDescription')}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('results.feedbackPlaceholder')}
          rows={4}
          className="w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-4 py-3 text-sm text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] resize-none"
        />
        <div className="flex justify-end">
          <Button onClick={handleSubmit} isLoading={isLoading} disabled={!content.trim()}>
            {t('results.feedbackSubmit')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function InterviewResultsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const sessionId = Number(id)
  const isRtl = i18n.language === 'fa'

  const { data: resultsData, isLoading } = useGetDiagnosticResultsQuery(sessionId)
  const { data: session } = useGetSessionQuery(sessionId)
  const [isDownloading, setIsDownloading] = useState(false)
  const [confirmingResultId, setConfirmingResultId] = useState<number | null>(null)
  const [confirmDiagnosticResult] = useConfirmDiagnosticResultMutation()
  const [confirmAllDiagnosticResults, { isLoading: isConfirmingAll }] = useConfirmAllDiagnosticResultsMutation()
  const [confirmAllOpen, setConfirmAllOpen] = useState(false)

  const handleConfirm = async (result: DiagnosticResultItem, action: 'confirm' | 'unconfirm' | 'disagree') => {
    if (confirmingResultId !== null) return
    setConfirmingResultId(result.id)
    try {
      await confirmDiagnosticResult({ sessionId, resultId: result.id, action }).unwrap()
      toast.success(
        action === 'confirm'
          ? t('results.confirmSuccess')
          : action === 'disagree'
            ? t('results.disagreeSuccess')
            : t('results.unconfirmSuccess')
      )
    } catch (err) {
      toast.error(getErrorMessage(err, t('results.confirmError')))
    } finally {
      setConfirmingResultId(null)
    }
  }

  const handleConfirmAll = async () => {
    if (isConfirmingAll) return
    try {
      await confirmAllDiagnosticResults(sessionId).unwrap()
      toast.success(t('results.confirmAllSuccess'))
      setConfirmAllOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err, t('results.confirmError')))
    }
  }

  if (isLoading) {
    return <PageLoader />
  }

  const modules = resultsData?.modules || []
  const moduleCodes = session?.selected_module_codes || []

  const handleDownloadPdf = async () => {
    if (isDownloading) return
    setIsDownloading(true)
    try {
      await downloadSessionPdf(sessionId, `SCID5_Report_${sessionId}.pdf`)
    } catch (err: any) {
      toast.error(getErrorMessage(err, t('results.downloadError')))
    } finally {
      setIsDownloading(false)
    }
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
        <div className="flex flex-wrap items-center gap-2">
          {resultsData && modules.length > 0 && (
            <>
              {confirmAllOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setConfirmAllOpen(false)}>
                  <div className="relative w-full max-w-sm rounded-xl bg-[var(--glass-bg)] backdrop-blur-xl p-5 shadow-[var(--glass-shadow)] border border-[var(--glass-border)]" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-base font-semibold">{t('results.confirmAllConfirm')}</h3>
                    <div className="mt-4 flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setConfirmAllOpen(false)}>
                        {t('common.cancel')}
                      </Button>
                      <Button onClick={handleConfirmAll} isLoading={isConfirmingAll}>
                        {t('results.confirmAll')}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              <Button onClick={() => setConfirmAllOpen(true)} isLoading={isConfirmingAll} disabled={isConfirmingAll}>
                <ShieldCheck className="ms-1 h-4 w-4" />
                {t('results.confirmAll')}
              </Button>
            </>
          )}
          <Button onClick={handleDownloadPdf} isLoading={isDownloading} disabled={!session}>
            <Download className="ms-1 h-4 w-4" />
            {t('results.downloadReport')}
          </Button>
        </div>
      </div>

      {session && (
        <Card>
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
                  <User className="h-7 w-7" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {t('results.patient')}
                  </p>
                  <h2 className="text-xl font-bold leading-tight break-words">
                    {session.patient_name || '—'}
                  </h2>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    {t('results.clinician')}: {session.clinician_name || '—'}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/interview/${id}/background`)}
                >
                  <FileText className="ms-1 h-4 w-4" />
                  {t('results.viewOverview')}
                </Button>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t border-[hsl(var(--border))] pt-3 text-xs text-[hsl(var(--muted-foreground))]">
              <span>
                {t('results.sessionId')}: #{session.id}
              </span>
              {session.started_at && (
                <span>
                  {t('results.sessionDate')}: {formatDate(session.started_at)}
                </span>
              )}
              {moduleCodes.length > 0 && (
                <span>
                  {t('results.modules')}: {moduleCodes.join('، ')}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
              <ModuleAccordion
                key={mod.module_code}
                module={mod}
                isRtl={isRtl}
                t={t}
                onConfirm={handleConfirm}
                confirmingResultId={confirmingResultId}
              />
            ))}
          </div>

          {resultsData.has_preexisting_diagnosis && resultsData.agreement && (
            <ValidityCard agreement={resultsData.agreement} isRtl={isRtl} t={t} />
          )}

          <FeedbackCard sessionId={sessionId} t={t} />
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