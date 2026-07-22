import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { GoogleLogin } from '@react-oauth/google'
import type { CredentialResponse } from '@react-oauth/google'
import { Brain, Smartphone, KeyRound, Globe, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { useSendOTPMutation, useVerifyOTPMutation, useGoogleLoginMutation, usePasswordLoginMutation } from '@/store/api/authApi'
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore'
import { setCredentials } from '@/store/slices/authSlice'
import { getErrorMessage } from '@/utils/error'
import { cn } from '@/utils/cn'
import { toEnglishDigits } from '@/utils/string'

const phoneSchema = z.object({
  phone_number: z
    .string()
    .transform(toEnglishDigits)
    .refine(
      (val) => /^09\d{9}$/.test(val),
      'شماره باید با 09 شروع شود و 11 رقم باشد'
    ),
})

const otpSchema = z.object({
  otp_code: z
    .string()
    .transform(toEnglishDigits)
    .refine(
      (val) => val.length === 5 && /^\d+$/.test(val),
      'کد تأیید ۵ رقمی است'
    ),
})

const passwordSchema = z.object({
  phone_number: z
    .string()
    .transform(toEnglishDigits)
    .refine(
      (val) => /^09\d{9}$/.test(val),
      'شماره باید با 09 شروع شود و 11 رقم باشد'
    ),
  password: z.string().min(1, 'رمز عبور را وارد کنید'),
})

type PhoneFormData = z.infer<typeof phoneSchema>
type OTPFormData = z.infer<typeof otpSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

const tabs = [
  { key: 'otp', labelKey: 'auth.loginWithOTP', icon: Smartphone },
  { key: 'password', labelKey: 'auth.loginWithPassword', icon: KeyRound },
  { key: 'google', labelKey: 'auth.loginWithGoogle', icon: Globe },
] as const

type TabKey = (typeof tabs)[number]['key']

export function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null)

  useEffect(() => {
    if (pendingRedirect) {
      navigate(pendingRedirect, { replace: true })
      setPendingRedirect(null)
    } else if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, pendingRedirect, navigate])

  const [activeTab, setActiveTab] = useState<TabKey>('otp')
  const [otpStep, setOtpStep] = useState<'phone' | 'otp'>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [sendOTP, { isLoading: isSending }] = useSendOTPMutation()
  const [verifyOTP, { isLoading: isVerifying }] = useVerifyOTPMutation()
  const [googleLoginMutation] = useGoogleLoginMutation()
  const [passwordLoginMutation, { isLoading: isPasswordLogging }] = usePasswordLoginMutation()

  const onGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      setError(null)
      const idToken = credentialResponse.credential
      if (!idToken) {
        setError('Google token not received')
        return
      }
      const result = await googleLoginMutation({ id_token: idToken }).unwrap()
      dispatch(setCredentials({
        user: result.user,
        tokens: { access: result.access, refresh: result.refresh },
      }))
      setPendingRedirect(
        !result.user.has_password || result.user.phone_number?.startsWith('0990')
          ? '/complete-registration'
          : '/dashboard'
      )
    } catch (err: any) {
      setError(getErrorMessage(err, 'خطا در ورود با گوگل'))
    }
  }

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
  })

  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
  })

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const onSendOTP = async (data: PhoneFormData) => {
    try {
      setError(null)
      await sendOTP({ phone_number: data.phone_number }).unwrap()
      setPhoneNumber(data.phone_number)
      setOtpStep('otp')
    } catch (err: any) {
      setError(getErrorMessage(err, 'خطا در ارسال کد تأیید'))
    }
  }

  const onVerifyOTP = async (data: OTPFormData) => {
    try {
      setError(null)
      const result = await verifyOTP({
        phone_number: phoneNumber,
        otp_code: data.otp_code,
      }).unwrap()

      dispatch(setCredentials({
        user: result.user,
        tokens: { access: result.access, refresh: result.refresh },
      }))
      setPendingRedirect(
        result.is_new_user && !result.user?.first_name
          ? '/complete-registration'
          : '/dashboard'
      )
    } catch (err: any) {
      setError(getErrorMessage(err, 'کد تأیید نادرست است'))
    }
  }

  const onPasswordLogin = async (data: PasswordFormData) => {
    try {
      setError(null)
      const result = await passwordLoginMutation({
        phone_number: data.phone_number,
        password: data.password,
      }).unwrap()

      dispatch(setCredentials({
        user: result.user,
        tokens: { access: result.access, refresh: result.refresh },
      }))
      setPendingRedirect('/dashboard')
    } catch (err: any) {
      setError(getErrorMessage(err, 'خطا در ورود'))
    }
  }

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab)
    setError(null)
    setOtpStep('phone')
    phoneForm.clearErrors()
    otpForm.clearErrors()
    passwordForm.clearErrors()
  }

  const handleOtpBack = () => {
    setOtpStep('phone')
    setError(null)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--muted))]">
      <Card className="w-full max-w-xl mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-2xl bg-[hsl(var(--primary))]/10 p-4">
              <Brain className="h-12 w-12 text-[hsl(var(--primary))]" />
            </div>
          </div>
          <CardTitle className="text-3xl">
            {activeTab === 'otp'
              ? (otpStep === 'otp' ? t('auth.otpCode') : t('auth.login'))
              : activeTab === 'password'
                ? t('auth.passwordLogin')
                : t('auth.loginWithGoogle')}
          </CardTitle>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
            {t('app.fullTitle')} {t('app.subtitle')}
          </p>
        </CardHeader>

        <CardContent className="space-y-6 pb-8">
          {/* ---- Tabs ---- */}
          <div className="grid grid-cols-3 gap-2" role="tablist">
            {tabs.map(({ key, labelKey, icon: Icon }) => (
              <button
                key={key}
                role="tab"
                aria-selected={activeTab === key}
                onClick={() => handleTabChange(key)}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                  activeTab === key
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm'
                    : 'border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{t(labelKey)}</span>
              </button>
            ))}
          </div>

          {/* ---- Tab: OTP ---- */}
          {activeTab === 'otp' && otpStep === 'phone' && (
            <form onSubmit={phoneForm.handleSubmit(onSendOTP)} className="space-y-5">
              {error && (
                <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-600 text-center dark:border-red-800 dark:bg-red-950 dark:text-red-400">
                  {error}
                </div>
              )}

              <Input
                id="phone_number"
                label={t('auth.phoneNumber')}
                placeholder={t('auth.phonePlaceholder')}
                dir="ltr"
                className="text-center text-lg py-3"
                error={phoneForm.formState.errors.phone_number?.message}
                {...phoneForm.register('phone_number')}
              />

              <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">
                {t('auth.otpHint')}
              </p>

              <Button type="submit" className="w-full" size="lg" isLoading={isSending}>
                {t('auth.sendOTP')}
              </Button>
            </form>
          )}

          {activeTab === 'otp' && otpStep === 'otp' && (
            <form onSubmit={otpForm.handleSubmit(onVerifyOTP)} className="space-y-5">
              {error && (
                <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-600 text-center dark:border-red-800 dark:bg-red-950 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="text-center">
                <CheckCircle className="h-10 w-10 text-green-500 dark:text-green-400 mx-auto mb-3" />
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {t('auth.otpSent', { phone: phoneNumber })}
                </p>
              </div>

              <Input
                id="otp_code"
                label={t('auth.otpCode')}
                placeholder={t('auth.otpPlaceholder')}
                dir="ltr"
                className="text-center text-2xl tracking-[1em] py-4"
                maxLength={5}
                error={otpForm.formState.errors.otp_code?.message}
                {...otpForm.register('otp_code')}
              />

              <Button type="submit" className="w-full" size="lg" isLoading={isVerifying}>
                {t('auth.verifyOTP')}
              </Button>

              <button
                type="button"
                onClick={handleOtpBack}
                className="flex items-center justify-center gap-1 w-full text-sm text-[hsl(var(--muted-foreground))] hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('auth.editPhone')}
              </button>
            </form>
          )}

          {/* ---- Tab: Password ---- */}
          {activeTab === 'password' && (
            <form onSubmit={passwordForm.handleSubmit(onPasswordLogin)} className="space-y-5">
              {error && (
                <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-600 text-center dark:border-red-800 dark:bg-red-950 dark:text-red-400">
                  {error}
                </div>
              )}

              <Input
                id="password_phone"
                label={t('auth.phoneNumber')}
                placeholder={t('auth.phonePlaceholder')}
                dir="ltr"
                className="text-lg py-3"
                error={passwordForm.formState.errors.phone_number?.message}
                {...passwordForm.register('phone_number')}
              />

              <Input
                id="password_field"
                label={t('auth.password')}
                placeholder={t('auth.password')}
                type="password"
                className="text-lg py-3"
                error={passwordForm.formState.errors.password?.message}
                {...passwordForm.register('password')}
              />

              <Button type="submit" className="w-full" size="lg" isLoading={isPasswordLogging}>
                {t('auth.passwordLoginBtn')}
              </Button>
            </form>
          )}

          {/* ---- Tab: Google ---- */}
          {activeTab === 'google' && (
            <div className="space-y-5">
              {error && (
                <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-600 text-center dark:border-red-800 dark:bg-red-950 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="text-center">
                <Globe className="h-12 w-12 text-[hsl(var(--primary))] mx-auto mb-3" />
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
                  {t('auth.googleLoginHint')}
                </p>
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={onGoogleSuccess}
                  onError={() => setError('Google Login Failed')}
                  size="large"
                  theme="outline"
                  text="signin_with"
                  shape="rectangular"
                  width="350"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
