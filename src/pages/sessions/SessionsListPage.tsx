import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useGetSessionsQuery, useDeleteSessionMutation, useContinueSessionMutation } from '@/store/api/interviewApi'
import type { Session } from '@/types'
import { Button, Card, CardContent } from '@/components/ui'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ClipboardList, Eye, Search, Loader2, Trash2, Play } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatDate } from '@/utils/date'

export function SessionsListPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Session | null>(null)
  const [deleteSession, { isLoading: isDeleting }] = useDeleteSessionMutation()
  const [continueSession, { isLoading: isContinuing }] = useContinueSessionMutation()
  const { data: sessionsData, isLoading } = useGetSessionsQuery({})

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteSession(deleteTarget.id).unwrap()
      toast.success(t('sessions.deleteSuccess'))
      setDeleteTarget(null)
    } catch {
      toast.error(t('sessions.deleteError'))
    }
  }

  const handleContinue = async (session: Session) => {
    try {
      await continueSession(session.id).unwrap()
      navigate(`/interview/${session.id}`)
    } catch {
      toast.error(t('sessions.continueError'))
    }
  }

  const filteredSessions = (sessionsData?.results || []).filter((s: Session) =>
    s.patient_name.toLowerCase().includes(search.toLowerCase())
  )

  const statusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'abandoned':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case 'in_progress': return t('sessions.status_in_progress')
      case 'completed': return t('sessions.status_completed')
      case 'abandoned': return t('sessions.status_abandoned')
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
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--muted-foreground))]" />
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
                      {session.current_module_code && (
                        <span>{t('dashboard.module' + session.current_module_code)}</span>
                      )}
                      <span>{formatDate(session.started_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {session.phase === 'diagnostic' ? (
                      <Button
                        size="sm"
                        variant={session.status === 'completed' ? 'outline' : 'default'}
                        onClick={(e) => { e.stopPropagation(); handleContinue(session) }}
                        isLoading={isContinuing}
                      >
                        <Play className="h-4 w-4 ml-1" />
                        {t('sessions.continue')}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); navigate(`/interview/${session.id}`) }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(session) }}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={!!deleteTarget}
        title={t('sessions.deleteTitle')}
        message={t('sessions.deleteConfirm', { name: deleteTarget?.patient_name || '' })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </div>
  )
}