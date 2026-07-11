import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Brain, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { useSendOTPMutation, useVerifyOTPMutation } from '@/store/api/authApi'
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

  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [sendOTP, { isLoading: isSending }] = useSendOTPMutation()
  const [verifyOTP, { isLoading: isVerifying }] = useVerifyOTPMutation()

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
             {step === 'phone' ? 'ورود/ثبت نام' : 'تأیید کد'}
           </CardTitle>
           <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
             سامانه هوشمند مصاحبه بالینی SCID-5-CV
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
                label="شماره تماس"
                placeholder="09xxxxxxxxx"
                dir="ltr"
                className="text-center"
                error={phoneForm.formState.errors.phone_number?.message}
                {...phoneForm.register('phone_number')}
              />

              <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">
                کد تأیید به شماره وارد شده پیامک خواهد شد
              </p>

               <Button type="submit" className="w-full" isLoading={isSending}>
                 ارسال کد تأیید
               </Button>
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
                  کد تأیید به شماره {phoneNumber} ارسال شد
                </p>
              </div>

              <Input
                id="otp_code"
                label="کد تأیید"
                placeholder="12345"
                dir="ltr"
                className="text-center text-lg tracking-[0.5em]"
                maxLength={5}
                error={otpForm.formState.errors.otp_code?.message}
                {...otpForm.register('otp_code')}
              />

               <Button type="submit" className="w-full" isLoading={isVerifying}>
                 تأیید و ادامه
               </Button>

              <button
                type="button"
                onClick={handleBack}
                className="flex items-center justify-center gap-1 w-full text-sm text-[hsl(var(--muted-foreground))] hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                ویرایش شماره تماس
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}