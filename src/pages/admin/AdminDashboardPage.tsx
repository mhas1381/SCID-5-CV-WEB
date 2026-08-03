import { useTranslation } from 'react-i18next'
import { useGetAdminOverviewQuery } from '@/store/api/adminApi'
import { Card, CardContent, CardHeader, CardTitle, LoadingSpinner, ExportButton } from '@/components/ui'
import {
  Users, Stethoscope, ClipboardList, CheckCircle2, XCircle, Clock,
  Gauge, Timer, Activity, ThumbsUp, MessageSquare, ShieldCheck,
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
} from 'recharts'
import { formatDate } from '@/utils/date'

const STATUS_COLORS: Record<string, string> = {
  completed: '#22c55e',
  in_progress: '#eab308',
  abandoned: '#ef4444',
  not_started: '#94a3b8',
}

export function AdminDashboardPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useGetAdminOverviewQuery()

  if (isLoading) {
    return <LoadingSpinner size="xl" className="py-20" />
  }
  if (!data) return null

  const stats = [
    { label: t('admin.overview.totalPatients'), value: data.total_patients, icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/50' },
    { label: t('admin.overview.totalClinicians'), value: data.total_clinicians, icon: Stethoscope, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-100 dark:bg-cyan-900/50' },
    { label: t('admin.overview.totalSessions'), value: data.total_sessions, icon: ClipboardList, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/50' },
    { label: t('admin.overview.completedSessions'), value: data.completed_sessions, icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/50' },
    { label: t('admin.overview.inProgressSessions'), value: data.in_progress_sessions, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/50' },
    { label: t('admin.overview.abandonedSessions'), value: data.abandoned_sessions, icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/50' },
  ]

  const pieData = [
    { name: t('sessions.status_completed'), value: data.completed_sessions, color: STATUS_COLORS.completed },
    { name: t('sessions.status_in_progress'), value: data.in_progress_sessions, color: STATUS_COLORS.in_progress },
    { name: t('sessions.status_abandoned'), value: data.abandoned_sessions, color: STATUS_COLORS.abandoned },
  ].filter((d) => d.value > 0)

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.overview.title')}</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            {t('admin.overview.description')}
          </p>
        </div>
        <ExportButton url="v1/admin/export/overview/" filename="admin-overview.csv" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{stat.label}</p>
                  <p className="text-xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`shrink-0 rounded-xl p-2.5 ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session status donut */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.overview.sessionDistribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))] py-10 text-center">
                {t('common.noData')}
              </p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance metrics */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.overview.performance')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MetricRow
              icon={Gauge}
              label={t('admin.overview.completionRate')}
              value={`${data.completion_rate}%`}
            />
            <MetricRow
              icon={Timer}
              label={t('admin.overview.avgElapsedTime')}
              value={formatMinutes(data.average_elapsed_time_seconds)}
            />
            <MetricRow
              icon={Activity}
              label={t('admin.overview.diagnosesMet')}
              value={data.diagnoses_met}
            />
            <MetricRow
              icon={ThumbsUp}
              label={t('admin.overview.confirmationRate')}
              value={`${data.confirmation_rate}%`}
            />
            <MetricRow
              icon={MessageSquare}
              label={t('admin.overview.totalFeedback')}
              value={data.total_feedback}
            />
          </CardContent>
        </Card>

        {/* Recent sessions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.overview.recentSessions')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {data.recent_sessions.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))] px-6 py-10 text-center">
                {t('common.noData')}
              </p>
            ) : (
              <ul>
                {data.recent_sessions.map((s, idx) => (
                  <li
                    key={s.id}
                    className={`flex items-center gap-3 px-4 py-3 ${idx > 0 ? 'border-t border-[hsl(var(--border))]' : ''}`}
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[s.status] || '#94a3b8' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.patient_name}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                        {s.clinician_name}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-[hsl(var(--muted-foreground))]">
                      {formatDate(s.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
        <ShieldCheck className="h-4 w-4" />
        {t('admin.overview.adminHint')}
      </div>
    </div>
  )
}

function formatMinutes(seconds: number): string {
  const minutes = seconds / 60
  return Number.isInteger(minutes)
    ? String(minutes)
    : minutes.toFixed(1)
}

function MetricRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gauge
  label: string
  value: string | number
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm">
        <Icon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
        <span className="text-[hsl(var(--muted-foreground))]">{label}</span>
      </div>
      <span className="text-sm font-semibold tabular-nums">{value}</span>
    </div>
  )
}
