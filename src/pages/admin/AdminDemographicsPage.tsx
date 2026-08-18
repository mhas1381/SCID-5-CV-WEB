import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetAdminDemographicsQuery } from '@/store/api/adminApi'
import { useGetProvincesQuery } from '@/store/api/locationApi'
import { setDataSource, selectDataSource } from '@/store/slices/dataSourceSlice'
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore'
import { Card, CardContent, CardHeader, CardTitle, LoadingSpinner, Button, ExportButton } from '@/components/ui'
import { JalaliDatePicker } from '@/components/ui/JalaliDatePicker'
import { Users, Filter, RotateCcw, CalendarDays, MapPin } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { toPersianNum } from '@/utils/date'
import type { Instrument } from '@/types'
import { MODULE_COLORS, INSTRUMENTS } from '@/utils/modules'
import { chartTooltipProps } from '@/utils/charts'

const EDUCATION_OPTIONS = ['none', 'diploma', 'associate', 'bachelor', 'master', 'doctorate']
const MARITAL_OPTIONS = ['single', 'married', 'divorced', 'widowed']
const AGE_GROUP_OPTIONS = ['0-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+']

const DIMENSION_KEYS = ['gender', 'education', 'marital_status', 'age_group', 'province']

const BAR_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f43f5e']

interface FilterState {
  gender: string
  education: string
  marital_status: string
  age_group: string
  province: string
  from: string
  to: string
  instrument: string
}

const EMPTY_FILTERS: FilterState = {
  gender: '',
  education: '',
  marital_status: '',
  age_group: '',
  province: '',
  from: '',
  to: '',
  instrument: '',
}

