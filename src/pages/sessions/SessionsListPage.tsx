import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import { useGetSessionsQuery, useDeleteSessionMutation, useContinueSessionMutation } from '@/store/api/interviewApi'
import type { Session } from '@/types'
import { Button, Card, CardContent, LoadingSpinner } from '@/components/ui'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ClipboardList, Search, Trash2, Play, FileText, Eye } from 'lucide-react'
import { cn } from '@/utils/cn'

const formatElapsed = (seconds?: number) => {
  if (seconds === undefined || seconds === null) return null
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m >= 60) {
    const h = Math.floor(m / 60)
    return `${h}:${String(m % 60).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}

const avatarColors = [
  'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500',
  'bg-amber-500', 'bg-cyan-500', 'bg-pink-500', 'bg-indigo-500',
  'bg-teal-500', 'bg-orange-500', 'bg-lime-500', 'bg-fuchsia-500',
]

const getAvatarColor = (name: string) => {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

const statusTopBar = (status: string) => {
  switch (status) {
    case 'in_progress': return 'bg-yellow-500'
    case 'completed': return 'bg-green-500'
    case 'abandoned': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
}

const statusBadge = (status: string) => {
  switch (status) {
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'abandoned':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  }
}

const phaseBadge = (phase: string) => {
  switch (phase) {
    case 'diagnostic':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
    case 'overview':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, delay: i * 0.04 },
  }),
  exit: { opacity: 0, scale: 0.85, transition: { duration: 0.25 } },
}

export function SessionsListPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Session | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteSession] = useDeleteSessionMutation()
  const [continueSession, { isLoading: isContinuing }] = useContinueSessionMutation()
  const { data: sessionsData, isLoading } = useGetSessionsQuery({})

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    const targetId = deleteTarget.id
    setDeletingId(targetId)
    setDeleteTarget(null)
    setTimeout(async () => {
      try {
        await deleteSession(targetId).unwrap()
        toast.success(t('sessions.deleteSuccess'))
      } catch {
        toast.error(t('sessions.deleteError'))
      } finally {
        setDeletingId(null)
      }
    }, 300)
  }, [deleteTarget, deleteSession, t])

  const handleContinue = async (session: Session) => {
    try {
      await continueSession(session.id).unwrap()
      navigate(`/interview/${session.id}`)
    } catch {
      toast.error(t('sessions.continueError'))
    }
  }

  const filteredSessions = useMemo(
    () => (sessionsData?.results || []).filter((s: Session) =>
      s.patient_name.toLowerCase().includes(search.toLowerCase())
    ),
    [sessionsData?.results, search],
  )

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
        <LoadingSpinner size="xl" className="py-12" />
      ) : filteredSessions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ClipboardList className="h-12 w-12 text-[hsl(var(--muted-foreground))] mb-4" />
              <p className="text-[hsl(var(--muted-foreground))]">{t('sessions.noSessions')}</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate('/interview')}>
                {t('sessions.newSession')}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredSessions.map((session: Session, index: number) => (
              <motion.div
                key={session.id}
                layout
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                custom={index}
              >
                <Card
                  className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/interview/${session.id}`)}
                >
                  <div className={cn('h-1.5', statusTopBar(session.status))} />
                  <CardContent className="p-0">
                    <div className="flex items-center gap-3 p-3 pb-2">
                      <div className={cn(
                        'shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold',
                        getAvatarColor(session.patient_name),
                      )}>
                        {getInitials(session.patient_name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold truncate">{session.patient_name}</h3>
                        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                          <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium', statusBadge(session.status))}>
                            {session.status === 'in_progress'
                              ? t('sessions.status_in_progress')
                              : session.status === 'completed'
                              ? t('sessions.status_completed')
                              : session.status === 'abandoned'
                              ? t('sessions.status_abandoned')
                              : session.status}
                          </span>
                          <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium uppercase', phaseBadge(session.phase))}>
                            {session.phase === 'diagnostic' ? t('sessions.phase_diagnostic') : t('sessions.phase_overview')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <hr className="border-[hsl(var(--border))] mx-3" />

                    <div className="px-3 py-2 text-xs space-y-1.5">
                      {session.current_module_code && (
                        <p>
                          <span className="text-[hsl(var(--foreground))] font-medium ml-1">{t('sessions.moduleLabel')}:</span>
                          {t('dashboard.module' + session.current_module_code)}
                        </p>
                      )}
                      {formatElapsed(session.elapsed_time) && (
                        <p>
                          <span className="text-[hsl(var(--foreground))] font-medium ml-1">{t('sessions.timeLabel')}:</span>
                          <span className="font-mono tabular-nums">{formatElapsed(session.elapsed_time)}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 px-3 py-3 border-t border-[hsl(var(--border))]">
                      {session.phase === 'overview' ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => { e.stopPropagation(); navigate(`/interview/${session.id}/overview`) }}
                        >
                          <Play className="ml-1 h-4 w-4" />
                          {t('sessions.continue')}
                        </Button>
                      ) : session.phase === 'diagnostic' ? (
                        <Button
                          size="sm"
                          variant={session.status === 'completed' ? 'outline' : 'secondary'}
                          onClick={(e) => { e.stopPropagation(); handleContinue(session) }}
                          isLoading={isContinuing}
                        >
                          <Play className="ml-1 h-4 w-4" />
                          {t('sessions.continue')}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => { e.stopPropagation(); navigate(`/interview/${session.id}`) }}
                        >
                          {i18n.language === 'fa' ? 'مشاهده' : 'View'}
                        </Button>
                      )}
                      {session.overview_id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => { e.stopPropagation(); navigate(`/interview/${session.id}/background`) }}
                        >
                          <Eye className="ml-1 h-4 w-4" />
                          {i18n.language === 'fa' ? 'اطلاعات زمینه‌ای' : 'Overview'}
                        </Button>
                      )}
                      {session.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => { e.stopPropagation(); navigate(`/interview/${session.id}/results`) }}
                        >
                          <FileText className="ml-1 h-4 w-4" />
                          {i18n.language === 'fa' ? 'نتایج' : 'Results'}
                        </Button>
                      )}
                      <div className="flex-1" />
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(session) }}
                      >
                        <Trash2 className="ml-1 h-4 w-4" />
                        {t('common.delete')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
      <ConfirmDialog
        open={!!deleteTarget}
        title={t('sessions.deleteTitle')}
        message={t('sessions.deleteConfirm', { name: deleteTarget?.patient_name || '' })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}