import { forwardRef, useState, type InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'
import { toEnglishDigits } from '@/utils/string'

const PERSIAN_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  required?: boolean
  endAdornment?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, required, endAdornment, type, onChange, onKeyDown, ...props }, ref) => {
    const [capsLock, setCapsLock] = useState(false)
    const [hasPersian, setHasPersian] = useState(false)
    const isPassword = type === 'password'

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      setCapsLock(e.getModifierState('CapsLock'))
      onKeyDown?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isPassword) {
        setHasPersian(PERSIAN_REGEX.test(e.target.value))
      }
      const converted = toEnglishDigits(e.target.value)
      if (converted !== e.target.value) {
        e.target.value = converted
      }
      onChange?.(e)
    }

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-[hsl(var(--foreground))]">
            {label}
            {required && <span className="text-red-500 mr-0.5"> *</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            className={cn(
              'flex h-10 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm',
              'placeholder:text-[hsl(var(--muted-foreground))]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              isPassword && 'text-left',
              error && 'border-red-500 focus-visible:ring-red-500 dark:border-red-700 dark:focus-visible:ring-red-700',
              endAdornment && 'ltr:pr-10 rtl:pl-10',
              className
            )}
            type={type}
            dir={isPassword ? 'ltr' : undefined}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            {...props}
          />
          {endAdornment && (
            <div className="absolute inset-y-0 ltr:right-0 rtl:left-0 flex items-center pr-3 rtl:pl-3 rtl:pr-0">
              {endAdornment}
            </div>
          )}
        </div>
        {isPassword && capsLock && (
          <p className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
            <span className="text-base leading-none">⚠</span> Caps Lock روشن است
          </p>
        )}
        {isPassword && hasPersian && (
          <p className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
            <span className="text-base leading-none">⚠</span> زبان کیبورد را به انگلیسی تغییر دهید
          </p>
        )}
        {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
export type { InputProps }