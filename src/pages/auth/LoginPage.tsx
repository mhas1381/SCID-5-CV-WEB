import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { GoogleLogin } from '@react-oauth/google'
import type { CredentialResponse } from '@react-oauth/google'
import { Brain, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { useSendOTPMutation, useVerifyOTPMutation, useGoogleLoginMutation } from '@/store/api/authApi'
import { useAppDispatch } from '@/hooks/useAppStore'
import { setCredentials } from '@/store/slices/authSlice'
import { getErrorMessage } from '@/utils/error'

const phoneSchema = z.object({
  phone_number: z
    .string()
    .min(10, 'شماره تماس معتبر وارد کنید')
    .regex(/^09\d{9}$/, 'شماره باید با 09 شروع شود و 11 رقم باشد'),
})

const otpSchema = z.object({
  otp_code: z
    .string()
    .length(5, 'کد تأیید ۵ رقمی است')
    .regex(/^\d{5}$/, 'کد تأیید فقط شامل اعداد است'),
})

type PhoneFormData = z.infer<typeof phoneSchema>
type OTPFormData = z.infer<typeof otpSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [sendOTP, { isLoading: isSending }] = useSendOTPMutation()
  const [verifyOTP, { isLoading: isVerifying }] = useVerifyOTPMutation()
  const [googleLoginMutation] = useGoogleLoginMutation()

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
      navigate('/dashboard')
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

  const onSendOTP = async (data: PhoneFormData) => {
    try {
      setError(null)
      await sendOTP({ phone_number: data.phone_number }).unwrap()
      setPhoneNumber(data.phone_number)
      setStep('otp')
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

      // ذخیره توکن و user
      dispatch(setCredentials({
        user: result.user,
        tokens: { access: result.access, refresh: result.refresh },
      }))

      // اگر کاربر جدید است (is_new_user: true)، به صفحه ثبت اطلاعات هدایت شود
      // اگر کاربر موجود است (is_new_user: false)، مستقیماً به داشبورد هدایت شود
      if (result.is_new_user) {
        navigate('/complete-registration', {
          state: {
            phone: phoneNumber,
            tokens: { access: result.access, refresh: result.refresh }
          }
        })
      } else {
        navigate('/dashboard')
      }
    } catch (err: any) {
      setError(getErrorMessage(err, 'کد تأیید نادرست است'))
    }
  }

  const handleBack = () => {
    setStep('phone')
    setError(null)
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
           <CardTitle className="text-3xl">
              {step === 'phone' ? t('auth.login') : t('auth.otpCode')}
           </CardTitle>
           <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
              {t('app.fullTitle')} {t('app.subtitle')}
           </p>
        </CardHeader>
        <CardContent>
          {step === 'phone' && (
            <form onSubmit={phoneForm.handleSubmit(onSendOTP)} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive text-center">
                  {error}
                </div>
              )}

              <Input
                id="phone_number"
                label={t('auth.phoneNumber')}
                placeholder={t('auth.phonePlaceholder')}
                dir="ltr"
                className="text-center"
                error={phoneForm.formState.errors.phone_number?.message}
                {...phoneForm.register('phone_number')}
              />

              <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">
                {t('auth.otpHint')}
              </p>

               <Button type="submit" className="w-full" isLoading={isSending}>
                  {t('auth.sendOTP')}
               </Button>

               <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[hsl(var(--border))]" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[hsl(var(--card))] px-2 text-[hsl(var(--muted-foreground))]">
                      {t('common.or')}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={onGoogleSuccess}
                    onError={() => setError('Google Login Failed')}
                    size="large"
                    theme="outline"
                    text="signin_with"
                    shape="rectangular"
                    width="300"
                  />
                </div>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={otpForm.handleSubmit(onVerifyOTP)} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive text-center">
                  {error}
                </div>
              )}

              <div className="text-center">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                   {t('auth.otpSent', { phone: phoneNumber })}
                </p>
              </div>

              <Input
                id="otp_code"
                label={t('auth.otpCode')}
                placeholder={t('auth.otpPlaceholder')}
                dir="ltr"
                className="text-center text-lg tracking-[0.5em]"
                maxLength={5}
                error={otpForm.formState.errors.otp_code?.message}
                {...otpForm.register('otp_code')}
              />

               <Button type="submit" className="w-full" isLoading={isVerifying}>
                  {t('auth.verifyOTP')}
               </Button>

              <button
                type="button"
                onClick={handleBack}
                className="flex items-center justify-center gap-1 w-full text-sm text-[hsl(var(--muted-foreground))] hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('auth.editPhone')}
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}