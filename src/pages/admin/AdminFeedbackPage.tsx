import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetAdminFeedbackQuery } from '@/store/api/adminApi'
import { Card, CardContent, CardHeader, CardTitle, LoadingSpinner, Input, ExportButton } from '@/components/ui'
import {
  MessageSquare,
  Lightbulb,
  AlertTriangle,
  Info,
  Search,
  ClipboardList,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatDate, toPersianNum } from '@/utils/date'
import type { AdminFeedbackType, AdminFeedbackItem } from '@/types'

const TYPE_ORDER: AdminFeedbackType[] = ['suggestion', 'problem', 'general']

const TYPE_META: Record<
  AdminFeedbackType,
  { icon: typeof Lightbulb; color: string; bg: string; chip: string }
> = {
  suggestion: {
    icon: Lightbulb,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/50',
    chip: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400',
  },
  problem: {
    icon: AlertTriangle,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/50',
    chip: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400',
  },
  general: {
    icon: Info,
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-100 dark:bg-slate-800/60',
    chip: 'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300',
  },
}

export function AdminFeedbackPage() {
  const { t, i18n } = useTranslation()
  const [type, setType] = useState<AdminFeedbackType | ''>('')
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')

  const { data, isLoading, isFetching } = useGetAdminFeedbackQuery({
    feedback_type: type,
    search: appliedSearch || undefined,
  })

  const applySearch = () => setAppliedSearch(search.trim())

  const resetFilters = () => {
    setType('')
    setSearch('')
    setAppliedSearch('')
  }

  const items = data?.items ?? []
  const hasActiveFilters = type !== '' || appliedSearch !== ''

  if (isLoading) {
    return <LoadingSpinner size="xl" className="py-20" />
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-[hsl(var(--primary))]" />
            {t('admin.feedback.title')}
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            {t('admin.feedback.description')}
          </p>
        </div>
        <ExportButton url="v1/admin/export/feedback/" filename="admin-feedback.csv" />
      </div>

      {/* Type filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setType('')}
          className={cn(
            'rounded-full px-3 py-1.5 text-xs font-medium transition-colors border',
            type === ''
              ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-transparent'
              : 'border-[hsl(var(--input))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'
          )}
        >
          {t('admin.feedback.allTypes')}
        </button>
        {TYPE_ORDER.map((itemType) => {
          const meta = TYPE_META[itemType]
          return (
            <button
              key={itemType}
              type="button"
              onClick={() => setType(type === itemType ? '' : itemType)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border',
                type === itemType
                  ? cn(meta.chip, 'border-transparent')
                  : 'border-[hsl(var(--input))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'
              )}
            >
              <meta.icon className="h-3.5 w-3.5" />
              {t(`admin.feedback.types.${itemType}`)}
            </button>
          )
        })}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="min-w-0 flex-1">
              <Input
                placeholder={t('admin.feedback.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') applySearch()
                }}
                endAdornment={<Search className="h-4 w-4" />}
              />
            </div>
            <button
              type="button"
              onClick={applySearch}
              className="h-10 rounded-lg bg-[hsl(var(--primary))] px-4 text-sm font-medium text-[hsl(var(--primary-foreground))] hover:brightness-90"
            >
              {t('admin.feedback.search')}
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="h-10 rounded-lg border border-[hsl(var(--input))] px-4 text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"
              >
                {t('admin.feedback.reset')}
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Feedback list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            {t('admin.feedback.listTitle')}
            <span className="text-xs font-normal text-[hsl(var(--muted-foreground))]">
              ({toPersianNum(String(data?.total ?? 0))})
            </span>
            {isFetching && (
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                {t('admin.feedback.loadingMore')}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))] py-10 text-center">
              {hasActiveFilters
                ? t('common.noData')
                : t('admin.feedback.noFeedbackHint')}
            </p>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => {
                const meta = TYPE_META[item.feedback_type] ?? TYPE_META.general
                const Icon = meta.icon
                return (
                  <li
                    key={item.id}
                    className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4"
                  >
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                          meta.chip
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {t(`admin.feedback.types.${item.feedback_type}`)}
                      </span>
                      <span className="text-sm font-medium">{item.clinician_name}</span>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">
                        {formatDate(item.created_at)}
                      </span>
                      {item.session && (
                        <span className="inline-flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
                          <ClipboardList className="h-3.5 w-3.5" />
                          {t('admin.feedback.sessionLabel', { id: toPersianNum(String(item.session)) })}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[hsl(var(--foreground))]">
                      {item.content}
                    </p>
                    {item.diagnostic_summary &&
                      (item.diagnostic_summary.responses?.length ||
                        item.diagnostic_summary.diagnoses?.length ||
                        item.diagnostic_summary.manual_diagnoses?.length) && (
                        <FeedbackDetailsSection
                          item={item}
                          isRtl={i18n.language === 'fa'}
                          t={t}
                        />
                      )}
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

    </div>
  )
}

function formatResponseValue(
  item: AdminFeedbackItem,
  r: NonNullable<NonNullable<AdminFeedbackItem['diagnostic_summary']>['responses']>[number]
): string {
  if (r.answer_option) return r.answer_option.label_fa || r.answer_option.label || r.answer_option.value
  if (r.numeric_response !== null && r.numeric_response !== undefined) return String(r.numeric_response)
  if (r.date_response) return formatDate(r.date_response)
  if (r.text_response) return r.text_response
  return '—'
}

function FeedbackDetailsSection({
  item,
  isRtl,
  t,
}: {
  item: AdminFeedbackItem
  isRtl: boolean
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  const [open, setOpen] = useState(false)
  const summary = item.diagnostic_summary
  const diagnoses = summary?.diagnoses ?? []
  const responses = summary?.responses ?? []
  const manual = summary?.manual_diagnoses ?? []
  const totalQ = summary?.total_responses ?? responses.length
  const answered = responses.length

  return (
    <div className="mt-3 rounded-lg border border-[hsl(var(--border))]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-lg bg-[hsl(var(--secondary))] px-3 py-2 text-sm font-semibold text-[hsl(var(--muted-foreground))]"
      >
        <span className="flex items-center gap-1.5">
          <ClipboardList className="h-3.5 w-3.5" />
          {t('admin.feedback.detailsTitle')}
          <span className="rounded-full bg-[hsl(var(--primary))]/10 px-1.5 py-0.5 text-[11px] font-medium text-[hsl(var(--primary))]">
            {toPersianNum(String(totalQ))} {t('common.questions')} /{' '}
            {toPersianNum(String(diagnoses.length))} {t('admin.feedback.diagnosesLabel')}
          </span>
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {open && (
        <div className="space-y-4 p-3">
          {/* Session meta */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-[hsl(var(--muted-foreground))]">
              {t('admin.feedback.sessionLabel', {
                id: toPersianNum(String(summary?.session_id ?? item.session ?? '—')),
              })}
            </div>
            <div className="text-[hsl(var(--muted-foreground))]">
              {t('admin.feedback.attachedDiagnoses') + ':'}{' '}
              {toPersianNum(String(diagnoses.filter((d) => d.is_met).length))}
            </div>
            {summary?.selected_modules && (
              <div className="col-span-2 text-[hsl(var(--muted-foreground))]">
                {t('admin.feedback.selectedModules')}:{' '}
                {summary.selected_modules.map((m) => m).join(' · ')}
              </div>
            )}
          </div>

          {/* Diagnoses (met) */}
          {diagnoses.filter((d) => d.is_met).length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                {t('admin.feedback.attachedDiagnoses')}
              </p>
              <ul className="space-y-1.5">
                {diagnoses
                  .filter((d) => d.is_met)
                  .map((dg, idx) => (
                    <li
                      key={idx}
                      className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs"
                    >
                      <span className="rounded bg-[hsl(var(--primary))]/10 px-1.5 py-0.5 font-mono text-[11px] text-[hsl(var(--primary))]">
                        {dg.code}
                      </span>
                      <span className="font-medium">
                        {isRtl && dg.name_fa ? dg.name_fa : dg.name}
                      </span>
                      {dg.severity && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                          {t(`admin.feedback.severity.${dg.severity}`)}
                        </span>
                      )}
                      <span className="text-[hsl(var(--muted-foreground))]">
                        {t(`admin.feedback.confirmation.${dg.confirmation_status}`)}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Manual / pre-existing diagnoses */}
          {manual.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                {t('admin.feedback.manualDiagnoses')}
              </p>
              <ul className="space-y-1">
                {manual.map((m, idx) => (
                  <li key={idx} className="text-xs">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                      {m.criteria__diagnosis_code}
                    </span>{' '}
                    <span className="font-medium">
                      {isRtl && m.criteria__disorder_name_fa
                        ? m.criteria__disorder_name_fa
                        : m.criteria__disorder_name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* All responses */}
          {responses.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                {t('admin.feedback.responsesTitle')} ({toPersianNum(String(answered))})
              </p>
              <ol className="max-h-80 space-y-1.5 overflow-y-auto rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2">
                {responses.map((r, idx) => (
                  <li key={idx} className="flex items-baseline gap-2 rounded px-1.5 py-1 text-xs hover:bg-[hsl(var(--secondary))]">
                    <span className="shrink-0 font-mono text-[10px] text-[hsl(var(--muted-foreground))]">
                      {r.module}·{r.question_id}
                    </span>
                    <span className="min-w-0 flex-1 leading-snug text-[hsl(var(--foreground))]">
                      {isRtl && r.question_fa ? r.question_fa : r.question}
                    </span>
                    <span className="shrink-0 rounded bg-[hsl(var(--primary))]/10 px-1.5 py-0.5 font-medium text-[hsl(var(--primary))]">
                      {formatResponseValue(item, r)}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
