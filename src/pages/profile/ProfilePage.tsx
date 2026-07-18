import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useVerifyPsychologistMutation,
} from '@/store/api/profileApi'
import { useGetMeQuery } from '@/store/api/authApi'
import { Card, CardHeader, CardTitle, CardContent, VerifiedBadge } from '@/components/ui'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui'
import { JalaliDatePicker } from '@/components/ui/JalaliDatePicker'
import { toast } from 'sonner'
import { Loader2, User, Save, Camera, ShieldCheck, Upload, X, Image, GraduationCap, Stethoscope, IdCard, BadgeCheck } from 'lucide-react'
import { getErrorMessage } from '@/utils/error'
import type { UserProfileUpdateRequest } from '@/types'

export function ProfilePage() {
  const { t } = useTranslation()

  const { data: me, isLoading: meLoading } = useGetMeQuery()

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    refetch,
  } = useGetProfileQuery()
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation()
  const [verifyPsychologist, { isLoading: isVerifying }] = useVerifyPsychologistMutation()

  const [form, setForm] = useState<UserProfileUpdateRequest>({})
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const [orgCardImage, setOrgCardImage] = useState<File | null>(null)
  const [orgCardImagePreview, setOrgCardImagePreview] = useState<string | null>(null)
  const [removeOrgCard, setRemoveOrgCard] = useState(false)
  const serverImage = profile?.profile_image || me?.profile_image
  const [cacheBuster] = useState(Date.now())

  const profileImageSrc = useMemo(() => {
    return profileImagePreview || (serverImage ? `${serverImage}?t=${cacheBuster}` : null)
  }, [profileImagePreview, serverImage, cacheBuster])

  useEffect(() => {
    if (profile) {
      setForm({
        first_name: me?.first_name || '',
        last_name: me?.last_name || '',
        email: me?.email || '',
        birth_date: profile.birth_date || '',
        gender: profile.gender,
        role: profile.role || me?.role,
        license_number: profile.license_number || '',
        specialization: profile.specialization || '',
        organization: profile.organization || '',
        years_of_experience: profile.years_of_experience,
        clinician_type: profile.clinician_type || 'none',
      })
    } else if (me) {
      setForm({
        first_name: me.first_name || '',
        last_name: me.last_name || '',
        email: me.email || '',
        birth_date: '',
        gender: null,
        role: me.role,
        license_number: '',
        specialization: '',
        organization: '',
        years_of_experience: null,
        clinician_type: 'none',
      })
    }
  }, [profile, me])

  const handleChange = (field: string, value: string | number | null) => {
    setForm((prev) => ({ ...prev, [field]: value ?? '' }))
  }

  const handleSubmit = async () => {
    try {
      const hasFile = profileImage || orgCardImage
      let body: FormData | UserProfileUpdateRequest

      if (hasFile) {
        const fd = new FormData()
        for (const [key, value] of Object.entries(form)) {
          if (value !== undefined && value !== null && value !== '') {
            fd.append(key, String(value))
          }
        }
        if (profileImage) fd.append('profile_image', profileImage)
        if (orgCardImage) fd.append('organization_card', orgCardImage)
        if (removeOrgCard && !orgCardImage) fd.append('organization_card', '')
        body = fd
      } else {
        const cleanForm = { ...form }
        for (const key of Object.keys(cleanForm)) {
          if (cleanForm[key as keyof typeof cleanForm] === '') {
            delete cleanForm[key as keyof typeof cleanForm]
          }
        }
        body = removeOrgCard ? { ...cleanForm, organization_card: null } : cleanForm
      }

      await updateProfile(body).unwrap()
      toast.success(t('profile.saveSuccess'))
      setProfileImage(null)
      setOrgCardImage(null)
      setOrgCardImagePreview(null)
      setRemoveOrgCard(false)
      refetch()
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'خطا در ذخیره پروفایل'))
    }
  }

  const handleVerify = async () => {
    if (!form.license_number) {
      toast.error(t('profile.licenseRequired'))
      return
    }
    if (form.clinician_type === 'psychologist' && !profile?.organization_card && !orgCardImage) {
      toast.error(t('profile.orgCardRequired'))
      return
    }
    try {
      const hasFile = profileImage || orgCardImage
      if (hasFile) {
        const fd = new FormData()
        for (const [key, value] of Object.entries(form)) {
          if (value !== undefined && value !== null && value !== '') {
            fd.append(key, String(value))
          }
        }
        if (profileImage) fd.append('profile_image', profileImage)
        if (orgCardImage) fd.append('organization_card', orgCardImage)
        await updateProfile(fd).unwrap()
      } else {
        const cleanForm = { ...form }
        for (const key of Object.keys(cleanForm)) {
          if (cleanForm[key as keyof typeof cleanForm] === '') {
            delete cleanForm[key as keyof typeof cleanForm]
          }
        }
        await updateProfile(cleanForm).unwrap()
      }
      await refetch().unwrap()

      const result = await verifyPsychologist().unwrap()
      if (result.success) {
        toast.success(t('profile.verificationSuccess'))
      } else {
        toast.error(t('profile.verificationFailedMessage'))
      }
      refetch()
    } catch (err: any) {
      toast.error(getErrorMessage(err, t('profile.verificationError')))
    }
  }

  if (profileLoading || meLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6 text-[hsl(var(--primary))]" />
            {t('nav.profile')}
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            {t('profile.description')}
          </p>
        </div>
        {profileError && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            {t('profile.createHint')}
          </p>
        )}
      </div>

      {/* ---- Avatar Card ---- */}
      <Card className="overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))/0.6]" />
        <CardContent className="flex flex-col items-center py-6">
          <div className="relative">
            <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-[hsl(var(--border))]">
              {profileImageSrc ? (
                <img
                  src={profileImageSrc}
                  alt="profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[hsl(var(--muted))]">
                  <User className="h-10 w-10 text-[hsl(var(--muted-foreground))]" />
                </div>
              )}
            </div>
            <label
              htmlFor="profile_image"
              className="absolute -bottom-1 -left-1 cursor-pointer rounded-full bg-[hsl(var(--primary))] p-2 text-[hsl(var(--primary-foreground))] shadow-md hover:brightness-110"
            >
              <Camera className="h-4 w-4" />
            </label>
            <input
              id="profile_image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setProfileImage(file)
                  setProfileImagePreview(URL.createObjectURL(file))
                }
              }}
            />
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm font-medium">
            <span>{me?.first_name} {me?.last_name}</span>
            {profile?.verification_status === 'verified' && (
              <BadgeCheck className="h-4 w-4 text-green-500 dark:text-green-400" />
            )}
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{me?.email}</p>
        </CardContent>
      </Card>

      {/* ---- Personal Info Card ---- */}
      <Card>
        <div className="h-2 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))/0.4]" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-[hsl(var(--primary))]" />
            {t('profile.personalInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              id="first_name"
              label={t('patients.firstName')}
              value={form.first_name || ''}
              onChange={(e) => handleChange('first_name', e.target.value)}
              required
            />
            <Input
              id="last_name"
              label={t('patients.lastName')}
              value={form.last_name || ''}
              onChange={(e) => handleChange('last_name', e.target.value)}
              required
            />
          </div>
          <Input
            id="email"
            label={t('common.email')}
            type="email"
            value={form.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            required
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <JalaliDatePicker
              label={t('profile.birthDate')}
              value={form.birth_date || ''}
              onChange={(value) => handleChange('birth_date', value)}
            />
            <div className="space-y-1">
              <label
                htmlFor="role"
                className="block text-sm font-medium text-[hsl(var(--foreground))]"
              >
                {t('profile.role')}
              </label>
              <select
                id="role"
                className="flex h-10 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
                value={form.role || ''}
                onChange={(e) =>
                  handleChange('role', (e.target.value as 'admin' | 'clinician' | 'researcher') || '')
                }
              >
                <option value="" className="bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">{t('common.optional')}</option>
                <option value="admin" className="bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">{t('profile.admin')}</option>
                <option value="clinician" className="bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">{t('profile.clinician')}</option>
                <option value="researcher" className="bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">{t('profile.researcher')}</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ---- Professional Info Card ---- */}
      <Card>
        <div className="h-2 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))/0.4]" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-[hsl(var(--primary))]" />
            {t('profile.professionalInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ---- Credential Verification Section ---- */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-amber-500 dark:text-amber-400" />
              {t('profile.verificationSection')}
            </h3>
            <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-[hsl(var(--border))] dark:bg-[hsl(var(--muted))/0.3]">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  id="license_number"
                  label={t('profile.licenseNumber')}
                  value={form.license_number || ''}
                  onChange={(e) => handleChange('license_number', e.target.value)}
                  required
                />
                <div className="space-y-1">
                  <label
                    htmlFor="clinician_type"
                    className="block text-sm font-medium text-[hsl(var(--foreground))]"
                  >
                    {t('profile.clinicianType')}<span className="text-red-500 mr-0.5"> *</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      id="clinician_type"
                      className="flex h-10 flex-1 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
                      value={form.clinician_type || 'none'}
                      onChange={(e) =>
                        handleChange('clinician_type', e.target.value)
                      }
                    >
                      <option value="none">{t('profile.none')}</option>
                      <option value="psychologist">{t('profile.psychologist')}</option>
                      <option value="psychiatrist">{t('profile.psychiatrist')}</option>
                    </select>
                    {form.clinician_type && form.clinician_type !== 'none' && (
                      <VerifiedBadge status={profile?.verification_status || 'unverified'} />
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[hsl(var(--foreground))]">
                  {t(form.clinician_type === 'psychiatrist' ? 'profile.organizationCardPsychiatrist' : 'profile.organizationCardPsychologist')}<span className="text-red-500 mr-0.5"> *</span>
                </label>
                <div className="flex justify-center">
                  {(orgCardImagePreview || profile?.organization_card) && !removeOrgCard ? (
                    <div className="relative">
                      <img
                        src={orgCardImagePreview || profile!.organization_card!}
                        alt="org card"
                        className="h-36 w-60 rounded-lg border object-cover shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setOrgCardImage(null)
                          setOrgCardImagePreview(null)
                          if (profile?.organization_card) setRemoveOrgCard(true)
                        }}
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="organization_card"
                      className="flex h-36 w-60 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[hsl(var(--input))] text-sm text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] transition-colors"
                    >
                      <Upload className="mb-1 h-6 w-6" />
                      <span>{t('profile.chooseFile')}</span>
                    </label>
                  )}
                  <input
                    id="organization_card"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setOrgCardImage(file)
                        setOrgCardImagePreview(URL.createObjectURL(file))
                        setRemoveOrgCard(false)
                      }
                    }}
                  />
                </div>
              </div>

              {form.clinician_type && form.clinician_type !== 'none' && profile?.verification_status !== 'verified' && (
                <div className="flex items-center gap-3 rounded-lg border border-amber-300 bg-white p-3 shadow-sm dark:border-[hsl(var(--border))] dark:bg-[hsl(var(--card))]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 dark:bg-[hsl(var(--muted))]">
                    <BadgeCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium">
                      {form.clinician_type === 'psychologist'
                        ? t('profile.verifyLicense')
                        : t('profile.verifyPsychiatristLicense')}
                    </p>
                    {profile?.verification_status === 'failed' && (
                      <p className="text-xs text-red-600 dark:text-red-400">{t('profile.verificationFailedMessage')}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleVerify}
                    isLoading={isVerifying}
                  >
                    {t('profile.verifyLicense')}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* ---- Other Professional Info ---- */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
              <Stethoscope className="h-4 w-4 text-[hsl(var(--primary))]" />
              {t('profile.otherInfo')}
            </h3>
            <div className="space-y-4">
              <Input
                id="specialization"
                label={t('profile.specialization')}
                value={form.specialization || ''}
                onChange={(e) => handleChange('specialization', e.target.value)}
              />
              <Input
                id="organization"
                label={t('profile.organization')}
                value={form.organization || ''}
                onChange={(e) => handleChange('organization', e.target.value)}
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  id="years_of_experience"
                  label={t('profile.yearsOfExperience')}
                  type="number"
                  min={0}
                  max={70}
                  value={form.years_of_experience ?? ''}
                  onChange={(e) =>
                    handleChange(
                      'years_of_experience',
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                />
                <div className="space-y-1">
                  <label
                    htmlFor="gender"
                    className="block text-sm font-medium text-[hsl(var(--foreground))]"
                  >
                    {t('patients.gender')}
                  </label>
                  <select
                    id="gender"
                    className="flex h-10 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
                    value={form.gender || ''}
                    onChange={(e) =>
                      handleChange(
                        'gender',
                        (e.target.value as 'male' | 'female') || null
                      )
                    }
                  >
                    <option value="" className="bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">{t('common.notSelected')}</option>
                    <option value="male" className="bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">{t('patients.male')}</option>
                    <option value="female" className="bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">{t('patients.female')}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end">
        <Button onClick={handleSubmit} disabled={isUpdating}>
          {isUpdating ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              {t('common.loading')}
            </>
          ) : (
            <>
              <Save className="ml-2 h-4 w-4" />
              {t('common.save')}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}