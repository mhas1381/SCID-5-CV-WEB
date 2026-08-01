import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetAdminActivityQuery } from '@/store/api/adminApi'
import { Card, CardContent, CardHeader, CardTitle, LoadingSpinner, Button } from '@/components/ui'
import {
  UserPlus, PlayCircle, CheckCircle2, BadgeCheck, MessageSquare, UserCog, Activity,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatDate } from '@/utils/date'
import type { AdminActivityEventType } from '@/types'

const PAGE_SIZE = 50

const EVENT_META: Record<
  AdminActivityEventType,
  { icon: typeof UserPlus; color: string; bg: string }
> = {
  patient_registered: { icon: UserPlus, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/50' },
  interview_started: { icon: PlayCircle, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-100 dark:bg-cyan-900/50' },
  interview_completed: { icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/50' },
  diagnosis_confirmed: { icon: BadgeCheck, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/50' },
  feedback_submitted: { icon: MessageSquare, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/50' },
  user_role_changed: { icon: UserCog, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/50' },
}

const EVENT_ORDER: AdminActivityEventType[] = [
  'patient_registered',
  'interview_started',
  'interview_completed',
  'diagnosis_confirmed',
  'feedback_submitted',
  'user_role_changed',
]

export function AdminActivityPage() {
  const { t } = useTranslation()
  const [eventType, setEventType] = useState<AdminActivityEventType | ''>('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const { data, isLoading, isFetching } = useGetAdminActivityQuery({
    event_type: eventType,
    limit: visibleCount,
    offset: 0,
  })

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const hasMore = items.length < total

  const selectType = (type: AdminActivityEventType | '') => {
    setEventType(type)
    setVisibleCount(PAGE_SIZE)
  }

  const loadMore = () => setVisibleCount((prev) => prev + PAGE_SIZE)

  if (isLoading) {
    return <LoadingSpinner size="xl" className="py-20" />
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.activity.title')}</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            {t('admin.activity.description')}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
          <Activity className="h-4 w-4" />
          {t('admin.activity.totalEvents', { count: total })}
        </div>
      </div>

      {/* Event type filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => selectType('')}
          className={cn(
            'rounded-full px-3 py-1.5 text-xs font-medium transition-colors border',
            eventType === ''
              ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-transparent'
              : 'border-[hsl(var(--input))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'
          )}
        >
          {t('admin.activity.allEvents')}
        </button>
        {EVENT_ORDER.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => selectType(type)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-colors border',
              eventType === type
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-transparent'
                : 'border-[hsl(var(--input))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'
            )}
          >
            {t(`admin.activity.types.${type}`)}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            {t('admin.activity.timeline')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))] py-10 text-center">
              {t('common.noData')}
            </p>
          ) : (
            <ol className="relative space-y-6 before:absolute before:top-2 before:bottom-2 before:start-4 before:w-px before:bg-[hsl(var(--border))]">
              {items.map((item) => {
                const meta = EVENT_META[item.event_type] ?? EVENT_META.interview_started
                const Icon = meta.icon
                return (
                  <li key={item.id} className="relative ps-12">
                    <span
                      className={cn(
                        'absolute start-0 top-0 flex h-8 w-8 items-center justify-center rounded-full',
                        meta.bg
                      )}
                    >
                      <Icon className={cn('h-4 w-4', meta.color)} />
                    </span>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-sm font-medium">{item.description}</span>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                      {item.actor && <span>{t('admin.activity.by', { name: item.actor })}</span>}
                      {item.patient && <span>{item.patient.name}</span>}
                      {item.session && (
                        <span>{t('admin.activity.sessionLabel', { id: item.session })}</span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
          )}

          {hasMore && (
            <div className="mt-6 text-center">
              <Button variant="outline" size="sm" onClick={loadMore} disabled={isFetching}>
                {isFetching
                  ? t('admin.activity.loadingMore')
                  : t('admin.activity.loadMore')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
