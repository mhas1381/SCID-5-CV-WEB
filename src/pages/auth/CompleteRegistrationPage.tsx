import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Brain, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { useCompleteProfileMutation } from '@/store/api/authApi'
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore'
import { setCredentials } from '@/store/slices/authSlice'
import { getErrorMessage } from '@/utils/error'

const registrationSchema = z.object({
  first_name: z.string().min(1, 'نام الزامی است'),
  last_name: z.string().min(1, 'نام خانوادگی الزامی است'),
  email: z.string().email('ایمیل معتبر وارد کنید').optional().or(z.literal('')),
  password: z.string().min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد'),
  confirm_password: z.string().min(8, 'تکرار رمز عبور باید حداقل ۸ کاراکتر باشد'),
}).refine((data) => data.password === data.confirm_password, {
  message: 'رمز عبور و تکرار آن یکسان نیستند',
  path: ['confirm_password'],
})

type RegistrationFormData = z.infer<typeof registrationSchema>

export function CompleteRegistrationPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const authUser = useAppSelector((state) => state.auth.user)
  const authTokens = useAppSelector((state) => ({
    access: state.auth.accessToken,
    refresh: state.auth.refreshToken,
  }))

  const statePhone = (location.state as any)?.phone
  const stateTokens = (location.state as any)?.tokens
  const phone = statePhone || authUser?.phone_number || ''
  const tokens = stateTokens || (authTokens.access ? authTokens : null)

  const [completeProfile, { isLoading }] = useCompleteProfileMutation()

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: RegistrationFormData) => {
    try {
      setError(null)

      const profileData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email || '',
        password: data.password,
        confirm_password: data.confirm_password,
      }

      const result = await completeProfile(profileData).unwrap()

      dispatch(setCredentials({
        user: result.user,
        tokens: tokens,
      }))

      setSuccess(true)
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)

    } catch (err: any) {
      const data = err?.data
      setError(getErrorMessage(err, 'خطا در ثبت نام کاربر'))
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

  if (!phone || !tokens) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--muted))]">
        <Card className="w-full max-w-lg mx-4">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">اطلاعات مورد نیاز یافت نشد. لطفاً دوباره از صفحه ورود اقدام کنید.</p>
            <Button onClick={() => navigate('/login')}>بازگشت به صفحه ورود</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--muted))]">
        <Card className="w-full max-w-lg mx-4">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">ثبت نام با موفقیت انجام شد</h3>
            <p className="text-[hsl(var(--muted-foreground))]">در حال هدایت به داشبورد...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--muted))]">
      <Card className="w-full max-w-lg mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-2xl bg-[hsl(var(--primary))]/10 p-4">
              <Brain className="h-12 w-12 text-[hsl(var(--primary))]" />
            </div>
          </div>
          <CardTitle className="text-3xl">تکمیل اطلاعات کاربری</CardTitle>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
            لطفاً اطلاعات خود را تکمیل کنید
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive text-center">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="first_name"
                label={t('patients.firstName')}
                placeholder="نام خود را وارد کنید"
                error={form.formState.errors.first_name?.message}
                {...form.register('first_name')}
              />
              <Input
                id="last_name"
                label={t('patients.lastName')}
                placeholder="نام خانوادگی خود را وارد کنید"
                error={form.formState.errors.last_name?.message}
                {...form.register('last_name')}
              />
            </div>

            <Input
              id="email"
              label="ایمیل (اختیاری)"
              placeholder="example@email.com"
              type="email"
              error={form.formState.errors.email?.message}
              {...form.register('email')}
            />

            <Input
              id="password"
              label={t('auth.password')}
              placeholder="رمز عبور خود را وارد کنید"
              type="password"
              error={form.formState.errors.password?.message}
              {...form.register('password')}
            />

            <Input
              id="confirm_password"
              label={t('auth.confirmPassword')}
              placeholder="رمز عبور خود را تکرار کنید"
              type="password"
              error={form.formState.errors.confirm_password?.message}
              {...form.register('confirm_password')}
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              تکمیل ثبت نام
            </Button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="flex items-center justify-center gap-1 w-full text-sm text-[hsl(var(--muted-foreground))] hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              بازگشت به صفحه ورود
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
