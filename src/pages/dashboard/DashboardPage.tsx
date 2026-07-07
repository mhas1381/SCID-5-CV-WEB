import { useTranslation } from 'react-i18next'
import { useGetMeQuery } from '@/store/api/authApi'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { Users, ClipboardList, Activity, CalendarDays } from 'lucide-react'

export function DashboardPage() {
  const { t } = useTranslation()
  const { data: user, isLoading } = useGetMeQuery()

  const stats = [
    { title: t('dashboard.totalPatients'), value: '—', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: t('dashboard.recentSessions'), value: '—', icon: ClipboardList, color: 'text-green-600', bg: 'bg-green-100' },
    { title: t('dashboard.completedSessions'), value: '—', icon: Activity, color: 'text-orange-600', bg: 'bg-orange-100' },
    { title: t('dashboard.totalSessions'), value: '—', icon: CalendarDays, color: 'text-purple-600', bg: 'bg-purple-100' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          {isLoading
            ? t('common.loading')
            : `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || t('nav.dashboard')}
        </h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          {t('dashboard.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
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
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {t('common.noData')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.recentSessions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {t('common.noData')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}