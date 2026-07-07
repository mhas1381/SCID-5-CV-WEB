import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetPatientsQuery } from '@/store/api/patientApi'
import { useCreateSessionMutation } from '@/store/api/interviewApi'
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { Brain, User, AlertCircle } from 'lucide-react'
import { cn } from '@/utils/cn'

const MODULES = [
  { id: 'A', label: 'حالات خلقی (Mood Episodes)', description: 'MDD, Dysthymia, Mania, Hypomania' },
  { id: 'B', label: 'روان‌پریشی (Psychotic Symptoms)', description: 'Schizophrenia, Schizoaffective, Delusional' },
  { id: 'C', label: 'اختلالات خلقی (Differential of Mood Disorders)', description: 'تفکیک اختلالات خلقی' },
  { id: 'D', label: 'سوء مصرف مواد (Substance Use)', description: 'Alcohol, Cannabis, Stimulants, Opioids' },
  { id: 'E', label: 'اضطراب (Anxiety Disorders)', description: 'Panic, Agoraphobia, Social Anxiety, GAD' },
  { id: 'F', label: 'وسواس و استرس (OCD & PTSD)', description: 'OCD, PTSD, Acute Stress' },
  { id: 'G', label: 'اختلالات جسمانی (Somatic Symptoms)', description: 'Somatization, Conversion, Illness Anxiety' },
  { id: 'H', label: 'اختلالات تغذیه (Eating Disorders)', description: 'Anorexia, Bulimia, Binge Eating' },
  { id: 'I', label: 'اختلالات خواب (Sleep Disorders)', description: 'Insomnia, Hypersomnia, Nightmare' },
  { id: 'J', label: 'اختلالات تطبیقی (Adjustment Disorders)', description: 'Adjustment Disorder subtypes' },
]

export function NewInterviewPage() {
  const navigate = useNavigate()
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null)
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const { data: patientsData } = useGetPatientsQuery({ page: 1 })
  const [createSession, { isLoading }] = useCreateSessionMutation()

  const handleStart = async () => {
    if (!selectedPatient || !selectedModule) {
      setError('لطفاً بیمار و ماژول را انتخاب کنید')
      return
    }
    try {
      setError(null)
      const session = await createSession({ patient: selectedPatient, module: selectedModule }).unwrap()
      navigate(`/interview/${session.id}`)
    } catch (err: any) {
      setError(err?.data?.detail || 'خطا در شروع مصاحبه')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">مصاحبه جدید</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          شروع یک مصاحبه بالینی جدید
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            انتخاب بیمار
          </CardTitle>
        </CardHeader>
        <CardContent>
          <select
            className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
            value={selectedPatient ?? ''}
            onChange={(e) => setSelectedPatient(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">انتخاب بیمار...</option>
            {patientsData?.results.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.first_name} {patient.last_name} - {patient.national_id}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            انتخاب ماژول
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MODULES.map((module) => (
              <button
                key={module.id}
                onClick={() => setSelectedModule(module.id)}
                className={cn(
                  'text-right rounded-lg border p-4 transition-all hover:shadow-md',
                  selectedModule === module.id
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5 shadow-sm'
                    : 'border-[hsl(var(--border))]'
                )}
              >
                <div className="font-medium">ماژول {module.id}: {module.label}</div>
                <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                  {module.description}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button size="lg" onClick={handleStart} isLoading={isLoading} disabled={!selectedPatient || !selectedModule}>
          شروع مصاحبه
        </Button>
      </div>
    </div>
  )
}