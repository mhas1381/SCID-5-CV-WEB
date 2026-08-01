import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetAdminFeedbackQuery } from '@/store/api/adminApi'
import { Card, CardContent, CardHeader, CardTitle, LoadingSpinner, Input, ExportButton } from '@/components/ui'
import { MessageSquare, Lightbulb, AlertTriangle, Info, Search, ClipboardList } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatDate, toPersianNum } from '@/utils/date'
import type { AdminFeedbackType } from '@/types'

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
  const { t } = useTranslation()
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
