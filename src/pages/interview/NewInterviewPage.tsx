import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useGetPatientsQuery } from '@/store/api/patientApi'
import { useCreateSessionMutation } from '@/store/api/interviewApi'
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { User, AlertCircle } from 'lucide-react'
import { getErrorMessage } from '@/utils/error'

export function NewInterviewPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const { data: patientsData } = useGetPatientsQuery({ page: 1 })
  const [createSession, { isLoading }] = useCreateSessionMutation()

  const handleStart = async () => {
    if (!selectedPatient) {
      setError(t('interview.selectPatientRequired'))
      return
    }
    try {
      setError(null)
      const session = await createSession({ patient: selectedPatient }).unwrap()
      navigate(`/interview/${session.id}/overview`)
    } catch (err: any) {
      setError(getErrorMessage(err, t('interview.startError')))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('interview.title')}</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          {t('interview.description')}
        </p>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
          {t('interview.newHint')}
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
            {t('interview.selectPatient')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <select
            className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
            value={selectedPatient ?? ''}
            onChange={(e) => setSelectedPatient(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">{t('interview.selectPatientPlaceholder')}</option>
            {patientsData?.results.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.full_name} - {patient.national_id}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button size="lg" onClick={handleStart} isLoading={isLoading} disabled={!selectedPatient}>
          {t('interview.start')}
        </Button>
      </div>
    </div>
  )
}
