import { useTranslation } from 'react-i18next'
import { Check, X } from 'lucide-react'

interface PasswordStrengthProps {
  password: string
}

function getStrengthLabel(score: number) {
  if (score <= 1) return { key: 'weak', color: 'text-red-500', bg: 'bg-red-500', width: 'w-1/5' }
  if (score === 2) return { key: 'fair', color: 'text-orange-500', bg: 'bg-orange-500', width: 'w-2/5' }
  if (score === 3) return { key: 'good', color: 'text-yellow-500', bg: 'bg-yellow-500', width: 'w-3/5' }
  if (score === 4) return { key: 'strong', color: 'text-green-500', bg: 'bg-green-500', width: 'w-4/5' }
  return { key: 'veryStrong', color: 'text-emerald-500', bg: 'bg-emerald-500', width: 'w-full' }
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { t } = useTranslation()
  if (!password) return null

  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  ].filter(Boolean).length

  const strength = getStrengthLabel(score)

  const rules = [
    { key: 'minLength', test: password.length >= 8 },
    { key: 'uppercase', test: /[A-Z]/.test(password) },
    { key: 'lowercase', test: /[a-z]/.test(password) },
    { key: 'digit', test: /[0-9]/.test(password) },
    { key: 'specialChar', test: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) },
  ]

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs">
        <span className="text-[hsl(var(--muted-foreground))]">{t('passwordStrength.title')}</span>
        <span className={`font-medium ${strength.color}`}>{t(`passwordStrength.${strength.key}`)}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]">
        <div className={`h-full rounded-full transition-all duration-300 ${strength.bg} ${strength.width}`} />
      </div>
      <ul className="space-y-1">
        {rules.map((rule) => {
          const ok = rule.test
          return (
            <li key={rule.key} className="flex items-center gap-1.5 text-xs">
              {ok ? (
                <Check className="h-3 w-3 text-green-500 shrink-0" />
              ) : (
                <X className="h-3 w-3 text-[hsl(var(--muted-foreground))] shrink-0" />
              )}
              <span className={ok ? 'text-green-600 dark:text-green-400' : 'text-[hsl(var(--muted-foreground))]'}>
                {t(`passwordStrength.${rule.key}`)}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}