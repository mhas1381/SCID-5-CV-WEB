import { useTranslation } from 'react-i18next'
import { Languages } from 'lucide-react'
import { Button } from '@/components/ui'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    const next = i18n.language === 'fa' ? 'en' : 'fa'
    i18n.changeLanguage(next)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="gap-1 text-xs"
      title={i18n.language === 'fa' ? 'English' : 'فارسی'}
    >
      <Languages className="h-3.5 w-3.5" />
      {i18n.language === 'fa' ? 'EN' : 'FA'}
    </Button>
  )
}