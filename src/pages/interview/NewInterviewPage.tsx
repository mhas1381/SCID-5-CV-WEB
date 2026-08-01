import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useGetPatientsQuery } from '@/store/api/patientApi'
import {
  useGetModulesQuery,
  useGetDiagnosticCriteriaQuery,
  useCreateSessionMutation,
} from '@/store/api/interviewApi'
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import {
  User,
  AlertCircle,
  Layers,
  Check,
  HeartPulse,
  Brain,
  BrainCircuit,
  Frown,
  Wine,
  ShieldAlert,
  Repeat,
  Zap,
  ListChecks,
  Scale,
  ClipboardCheck,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react'
import { getErrorMessage } from '@/utils/error'
import { cn } from '@/utils/cn'

const MODULE_PAIRS: Record<string, string> = {
  A: 'D',
  D: 'A',
  B: 'C',
  C: 'B',
}

const MODULE_ICONS: Record<string, LucideIcon> = {
  A: HeartPulse,
  B: Brain,
  C: BrainCircuit,
  D: Frown,
  E: Wine,
  F: ShieldAlert,
  G: Repeat,
  H: Zap,
  I: ListChecks,
  J: Scale,
}

const MODULE_COLORS: Record<string, string> = {
  A: 'bg-rose-500',
  B: 'bg-violet-500',
  C: 'bg-purple-500',
  D: 'bg-orange-500',
  E: 'bg-amber-500',
  F: 'bg-sky-500',
  G: 'bg-teal-500',
  H: 'bg-emerald-500',
  I: 'bg-indigo-500',
  J: 'bg-pink-500',
}

export function NewInterviewPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const lang = i18n.language as 'en' | 'fa'
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null)
  const [selectedModules, setSelectedModules] = useState<string[]>([])
  const [hasPreexistingDiagnosis, setHasPreexistingDiagnosis] = useState(false)
  const [selectedManualDiagnoses, setSelectedManualDiagnoses] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)

  const { data: patientsData } = useGetPatientsQuery({ page: 1 })
  const { data: modules, isLoading: modulesLoading } = useGetModulesQuery()
  const { data: criteria, isLoading: criteriaLoading } = useGetDiagnosticCriteriaQuery()
  const [createSession, { isLoading }] = useCreateSessionMutation()

  const orderedModules = useMemo(
    () => [...(modules ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [modules],
  )

  const orderedCriteria = useMemo(
    () =>
      [...(criteria ?? [])].sort((a, b) => {
        const moduleOrder = (a.module ?? '').localeCompare(b.module ?? '')
        return moduleOrder !== 0 ? moduleOrder : a.disorder_name.localeCompare(b.disorder_name)
      }),
    [criteria],
  )

  // Group criteria by module code for a module-by-module accordion like the
  // results page. Module order follows the module list (A..J).
  const criteriaByModule = useMemo(() => {
    const moduleOrder = (orderedModules ?? []).reduce<Record<string, number>>(
      (acc, m) => {
        acc[m.code] = m.order ?? 0
        return acc
      },
      {}
    )
    const groups: { code: string; name: string; name_fa: string; items: typeof orderedCriteria }[] = []
    const byCode = new Map<string, typeof orderedCriteria>()
    for (const c of orderedCriteria) {
      const list = byCode.get(c.module) ?? []
      list.push(c)
      byCode.set(c.module, list)
    }
    for (const [code, items] of byCode) {
      const mod = orderedModules?.find((m) => m.code === code)
      groups.push({
        code,
        name: mod?.name ?? code,
        name_fa: mod?.name_fa ?? '',
        items,
      })
    }
    groups.sort((a, b) => (moduleOrder[a.code] ?? 0) - (moduleOrder[b.code] ?? 0))
    return groups
  }, [orderedCriteria, orderedModules])

  const toggleManualDiagnosis = (criteriaId: number) => {
    setSelectedManualDiagnoses((prev) =>
      prev.includes(criteriaId)
        ? prev.filter((c) => c !== criteriaId)
        : [...prev, criteriaId]
    )
  }

  const toggleModule = (code: string) => {
    setSelectedModules((prev) => {
      const isActive = prev.includes(code)
      const pair = MODULE_PAIRS[code]
      if (isActive) {
        // Removing the module also removes its mandatory pair
        return prev.filter((c) => c !== code && c !== pair)
      }
      // Adding the module also adds its mandatory pair
      return [...prev, code, pair].filter((c) => c && c.length > 0)
    })
  }

  const clearAll = () => setSelectedModules([])

  const handleStart = async () => {
    if (!selectedPatient) {
      setError(t('interview.selectPatientRequired'))
      return
    }
    try {
      setError(null)
      const session = await createSession({
        patient: selectedPatient,
        modules: selectedModules.length > 0 ? selectedModules : undefined,
        has_preexisting_diagnosis: hasPreexistingDiagnosis,
        manual_diagnoses: hasPreexistingDiagnosis ? selectedManualDiagnoses : undefined,
      }).unwrap()
      // When modules are selected, the overview is skipped (backend starts in diagnostic phase)
      if (selectedModules.length > 0) {
        navigate(`/interview/${session.id}`)
      } else {
        navigate(`/interview/${session.id}/overview`)
      }
    } catch (err: any) {
      setError(getErrorMessage(err, t('interview.startError')))
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-xl font-bold">{t('interview.title')}</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          {t('interview.description')}
        </p>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
          {t('interview.newHint')}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <Card>
        <CardHeader className="p-6 sm:p-7">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            {t('interview.selectPatient')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 sm:p-7 sm:pt-0">
          <select
            className="w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-4 py-3 text-sm text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
            value={selectedPatient ?? ''}
            onChange={(e) => setSelectedPatient(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="" className="bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">{t('interview.selectPatientPlaceholder')}</option>
            {patientsData?.results.map((patient) => (
              <option key={patient.id} value={patient.id} className="bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">
                {patient.full_name} - {patient.national_id}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Module selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Layers className="h-5 w-5" />
              {t('interview.selectModules')}
            </h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              {t('interview.selectModulesHint')}
            </p>
          </div>
          {selectedModules.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearAll}>
              {t('interview.clearSelection')}
            </Button>
          )}
        </div>

        {modulesLoading ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('common.loading')}</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {orderedModules.map((mod) => {
                const isActive = selectedModules.includes(mod.code)
                const Icon = MODULE_ICONS[mod.code] ?? Layers
                const label = lang === 'fa' && mod.name_fa ? mod.name_fa : mod.name
                return (
                  <button
                    key={mod.code}
                    type="button"
                    onClick={() => toggleModule(mod.code)}
                    className={cn(
                      'group flex w-full items-center gap-4 rounded-2xl border-2 p-5 text-start transition-all hover:shadow-md sm:p-6',
                      isActive
                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5 shadow-sm'
                        : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/50 hover:bg-[hsl(var(--primary))]/[0.03]'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-colors sm:h-16 sm:w-16',
                        isActive
                          ? 'bg-[hsl(var(--primary))] text-white'
                          : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))]'
                      )}
                    >
                      <Icon className="h-7 w-7 sm:h-8 sm:w-8" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="text-base font-semibold leading-snug break-words sm:text-lg">
                          {label}
                        </span>
                        <span
                          dir="ltr"
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm sm:h-10 sm:w-10',
                            MODULE_COLORS[mod.code] ?? 'bg-[hsl(var(--primary))]'
                          )}
                        >
                          {mod.code}
                        </span>
                      </span>
                      <span className="mt-1 block text-sm text-[hsl(var(--muted-foreground))]">
                        {mod.questions_count} {t('interview.questions')}
                      </span>
                    </span>
                    <span
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors sm:h-10 sm:w-10',
                        isActive
                          ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-white'
                          : 'border-[hsl(var(--input))] text-transparent'
                      )}
                    >
                      <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                    </span>
                  </button>
                )
              })}
            </div>

            {selectedModules.length === 0 ? (
              <div className="flex items-center gap-3 rounded-2xl border border-dashed border-[hsl(var(--border))] p-4 text-sm text-[hsl(var(--muted-foreground))]">
                <Scale className="h-5 w-5 shrink-0" />
                {t('interview.fullInterview')}
              </div>
            ) : (
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                {selectedModules.length} {t('interview.selectedModulesCount')}
              </p>
            )}

            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {t('interview.modulesGroupedHint')}
            </p>
          </>
        )}
      </div>

      {/* Pre-existing clinical diagnosis */}
      <Card>
        <CardHeader className="p-6 sm:p-7">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardCheck className="h-5 w-5" />
            {t('interview.preexistingTitle')}
          </CardTitle>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            {t('interview.preexistingHint')}
          </p>
        </CardHeader>
        <CardContent className="p-6 pt-0 sm:p-7 sm:pt-0 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasPreexistingDiagnosis}
              onChange={(e) => {
                setHasPreexistingDiagnosis(e.target.checked)
                if (!e.target.checked) setSelectedManualDiagnoses([])
              }}
              className="mt-1 h-4 w-4 rounded border-[hsl(var(--input))]"
            />
            <span className="text-sm leading-relaxed">
              {t('interview.preexistingCheckbox')}
            </span>
          </label>

          {hasPreexistingDiagnosis && (
            criteriaLoading ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('common.loading')}</p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{t('interview.preexistingListTitle')}</p>
                  {selectedManualDiagnoses.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedManualDiagnoses([])}
                    >
                      {t('interview.clearSelection')}
                    </Button>
                  )}
                </div>

                {criteriaByModule.map((group) => {
                  const modName = lang === 'fa' && group.name_fa ? group.name_fa : group.name
                  const selectedCount = group.items.filter((c) =>
                    selectedManualDiagnoses.includes(c.id)
                  ).length
                  return (
                    <details
                      key={group.code}
                      className="group rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl shadow-[var(--glass-shadow)] overflow-hidden"
                    >
                      <summary className="flex items-center justify-between p-3 cursor-pointer list-none hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-sm font-bold shrink-0">
                            {group.code}
                          </span>
                          <span className="font-semibold text-sm">{modName}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {selectedCount > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              <Check className="h-3 w-3" />
                              {selectedCount}
                            </span>
                          )}
                          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-0 -rotate-90 text-[hsl(var(--muted-foreground))]" />
                        </div>
                      </summary>
                      <div className="border-t px-3 pb-3 pt-2 space-y-2">
                        {group.items.map((c) => {
                          const selected = selectedManualDiagnoses.includes(c.id)
                          const name = lang === 'fa' && c.disorder_name_fa ? c.disorder_name_fa : c.disorder_name
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => toggleManualDiagnosis(c.id)}
                              className={cn(
                                'w-full flex items-center gap-3 rounded-lg border px-3 py-2 text-start transition-all',
                                selected
                                  ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5'
                                  : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/50 hover:bg-[hsl(var(--primary))]/[0.03]'
                              )}
                            >
                              <span className="min-w-0 flex-1 text-sm leading-snug">
                                <span className="block truncate">{name}</span>
                                <span className="block text-xs font-mono text-[hsl(var(--muted-foreground))]">
                                  {c.diagnosis_code}
                                </span>
                              </span>
                              {selected && <Check className="h-4 w-4 shrink-0 text-[hsl(var(--primary))]" />}
                            </button>
                          )
                        })}
                      </div>
                    </details>
                  )
                })}
              </div>
            )
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center pb-8">
        <Button size="lg" className="w-full sm:w-auto" onClick={handleStart} isLoading={isLoading} disabled={!selectedPatient}>
          {selectedModules.length > 0 ? t('interview.startSelected') : t('interview.start')}
        </Button>
      </div>
    </div>
  )
}
