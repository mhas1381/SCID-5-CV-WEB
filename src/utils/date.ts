import i18n from 'i18next'
import { toJalaali } from 'jalaali-js'

const persianDigits: Record<string, string> = {
  '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
  '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹',
}

function toPersianNum(str: string): string {
  return str.replace(/\d/g, (d) => persianDigits[d])
}

const monthNames: Record<string, string[]> = {
  fa: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'],
}

export function formatDate(isoString: string): string {
  if (!isoString) return ''

  const lang = i18n.language?.startsWith('fa') ? 'fa' : 'en'
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return isoString

  if (lang === 'fa') {
    const j = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate())
    const monthName = monthNames.fa[j.jm - 1]
    return toPersianNum(`${j.jd} ${monthName} ${j.jy}`)
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
