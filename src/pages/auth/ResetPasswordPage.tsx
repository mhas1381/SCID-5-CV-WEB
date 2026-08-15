import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Brain, Shield, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, PasswordStrength } from '@/components/ui'
import { useConfirmPasswordResetMutation } from '@/store/api/authApi'
import { getErrorMessage } from '@/utils/error'

const resetSchema = z
  .object({
    password: z.string().min(10, 'رمز عبور حداقل ۱۰ کاراکتر'),
    confirm_password: z.string().min(10, 'تکرار رمز عبور'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'رمز عبور و تکرار آن باید یکسان باشند',
    path: ['confirm_password'],
  })

type ResetFormData = z.infer<typeof resetSchema>

export function ResetPasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const uid = searchParams.get('uid') || ''
  const token = searchParams.get('token') || ''
  const [confirmReset, { isLoading }] = useConfirmPasswordResetMutation()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [passwordVal, setPasswordVal] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  })

  const onSubmit = async (data: ResetFormData) => {
    try {
      setError(null)
      await confirmReset({
        uid,
        token,
        password: data.password,
        confirm_password: data.confirm_password,
      }).unwrap()
      setSuccess(true)
      setTimeout(() => navigate('/login', { replace: true }), 1500)
    } catch (err: any) {
      setError(getErrorMessage(err, t('auth.resetPasswordInvalid')))
    }
  }

  if (!uid || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center space-y-4">
            <Shield className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto" />
            <h2 className="text-xl font-bold">{t('auth.resetPasswordInvalid')}</h2>
            <Link
              to="/login"
              className="flex items-center justify-center gap-1 w-full text-sm text-[hsl(var(--muted-foreground))] hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('auth.forgotPasswordBackToLogin')}
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center space-y-4">
            <Shield className="h-12 w-12 text-green-500 dark:text-green-400 mx-auto" />
            <h2 className="text-xl font-bold">{t('auth.resetPasswordSuccess')}</h2>
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
          <CardTitle className="text-2xl">{t('auth.resetPasswordTitle')}</CardTitle>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
            {t('auth.resetPasswordHint')}
          </p>
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
              label={t('auth.password')}
              type={showPassword ? 'text' : 'password'}
              placeholder={t('auth.passwordMinLength')}
              autoComplete="new-password"
              error={errors.password?.message}
              endAdornment={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              {...register('password', {
                onChange: (e) => setPasswordVal(e.target.value),
              })}
            />
            <PasswordStrength password={passwordVal} />

            <Input
              id="confirm_password"
              label={t('auth.confirmPassword')}
              type={showConfirmPass ? 'text' : 'password'}
              placeholder={t('auth.confirmPassword')}
              autoComplete="new-password"
              error={errors.confirm_password?.message}
              endAdornment={
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                >
                  {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              {...register('confirm_password')}
            />

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              {t('auth.setPasswordBtn')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}