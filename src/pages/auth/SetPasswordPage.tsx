import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Brain, Shield } from 'lucide-react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { useSetPasswordMutation } from '@/store/api/authApi'

const passwordSchema = z.object({
  password: z.string().min(6, 'رمز عبور حداقل ۶ کاراکتر'),
  confirm_password: z.string().min(6, 'تکرار رمز عبور'),
}).refine((data) => data.password === data.confirm_password, {
  message: 'رمز عبور و تکرار آن باید یکسان باشند',
  path: ['confirm_password'],
})

type PasswordFormData = z.infer<typeof passwordSchema>

export function SetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [setPassword, { isLoading }] = useSetPasswordMutation()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Phone from login/register state (optional fallback)
  const phone = (location.state as any)?.phone || ''

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const onSubmit = async (data: PasswordFormData) => {
    try {
      setError(null)
      await setPassword({
        password: data.password,
        confirm_password: data.confirm_password,
      }).unwrap()
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (err: any) {
      setError(err?.data?.detail || 'خطا در تنظیم رمز عبور')
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--muted))]">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">رمز عبور با موفقیت تنظیم شد</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              در حال انتقال به داشبورد ...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--muted))]">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-2xl bg-[hsl(var(--primary))]/10 p-4">
              <Brain className="h-10 w-10 text-[hsl(var(--primary))]" />
            </div>
          </div>
          <CardTitle className="text-2xl">تنظیم رمز عبور</CardTitle>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
            برای حساب کاربری خود یک رمز عبور انتخاب کنید
          </p>
          {phone && (
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
              شماره تماس: {phone}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive text-center">
                {error}
              </div>
            )}

            <Input
              id="password"
              label="رمز عبور"
              type="password"
              placeholder="حداقل ۶ کاراکتر"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              id="confirm_password"
              label="تکرار رمز عبور"
              type="password"
              placeholder="رمز عبور را دوباره وارد کنید"
              error={errors.confirm_password?.message}
              {...register('confirm_password')}
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              تأیید و ادامه
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}