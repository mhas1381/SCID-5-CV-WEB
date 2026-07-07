import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Hook that updates <html dir> and <html lang> whenever the language changes.
 * Also applies a CSS class so Tailwind can respect RTL.
 */
export function useDirection() {
  const { i18n } = useTranslation()

  useEffect(() => {
    const dir = i18n.language === 'fa' ? 'rtl' : 'ltr'
    document.documentElement.dir = dir
    document.documentElement.lang = i18n.language
    document.documentElement.style.direction = dir
  }, [i18n.language])
}