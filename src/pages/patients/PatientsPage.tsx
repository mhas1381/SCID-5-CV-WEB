import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useGetPatientsQuery, useDeletePatientMutation } from '@/store/api/patientApi'
import { Button, Card, CardContent } from '@/components/ui'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Plus, Search, Edit2, Trash2, User, Loader2, Info } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatDate } from '@/utils/date'

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

export function PatientsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null)
  const { data, isLoading } = useGetPatientsQuery({ page, search })
  const [deletePatient, { isLoading: isDeleting }] = useDeletePatientMutation()

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deletePatient(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('patients.title')}</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            {t('patients.description')}
          </p>
        </div>
        <Button onClick={() => navigate('/patients/new')}>
          <Plus className="ml-2 h-4 w-4" />
          {t('patients.newPatient')}
        </Button>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{t('patients.encryptionHint')}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute rtl:right-3 ltr:left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder={t('patients.searchPlaceholder')}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full rtl:pr-10 rtl:pl-4 ltr:pl-10 ltr:pr-4 py-2 rounded-lg border border-[hsl(var(--input))] bg-transparent text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--muted-foreground))]" />
        </div>
      ) : data?.results.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-[hsl(var(--muted-foreground))] mb-4" />
            <p className="text-[hsl(var(--muted-foreground))]">{t('patients.noPatients')}</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/patients/new')}>
              {t('patients.registerPatient')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {data?.results.map((patient) => (
            <Card
              key={patient.id}
              className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
              onClick={() => navigate(`/patients/${patient.id}`)}
            >
              <div className="h-1.5 bg-blue-500" />
              <CardContent className="p-0">
                <div className="flex items-center gap-3 p-3 pb-2">
                  <div className={cn(
                    'shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold',
                    getAvatarColor(patient.full_name || `${patient.first_name} ${patient.last_name}`),
                  )}>
                    {getInitials(patient.full_name || `${patient.first_name} ${patient.last_name}`)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold truncate">
                      {patient.full_name || `${patient.first_name || ''} ${patient.last_name || ''}`.trim()}
                    </h3>
                    <span className={cn(
                      'inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium mt-0.5',
                      patient.gender === 'male'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300'
                    )}>
                      {patient.gender === 'male' ? t('patients.male') : t('patients.female')}
                    </span>
                  </div>
                </div>

                <hr className="border-[hsl(var(--border))] mx-3" />

                <div className="px-3 py-2 text-xs space-y-1.5">
                  <p>
                    <span className="text-[hsl(var(--foreground))] font-medium ml-1">{t('patients.phone')}:</span>
                    <span dir="ltr">{patient.phone_number}</span>
                  </p>
                  <p>
                    <span className="text-[hsl(var(--foreground))] font-medium ml-1">{t('patients.nationalId')}:</span>
                    <span dir="ltr">{patient.national_id}</span>
                  </p>
                  {patient.birth_date && (
                    <p>
                      <span className="text-[hsl(var(--foreground))] font-medium ml-1">{t('patients.birthDate')}:</span>
                      {formatDate(patient.birth_date)}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 px-3 py-3 border-t border-[hsl(var(--border))]">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); navigate(`/patients/${patient.id}/edit`) }}
                  >
                    <Edit2 className="ml-1 h-4 w-4" />
                    {t('common.edit')}
                  </Button>
                  <div className="flex-1" />
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: patient.id, name: patient.full_name || `${patient.first_name || ''} ${patient.last_name || ''}`.trim() }) }}
                  >
                    <Trash2 className="ml-1 h-4 w-4" />
                    {t('common.delete')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data && data.count > 20 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            disabled={!data.previous}
            onClick={() => setPage((p) => p - 1)}
          >
            {t('common.previous')}
          </Button>
          <span className="flex items-center px-4 text-sm">
            {t('common.page')} {page}
          </span>
          <Button
            variant="outline"
            disabled={!data.next}
            onClick={() => setPage((p) => p + 1)}
          >
            {t('common.next')}
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('patients.deleteTitle')}
        message={t('patients.deleteConfirm', { name: deleteTarget?.name || '' })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </div>
  )
}
