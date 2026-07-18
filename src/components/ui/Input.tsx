import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  required?: boolean
  endAdornment?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, required, endAdornment, type, ...props }, ref) => {
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
              error && 'border-red-500 focus-visible:ring-red-500 dark:border-red-700 dark:focus-visible:ring-red-700',
              endAdornment && 'ltr:pr-10 rtl:pl-10',
              className
            )}
            type={type}
            dir={type === 'password' ? 'ltr' : undefined}
            {...props}
          />
          {endAdornment && (
            <div className="absolute inset-y-0 ltr:right-0 rtl:left-0 flex items-center pr-3 rtl:pl-3 rtl:pr-0">
              {endAdornment}
            </div>
          )}
        </div>
        {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
export type { InputProps }