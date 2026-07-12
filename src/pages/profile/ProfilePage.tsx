import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from '@/store/api/profileApi'
import { useGetMeQuery } from '@/store/api/authApi'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui'
import { JalaliDatePicker } from '@/components/ui/JalaliDatePicker'
import { toast } from 'sonner'
import { Loader2, User, Save, Camera } from 'lucide-react'
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

  const [form, setForm] = useState<UserProfileUpdateRequest>({})
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
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
      })
    }
  }, [profile, me])

  const handleChange = (field: string, value: string | number | null) => {
    setForm((prev) => ({ ...prev, [field]: value ?? '' }))
  }

  const handleSubmit = async () => {
    try {
      let body: FormData | UserProfileUpdateRequest

      if (profileImage) {
        const fd = new FormData()
        for (const [key, value] of Object.entries(form)) {
          if (value !== undefined && value !== null) {
            fd.append(key, String(value))
          }
        }
        fd.append('profile_image', profileImage)
        body = fd
      } else {
        body = form
      }

      await updateProfile(body).unwrap()
      toast.success(t('profile.saveSuccess'))
      setProfileImage(null)
      refetch()
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'خطا در ذخیره پروفایل'))
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
          <p className="text-sm text-amber-600">
            {t('profile.createHint')}
          </p>
        )}
      </div>

      <Card>
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
              className="absolute -bottom-1 -left-1 cursor-pointer rounded-full bg-[hsl(var(--primary))] p-2 text-[hsl(var(--primary-foreground))] shadow-md hover:bg-[hsl(var(--primary))/0.9]"
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
          <p className="mt-3 text-sm font-medium">{me?.first_name} {me?.last_name}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{me?.email}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('profile.personalInfo')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              id="first_name"
              label={t('patients.firstName')}
              value={form.first_name || ''}
              onChange={(e) => handleChange('first_name', e.target.value)}
            />
            <Input
              id="last_name"
              label={t('patients.lastName')}
              value={form.last_name || ''}
              onChange={(e) => handleChange('last_name', e.target.value)}
            />
          </div>
          <Input
            id="email"
            label="Email"
            type="email"
            value={form.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
          />
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
              className="flex h-10 w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
              value={form.role || ''}
              onChange={(e) =>
                handleChange('role', (e.target.value as 'admin' | 'clinician' | 'researcher') || '')
              }
            >
              <option value="">{t('common.optional')}</option>
              <option value="admin">{t('profile.admin')}</option>
              <option value="clinician">{t('profile.clinician')}</option>
              <option value="researcher">{t('profile.researcher')}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('profile.professionalInfo')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            id="license_number"
            label={t('profile.licenseNumber')}
            value={form.license_number || ''}
            onChange={(e) => handleChange('license_number', e.target.value)}
          />
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
                className="flex h-10 w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
                value={form.gender || ''}
                onChange={(e) =>
                  handleChange(
                    'gender',
                    (e.target.value as 'male' | 'female' | 'other') || null
                  )
                }
              >
                <option value="">{t('common.optional')}</option>
                <option value="male">{t('patients.male')}</option>
                <option value="female">{t('patients.female')}</option>
                <option value="other">{t('profile.other')}</option>
              </select>
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