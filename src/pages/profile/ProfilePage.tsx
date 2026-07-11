import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useGetProfileQuery,
  useCreateProfileMutation,
  useUpdateProfileMutation,
} from '@/store/api/profileApi'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui'
import { Loader2, User, Save } from 'lucide-react'
import { useAppSelector } from '@/hooks/useAppStore'
import type { UserProfileUpdateRequest } from '@/types'

export function ProfilePage() {
  const { t } = useTranslation()
  const user = useAppSelector((state) => state.auth.user)

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    refetch,
  } = useGetProfileQuery()
  const [createProfile, { isLoading: isCreating }] = useCreateProfileMutation()
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation()

  const [form, setForm] = useState<UserProfileUpdateRequest>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profile) {
      setForm({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        birth_date: profile.birth_date || '',
        gender: profile.gender,
        role: profile.role || user?.role,
        license_number: profile.license_number || '',
        specialization: profile.specialization || '',
        organization: profile.organization || '',
        years_of_experience: profile.years_of_experience,
      })
    } else if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        birth_date: '',
        gender: null,
        role: user.role,
        license_number: '',
        specialization: '',
        organization: '',
        years_of_experience: null,
      })
    }
  }, [profile, user])

  const handleChange = (field: string, value: string | number | null) => {
    setForm((prev) => ({ ...prev, [field]: value ?? '' }))
    setSaved(false)
  }

  const handleSubmit = async () => {
    try {
      if (profile) {
        await updateProfile(form).unwrap()
      } else {
        await createProfile(form).unwrap()
      }
      setSaved(true)
      refetch()
    } catch {
      // error handled by RTK
    }
  }

  if (profileLoading) {
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
          <Input
            id="birth_date"
            label={t('profile.birthDate')}
            type="date"
            value={form.birth_date || ''}
            onChange={(e) => handleChange('birth_date', e.target.value)}
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

      <div className="flex items-center justify-end gap-4">
        {saved && (
          <p className="text-sm text-green-600">{t('profile.saveSuccess')}</p>
        )}
        <Button onClick={handleSubmit} disabled={isCreating || isUpdating}>
          {isCreating || isUpdating ? (
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