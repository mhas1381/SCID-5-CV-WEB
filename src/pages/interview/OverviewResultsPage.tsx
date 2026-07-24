import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGetSessionQuery, useGetOverviewDetailQuery, useGetOverviewQuestionsQuery } from '@/store/api/interviewApi'
import { Button, Card, CardHeader, CardTitle, CardContent, PageLoader } from '@/components/ui'
import { ArrowLeft, User } from 'lucide-react'

function formatOverviewValue(value: unknown, question: { choices?: { value?: string; label?: string; label_en?: string; label_fa?: string }[] | null }, isRtl: boolean): string {
  if (value === null || value === undefined || value === '') return '-'
  const strVal = String(value)

  if (question.choices && question.choices.length > 0) {
    const choice = question.choices.find((c) => String(c.value) === strVal)
    if (choice) {
      if (isRtl && choice.label_fa) return choice.label_fa
      if (choice.label_en) return choice.label_en
      if (choice.label) return choice.label
    }
  }

  if (strVal === 'true') return isRtl ? 'بله' : 'Yes'
  if (strVal === 'false') return isRtl ? 'خیر' : 'No'

  return strVal
}

export function OverviewResultsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const sessionId = Number(id)
  const isRtl = i18n.language === 'fa'

  const { data: session } = useGetSessionQuery(sessionId)
  const overviewId = session?.overview_id
  const { data: overview, isLoading } = useGetOverviewDetailQuery(overviewId!, { skip: !overviewId })
  const { data: overviewQuestions } = useGetOverviewQuestionsQuery({ lang: isRtl ? 'fa' : 'en' })

  if (isLoading) {
    return <PageLoader />
  }

  const sectionIcons: Record<string, string> = {
    demographic: '👤',
    illness_history: '🩺',
    treatment_history: '💊',
    medical: '🏥',
    suicidal: '⚠️',
    other: '📋',
  }

  const patientName = session?.patient_name || ''

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/sessions')}>
          <ArrowLeft className="ml-1 h-4 w-4" />
          {isRtl ? 'بازگشت' : 'Back'}
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <User className="h-6 w-6 text-[hsl(var(--primary))]" />
          {isRtl ? 'اطلاعات زمینه‌ای بیمار' : 'Patient Background Information'}
        </h1>
        {patientName && (
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            {patientName}
          </p>
        )}
      </div>

      {overview && overviewQuestions ? (
        <div className="space-y-8">
          {overviewQuestions.sections.map((section) => {
            const sectionAnswers = section.questions.filter(
              (q) => q.key in overview.answers && overview.answers[q.key] !== '' && overview.answers[q.key] !== null && overview.answers[q.key] !== undefined
            )
            if (sectionAnswers.length === 0) return null
            return (
              <Card key={section.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span>{sectionIcons[section.id] || '📄'}</span>
                    <span>{isRtl && section.title_fa ? section.title_fa : section.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-[hsl(var(--border))] rounded-lg border border-[hsl(var(--border))]">
                    {sectionAnswers.map((q) => {
                      const answerVal = overview.answers[q.key]
                      const displayVal = formatOverviewValue(answerVal, q, isRtl)
                      const questionText = isRtl && q.text_fa ? q.text_fa : q.text
                      return (
                        <div key={q.key} className="flex items-start justify-between gap-4 px-4 py-3 text-sm">
                          <span className="text-[hsl(var(--muted-foreground))] flex-1">{questionText}</span>
                          <span className="font-medium text-[hsl(var(--foreground))] shrink-0 max-w-[50%] text-left" dir="ltr">
                            {displayVal}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-[hsl(var(--muted-foreground))]">
            {isRtl ? 'اطلاعات زمینه‌ای ثبت نشده است.' : 'No background information recorded.'}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4 pb-8">
        <Button onClick={() => navigate('/sessions')}>
          <ArrowLeft className="ml-2 h-4 w-4" />
          {isRtl ? 'بازگشت به لیست جلسات' : 'Back to Sessions'}
        </Button>
        {session?.status === 'completed' && (
          <Button variant="outline" onClick={() => navigate(`/interview/${id}/results`)}>
            {isRtl ? 'مشاهده نتایج تشخیصی' : 'View Diagnostic Results'}
          </Button>
        )}
      </div>
    </div>
  )
}