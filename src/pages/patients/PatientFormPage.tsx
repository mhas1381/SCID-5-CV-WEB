import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreatePatientMutation, useUpdatePatientMutation, useGetPatientQuery } from '@/store/api/patientApi'
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

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
      setError(err?.data?.detail || 'خطا در ذخیره اطلاعات')
    }
  }

  if (isEdit && isLoadingPatient) {
    return <div className="text-center py-12">در حال بارگذاری...</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'ویرایش بیمار' : 'ثبت بیمار جدید'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="first_name"
                label="نام"
                placeholder="نام"
                error={errors.first_name?.message}
                {...register('first_name')}
              />
              <Input
                id="last_name"
                label="نام خانوادگی"
                placeholder="نام خانوادگی"
                error={errors.last_name?.message}
                {...register('last_name')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="national_id"
                label="کد ملی"
                placeholder="۱۰ رقم"
                error={errors.national_id?.message}
                {...register('national_id')}
              />
              <Input
                id="phone_number"
                label="شماره تماس"
                placeholder="09xxxxxxxxx"
                error={errors.phone_number?.message}
                {...register('phone_number')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="date_of_birth"
                label="تاریخ تولد"
                type="date"
                error={errors.date_of_birth?.message}
                {...register('date_of_birth')}
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium">جنسیت</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
                  {...register('gender')}
                >
                  <option value="male">مرد</option>
                  <option value="female">زن</option>
                </select>
                {errors.gender && <p className="text-sm text-red-500">{errors.gender.message}</p>}
              </div>
            </div>

            <Input
              id="address"
              label="آدرس"
              placeholder="آدرس (اختیاری)"
              error={errors.address?.message}
              {...register('address')}
            />

            <div className="flex gap-4 pt-4">
              <Button type="submit" isLoading={isCreating || isUpdating}>
                {isEdit ? 'بروزرسانی' : 'ثبت بیمار'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/patients')}>
                انصراف
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}