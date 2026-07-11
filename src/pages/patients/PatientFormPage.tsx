import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreatePatientMutation, useUpdatePatientMutation, useGetPatientQuery } from '@/store/api/patientApi'
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { getErrorMessage } from '@/utils/error'

const patientSchema = z.object({
  first_name: z.string().min(2, 'نام حداقل ۲ کاراکتر'),
  last_name: z.string().min(2, 'نام خانوادگی حداقل ۲ کاراکتر'),
  national_id: z.string().length(10, 'کد ملی ۱۰ رقم'),
  phone_number: z.string().min(10, 'شماره تماس معتبر'),
  date_of_birth: z.string().min(10, 'تاریخ تولد معتبر'),
  gender: z.enum(['male', 'female']),
  address: z.string().optional(),
})

type PatientFormData = z.infer<typeof patientSchema>

export function PatientFormPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const [createPatient, { isLoading: isCreating }] = useCreatePatientMutation()
  const [updatePatient, { isLoading: isUpdating }] = useUpdatePatientMutation()
  const { data: patient, isLoading: isLoadingPatient } = useGetPatientQuery(Number(id), { skip: !isEdit })
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    values: patient ? {
      first_name: patient.first_name,
      last_name: patient.last_name,
      national_id: patient.national_id,
      phone_number: patient.phone_number,
      date_of_birth: patient.date_of_birth || '',
      gender: patient.gender,
      address: patient.address || '',
    } : undefined,
  })

  const onSubmit = async (data: PatientFormData) => {
    try {
      setError(null)
      if (isEdit && id) {
        await updatePatient({ id: Number(id), data }).unwrap()
      } else {
        await createPatient(data).unwrap()
      }
      navigate('/patients')
    } catch (err: any) {
      setError(getErrorMessage(err, t('patients.saveError')))
    }
  }

  if (isEdit && isLoadingPatient) {
    return <div className="text-center py-12">{t('common.loading')}</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? t('patients.editPatient') : t('patients.newPatient')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="first_name"
                label={t('patients.firstName')}
                placeholder={t('patients.firstName')}
                error={errors.first_name?.message}
                {...register('first_name')}
              />
              <Input
                id="last_name"
                label={t('patients.lastName')}
                placeholder={t('patients.lastName')}
                error={errors.last_name?.message}
                {...register('last_name')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="national_id"
                label={t('patients.nationalId')}
                placeholder="۱۰ رقم"
                error={errors.national_id?.message}
                {...register('national_id')}
              />
              <Input
                id="phone_number"
                label={t('patients.phone')}
                placeholder="09xxxxxxxxx"
                error={errors.phone_number?.message}
                {...register('phone_number')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="date_of_birth"
                label={t('patients.birthDate')}
                type="date"
                error={errors.date_of_birth?.message}
                {...register('date_of_birth')}
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium">{t('patients.gender')}</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
                  {...register('gender')}
                >
                  <option value="male">{t('patients.male')}</option>
                  <option value="female">{t('patients.female')}</option>
                </select>
                {errors.gender && <p className="text-sm text-red-500">{errors.gender.message}</p>}
              </div>
            </div>

            <Input
              id="address"
              label={t('patients.address')}
              placeholder={t('patients.address')}
              error={errors.address?.message}
              {...register('address')}
            />

            <div className="flex gap-4 pt-4">
              <Button type="submit" isLoading={isCreating || isUpdating}>
                {isEdit ? t('common.save') : t('patients.registerPatient')}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/patients')}>
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
