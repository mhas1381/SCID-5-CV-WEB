import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetSessionQuery, useGetModuleQuestionsQuery, useSubmitAnswerMutation, useCompleteSessionMutation } from '@/store/api/interviewApi'
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { AlertCircle, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react'
import { cn } from '@/utils/cn'

export function InterviewSessionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const sessionId = Number(id)

  const { data: session, isLoading: sessionLoading, error: sessionError } = useGetSessionQuery(sessionId)
  const { data: questions, isLoading: questionsLoading } = useGetModuleQuestionsQuery(
    { module: session?.module ?? '', lang: 'fa' as const },
    { skip: !session }
  )
  const [submitAnswer] = useSubmitAnswerMutation()
  const [completeSession, { isLoading: isCompleting }] = useCompleteSessionMutation()

  const [currentIndex, setCurrentIndex] = useState(session?.current_question_index || 0)
  const [answers, setAnswers] = useState<Record<string, string | boolean | number>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})

  if (sessionLoading || questionsLoading) {
    return <div className="text-center py-12">در حال بارگذاری...</div>
  }

  if (sessionError || !session || !questions) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-[hsl(var(--muted-foreground))]">خطا در بارگذاری جلسه</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/interview')}>
          بازگشت
        </Button>
      </div>
    )
  }

  const question = questions[currentIndex]
  if (!question) return null

  const isLastQuestion = currentIndex === questions.length - 1
  const currentAnswer = answers[question.id]

  const handleAnswer = async (value: string | boolean | number) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }))
    try {
      await submitAnswer({
        sessionId,
        questionId: question.id,
        value,
        notes: notes[question.id],
      }).unwrap()
    } catch (err) {
      console.error('Failed to submit answer:', err)
    }
  }

  const handleNext = () => {
    if (!currentAnswer && question.required) return
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1)
    }
  }

  const handleComplete = async () => {
    try {
      await completeSession(sessionId).unwrap()
      navigate(`/interview/${sessionId}/results`)
    } catch (err) {
      console.error('Failed to complete session:', err)
    }
  }

  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">ماژول {session.module}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {session.patient_name} • سؤال {currentIndex + 1} از {questions.length}
          </p>
        </div>
        <span className={cn(
          'px-3 py-1 rounded-full text-xs font-medium',
          session.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
          session.status === 'completed' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'
        )}>
          {session.status === 'in_progress' ? 'در حال انجام' :
           session.status === 'completed' ? 'تکمیل شده' : 'لغو شده'}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[hsl(var(--secondary))] rounded-full h-2">
        <div
          className="bg-[hsl(var(--primary))] h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{question.question_text}</CardTitle>
          {question.criteria && (
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
              معیار: {question.criteria}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Question Type: Yes/No */}
          {question.question_type === 'yes_no' && (
            <div className="flex gap-3">
              <Button
                variant={currentAnswer === true ? 'primary' : 'outline'}
                onClick={() => handleAnswer(true)}
                className="flex-1"
              >
                بله
              </Button>
              <Button
                variant={currentAnswer === false ? 'primary' : 'outline'}
                onClick={() => handleAnswer(false)}
                className="flex-1"
              >
                خیر
              </Button>
            </div>
          )}

          {/* Question Type: Multiple Choice */}
          {question.question_type === 'multiple_choice' && question.options && (
            <div className="space-y-2">
              {question.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className={cn(
                    'w-full text-right rounded-lg border p-3 transition-all',
                    currentAnswer === option.value
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5'
                      : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {/* Question Type: Scale */}
          {question.question_type === 'scale' && (
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleAnswer(value)}
                  className={cn(
                    'w-12 h-12 rounded-full border text-sm font-medium transition-all',
                    currentAnswer === value
                      ? 'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]'
                      : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]'
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">یادداشت (اختیاری)</label>
            <textarea
              className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm min-h-[80px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
              placeholder="یادداشت بالینی..."
              value={notes[question.id] || ''}
              onChange={(e) => setNotes((prev) => ({ ...prev, [question.id]: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrev} disabled={currentIndex === 0}>
          <ChevronRight className="ml-2 h-4 w-4" />
          قبلی
        </Button>

        {isLastQuestion ? (
          <Button onClick={handleComplete} isLoading={isCompleting}>
            <CheckCircle className="ml-2 h-4 w-4" />
            تکمیل مصاحبه
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={!currentAnswer && question.required}>
            بعدی
            <ChevronLeft className="mr-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Question Navigator */}
      <div className="flex flex-wrap gap-2 justify-center">
        {questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(i)}
            className={cn(
              'w-8 h-8 rounded-full text-xs font-medium border transition-all',
              i === currentIndex
                ? 'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]'
                : answers[q.id]
                ? 'bg-green-100 text-green-700 border-green-300'
                : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  )
}