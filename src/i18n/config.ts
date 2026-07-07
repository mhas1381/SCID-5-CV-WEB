import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import fa from '@/locales/fa.json'
import en from '@/locales/en.json'

const savedLang = localStorage.getItem('i18nextLng') || 'fa'

i18n.use(initReactI18next).init({
  resources: {
    fa: { translation: fa },
    en: { translation: en },
  },
  lng: savedLang,
  fallbackLng: 'fa',
  interpolation: {
    escapeValue: false, // react already safes from xss
  },
})

export default i18n