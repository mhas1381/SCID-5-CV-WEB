import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { ShieldCheck, X, KeyRound, Database, FileLock2 } from 'lucide-react'
import { Button, LoadingSpinner } from '@/components/ui'
import { useGetPatientEncryptionInfoQuery } from '@/store/api/patientApi'
import type { Patient, PatientEncryptionField } from '@/types'

interface EncryptionInfoModalProps {
  open: boolean
  patients: Patient[]
  initialPatientId: number | null
  onClose: () => void
}

const FIELD_LABELS: Record<string, string> = {
  first_name: 'firstName',
  last_name: 'lastName',
  national_id: 'nationalId',
  phone_number: 'phone',
  birth_date: 'birthDate',
}

function FieldRow({ field, label }: { field: PatientEncryptionField; label: string }) {
  const { t } = useTranslation()
  return (
    <tr className="border-t border-[hsl(var(--border))]">
      <td className="px-4 py-3 font-medium text-[hsl(var(--foreground))] whitespace-nowrap">{t(`patients.${label}`)}</td>
      <td dir="ltr" className="px-4 py-3 text-end tabular-nums">{field.plaintext ?? '—'}</td>
      <td className="px-4 py-3">
        <code
          dir="ltr"
          className="block break-all rounded bg-[hsl(var(--muted))] px-2 py-1 text-xs text-[hsl(var(--foreground))] tabular-nums"
        >
          {field.ciphertext ?? '—'}
        </code>
      </td>
    </tr>
  )
}

export function EncryptionInfoModal({
  open,
  patients,
  initialPatientId,
  onClose,
}: EncryptionInfoModalProps) {
  const { t } = useTranslation()
  const [selectedId, setSelectedId] = useState<number | null>(initialPatientId)

  useEffect(() => {
    if (open) {
      setSelectedId(initialPatientId)
    }
  }, [open, initialPatientId])

  const activeId = selectedId ?? initialPatientId ?? patients[0]?.id ?? null
  const { data, isLoading, isError } = useGetPatientEncryptionInfoQuery(activeId!, {
    skip: !open || !activeId,
  })

  const handlePatientChange = (id: number) => {
    setSelectedId(id)
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl bg-[hsl(var(--card))] shadow-xl border border-[hsl(var(--border))]"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-[hsl(var(--border))] p-5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold truncate">{t('patients.encryptionMoreInfo')}</h3>
                  <p className="text-xs text-[hsl(var(--foreground))]/70 truncate">
                    {t('patients.encryptionHint')}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="shrink-0 text-[hsl(var(--foreground))]/60 hover:text-[hsl(var(--foreground))]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <p className="text-sm text-[hsl(var(--foreground))]/80 leading-relaxed">
                {t('patients.encryptionDetailsIntro')}
              </p>

              <div className="space-y-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 p-3">
                <div className="flex items-start gap-2">
                  <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--primary))]" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[hsl(var(--foreground))]">{t('patients.encryptionAlgorithm')}</p>
                    <p dir="ltr" className="text-xs text-[hsl(var(--foreground))]/75 break-words">{data?.algorithm}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--primary))]" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[hsl(var(--foreground))]">{t('patients.encryptionKeyDerivation')}</p>
                    <p className="text-xs text-[hsl(var(--foreground))]/75 break-words">{data?.key_derivation}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Database className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--primary))]" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[hsl(var(--foreground))]">{t('patients.encryptionStorage')}</p>
                    <p className="text-xs text-[hsl(var(--foreground))]/75 break-words">{data?.storage}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[hsl(var(--foreground))]/80">
                  {t('patients.encryptionSelectPatient')}
                </label>
                <select
                  value={activeId ?? ''}
                  onChange={(e) => handlePatientChange(Number(e.target.value))}
                  className="h-9 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name || `${p.first_name || ''} ${p.last_name || ''}`.trim()}
                    </option>
                  ))}
                </select>
              </div>

              {isLoading ? (
                <LoadingSpinner size="lg" className="py-10" />
              ) : isError || !data ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
                  {t('patients.encryptionLoadError')}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-[hsl(var(--border))]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[hsl(var(--border))] text-xs text-[hsl(var(--foreground))]/70">
                        <th className="px-4 py-2 text-start font-medium">{t('patients.encryptionField')}</th>
                        <th className="px-4 py-2 text-end font-medium">{t('patients.encryptionPlaintext')}</th>
                        <th className="px-4 py-2 text-start font-medium">{t('patients.encryptionCiphertext')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.fields.map((field) => (
                        <FieldRow
                          key={field.name}
                          field={field}
                          label={FIELD_LABELS[field.name] ?? field.name}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50/50 p-3 text-xs text-blue-800 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
                <FileLock2 className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{t('patients.encryptionHint')}</p>
              </div>
            </div>

            <div className="flex justify-end border-t border-[hsl(var(--border))] p-4">
              <Button variant="outline" onClick={onClose}>
                {t('common.cancel')}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
