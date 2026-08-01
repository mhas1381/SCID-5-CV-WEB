import { useTranslation } from 'react-i18next'
import { useGetAdminAgreementQuery } from '@/store/api/adminApi'
import { Card, CardContent, CardHeader, CardTitle, LoadingSpinner, ExportButton } from '@/components/ui'
import { GitCompareArrows, ThumbsUp, PlusCircle, MinusCircle, Users, Stethoscope, Percent } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'
import { toPersianNum } from '@/utils/date'

const CATEGORY_COLORS: Record<string, string> = {
  tp: '#22c55e',
  tn: '#3b82f6',
  fp: '#f59e0b',
  fn: '#ef4444',
}

export function AdminAgreementPage() {
  const { t, i18n } = useTranslation()
  const isFa = i18n.language === 'fa'
  const { data, isLoading } = useGetAdminAgreementQuery()

  if (isLoading) {
    return <LoadingSpinner size="xl" className="py-20" />
  }
  if (!data) return null

  const chartData = [
    { key: 'tp', name: t('admin.agreement.tp'), value: data.totals.tp, color: CATEGORY_COLORS.tp },
    { key: 'tn', name: t('admin.agreement.tn'), value: data.totals.tn, color: CATEGORY_COLORS.tn },
    { key: 'fp', name: t('admin.agreement.fp'), value: data.totals.fp, color: CATEGORY_COLORS.fp },
    { key: 'fn', name: t('admin.agreement.fn'), value: data.totals.fn, color: CATEGORY_COLORS.fn },
  ]

  const statCards = [
    {
      label: t('admin.agreement.agreementPercent'),
      value: `${data.agreement_percent}%`,
      icon: Percent,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/50',
    },
    {
      label: t('admin.agreement.sessionsWithPreexisting'),
      value: data.sessions_with_preexisting,
      icon: GitCompareArrows,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/50',
    },
    {
      label: t('admin.agreement.tp'),
      value: data.totals.tp,
      icon: ThumbsUp,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/50',
    },
    {
      label: t('admin.agreement.tn'),
      value: data.totals.tn,
      icon: ThumbsUp,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/50',
    },
    {
      label: t('admin.agreement.fp'),
      value: data.totals.fp,
      icon: PlusCircle,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-100 dark:bg-amber-900/50',
    },
    {
      label: t('admin.agreement.fn'),
      value: data.totals.fn,
      icon: MinusCircle,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/50',
    },
  ]

  const disorderRows = data.by_disorder.map((d) => ({
    ...d,
    displayName: isFa ? d.disorder_name_fa || d.disorder_name : d.disorder_name,
  }))

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.agreement.title')}</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            {t('admin.agreement.description')}
          </p>
        </div>
        <ExportButton url="v1/admin/export/agreement/" filename="admin-agreement.csv" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{stat.label}</p>
                  <p className="text-xl font-bold mt-1 tabular-nums">{stat.value}</p>
                </div>
                <div className={`shrink-0 rounded-xl p-2.5 ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Agreement bar chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.agreement.categoryChart')}</CardTitle>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            {t('admin.agreement.categoryHint')}
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip formatter={(value) => [value, t('admin.agreement.criteriaCount')]} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By disorder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              {t('admin.agreement.byDisorder')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {disorderRows.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))] px-6 py-10 text-center">
                {t('common.noData')}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[hsl(var(--border))] text-xs text-[hsl(var(--muted-foreground))]">
                      <th className="px-4 py-2 text-start font-medium">{t('admin.agreement.disorder')}</th>
                      <th className="px-3 py-2 text-center font-medium">TP</th>
                      <th className="px-3 py-2 text-center font-medium">TN</th>
                      <th className="px-3 py-2 text-center font-medium">FP</th>
                      <th className="px-3 py-2 text-center font-medium">FN</th>
                      <th className="px-4 py-2 text-center font-medium">{t('admin.agreement.sensitivity')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disorderRows.map((row, idx) => (
                      <tr
                        key={row.criteria_id}
                        className={idx > 0 ? 'border-t border-[hsl(var(--border))]' : ''}
                      >
                        <td className="px-4 py-2.5">
                          <span className="block font-medium leading-tight">{row.displayName}</span>
                          <span className="text-xs text-[hsl(var(--muted-foreground))]">{row.diagnosis_code}</span>
                        </td>
                        <td className="px-3 py-2.5 text-center font-medium text-green-600 dark:text-green-400 tabular-nums">{row.tp}</td>
                        <td className="px-3 py-2.5 text-center text-blue-600 dark:text-blue-400 tabular-nums">{row.tn}</td>
                        <td className="px-3 py-2.5 text-center text-amber-600 dark:text-amber-400 tabular-nums">{row.fp}</td>
                        <td className="px-3 py-2.5 text-center text-red-600 dark:text-red-400 tabular-nums">{row.fn}</td>
                        <td className="px-4 py-2.5 text-center font-semibold tabular-nums">{row.sensitivity}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* By clinician */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              {t('admin.agreement.byClinician')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {data.by_clinician.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))] px-6 py-10 text-center">
                {t('common.noData')}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[hsl(var(--border))] text-xs text-[hsl(var(--muted-foreground))]">
                      <th className="px-4 py-2 text-start font-medium">{t('admin.agreement.clinician')}</th>
                      <th className="px-3 py-2 text-center font-medium">{t('admin.agreement.sessions')}</th>
                      <th className="px-3 py-2 text-center font-medium">TP</th>
                      <th className="px-3 py-2 text-center font-medium">TN</th>
                      <th className="px-3 py-2 text-center font-medium">FP</th>
                      <th className="px-3 py-2 text-center font-medium">FN</th>
                      <th className="px-4 py-2 text-center font-medium">{t('admin.agreement.agreementPercent')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.by_clinician.map((row, idx) => (
                      <tr
                        key={row.clinician_id}
                        className={idx > 0 ? 'border-t border-[hsl(var(--border))]' : ''}
                      >
                        <td className="px-4 py-2.5 font-medium">{row.clinician_name}</td>
                        <td className="px-3 py-2.5 text-center tabular-nums">{toPersianNum(String(row.sessions))}</td>
                        <td className="px-3 py-2.5 text-center text-green-600 dark:text-green-400 tabular-nums">{toPersianNum(String(row.tp))}</td>
                        <td className="px-3 py-2.5 text-center text-blue-600 dark:text-blue-400 tabular-nums">{toPersianNum(String(row.tn))}</td>
                        <td className="px-3 py-2.5 text-center text-amber-600 dark:text-amber-400 tabular-nums">{toPersianNum(String(row.fp))}</td>
                        <td className="px-3 py-2.5 text-center text-red-600 dark:text-red-400 tabular-nums">{toPersianNum(String(row.fn))}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/50 dark:text-green-400 tabular-nums">
                            {toPersianNum(String(row.agreement_percent))}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
