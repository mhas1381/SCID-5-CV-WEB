import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Brain, Eye, EyeOff } from 'lucide-react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, PasswordStrength } from '@/components/ui'
import { useRegisterMutation } from '@/store/api/authApi'
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore'
import { setCredentials } from '@/store/slices/authSlice'
import { getErrorMessage } from '@/utils/error'
import { toEnglishDigits } from '@/utils/string'

const registerSchema = z
  .object({
    phone_number: z
      .string()
      .transform(toEnglishDigits)
      .refine(
        (val) => /^09\d{9}$/.test(val),
        'شماره باید با 09 شروع شود و 11 رقم باشد'
      ),
    first_name: z.string().min(1, 'نام الزامی است'),
    last_name: z.string().min(1, 'نام خانوادگی الزامی است'),
    email: z.string().email('ایمیل معتبر وارد کنید').min(1, 'ایمیل الزامی است'),
    password: z
      .string()
      .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد')
      .regex(/\d/, 'رمز عبور باید حداقل شامل یک عدد باشد')
      .regex(/[a-zA-Z]/, 'رمز عبور باید حداقل شامل یک حرف انگلیسی باشد')
      .regex(
        /[!@#$%^&*()_+\-=[\]{};:"\\|,.<>/?]/,
        'رمز عبور باید حداقل شامل یک کاراکتر خاص باشد'
      ),
    confirm_password: z.string().min(8, 'تکرار رمز عبور باید حداقل ۸ کاراکتر باشد'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'رمز عبور و تکرار آن یکسان نیستند',
    path: ['confirm_password'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  const [error, setError] = useState<string | null>(null)
  const [passwordVal, setPasswordVal] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)

  const [register, { isLoading: isRegistering }] = useRegisterMutation()

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null)
      const result = await register({
        phone_number: data.phone_number,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
        confirm_password: data.confirm_password,
      }).unwrap()

      dispatch(setCredentials({
        user: result.user,
        tokens: { access: result.access, refresh: result.refresh },
      }))

      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(getErrorMessage(err, t('register.errorRegister', 'خطا در ثبت نام')))
      const data = err?.data
      if (data && typeof data === 'object') {
        for (const key of Object.keys(data)) {
          const value = data[key]
          if (Array.isArray(value) && value.length > 0) {
            form.setError(key as any, { message: String(value[0]) })
          }
        }
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-lg mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-2xl bg-[hsl(var(--primary))]/10 p-4">
              <Brain className="h-12 w-12 text-[hsl(var(--primary))]" />
            </div>
          </div>
          <CardTitle className="text-3xl">{t('auth.register')}</CardTitle>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
            {t('register.subtitle')}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-600 text-center dark:border-red-800 dark:bg-red-950 dark:text-red-400">
                {error}
              </div>
            )}

            <Input
              id="register_phone"
              label={t('auth.phoneNumber')}
              placeholder={t('auth.phonePlaceholder')}
              dir="ltr"
              autoComplete="username"
              error={form.formState.errors.phone_number?.message}
              {...form.register('phone_number')}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="register_first_name"
                label={t('patients.firstName')}
                placeholder={t('completeRegistration.firstNamePlaceholder')}
                error={form.formState.errors.first_name?.message}
                {...form.register('first_name')}
              />
              <Input
                id="register_last_name"
                label={t('patients.lastName')}
                placeholder={t('completeRegistration.lastNamePlaceholder')}
                error={form.formState.errors.last_name?.message}
                {...form.register('last_name')}
              />
            </div>

            <Input
              id="register_email"
              label={t('register.emailLabel')}
              placeholder="example@email.com"
              type="email"
              autoComplete="off"
              dir="ltr"
              error={form.formState.errors.email?.message}
              {...form.register('email')}
            />

            <Input
              id="register_password"
              label={t('auth.password')}
              placeholder={t('completeRegistration.passwordPlaceholder')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              error={form.formState.errors.password?.message}
              endAdornment={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              {...form.register('password', {
                onChange: (e) => setPasswordVal(e.target.value),
              })}
            />
            <PasswordStrength password={passwordVal} />

            <Input
              id="register_confirm_password"
              label={t('auth.confirmPassword')}
              placeholder={t('completeRegistration.confirmPasswordPlaceholder')}
              type={showConfirmPass ? 'text' : 'password'}
              autoComplete="new-password"
              error={form.formState.errors.confirm_password?.message}
              endAdornment={
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                >
                  {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              {...form.register('confirm_password')}
            />

            <Button type="submit" className="w-full" size="lg" isLoading={isRegistering}>
              {t('register.submitBtn')}
            </Button>

            <div className="border-t border-[hsl(var(--border))] pt-4 text-center">
              <p className="align-middle text-sm text-[hsl(var(--muted-foreground))] whitespace-nowrap p-0 leading-normal">
                {t('auth.hasAccount')}{' '}
                <Link
                  to="/login"
                  className="font-medium text-[hsl(var(--primary))] hover:underline align-middle"
                >
                  {t('register.loginLink')}
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}