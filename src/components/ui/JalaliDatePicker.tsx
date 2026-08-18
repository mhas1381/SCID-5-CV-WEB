import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { toJalaali, toGregorian, jalaaliMonthLength, isValidJalaaliDate } from 'jalaali-js'
import { cn } from '@/utils/cn'

interface JalaliDatePickerProps {
  value?: string
  onChange?: (value: string) => void
  label?: string
  error?: string
}

const MONTH_NAMES = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
]

const DAY_NAMES = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

type Panel = 'days' | 'months' | 'years'

function toIso(gy: number, gm: number, gd: number): string {
  return `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`
}

function parseIso(value?: string): { gy: number; gm: number; gd: number } | null {
  if (!value) return null
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return null
  return { gy: +m[1], gm: +m[2], gd: +m[3] }
}

export function JalaliDatePicker({ value, onChange, label, error }: JalaliDatePickerProps) {
  const [open, setOpen] = useState(false)
  const [panel, setPanel] = useState<Panel>('days')
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  const gDate = parseIso(value)
  const selectedJalali = gDate ? toJalaali(gDate.gy, gDate.gm, gDate.gd) : null

  const today = useMemo(() => {
    const d = new Date()
    return toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate())
  }, [])

  const [viewYear, setViewYear] = useState(selectedJalali?.jy ?? today.jy)
  const [viewMonth, setViewMonth] = useState(selectedJalali?.jm ?? today.jm)

  useEffect(() => {
    if (selectedJalali) {
      setViewYear(selectedJalali.jy)
      setViewMonth(selectedJalali.jm)
    }
  }, [selectedJalali])

  const updatePosition = useCallback(() => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const POPUP_WIDTH = 288
    const left = Math.max(0, Math.min(rect.left, window.innerWidth - POPUP_WIDTH - 8))
    setPopupPos({ top: rect.bottom + 4, left })
  }, [])

  useEffect(() => {
    if (!open) return
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, updatePosition])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      const insideInput = ref.current?.contains(target)
      const insidePopup = popupRef.current?.contains(target)
      if (!insideInput && !insidePopup) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectDate = useCallback(
    (jy: number, jm: number, jd: number) => {
      if (!isValidJalaaliDate(jy, jm, jd)) return
      const g = toGregorian(jy, jm, jd)
      onChange?.(toIso(g.gy, g.gm, g.gd))
      setOpen(false)
    },
    [onChange],
  )

  const daysInMonth = jalaaliMonthLength(viewYear, viewMonth)
  const firstDayOfWeek = useMemo(() => {
    const g = toGregorian(viewYear, viewMonth, 1)
    return new Date(g.gy, g.gm - 1, g.gd).getDay()
  }, [viewYear, viewMonth])

  const days: (number | null)[] = []
  for (let i = 0; i < firstDayOfWeek; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)
  while (days.length % 7 !== 0) days.push(null)

  const decadeStart = Math.floor(viewYear / 10) * 10
  const years = Array.from({ length: 10 }, (_, i) => decadeStart + i)

  const displayText = selectedJalali
    ? `${selectedJalali.jy}/${String(selectedJalali.jm).padStart(2, '0')}/${String(selectedJalali.jd).padStart(2, '0')}`
    : ''

  const btnClass =
    'flex h-8 w-full items-center justify-center rounded text-sm transition-colors hover:bg-[hsl(var(--accent))]'

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-[hsl(var(--foreground))]">{label}</label>
      )}
      <div ref={ref} className="relative">
        <input
          type="text"
          readOnly
          value={displayText}
          placeholder="1400/01/01"
          onFocus={() => setOpen(true)}
          className={cn(
            'flex h-10 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm',
            'placeholder:text-[hsl(var(--muted-foreground))] cursor-pointer',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]',
            error && 'border-red-500 dark:border-red-700',
          )}
        />
        {open &&
          popupPos &&
          typeof document !== 'undefined' &&
          createPortal(
            <div
              ref={popupRef}
              className="fixed z-50 mt-1 w-72 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 shadow-lg"
              style={{ top: popupPos.top, left: popupPos.left }}
            >
            {panel === 'days' && (
              <>
                <div className="mb-2 flex items-center justify-between">
                  <button type="button" onClick={() => { prevMonth(); setPanel('days') }} className="rounded p-1 hover:bg-[hsl(var(--accent))]">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="flex gap-1 text-sm font-medium">
                    <button type="button" onClick={() => setPanel('months')} className="rounded px-1 hover:bg-[hsl(var(--accent))]">
                      {MONTH_NAMES[viewMonth - 1]}
                    </button>
                    <button type="button" onClick={() => setPanel('years')} className="rounded px-1 hover:bg-[hsl(var(--accent))]">
                      {viewYear}
                    </button>
                  </div>
                  <button type="button" onClick={() => { nextMonth(); setPanel('days') }} className="rounded p-1 hover:bg-[hsl(var(--accent))]">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-0 text-center">
                  {DAY_NAMES.map((name) => (
                    <div key={name} className="py-1 text-xs font-medium text-[hsl(var(--muted-foreground))]">
                      {name}
                    </div>
                  ))}
                  {days.map((day, i) => {
                    if (day === null) return <div key={i} />
                    const isSelected =
                      selectedJalali?.jy === viewYear &&
                      selectedJalali?.jm === viewMonth &&
                      selectedJalali?.jd === day
                    const isToday = today.jy === viewYear && today.jm === viewMonth && today.jd === day
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => selectDate(viewYear, viewMonth, day)}
                        className={cn(
                          'rounded p-1 text-sm transition-colors',
                          isSelected && 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]',
                          !isSelected && isToday && 'bg-[hsl(var(--accent))] font-medium',
                          !isSelected && !isToday && 'hover:bg-[hsl(var(--accent))]',
                        )}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </>
            )}

            {panel === 'months' && (
              <div className="grid grid-cols-3 gap-2">
                {MONTH_NAMES.map((name, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setViewMonth(i + 1); setPanel('days') }}
                    className={cn(
                      btnClass,
                      viewMonth === i + 1 && 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]',
                    )}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}

            {panel === 'years' && (
              <>
                <div className="mb-2 flex items-center justify-between">
                  <button type="button" onClick={() => setViewYear((y) => y - 10)} className="rounded p-1 hover:bg-[hsl(var(--accent))]">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-sm font-medium">
                    {decadeStart} - {decadeStart + 9}
                  </span>
                  <button type="button" onClick={() => setViewYear((y) => y + 10)} className="rounded p-1 hover:bg-[hsl(var(--accent))]">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {years.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => { setViewYear(y); setPanel('days') }}
                      className={cn(
                        btnClass,
                        viewYear === y && 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]',
                      )}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </>
            )}
            </div>,
            document.body
          )}
      </div>
      {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
    </div>
  )

  function prevMonth() {
    if (viewMonth === 1) {
      setViewYear((y) => y - 1)
      setViewMonth(12)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  function nextMonth() {
    if (viewMonth === 12) {
      setViewYear((y) => y + 1)
      setViewMonth(1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }
}
