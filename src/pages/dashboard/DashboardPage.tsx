import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useGetMeQuery } from '@/store/api/authApi'
import { useGetDashboardSummaryQuery } from '@/store/api/dashboardApi'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { Users, ClipboardList, Activity, CalendarDays, Loader2 } from 'lucide-react'

export function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: user, isLoading: userLoading } = useGetMeQuery()
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummaryQuery()

  const statCards = [
    { label: t('dashboard.totalPatients'), value: summary?.total_patients, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: t('dashboard.recentSessionsCount'), value: summary?.recent_sessions_count, icon: ClipboardList, color: 'text-green-600', bg: 'bg-green-100' },
    { label: t('dashboard.completedSessions'), value: summary?.completed_sessions, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: t('dashboard.totalSessions'), value: summary?.total_sessions, icon: CalendarDays, color: 'text-purple-600', bg: 'bg-purple-100' },
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
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
        </div>
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
              <CardHeader>
                <CardTitle>{t('dashboard.recentPatients')}</CardTitle>
              </CardHeader>
              <CardContent>
                {summary?.recent_patients?.length ? (
                  <ul className="divide-y divide-[hsl(var(--border))]">
                    {summary.recent_patients.map((p) => (
                      <li key={p.id} className="flex items-center justify-between py-3">
                        <span className="font-medium">{p.first_name} {p.last_name}</span>
                        <span className="text-sm text-[hsl(var(--muted-foreground))]">{p.created_at}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('common.noData')}</p>
                )}
                <Button variant="outline" className="mt-4 w-full" onClick={() => navigate('/patients')}>
                  {t('dashboard.viewAllPatients')}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.recentSessions')}</CardTitle>
              </CardHeader>
              <CardContent>
                {summary?.recent_sessions?.length ? (
                  <ul className="divide-y divide-[hsl(var(--border))]">
                    {summary.recent_sessions.map((s) => (
                      <li key={s.id} className="flex items-center justify-between py-3">
                        <span className="font-medium">{s.patient_name}</span>
                        <span className="text-sm text-[hsl(var(--muted-foreground))]">{s.created_at}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('common.noData')}</p>
                )}
                <Button variant="outline" className="mt-4 w-full" onClick={() => navigate('/patients')}>
                  {t('dashboard.viewAllSessions')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
