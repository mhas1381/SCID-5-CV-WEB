import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetAdminActivityQuery } from '@/store/api/adminApi'
import { useActivityStream } from '@/hooks/useActivityStream'
import { Card, CardContent, CardHeader, CardTitle, LoadingSpinner, Button } from '@/components/ui'
import {
  UserPlus, PlayCircle, CheckCircle2, BadgeCheck, MessageSquare, UserCog, Activity, Radio, LogOut,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatDateTime } from '@/utils/date'
import type { AdminActivityEventType, AdminActivityItem } from '@/types'
import type { TFunction } from 'i18next'

const PAGE_SIZE = 50

function describeActivity(t: TFunction, item: AdminActivityItem, isFa: boolean): string {
  const base = `admin.activity.desc.${item.event_type}`
  const meta = item.metadata ?? {}
  switch (item.event_type) {
    case 'patient_registered':
    case 'interview_started':
    case 'interview_abandoned':
    case 'interview_completed': {
      if (!item.patient?.name) return item.description
      return t(base, { name: item.patient.name })
    }
    case 'diagnosis_confirmed': {
      const name = isFa ? meta.disorder_name_fa : meta.disorder_name
      if (!name) return item.description
      return t(base, { name })
    }
    case 'user_role_changed': {
      if (!meta.user_name || !meta.old_role || !meta.new_role) return item.description
      return t(base, {
        name: meta.user_name,
        old: t(`admin.users.role_${meta.old_role}`),
        new: t(`admin.users.role_${meta.new_role}`),
      })
    }
    default:
      return t(base)
  }
}

const EVENT_META: Record<
  AdminActivityEventType,
  { icon: typeof UserPlus; color: string; bg: string }
> = {
  patient_registered: { icon: UserPlus, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/50' },
  interview_started: { icon: PlayCircle, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-100 dark:bg-cyan-900/50' },
  interview_abandoned: { icon: LogOut, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/50' },
  interview_completed: { icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/50' },
  diagnosis_confirmed: { icon: BadgeCheck, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/50' },
  feedback_submitted: { icon: MessageSquare, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/50' },
  user_role_changed: { icon: UserCog, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/50' },
}

const EVENT_ORDER: AdminActivityEventType[] = [
  'patient_registered',
  'interview_started',
  'interview_abandoned',
  'interview_completed',
  'diagnosis_confirmed',
  'feedback_submitted',
  'user_role_changed',
]

export function AdminActivityPage() {
  const { t, i18n } = useTranslation()
  const isFa = i18n.language === 'fa'
  const [eventType, setEventType] = useState<AdminActivityEventType | ''>('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const { data, isLoading, isFetching } = useGetAdminActivityQuery({
    event_type: eventType,
    limit: visibleCount,
    offset: 0,
  })

  // Live SSE stream: prepends new events as they happen.
  const fetchedItems = data?.items ?? []
  const newestFetchedId = fetchedItems[0]?.id ?? null
  const { isLive, pendingEvents, clearPending } = useActivityStream(newestFetchedId)

  const items = [...pendingEvents, ...fetchedItems].filter(
    (item, index, all) => all.findIndex((other) => other.id === item.id) === index
  )

  // Live events can be of any type; apply the client-side filter so the
  // timeline matches the selected chip.
  const visibleItems = eventType ? items.filter((item) => item.event_type === eventType) : items
  const total = Math.max(data?.total ?? 0, visibleItems.length)
  const hasMore = fetchedItems.length < (data?.total ?? 0)

  const selectType = (type: AdminActivityEventType | '') => {
    setEventType(type)
    setVisibleCount(PAGE_SIZE)
    clearPending()
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
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
              isLive
                ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
            )}
            title={isLive ? t('admin.activity.liveActive') : t('admin.activity.liveInactive')}
          >
            <Radio className={cn('h-3.5 w-3.5', isLive && 'animate-pulse')} />
            {isLive ? t('admin.activity.liveActive') : t('admin.activity.liveInactive')}
          </span>
          <span className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
            <Activity className="h-4 w-4" />
            {t('admin.activity.totalEvents', { count: total })}
          </span>
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
          {visibleItems.length === 0 ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))] py-10 text-center">
              {t('common.noData')}
            </p>
          ) : (
            <ol className="relative space-y-6 before:absolute before:top-2 before:bottom-2 before:start-4 before:w-px before:bg-[hsl(var(--border))]">
              {visibleItems.map((item) => {
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
                      <span className="text-sm font-medium">{describeActivity(t, item, isFa)}</span>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">
                        {formatDateTime(item.created_at)}
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
