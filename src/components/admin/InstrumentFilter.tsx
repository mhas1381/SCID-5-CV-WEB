import { useTranslation } from 'react-i18next'
import { INSTRUMENTS } from '@/utils/modules'

interface InstrumentFilterProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function InstrumentFilter({ value, onChange, className }: InstrumentFilterProps) {
  const { t } = useTranslation()
  const selectClass =
    className ??
    'flex h-10 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]'
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))]">
        {t('admin.instrument.label')}
      </label>
      <select
        className={selectClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{t('admin.instrument.all')}</option>
        {INSTRUMENTS.map((inst) => (
          <option key={inst.value} value={inst.value}>
            {inst.label}
          </option>
        ))}
      </select>
    </div>
  )
}