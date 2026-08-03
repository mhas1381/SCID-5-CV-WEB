import { useTranslation } from 'react-i18next'
import { useGetAdminInterviewAnalyticsQuery } from '@/store/api/adminApi'
import { Card, CardContent, CardHeader, CardTitle, LoadingSpinner, ExportButton } from '@/components/ui'
import {
  CheckCircle2, XCircle, Clock, Timer, ListChecks, ThumbsUp, BarChart3,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend,
} from 'recharts'
import { cn } from '@/utils/cn'

function formatMinutes(seconds: number): string {
  const minutes = seconds / 60
  return Number.isInteger(minutes) ? String(minutes) : minutes.toFixed(1)
}
import { toPersianNum } from '@/utils/date'

const MODULE_COLORS = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f43f5e', '#84cc16', '#a855f7', '#eab308',
]

export function AdminInterviewsPage() {
  const { t, i18n } = useTranslation()
  const isFa = i18n.language === 'fa'
  const { data, isLoading } = useGetAdminInterviewAnalyticsQuery({})

  if (isLoading) {
    return <LoadingSpinner size="xl" className="py-20" />
  }
  if (!data) return null

  const statCards = [
    {
      label: t('admin.interviews.completionRate'),
      value: `${data.completion_rate}%`,
      icon: CheckCircle2,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/50',
    },
    {
      label: t('admin.interviews.abandonmentRate'),
      value: `${data.abandonment_rate}%`,
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/50',
    },
    {
      label: t('admin.interviews.avgElapsedTime'),
      value: `${formatMinutes(data.average_elapsed_time_seconds)}`,
      icon: Timer,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/50',
    },
    {
      label: t('admin.interviews.avgResponses'),
      value: data.average_responses_per_completed,
      icon: ListChecks,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-100 dark:bg-purple-900/50',
    },
    {
      label: t('admin.interviews.confirmationRate'),
      value: `${data.confirmation_rate}%`,
      icon: ThumbsUp,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-100 dark:bg-amber-900/50',
    },
    {
      label: t('admin.interviews.inProgress'),
      value: data.in_progress,
      icon: Clock,
      color: 'text-cyan-600 dark:text-cyan-400',
      bg: 'bg-cyan-100 dark:bg-cyan-900/50',
    },
  ]

  const moduleData = data.module_usage.map((m) => ({
    code: m.code,
    name: m.code,
    label: isFa ? m.name_fa || m.name : m.name,
    sessions: m.selected_sessions,
  }))

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.interviews.title')}</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            {t('admin.interviews.description')}
          </p>
        </div>
        <ExportButton url="v1/admin/export/interviews/" filename="admin-interviews.csv" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{stat.label}</p>
                  <p className="text-xl font-bold mt-1 tabular-nums">{stat.value}</p>
                </div>
                <div className={`shrink-0 rounded-xl p-2.5 ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily trend */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.interviews.dailyTrend')}</CardTitle>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {t('admin.interviews.lastDays', { days: toPersianNum(String(data.days)) })}
            </p>
          </CardHeader>
          <CardContent>
            {data.daily_trend.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))] py-10 text-center">
                {t('common.noData')}
              </p>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.daily_trend} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                      name={t('admin.interviews.createdSessions')}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Module usage */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.interviews.moduleUsage')}</CardTitle>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {t('admin.interviews.fullInterviews', { count: data.full_interview_sessions })}
            </p>
          </CardHeader>
          <CardContent>
            {moduleData.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))] py-10 text-center">
                {t('common.noData')}
              </p>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={moduleData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="code" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      formatter={(value, _name, entry) => [
                        value,
                        entry?.payload?.label || '',
                      ]}
                    />
                    <Legend formatter={() => t('admin.interviews.selectedSessions')} />
                    <Bar dataKey="sessions" radius={[4, 4, 0, 0]}>
                      {moduleData.map((entry, idx) => (
                        <Cell key={entry.code} fill={MODULE_COLORS[idx % MODULE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status counts summary */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.interviews.statusSummary')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(['completed', 'in_progress', 'abandoned', 'not_started'] as const).map((status) => (
              <div
                key={status}
                className={cn(
                  'rounded-xl border border-[hsl(var(--border))] p-4',
                  status === 'completed' && 'bg-green-50 dark:bg-green-950/30',
                  status === 'in_progress' && 'bg-amber-50 dark:bg-amber-950/30',
                  status === 'abandoned' && 'bg-red-50 dark:bg-red-950/30',
                  status === 'not_started' && 'bg-gray-50 dark:bg-gray-900/30',
                )}
              >
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {t(`sessions.status_${status}`)}
                </p>
                <p className="text-2xl font-bold mt-1 tabular-nums">
                  {data.status_counts[status] ?? 0}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
            <BarChart3 className="h-4 w-4" />
            {t('admin.interviews.totalSessionsLabel', { count: data.total_sessions })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
