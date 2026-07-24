import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useGetMeQuery } from '@/store/api/authApi'
import { useGetDashboardSummaryQuery } from '@/store/api/dashboardApi'
import { Card, CardHeader, CardTitle, CardContent, LoadingSpinner } from '@/components/ui'
import { Button } from '@/components/ui'
import { Users, ClipboardList, Activity, CalendarDays, ChevronRight, User, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { formatDate } from '@/utils/date'

export function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: user, isLoading: userLoading } = useGetMeQuery()
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummaryQuery()

  const statCards = [
    { label: t('dashboard.totalPatients'), value: summary?.total_patients, icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/50' },
    { label: t('dashboard.recentSessionsCount'), value: summary?.recent_sessions_count, icon: ClipboardList, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/50' },
    { label: t('dashboard.completedSessions'), value: summary?.completed_sessions, icon: Activity, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/50' },
    { label: t('dashboard.totalSessions'), value: summary?.total_sessions, icon: CalendarDays, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/50' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          {userLoading
            ? t('common.loading')
            : `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || t('nav.dashboard')}
        </h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          {t('dashboard.description')}
        </p>
      </div>

      {summaryLoading ? (
        <LoadingSpinner size="xl" className="py-10" />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value ?? '—'}</p>
                    </div>
                    <div className={`rounded-xl p-3 ${stat.bg}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t('dashboard.recentPatients')}</CardTitle>
                <Users className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
              </CardHeader>
              <CardContent className="p-0">
                {summary?.recent_patients?.length ? (
                  <ul>
                    {summary.recent_patients.map((p, idx) => (
                      <li
                        key={p.id}
                        className={`flex items-center gap-3 px-6 py-3.5 transition-colors hover:bg-[hsl(var(--muted))/50] cursor-pointer ${idx > 0 ? 'border-t border-[hsl(var(--border))]' : ''}`}
                        onClick={() => navigate(`/patients/${p.id}/edit`)}>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))/10] text-[hsl(var(--primary))]">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{p.first_name} {p.last_name}</p>
                        </div>
                        <span className="shrink-0 text-xs text-[hsl(var(--muted-foreground))]">{formatDate(p.created_at)}</span>
                        <ChevronRight className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-6 py-8 text-center">
                    <User className="mx-auto h-8 w-8 text-[hsl(var(--muted-foreground))] mb-2" />
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('common.noData')}</p>
                  </div>
                )}
                <div className="border-t border-[hsl(var(--border))] px-6 py-3">
                  <Button variant="outline" className="w-full" onClick={() => navigate('/patients')}>
                    {t('dashboard.viewAllPatients')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t('dashboard.recentSessions')}</CardTitle>
                <ClipboardList className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
              </CardHeader>
              <CardContent className="p-0">
                {summary?.recent_sessions?.length ? (
                  <ul>
                    {summary.recent_sessions.map((s, idx) => (
                      <li
                        key={s.id}
                        className={`flex items-center gap-3 px-6 py-3.5 transition-colors hover:bg-[hsl(var(--muted))/50] cursor-pointer ${idx > 0 ? 'border-t border-[hsl(var(--border))]' : ''}`}
                        onClick={() => navigate('/sessions')}>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--muted))]">
                          {s.status === 'completed' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : s.status === 'in_progress' ? (
                            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{s.patient_name}</p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">{s.status === 'completed' ? 'تکمیل شده' : s.status === 'in_progress' ? 'در حال انجام' : 'لغو شده'}</p>
                        </div>
                        <span className="shrink-0 text-xs text-[hsl(var(--muted-foreground))]">{formatDate(s.created_at)}</span>
                        <ChevronRight className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-6 py-8 text-center">
                    <ClipboardList className="mx-auto h-8 w-8 text-[hsl(var(--muted-foreground))] mb-2" />
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('common.noData')}</p>
                  </div>
                )}
                <div className="border-t border-[hsl(var(--border))] px-6 py-3">
                  <Button variant="outline" className="w-full" onClick={() => navigate('/patients')}>
                    {t('dashboard.viewAllSessions')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
