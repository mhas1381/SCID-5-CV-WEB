import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Brain, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { useRequestPasswordResetMutation } from '@/store/api/authApi'
import { getErrorMessage } from '@/utils/error'

const forgotSchema = z.object({
  email: z.string().email('ایمیل معتبر وارد کنید').min(1, 'ایمیل الزامی است'),
})

type ForgotFormData = z.infer<typeof forgotSchema>

export function ForgotPasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [requestReset, { isLoading }] = useRequestPasswordResetMutation()
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  })

  const onSubmit = async (data: ForgotFormData) => {
    try {
      setError(null)
      await requestReset({ email: data.email }).unwrap()
      setSent(true)
    } catch (err: any) {
      setError(getErrorMessage(err, t('auth.forgotPasswordError')))
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 dark:text-green-400 mx-auto" />
            <h2 className="text-xl font-bold">{t('auth.forgotPasswordSentTitle')}</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {t('auth.forgotPasswordSent')}
            </p>
            <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
              <ArrowLeft className="h-4 w-4 ml-2" />
              {t('auth.forgotPasswordBackToLogin')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-2xl bg-[hsl(var(--primary))]/10 p-4">
              <Brain className="h-10 w-10 text-[hsl(var(--primary))]" />
            </div>
          </div>
          <CardTitle className="text-2xl">{t('auth.forgotPasswordTitle')}</CardTitle>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
            {t('auth.forgotPasswordHint')}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-600 text-center dark:border-red-800 dark:bg-red-950 dark:text-red-400">
                {error}
              </div>
            )}

            <Input
              id="email"
              label={t('register.emailLabel')}
              placeholder="example@email.com"
              type="email"
              autoComplete="email"
              dir="ltr"
              error={errors.email?.message}
              endAdornment={
                <Mail className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              }
              {...register('email')}
            />

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              {t('auth.sendResetLink')}
            </Button>

            <Link
              to="/login"
              className="flex items-center justify-center gap-1 w-full text-sm text-[hsl(var(--muted-foreground))] hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('auth.forgotPasswordBackToLogin')}
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}