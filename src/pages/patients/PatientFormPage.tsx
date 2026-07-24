import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreatePatientMutation, useUpdatePatientMutation, useGetPatientQuery } from '@/store/api/patientApi'
import { useGetProvincesQuery, useGetAllCitiesQuery } from '@/store/api/locationApi'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, PageLoader } from '@/components/ui'
import { JalaliDatePicker } from '@/components/ui/JalaliDatePicker'
import { getErrorMessage } from '@/utils/error'
import { cn } from '@/utils/cn'
import { toEnglishDigits } from '@/utils/string'
import { toast } from 'sonner'
import { UserPlus, User, ArrowRight } from 'lucide-react'
import type { FieldPath } from 'react-hook-form'

const patientSchema = z.object({
  first_name: z.string().min(2, 'نام حداقل ۲ کاراکتر'),
  last_name: z.string().min(2, 'نام خانوادگی حداقل ۲ کاراکتر'),
  national_id: z
    .string()
    .transform(toEnglishDigits)
    .refine(
      (val) => val.length === 10,
      'کد ملی ۱۰ رقم'
    ),
  phone_number: z
    .string()
    .transform(toEnglishDigits)
    .refine(
      (val) => val.length >= 10,
      'شماره تماس معتبر'
    ),
  birth_date: z.string().min(10, 'تاریخ تولد الزامی است'),
  gender: z.enum(['male', 'female']),
  education: z.string().min(1, 'تحصیلات الزامی است'),
  marital_status: z.string().min(1, 'وضعیت تأهل الزامی است'),
  province: z.number({ message: 'استان الزامی است' }),
  city: z.number({ message: 'شهر الزامی است' }),
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
  const { data: provinces } = useGetProvincesQuery()
  const { data: allCities } = useGetAllCitiesQuery()
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null)
  const [pageError, setPageError] = useState<string | null>(null)

  const cities = allCities?.filter((c) => c.province === selectedProvince)

  useEffect(() => {
    if (patient?.province) setSelectedProvince(patient.province)
    else setSelectedProvince(null)
  }, [patient?.province])

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: isEdit ? undefined : { gender: 'male', birth_date: '' },
    values: patient ? {
      first_name: patient.first_name,
      last_name: patient.last_name,
      national_id: patient.national_id || '',
      phone_number: patient.phone_number,
      birth_date: patient.birth_date || '',
      gender: patient.gender,
      education: patient.education || '',
      marital_status: patient.marital_status || '',
      province: patient.province,
      city: patient.city,
    } : undefined,
  })

  const watchedProvince = watch('province')

  const onSubmit = async (data: PatientFormData) => {
    try {
      setPageError(null)
      if (isEdit && id) {
        await updatePatient({ id: Number(id), data }).unwrap()
        toast.success(t('patients.updateSuccess'))
      } else {
        await createPatient(data as any).unwrap()
        toast.success(t('patients.createSuccess'))
      }
      navigate('/patients')
    } catch (err: any) {
      const msg = getErrorMessage(err, t('patients.saveError'))
      toast.error(msg)
      setPageError(msg)
      const errorData = err?.data
      if (errorData && typeof errorData === 'object') {
        for (const key of Object.keys(errorData)) {
          const val = errorData[key]
          const message = Array.isArray(val) ? String(val[0]) : String(val)
          setError(key as FieldPath<PatientFormData>, { type: 'manual', message })
        }
      }
    }
  }

  if (isEdit && isLoadingPatient) {
    return <PageLoader />
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
            {pageError && (
              <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
                {pageError}
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
                name="birth_date"
                control={control}
                render={({ field }) => (
                  <JalaliDatePicker
                    label={t('patients.birthDate')}
                    value={field.value || ''}
                    onChange={field.onChange}
                    error={errors.birth_date?.message}
                  />
                )}
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[hsl(var(--foreground))]">{t('patients.gender')}</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
                  {...register('gender')}
                >
                  <option value="male" className="bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">{t('patients.male')}</option>
                  <option value="female" className="bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">{t('patients.female')}</option>
                </select>
                {errors.gender && <p className="text-sm text-red-500 dark:text-red-400">{errors.gender.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[hsl(var(--foreground))]">تحصیلات</label>
                <select
                  className={cn(
                    'flex h-10 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]',
                    errors.education && 'border-red-500 dark:border-red-700',
                  )}
                  {...register('education')}
                >
                  <option value="" className="bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">انتخاب کنید</option>
                  <option value="none" className="bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">بدون تحصیلات</option>
                  <option value="diploma" className="bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">دیپلم</option>
                  <option value="associate" className="bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">کاردانی</option>
                  <option value="bachelor" className="bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">کارشناسی</option>
                  <option value="master" className="bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">کارشناسی ارشد</option>
                  <option value="doctorate" className="bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">دکتری</option>
                </select>
                {errors.education && <p className="text-sm text-red-500 dark:text-red-400">{errors.education.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[hsl(var(--foreground))]">وضعیت تأهل</label>
                <select
                  className={cn(
                    'flex h-10 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]',
                    errors.marital_status && 'border-red-500 dark:border-red-700',
                  )}
                  {...register('marital_status')}
                >
                  <option value="" className="bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">انتخاب کنید</option>
                  <option value="single" className="bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">مجرد</option>
                  <option value="married" className="bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">متأهل</option>
                  <option value="divorced" className="bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">مطلقه</option>
                  <option value="widowed" className="bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">همسر فوت شده</option>
                </select>
                {errors.marital_status && <p className="text-sm text-red-500 dark:text-red-400">{errors.marital_status.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[hsl(var(--foreground))]">استان</label>
                <select
                  className={cn(
                    'flex h-10 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]',
                    errors.province && 'border-red-500 dark:border-red-700',
                  )}
                  value={watchedProvince ? String(watchedProvince) : ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : 0
                    setValue('province', val as any)
                    setSelectedProvince(val || null)
                    setValue('city', 0 as any)
                  }}
                >
                  <option value="" className="bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">انتخاب استان</option>
                  {provinces?.map((p) => (
                    <option key={p.id} value={String(p.id)} className="bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">{p.name}</option>
                  ))}
                </select>
                {errors.province && <p className="text-sm text-red-500 dark:text-red-400">{errors.province.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[hsl(var(--foreground))]">شهر</label>
                <select
                  className={cn(
                    'flex h-10 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] disabled:opacity-50',
                    errors.city && 'border-red-500 dark:border-red-700',
                  )}
                  value={watch('city') ? String(watch('city')) : ''}
                  onChange={(e) => setValue('city', (e.target.value ? Number(e.target.value) : 0) as any)}
                  disabled={!watchedProvince}
                >
                  <option value="" className="bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">انتخاب شهر</option>
                  {cities?.map((c) => (
                    <option key={c.id} value={String(c.id)} className="bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">{c.name}</option>
                  ))}
                </select>
                {errors.city && <p className="text-sm text-red-500 dark:text-red-400">{errors.city.message}</p>}
              </div>
            </div>

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
