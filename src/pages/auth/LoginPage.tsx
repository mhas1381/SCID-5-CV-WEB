import { useState, useRef } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { GoogleLogin } from '@react-oauth/google'
import type { CredentialResponse } from '@react-oauth/google'
import { Brain, Smartphone, KeyRound, Globe, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react'
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

/** The SMS/OTP tab is intentionally hidden from the UI (its logic stays in place). */
const VISIBLE_TABS = tabs.filter((tab) => tab.key !== 'otp')

type TabKey = (typeof tabs)[number]['key']

export function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const isLoggingInRef = useRef(false)

  const [activeTab, setActiveTab] = useState<TabKey>('password')
  const [otpStep, setOtpStep] = useState<'phone' | 'otp'>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

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
      isLoggingInRef.current = true
      dispatch(setCredentials({
        user: result.user,
        tokens: { access: result.access, refresh: result.refresh },
      }))
      setTimeout(() => {
        if (!result.user.has_password || result.user.phone_number?.startsWith('0990')) {
          navigate('/complete-registration', {
            state: { isGoogle: true },
          })
        } else {
          navigate('/dashboard')
        }
        isLoggingInRef.current = false
      }, 0)
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

  if (isAuthenticated && !isLoggingInRef.current) {
    return <Navigate to="/dashboard" replace />
  }

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

      const targetPath = result.is_new_user ? '/complete-registration' : '/dashboard'
      isLoggingInRef.current = true
      dispatch(setCredentials({
        user: result.user,
        tokens: { access: result.access, refresh: result.refresh },
      }))
      setTimeout(() => {
        navigate(targetPath, {
          replace: true,
          state: { phone: phoneNumber },
        })
        isLoggingInRef.current = false
      }, 0)
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

      isLoggingInRef.current = true
      dispatch(setCredentials({
        user: result.user,
        tokens: { access: result.access, refresh: result.refresh },
      }))
      setTimeout(() => {
        navigate('/dashboard', { replace: true })
        isLoggingInRef.current = false
      }, 0)
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
    <div className="flex min-h-screen items-center justify-center relative px-4">
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="absolute top-4 start-4"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t('common.back')}
      </Button>

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
          <div className="grid grid-cols-2 gap-2" role="tablist">
            {VISIBLE_TABS.map(({ key, labelKey, icon: Icon }) => (
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
                autoComplete="tel"
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
                autoComplete="one-time-code"
                inputMode="numeric"
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
                autoComplete="username"
                className="text-lg py-3"
                error={passwordForm.formState.errors.phone_number?.message}
                {...passwordForm.register('phone_number')}
              />

              <Input
                id="password_field"
                label={t('auth.password')}
                placeholder={t('auth.password')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className="text-lg py-3"
                error={passwordForm.formState.errors.password?.message}
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                {...passwordForm.register('password')}
              />

              <Button type="submit" className="w-full" size="lg" isLoading={isPasswordLogging}>
                {t('auth.passwordLoginBtn')}
              </Button>

              <Link
                to="/forgot-password"
                className="block text-center text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
              >
                {t('auth.forgotPassword')}
              </Link>
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
                  width="100%"
                />
              </div>
            </div>
          )}

          {/* ---- Register link ---- */}
          <div className="border-t border-[hsl(var(--border))] pt-4 text-center">
            <p className="align-middle text-sm text-[hsl(var(--muted-foreground))] whitespace-nowrap p-0 leading-normal">
              {t('auth.noAccount')}{' '}
              <Link
                to="/register"
                className="font-medium text-[hsl(var(--primary))] hover:underline align-middle"
              >
                {t('register.submitBtn')}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
