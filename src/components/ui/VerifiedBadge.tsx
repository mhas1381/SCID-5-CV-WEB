import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'
import { BadgeCheck, Clock, AlertCircle } from 'lucide-react'

interface VerifiedBadgeProps {
  status: 'unverified' | 'pending' | 'verified' | 'failed'
  className?: string
}

export function VerifiedBadge({ status, className }: VerifiedBadgeProps) {
  const { t } = useTranslation()

  if (status === 'unverified') return null

  const config = {
    verified: {
      icon: BadgeCheck,
      label: t('profile.credentialVerified'),
      class: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    },
    pending: {
      icon: Clock,
      label: t('profile.verificationPending'),
      class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    },
    failed: {
      icon: AlertCircle,
      label: t('profile.verificationFailed'),
      class: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    },
  }

  const { icon: Icon, label, class: colorClass } = config[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        colorClass,
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  )
}