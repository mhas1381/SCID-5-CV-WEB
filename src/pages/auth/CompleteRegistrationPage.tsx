import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation, useBlocker } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Brain, ArrowLeft, CheckCircle, User, Camera, Loader2, AlertTriangle } from 'lucide-react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { useCompleteProfileMutation } from '@/store/api/authApi'
import { useUpdateProfileMutation } from '@/store/api/profileApi'
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore'
import { setCredentials } from '@/store/slices/authSlice'
import { getErrorMessage } from '@/utils/error'
import { toEnglishDigits } from '@/utils/string'

const otpSchema = z.object({
  first_name: z.string().min(1, 'نام الزامی است'),
  last_name: z.string().min(1, 'نام خانوادگی الزامی است'),
  email: z.string().email('ایمیل معتبر وارد کنید').optional().or(z.literal('')),
  password: z.string().min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد'),
  confirm_password: z.string().min(8, 'تکرار رمز عبور باید حداقل ۸ کاراکتر باشد'),
}).refine((data) => data.password === data.confirm_password, {
  message: 'رمز عبور و تکرار آن یکسان نیستند',
  path: ['confirm_password'],
})

const googleSchema = z.object({
  phone_number: z
    .string()
    .transform(toEnglishDigits)
    .refine(
      (val) => /^09\d{9}$/.test(val),
      'شماره باید با 09 شروع شود و 11 رقم باشد'
    ),
})

type OTPFormData = z.infer<typeof otpSchema>
type GoogleFormData = z.infer<typeof googleSchema>

export function CompleteRegistrationPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)

  const authUser = useAppSelector((state) => state.auth.user)
  const authTokens = useAppSelector((state) => ({
    access: state.auth.accessToken,
    refresh: state.auth.refreshToken,
  }))

  const isGoogle = (location.state as any)?.isGoogle
  const googleUser = (location.state as any)?.user
  const statePhone = (location.state as any)?.phone
  const stateTokens = (location.state as any)?.tokens
  const phone = statePhone || authUser?.phone_number || ''
  const tokens = stateTokens || (authTokens.access ? authTokens : null)

  const serverImage = googleUser?.profile_image
  const profileImageSrc = useMemo(() => {
    return profileImagePreview || serverImage || null
  }, [profileImagePreview, serverImage])

  const [completeProfile, { isLoading: isCompleting }] = useCompleteProfileMutation()
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation()

  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
  })

  const isDirty = otpForm.formState.isDirty
  const blocker = useBlocker(isDirty && !success)

  useEffect(() => {
    if (blocker.state === 'blocked') {
      const leave = confirm('اطلاعات ثبت‌نام شما ذخیره نشده است. آیا مطمئن هستید که می‌خواهید خارج شوید؟')
      if (leave) {
        blocker.proceed()
      } else {
        blocker.reset()
      }
    }
  }, [blocker])

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty && !success) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty, success])

  const googleForm = useForm<GoogleFormData>({
    resolver: zodResolver(googleSchema),
  })

  const onOTPSubmit = async (data: OTPFormData) => {
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
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err: any) {
      setError(getErrorMessage(err, 'خطا در ثبت نام کاربر'))
      const data = err?.data
      if (data && typeof data === 'object') {
        for (const key of Object.keys(data)) {
          const value = data[key]
          if (Array.isArray(value) && value.length > 0) {
            otpForm.setError(key as any, { message: String(value[0]) })
          }
        }
      }
    }
  }

  const onGoogleSubmit = async () => {
    try {
      setError(null)
      const data = googleForm.getValues()
      const fd = new FormData()
      fd.append('phone_number', data.phone_number)
      if (profileImage) {
        fd.append('profile_image', profileImage)
      }
      await updateProfile(fd).unwrap()
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err: any) {
      setError(getErrorMessage(err, 'خطا در ذخیره اطلاعات'))
    }
  }

  if (!isGoogle && (!phone || !tokens)) {
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
            <CheckCircle className="h-12 w-12 text-green-500 dark:text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {isGoogle ? 'اطلاعات با موفقیت ذخیره شد' : 'ثبت نام با موفقیت انجام شد'}
            </h3>
            <p className="text-[hsl(var(--muted-foreground))]">{t('common.loading')}</p>
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
          <CardTitle className="text-3xl">تکمیل اطلاعات</CardTitle>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
            لطفاً اطلاعات خود را تکمیل کنید
          </p>
        </CardHeader>
        <CardContent>
          {isGoogle ? (
            <form onSubmit={googleForm.handleSubmit(onGoogleSubmit)} className="space-y-6">
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-[hsl(var(--border))]">
                    {profileImageSrc ? (
                      <img src={profileImageSrc} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[hsl(var(--muted))]">
                        <User className="h-10 w-10 text-[hsl(var(--muted-foreground))]" />
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor="google_profile_image"
                    className="absolute -bottom-1 -left-1 cursor-pointer rounded-full bg-[hsl(var(--primary))] p-2 text-[hsl(var(--primary-foreground))] shadow-md hover:bg-[hsl(var(--primary))/0.9]"
                  >
                    <Camera className="h-4 w-4" />
                  </label>
                  <input
                    id="google_profile_image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setProfileImage(file)
                        setProfileImagePreview(URL.createObjectURL(file))
                      }
                    }}
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive text-center">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  id="first_name"
                  label={t('patients.firstName')}
                  value={googleUser?.first_name || ''}
                  disabled
                />
                <Input
                  id="last_name"
                  label={t('patients.lastName')}
                  value={googleUser?.last_name || ''}
                  disabled
                />
              </div>

              <Input
                id="email"
                label="Email"
                value={googleUser?.email || ''}
                disabled
              />

              <Input
                id="phone_number"
                label={t('auth.phoneNumber')}
                placeholder={t('auth.phonePlaceholder')}
                dir="ltr"
                error={googleForm.formState.errors.phone_number?.message}
                {...googleForm.register('phone_number')}
              />

              <Button type="submit" className="w-full" isLoading={isUpdating}>
                {isUpdating ? (
                  <><Loader2 className="ml-2 h-4 w-4 animate-spin" />{t('common.loading')}</>
                ) : (
                  'تکمیل ثبت نام'
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="space-y-4">
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
                  error={otpForm.formState.errors.first_name?.message}
                  {...otpForm.register('first_name')}
                />
                <Input
                  id="last_name"
                  label={t('patients.lastName')}
                  placeholder="نام خانوادگی خود را وارد کنید"
                  error={otpForm.formState.errors.last_name?.message}
                  {...otpForm.register('last_name')}
                />
              </div>

              <Input
                id="email"
                label="ایمیل (اختیاری)"
                placeholder="example@email.com"
                type="email"
                error={otpForm.formState.errors.email?.message}
                {...otpForm.register('email')}
              />

              <Input
                id="password"
                label={t('auth.password')}
                placeholder="رمز عبور خود را وارد کنید"
                type="password"
                error={otpForm.formState.errors.password?.message}
                {...otpForm.register('password')}
              />

              <Input
                id="confirm_password"
                label={t('auth.confirmPassword')}
                placeholder="رمز عبور خود را تکرار کنید"
                type="password"
                error={otpForm.formState.errors.confirm_password?.message}
                {...otpForm.register('confirm_password')}
              />

              <Button type="submit" className="w-full" isLoading={isCompleting}>
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
