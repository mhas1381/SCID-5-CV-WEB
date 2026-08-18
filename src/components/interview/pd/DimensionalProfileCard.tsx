import { CheckCircle, Scale, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { cn } from '@/utils/cn'
import type { InfoQuality, ModuleGroupResult } from '@/types'

export function DimensionalProfileCard({
  modules,
  infoQuality,
  isRtl,
  t,
}: {
  modules: ModuleGroupResult[]
  infoQuality?: InfoQuality | null
  isRtl: boolean
  t: (key: string) => string
}) {
  const results = modules.flatMap((m) => m.results)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Scale className="h-4 w-4" />
          {t('results.dimensionalProfile')}
        </CardTitle>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {t('results.dimensionalProfileHint')}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {infoQuality && (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {t('results.infoQuality')}:{' '}
            <span className="font-medium text-[hsl(var(--foreground))]">
              {isRtl && infoQuality.label_fa ? infoQuality.label_fa : infoQuality.label}
            </span>
          </p>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] text-xs text-[hsl(var(--muted-foreground))]">
                <th className="px-3 py-2 text-start font-medium">{t('results.disorder')}</th>
                <th className="px-3 py-2 text-start font-medium">{t('results.code')}</th>
                <th className="px-3 py-2 text-start font-medium">{t('results.threshold')}</th>
                <th className="px-3 py-2 text-end font-medium">{t('results.dimensionalScore')}</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id} className="border-b border-[hsl(var(--border))] last:border-0">
                  <td className="px-3 py-2 break-words">
                    {isRtl && r.disorder_name_fa ? r.disorder_name_fa : r.disorder_name}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{r.diagnosis_code}</td>
                  <td className="px-3 py-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                        r.is_met
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      )}
                    >
                      {r.is_met ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {r.is_met ? t('results.thresholdMet') : t('results.thresholdNotMet')}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-end font-mono text-xs">
                    {r.dimensional_score ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
