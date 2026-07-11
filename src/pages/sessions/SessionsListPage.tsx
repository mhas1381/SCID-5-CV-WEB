import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGetSessionsQuery } from '@/store/api/interviewApi'
import type { Session } from '@/types'
import { Button, Card, CardContent } from '@/components/ui'
import { ClipboardList, Eye, Search } from 'lucide-react'
import { cn } from '@/utils/cn'

export function SessionsListPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { data: sessions, isLoading } = useGetSessionsQuery({})

  const MODULE_LABELS: Record<string, string> = {
    A: t('dashboard.moduleA'),
    B: t('dashboard.moduleB'),
    C: t('dashboard.moduleC'),
    D: t('dashboard.moduleD'),
    E: t('dashboard.moduleE'),
    F: t('dashboard.moduleF'),
    G: t('dashboard.moduleG'),
    H: t('dashboard.moduleH'),
    I: t('dashboard.moduleI'),
    J: t('dashboard.moduleJ'),
  }

  const filteredSessions = sessions?.results?.filter((s: Session) =>
    s.patient_name.includes(search) || s.module.includes(search)
  ) || []

  const statusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case 'in_progress': return t('sessions.status_in_progress')
      case 'completed': return t('sessions.status_completed')
      case 'cancelled': return t('sessions.status_cancelled')
      default: return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('sessions.title')}</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            {t('sessions.description')}
          </p>
        </div>
        <Button onClick={() => navigate('/interview')}>
          <ClipboardList className="ml-2 h-4 w-4" />
          {t('sessions.newSession')}
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute rtl:right-3 ltr:left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
        <input
          type="text"
          placeholder={t('sessions.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rtl:pr-10 rtl:pl-4 ltr:pl-10 ltr:pr-4 py-2 rounded-lg border border-[hsl(var(--input))] bg-transparent text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
          {t('common.loading')}
        </div>
      ) : filteredSessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="h-12 w-12 text-[hsl(var(--muted-foreground))] mb-4" />
            <p className="text-[hsl(var(--muted-foreground))]">{t('sessions.noSessions')}</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/interview')}>
              {t('sessions.newSession')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((session: Session) => (
            <Card
              key={session.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/interview/${session.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{session.patient_name}</h3>
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusBadge(session.status))}>
                        {statusLabel(session.status)}
                      </span>
                    </div>
                    <div className="flex gap-4 mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                      <span>ماژول {session.module}: {MODULE_LABELS[session.module] || session.module}</span>
                      <span>{new Date(session.started_at).toLocaleDateString(i18n.language === 'fa' ? 'fa-IR' : 'en-US')}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); navigate(`/interview/${session.id}`) }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}