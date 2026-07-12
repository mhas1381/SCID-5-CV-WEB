import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreatePatientMutation, useUpdatePatientMutation, useGetPatientQuery } from '@/store/api/patientApi'
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { JalaliDatePicker } from '@/components/ui/JalaliDatePicker'
import { getErrorMessage } from '@/utils/error'
import { toast } from 'sonner'
import { UserPlus, User, ArrowRight, Loader2 } from 'lucide-react'

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
    control,
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
        toast.success(t('patients.updateSuccess'))
      } else {
        await createPatient(data).unwrap()
        toast.success(t('patients.createSuccess'))
      }
      navigate('/patients')
    } catch (err: any) {
      const msg = getErrorMessage(err, t('patients.saveError'))
      toast.error(msg)
      setError(msg)
    }
  }

  if (isEdit && isLoadingPatient) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <button
          onClick={() => navigate('/patients')}
          className="flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] hover:text-foreground transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          {t('patients.title')}
        </button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[hsl(var(--primary))/10] p-3">
              {isEdit ? <User className="h-6 w-6 text-[hsl(var(--primary))]" /> : <UserPlus className="h-6 w-6 text-[hsl(var(--primary))]" />}
            </div>
            <div>
              <CardTitle className="text-xl">{isEdit ? t('patients.editPatient') : t('patients.newPatient')}</CardTitle>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                {isEdit ? 'ویرایش اطلاعات بیمار' : 'ثبت اطلاعات بیمار جدید'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                dir="ltr"
                error={errors.phone_number?.message}
                {...register('phone_number')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="date_of_birth"
                control={control}
                render={({ field }) => (
                  <JalaliDatePicker
                    label={t('patients.birthDate')}
                    value={field.value || ''}
                    onChange={field.onChange}
                    error={errors.date_of_birth?.message}
                  />
                )}
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[hsl(var(--foreground))]">{t('patients.gender')}</label>
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

            <div className="flex gap-4 pt-4 border-t border-[hsl(var(--border))]">
              <Button type="submit" isLoading={isCreating || isUpdating} className="min-w-[120px]">
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
