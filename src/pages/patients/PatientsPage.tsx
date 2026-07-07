import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetPatientsQuery, useDeletePatientMutation } from '@/store/api/patientApi'
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { Input } from '@/components/ui/Input'
import { Plus, Search, Edit2, Trash2, User } from 'lucide-react'

export function PatientsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { data, isLoading } = useGetPatientsQuery({ page, search })
  const [deletePatient] = useDeletePatientMutation()

  const handleDelete = async (id: number) => {
    if (window.confirm('آیا از حذف این بیمار اطمینان دارید؟')) {
      await deletePatient(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">مدیریت بیماران</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            لیست بیماران شما
          </p>
        </div>
        <Button onClick={() => navigate('/patients/new')}>
          <Plus className="ml-2 h-4 w-4" />
          بیمار جدید
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="جستجوی بیمار..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pr-10 pl-4 py-2 rounded-lg border border-[hsl(var(--input))] bg-transparent text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
          در حال بارگذاری...
        </div>
      ) : data?.results.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-[hsl(var(--muted-foreground))] mb-4" />
            <p className="text-[hsl(var(--muted-foreground))]">بیماری یافت نشد</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/patients/new')}>
              ثبت بیمار جدید
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.results.map((patient) => (
            <Card key={patient.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/patients/${patient.id}`)}>
              <CardHeader>
                <CardTitle className="text-base">{patient.first_name} {patient.last_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><span className="text-[hsl(var(--muted-foreground))]">کد ملی:</span> {patient.national_id}</p>
                  <p><span className="text-[hsl(var(--muted-foreground))]">تلفن:</span> {patient.phone_number}</p>
                  <p><span className="text-[hsl(var(--muted-foreground))]">جنسیت:</span> {patient.gender === 'male' ? 'مرد' : 'زن'}</p>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-[hsl(var(--border))]">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); navigate(`/patients/${patient.id}/edit`) }}
                  >
                    <Edit2 className="ml-1 h-3 w-3" />
                    ویرایش
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={(e) => { e.stopPropagation(); handleDelete(patient.id) }}
                  >
                    <Trash2 className="ml-1 h-3 w-3" />
                    حذف
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data && data.count > 20 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            disabled={!data.previous}
            onClick={() => setPage((p) => p - 1)}
          >
            قبلی
          </Button>
          <span className="flex items-center px-4 text-sm">
            صفحه {page}
          </span>
          <Button
            variant="outline"
            disabled={!data.next}
            onClick={() => setPage((p) => p + 1)}
          >
            بعدی
          </Button>
        </div>
      )}
    </div>
  )
}