import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Save, Bell, Monitor, KeyRound, ShieldAlert, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, PasswordStrength, PageLoader } from '@/components/ui'
import { useGetSettingsQuery, useUpdateSettingsMutation, useChangePasswordMutation } from '@/store/api/settingsApi'
import { useGetMeQuery, useSendOTPMutation, useVerifyOTPMutation, useSetPasswordMutation } from '@/store/api/authApi'
import { getErrorMessage } from '@/utils/error'

export function SettingsPage() {
  const { t } = useTranslation()

  const { data: me } = useGetMeQuery()
  const { data: settings, isLoading: loadingSettings } = useGetSettingsQuery()
  const [updateSettings, { isLoading: saving }] = useUpdateSettingsMutation()
  const [changePassword, { isLoading: changingPassword }] = useChangePasswordMutation()
  const [sendOTP, { isLoading: sendingOTP }] = useSendOTPMutation()
  const [verifyOTP, { isLoading: verifyingOTP }] = useVerifyOTPMutation()
  const [setPassword, { isLoading: settingPassword }] = useSetPasswordMutation()

  const hasPassword = me?.has_password ?? false
  const phoneNumber = me?.phone_number ?? ''

  // --- Change Password state ---
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // --- Set Password state (for users without password) ---
  const [setPass, setSetPass] = useState('')
  const [setConfirmPass, setSetConfirmPass] = useState('')

  // --- Forgot Password state ---
  const [forgotStep, setForgotStep] = useState<'idle' | 'otp-sent' | 'otp-verified'>('idle')
  const [otpCode, setOtpCode] = useState('')
  const [forgotPass, setForgotPass] = useState('')
  const [forgotConfirmPass, setForgotConfirmPass] = useState('')
  const [otpTimer, setOtpTimer] = useState(0)

  useEffect(() => {
    if (otpTimer > 0) {
      const id = setTimeout(() => setOtpTimer((p) => p - 1), 1000)
      return () => clearTimeout(id)
    }
  }, [otpTimer])

  // --- Settings state ---
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifySms, setNotifySms] = useState(true)
  const [reminderBeforeHours, setReminderBeforeHours] = useState<number | null>(24)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [autoSaveInterval, setAutoSaveInterval] = useState(30)

  useEffect(() => {
    if (settings) {
      setNotifyEmail(settings.notify_email)
      setNotifySms(settings.notify_sms)
      setReminderBeforeHours(settings.reminder_before_hours)
      setItemsPerPage(settings.items_per_page)
      setAutoSaveInterval(settings.auto_save_interval)
    }
  }, [settings])

  const handleSavePreferences = async () => {
    try {
      await updateSettings({
        notify_email: notifyEmail,
        notify_sms: notifySms,
        reminder_before_hours: reminderBeforeHours,
        items_per_page: itemsPerPage,
        auto_save_interval: autoSaveInterval,
      }).unwrap()
      toast.success(t('settings.saved'))
    } catch (err) {
      toast.error(getErrorMessage(err, t('settings.saveError')))
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error(t('settings.passwordsMismatch'))
      return
    }
    if (newPassword.length < 8) {
      toast.error(t('settings.passwordMinLength'))
      return
    }
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      }).unwrap()
      toast.success(t('settings.passwordChanged'))
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error(getErrorMessage(err, t('settings.changePasswordError')))
    }
  }

  const handleSetPassword = async () => {
    if (setPass !== setConfirmPass) {
      toast.error(t('settings.passwordsMismatch'))
      return
    }
    if (setPass.length < 8) {
      toast.error(t('settings.passwordMinLength'))
      return
    }
    try {
      await setPassword({ password: setPass, confirm_password: setConfirmPass }).unwrap()
      toast.success(t('settings.passwordSet'))
      setSetPass('')
      setSetConfirmPass('')
    } catch (err) {
      toast.error(getErrorMessage(err, t('settings.setPasswordError')))
    }
  }

  const handleSendOTP = async () => {
    try {
      await sendOTP({ phone_number: phoneNumber }).unwrap()
      toast.success(t('settings.otpSent'))
      setForgotStep('otp-sent')
      setOtpTimer(120)
      setOtpCode('')
    } catch (err) {
      toast.error(getErrorMessage(err, t('settings.otpSendError')))
    }
  }

  const handleVerifyOTP = async () => {
    try {
      await verifyOTP({ phone_number: phoneNumber, otp_code: otpCode }).unwrap()
      toast.success(t('settings.otpVerified'))
      setForgotStep('otp-verified')
    } catch (err) {
      toast.error(getErrorMessage(err, t('settings.otpVerifyError')))
    }
  }

  const handleResetPassword = async () => {
    if (forgotPass !== forgotConfirmPass) {
      toast.error(t('settings.passwordsMismatch'))
      return
    }
    if (forgotPass.length < 8) {
      toast.error(t('settings.passwordMinLength'))
      return
    }
    try {
      await setPassword({ password: forgotPass, confirm_password: forgotConfirmPass }).unwrap()
      toast.success(t('settings.passwordReset'))
      setForgotStep('idle')
      setOtpCode('')
      setForgotPass('')
      setForgotConfirmPass('')
    } catch (err) {
      toast.error(getErrorMessage(err, t('settings.resetPasswordError')))
    }
  }

  if (loadingSettings) {
    return <PageLoader />
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">{t('settings.title')}</h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{t('settings.description')}</p>
      </div>

      {/* ---- Password Section ---- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-[hsl(var(--primary))]" />
            {hasPassword ? t('settings.changePassword') : t('settings.setPassword')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasPassword ? (
            <>
              <Input
                label={t('settings.currentPassword')}
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
              <Input
                label={t('settings.newPassword')}
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
              <PasswordStrength password={newPassword} />
              <Input
                label={t('settings.confirmPassword')}
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
              <div className="flex justify-end">
                <Button onClick={handleChangePassword} isLoading={changingPassword}>
                  {t('settings.updatePassword')}
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('settings.setPasswordHint')}</p>
              <Input
                label={t('settings.newPassword')}
                type={showNew ? 'text' : 'password'}
                value={setPass}
                onChange={(e) => setSetPass(e.target.value)}
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
              <PasswordStrength password={setPass} />
              <Input
                label={t('settings.confirmPassword')}
                type={showConfirm ? 'text' : 'password'}
                value={setConfirmPass}
                onChange={(e) => setSetConfirmPass(e.target.value)}
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
              <div className="flex justify-end">
                <Button onClick={handleSetPassword} isLoading={settingPassword}>
                  {t('settings.setPasswordBtn')}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ---- Forgot Password Card ---- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            {t('settings.forgotPassword')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {forgotStep === 'idle' && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {t('settings.forgotPasswordHint', { phone: phoneNumber })}
              </p>
              <Button variant="outline" onClick={handleSendOTP} isLoading={sendingOTP}>
                {t('settings.sendOTP')}
              </Button>
            </div>
          )}

          {forgotStep === 'otp-sent' && (
            <>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {t('settings.otpSentHint', { phone: phoneNumber })}
              </p>
              <div className="flex items-center gap-3">
                <Input
                  label={t('settings.otpCode')}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="12345"
                  className="flex-1"
                />
                <Button onClick={handleVerifyOTP} isLoading={verifyingOTP} className="mt-6">
                  {t('settings.verifyOTP')}
                </Button>
              </div>
              <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                {otpTimer > 0 ? (
                  <span>{t('settings.resendIn', { seconds: otpTimer })}</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={sendingOTP}
                    className="text-[hsl(var(--primary))] hover:underline"
                  >
                    {t('settings.resendOTP')}
                  </button>
                )}
              </div>
            </>
          )}

          {forgotStep === 'otp-verified' && (
            <>
              <Input
                label={t('settings.newPassword')}
                type={showNew ? 'text' : 'password'}
                value={forgotPass}
                onChange={(e) => setForgotPass(e.target.value)}
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
              <PasswordStrength password={forgotPass} />
              <Input
                label={t('settings.confirmPassword')}
                type={showConfirm ? 'text' : 'password'}
                value={forgotConfirmPass}
                onChange={(e) => setForgotConfirmPass(e.target.value)}
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
              <div className="flex justify-end">
                <Button onClick={handleResetPassword} isLoading={settingPassword}>
                  {t('settings.resetPassword')}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ---- Notifications ---- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-[hsl(var(--primary))]" />
            {t('settings.notifications')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-4 cursor-pointer">
            <div>
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">{t('settings.notifyEmail')}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{t('settings.notifyEmailDesc')}</p>
            </div>
            <input
              type="checkbox"
              checked={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.checked)}
              className="h-5 w-5 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--ring))]"
            />
          </label>
          <label className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-4 cursor-pointer">
            <div>
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">{t('settings.notifySms')}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{t('settings.notifySmsDesc')}</p>
            </div>
            <input
              type="checkbox"
              checked={notifySms}
              onChange={(e) => setNotifySms(e.target.checked)}
              className="h-5 w-5 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--ring))]"
            />
          </label>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[hsl(var(--foreground))]">
              {t('settings.reminderBeforeHours')}
            </label>
            <input
              type="number"
              min={1}
              max={168}
              value={reminderBeforeHours ?? ''}
              onChange={(e) => setReminderBeforeHours(e.target.value ? Number(e.target.value) : null)}
              className="flex h-10 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </div>
        </CardContent>
      </Card>

      {/* ---- Display Preferences ---- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-[hsl(var(--primary))]" />
            {t('settings.display')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[hsl(var(--foreground))]">
                {t('settings.itemsPerPage')}
              </label>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="flex h-10 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[hsl(var(--foreground))]">
                {t('settings.autoSaveInterval')}
              </label>
              <select
                value={autoSaveInterval}
                onChange={(e) => setAutoSaveInterval(Number(e.target.value))}
                className="flex h-10 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              >
                <option value={15}>15 {t('common.seconds')}</option>
                <option value={30}>30 {t('common.seconds')}</option>
                <option value={60}>60 {t('common.seconds')}</option>
                <option value={120}>2 {t('common.minutes')}</option>
                <option value={300}>5 {t('common.minutes')}</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSavePreferences} isLoading={saving}>
              <Save className="rtl:ml-2 ltr:mr-2 h-4 w-4" />
              {t('common.save')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
