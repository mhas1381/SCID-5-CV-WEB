import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Brain } from 'lucide-react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { useRegisterMutation } from '@/store/api/authApi'
import { useAppDispatch } from '@/hooks/useAppStore'
import { setCredentials } from '@/store/slices/authSlice'

const registerSchema = z.object({
  email: z.string().email('ایمیل معتبر وارد کنید'),
  password: z.string().min(6, 'رمز عبور حداقل ۶ کاراکتر'),
  password2: z.string().min(6, 'تکرار رمز عبور'),
  full_name: z.string().min(3, 'نام کامل حداقل ۳ کاراکتر'),
  phone_number: z.string().min(10, 'شماره تماس معتبر وارد کنید'),
  is_clinician: z.boolean(),
}).refine((data) => data.password === data.password2, {
  message: 'رمز عبور و تکرار آن باید یکسان باشند',
  path: ['password2'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [register, { isLoading }] = useRegisterMutation()
  const [error, setError] = useState<string | null>(null)

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { is_clinician: true },
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null)
      const result = await register(data).unwrap()
      dispatch(setCredentials(result))
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.data?.detail || Object.values(err?.data || {}).flat().join('\n') || 'خطا در ثبت نام')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--background))]">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Brain className="h-12 w-12 text-[hsl(var(--primary))]" />
          </div>
          <CardTitle className="text-2xl">ثبت نام</CardTitle>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
            ایجاد حساب کاربری جدید
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 whitespace-pre-line">
                {error}
              </div>
            )}

            <Input
              id="full_name"
              label="نام کامل"
              placeholder="نام و نام خانوادگی"
              error={errors.full_name?.message}
              {...formRegister('full_name')}
            />

            <Input
              id="email"
              label="ایمیل"
              type="email"
              placeholder="ایمیل"
              error={errors.email?.message}
              {...formRegister('email')}
            />

            <Input
              id="phone_number"
              label="شماره تماس"
              placeholder="09xxxxxxxxx"
              error={errors.phone_number?.message}
              {...formRegister('phone_number')}
            />

            <Input
              id="password"
              label="رمز عبور"
              type="password"
              placeholder="رمز عبور"
              error={errors.password?.message}
              {...formRegister('password')}
            />

            <Input
              id="password2"
              label="تکرار رمز عبور"
              type="password"
              placeholder="تکرار رمز عبور"
              error={errors.password2?.message}
              {...formRegister('password2')}
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_clinician"
                className="h-4 w-4 rounded border-[hsl(var(--input))]"
                {...formRegister('is_clinician')}
              />
              <label htmlFor="is_clinician" className="text-sm">
                کلینیسین هستم
              </label>
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              ثبت نام
            </Button>

            <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
              حساب کاربری دارید؟{' '}
              <a
                href="/login"
                className="text-[hsl(var(--primary))] hover:underline"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/login')
                }}
              >
                ورود
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}