export function AdminDemographicsPage() {
  const { t, i18n } = useTranslation()
  const isFa = i18n.language === 'fa'
  const dispatch = useAppDispatch()
  const testData = useAppSelector(selectDataSource)
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const { data: provinces } = useGetProvincesQuery()

  const queryParams = {
    ...(filters.gender && { gender: filters.gender }),
    ...(filters.education && { education: filters.education }),
    ...(filters.marital_status && { marital_status: filters.marital_status }),
    ...(filters.age_group && { age_group: filters.age_group }),
    ...(filters.province && { province: filters.province }),
    ...(filters.from && { from: filters.from }),
    ...(filters.to && { to: filters.to }),
    ...(filters.instrument && { instrument: filters.instrument as Instrument }),
    test_data: testData,
  }

  // test_data is excluded from the export URL because ExportButton appends the
  // global data-source selection to every analytics export automatically.
  const exportParams = Object.fromEntries(
    Object.entries(queryParams).filter(([key]) => key !== 'test_data')
  )

  const { data, isLoading } = useGetAdminDemographicsQuery(queryParams)

  const setFilter = (key: keyof FilterState) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const setDateFilter = (key: 'from' | 'to') => (value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS)
    dispatch(setDataSource('real'))
  }

  // Global data-source toggles: "real" (default), "test", or "all" (both).
  // These write to the shared Redux slice so every analytics page respects them.
  const realOn = testData === 'real' || testData === 'all'
  const testOn = testData === 'test' || testData === 'all'
  const setDataFlags = (real: boolean, test: boolean) => {
    let value: 'real' | 'test' | 'all'
    if (real && test) value = 'all'
    else if (real) value = 'real'
    else if (test) value = 'test'
    else value = 'real'
    dispatch(setDataSource(value))
  }

  const hasActiveFilters =
    filters.gender !== '' ||
    filters.education !== '' ||
    filters.marital_status !== '' ||
    filters.age_group !== '' ||
    filters.province !== '' ||
    filters.from !== '' ||
    filters.to !== '' ||
    filters.instrument !== '' ||
    testData !== 'real'

  if (isLoading) {
    return <LoadingSpinner size="xl" className="py-20" />
  }
  if (!data) return null

  const disorderRows = data.disorders.map((d) => ({
    ...d,
    displayName: isFa ? d.disorder_name_fa || d.disorder_name : d.disorder_name,
  }))

  const moduleMap: Record<string, (typeof disorderRows)[number][]> = {}
  for (const row of disorderRows) {
    (moduleMap[row.module_code] ??= []).push(row)
  }

  const moduleGroups = Object.entries(moduleMap)
    .map(([code, members]) => {
      const sorted = [...members].sort(
        (a, b) => b.prevalence_percent - a.prevalence_percent
      )
      const evaluated = sorted.reduce((acc, m) => acc + m.evaluated, 0)
      const met = sorted.reduce((acc, m) => acc + m.met, 0)
      const moduleMeta = sorted[0] ?? null
      return {
        code,
        members: sorted,
        evaluated,
        met,
        prevalencePercent: evaluated ? Math.round((met / evaluated) * 1000) / 10 : 0,
        moduleName: moduleMeta
          ? isFa
            ? moduleMeta.module_name_fa || moduleMeta.module_name
            : moduleMeta.module_name
          : code,
      }
    })
    .sort((a, b) => a.code.localeCompare(b.code))

  const selectClass =
    'flex h-10 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]'

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.demographics.title')}</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            {t('admin.demographics.description')}
          </p>
        </div>
        <ExportButton
          url={`v1/admin/export/demographics/?${new URLSearchParams(
            Object.entries(exportParams).map(([key, value]) => [key, String(value)])
          ).toString()}`}
          filename="admin-demographics.csv"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            {t('admin.demographics.filters')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))]">
                {t('admin.instrument.label')}
              </label>
              <select className={selectClass} value={filters.instrument} onChange={setFilter('instrument')}>
                <option value="">{t('admin.instrument.all')}</option>
                {INSTRUMENTS.map((inst) => (
                  <option key={inst.value} value={inst.value}>
                    {inst.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))]">
                {t('admin.demographics.gender')}
              </label>
              <select className={selectClass} value={filters.gender} onChange={setFilter('gender')}>
                <option value="">{t('admin.demographics.all')}</option>
                <option value="male">{t('patients.male')}</option>
                <option value="female">{t('patients.female')}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))]">
                {t('admin.demographics.education')}
              </label>
              <select className={selectClass} value={filters.education} onChange={setFilter('education')}>
                <option value="">{t('admin.demographics.all')}</option>
                {EDUCATION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {t(`admin.demographics.education_${opt}`)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))]">
                {t('admin.demographics.maritalStatus')}
              </label>
              <select className={selectClass} value={filters.marital_status} onChange={setFilter('marital_status')}>
                <option value="">{t('admin.demographics.all')}</option>
                {MARITAL_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {t(`admin.demographics.marital_${opt}`)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))]">
                {t('admin.demographics.ageGroup')}
              </label>
              <select className={selectClass} value={filters.age_group} onChange={setFilter('age_group')}>
                <option value="">{t('admin.demographics.all')}</option>
                {AGE_GROUP_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {t(`admin.demographics.age_${opt.replace('+', '_plus')}`)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))]">
                {t('admin.demographics.province')}
              </label>
              <select className={selectClass} value={filters.province} onChange={setFilter('province')}>
                <option value="">{t('admin.demographics.all')}</option>
                {provinces?.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <JalaliDatePicker
              label={t('admin.demographics.fromDate')}
              value={filters.from}
              onChange={setDateFilter('from')}
            />

            <JalaliDatePicker
              label={t('admin.demographics.toDate')}
              value={filters.to}
              onChange={setDateFilter('to')}
            />

            <div className="space-y-1">
              <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))]">
                {t('admin.demographics.dataSource')}
              </label>
              <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2">
                <label className="flex cursor-pointer select-none items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={realOn}
                    onChange={() => setDataFlags(!realOn, testOn)}
                    className="h-4 w-4 rounded border-[hsl(var(--input))]"
                  />
                  {t('admin.demographics.realData')}
                </label>
                <label className="flex cursor-pointer select-none items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={testOn}
                    onChange={() => setDataFlags(realOn, !testOn)}
                    className="h-4 w-4 rounded border-[hsl(var(--input))]"
                  />
                  {t('admin.demographics.testData')}
                </label>
              </div>
            </div>

            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={resetFilters} className="flex-1">
                <RotateCcw className="h-4 w-4 ml-2" />
                {t('admin.demographics.reset')}
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
            <Filter className="h-3.5 w-3.5 shrink-0" />
            <span>{t('admin.demographics.liveHint')}</span>
          </div>

          {hasActiveFilters && (
            <div className="mt-2 flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
              <CalendarDays className="h-3.5 w-3.5" />
              {t('admin.demographics.filteredSessions', {
                count: toPersianNum(String(data.total_sessions)),
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overall prevalence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            {t('admin.demographics.disorderPrevalence')}
            <span className="text-xs font-normal text-[hsl(var(--muted-foreground))]">
              ({toPersianNum(String(data.total_sessions))} {t('admin.demographics.sessionsLabel')})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {moduleGroups.length === 0 ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))] py-10 text-center">
              {t('common.noData')}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {moduleGroups.map((group) => (
                <div
                  key={group.code}
                  className="rounded-xl border border-[hsl(var(--border))] p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: MODULE_COLORS[group.code] ?? '#64748b' }}
                      >
                        {group.code}
                      </span>
                      <span className="text-sm font-semibold break-words">
                        {group.moduleName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 text-xs text-[hsl(var(--muted-foreground))]">
                      <span className="tabular-nums">
                        {toPersianNum(String(group.met))} / {toPersianNum(String(group.evaluated))}
                      </span>
                      <span className="w-12 text-end font-semibold text-[hsl(var(--foreground))] tabular-nums">
                        {toPersianNum(String(group.prevalencePercent))}%
                      </span>
                    </div>
                  </div>

                  <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(group.prevalencePercent, 100)}%`,
                        backgroundColor: MODULE_COLORS[group.code] ?? 'hsl(var(--primary))',
                      }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    {group.members.map((row) => (
                      <div
                        key={row.criteria_id}
                        className="flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="truncate">{row.displayName}</span>
                          <span className="shrink-0 rounded bg-[hsl(var(--muted))] px-1 py-0.5 text-[9px] text-[hsl(var(--muted-foreground))]">
                            {row.diagnosis_code}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 tabular-nums">
                          <span className="text-[hsl(var(--muted-foreground))]">
                            {toPersianNum(String(row.met))}/{toPersianNum(String(row.evaluated))}
                          </span>
                          <span className="w-10 text-end font-semibold text-[hsl(var(--foreground))]">
                            {toPersianNum(String(row.prevalence_percent))}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Per-dimension breakdowns */}
      {DIMENSION_KEYS.map((dimension) => {
        const values = data.breakdowns?.[dimension] ?? []
        if (values.length === 0) return null
        return (
          <Card key={dimension}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                {dimension === 'province' ? (
                  <MapPin className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                ) : (
                  <Users className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                )}
                {t(`admin.demographics.dimension_${dimension}`)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {values.map((value) => {
                  const top = value.disorders
                    .filter((d) => d.met > 0)
                    .sort((a, b) => b.prevalence_percent - a.prevalence_percent)
                  const chartData = top.map((d, idx) => ({
                    name: isFa ? d.disorder_name_fa || d.disorder_name : d.disorder_name,
                    percent: d.prevalence_percent,
                    color: BAR_COLORS[idx % BAR_COLORS.length],
                  }))
                  return (
                    <div
                      key={String(value.value)}
                      className="rounded-xl border border-[hsl(var(--border))] p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold">{value.label}</span>
                        <span className="text-xs text-[hsl(var(--muted-foreground))] tabular-nums">
                          {t('admin.demographics.positiveCount', {
                            count: toPersianNum(
                              String(value.disorders.reduce((acc, d) => acc + d.met, 0))
                            ),
                          })}
                        </span>
                      </div>
                      {chartData.length === 0 ? (
                        <p className="text-xs text-[hsl(var(--muted-foreground))] py-6 text-center">
                          {t('common.noData')}
                        </p>
                      ) : (
                        <div className="h-44">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 10 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                              <XAxis type="number" tick={{ fontSize: 10 }} unit="%" domain={[0, 100]} />
                              <YAxis
                                type="category"
                                dataKey="name"
                                tick={{ fontSize: 10 }}
                                width={110}
                                tickFormatter={(v: string) => (v.length > 14 ? `${v.slice(0, 13)}…` : v)}
                              />
                              <Tooltip {...chartTooltipProps} formatter={(value) => [`${value}%`, t('admin.demographics.prevalence')]} />
                              <Bar dataKey="percent" radius={[0, 4, 4, 0]} barSize={14}>
                                {chartData.map((entry) => (
                                  <Cell key={entry.name} fill={entry.color} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {data.total_sessions === 0 && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[hsl(var(--border))] py-12 text-sm text-[hsl(var(--muted-foreground))]">
          <CalendarDays className="h-4 w-4" />
          {t('admin.demographics.noSessionsHint')}
        </div>
      )}
    </div>
  )
}
