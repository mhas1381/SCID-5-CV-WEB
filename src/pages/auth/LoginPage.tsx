import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Brain } from 'lucide-react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { useLoginMutation } from '@/store/api/authApi'
import { useAppDispatch } from '@/hooks/useAppStore'
import { setCredentials } from '@/store/slices/authSlice'

const loginSchema = z.object({
  email: z.string().email('ایمیل معتبر وارد کنید'),
  password: z.string().min(6, 'رمز عبور حداقل ۶ کاراکتر'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [login, { isLoading }] = useLoginMutation()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null)
      const result = await login(data).unwrap()
      dispatch(setCredentials(result))
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.data?.detail || 'خطا در ورود به سیستم')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--background))]">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Brain className="h-12 w-12 text-[hsl(var(--primary))]" />
          </div>
          <CardTitle className="text-2xl">SCID-5-CV</CardTitle>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
            Structured Clinical Interview for DSM-5
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Input
              id="email"
              label="ایمیل"
              type="email"
              placeholder="ایمیل خود را وارد کنید"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              id="password"
              label="رمز عبور"
              type="password"
              placeholder="رمز عبور خود را وارد کنید"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              ورود
            </Button>

            <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
              حساب کاربری ندارید؟{' '}
              <a
                href="/register"
                className="text-[hsl(var(--primary))] hover:underline"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/register')
                }}
              >
                ثبت نام
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}