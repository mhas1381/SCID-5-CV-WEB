import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  useGetSessionQuery,
  useGetOverviewQuestionsQuery,
  useCreateOverviewMutation,
  useCompleteOverviewMutation,
} from '@/store/api/interviewApi'
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'
import { getErrorMessage } from '@/utils/error'
import type { OverviewQuestion } from '@/types'

export function OverviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const sessionId = Number(id)
  const lang = i18n.language as 'en' | 'fa'

  const { data: session, isLoading: sessionLoading, error: sessionError } = useGetSessionQuery(sessionId)
  const { data: overviewQuestions, isLoading: questionsLoading } = useGetOverviewQuestionsQuery({ lang })
  const [createOverview, { isLoading: isSaving }] = useCreateOverviewMutation()
  const [completeOverview, { isLoading: isCompleting }] = useCompleteOverviewMutation()

  const [answers, setAnswers] = useState<Record<string, string | boolean | number>>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (overviewQuestions) {
      const defaults: Record<string, string | boolean | number> = {}
      for (const section of overviewQuestions.sections) {
        for (const q of section.questions) {
      if (q.input_type === 'radio') defaults[q.key] = ''
      else if (q.input_type === 'number') defaults[q.key] = 0
      else defaults[q.key] = ''
        }
      }
      setAnswers((prev) => {
        const merged = { ...defaults, ...prev }
        return Object.keys(defaults).length > 0 ? merged : prev
      })
    }
  }, [overviewQuestions])

  const handleSubmit = async () => {
    if (!session) return
    setError(null)
    try {
      await createOverview({ patientId: session.patient, data: { answers } }).unwrap()
      await completeOverview(sessionId).unwrap()
      navigate(`/interview/${sessionId}`)
    } catch (err: any) {
      setError(getErrorMessage(err, t('interview.overviewError')))
    }
  }

  if (sessionLoading || questionsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
      </div>
    )
  }

  if (sessionError || !session || !overviewQuestions) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-[hsl(var(--muted-foreground))]">{t('interview.sessionError')}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/interview')}>
          {t('common.back')}
        </Button>
      </div>
    )
  }

  const renderField = (q: OverviewQuestion) => {
    const value = answers[q.key] ?? ''
    const set = (val: string | boolean | number) => setAnswers((prev) => ({ ...prev, [q.key]: val }))

    switch (q.input_type) {
      case 'text':
        return (
          <input
            type="text"
            value={value as string}
            onChange={(e) => set(e.target.value)}
            className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
          />
        )
      case 'textarea':
        return (
          <textarea
            value={value as string}
            onChange={(e) => set(e.target.value)}
            className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm min-h-[80px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
          />
        )
      case 'number':
        return (
          <input
            type="number"
            value={value as number}
            onChange={(e) => set(Number(e.target.value))}
            className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
          />
        )
      case 'date':
        return (
          <input
            type="date"
            value={value as string}
            onChange={(e) => set(e.target.value)}
            className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
          />
        )
      case 'radio':
        return (
          <div className="space-y-2">
            {(q.choices && q.choices.length > 0 ? q.choices : [
              { value: 'yes', label: t('common.yes') },
              { value: 'no', label: t('common.no') },
            ]).map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => set(choice.value)}
                className={`w-full text-right rounded-lg border p-3 text-sm transition-all ${
                  value === choice.value
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5'
                    : 'border-[hsl(var(--border))]'
                }`}
              >
                {choice.label}
              </button>
            ))}
          </div>
        )
      default:
        return (
          <input
            type="text"
            value={value as string}
            onChange={(e) => set(e.target.value)}
            className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
          />
        )
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('interview.overviewTitle')}</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            {t('interview.overviewDescription')}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/interview')}>
          <ArrowLeft className="ml-2 h-4 w-4" />
          {t('common.back')}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {overviewQuestions.sections.map((section) => {
        const sectionTitle = lang === 'fa' && section.title_fa ? section.title_fa : section.title
        return (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle className="text-lg">{sectionTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {section.questions.map((q) => {
                const label = lang === 'fa' && q.text_fa ? q.text_fa : q.text
                return (
                  <div key={q.key}>
                    <label className="block text-sm font-medium mb-2">
                      {label}
                      {q.required && <span className="text-red-500 mr-1">*</span>}
                    </label>
                    {renderField(q)}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )
      })}

      <div className="flex justify-center pb-8">
        <Button
          size="lg"
          onClick={handleSubmit}
          isLoading={isSaving || isCompleting}
        >
          {t('interview.overviewSubmit')}
        </Button>
      </div>
    </div>
  )
}