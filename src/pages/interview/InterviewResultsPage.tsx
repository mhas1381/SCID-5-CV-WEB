import { useParams, useNavigate } from 'react-router-dom'
import { useGetDiagnosticResultQuery } from '@/store/api/interviewApi'
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { AlertCircle, FileText, ArrowLeft, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/utils/cn'

export function InterviewResultsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const sessionId = Number(id)

  const { data: results, isLoading, error } = useGetDiagnosticResultQuery(sessionId)

  if (isLoading) {
    return <div className="text-center py-12">در حال محاسبه نتایج...</div>
  }

  if (error || !results) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-[hsl(var(--muted-foreground))]">خطا در بارگذاری نتایج</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/interview')}>
          بازگشت
        </Button>
      </div>
    )
  }

  const resultsArray = Array.isArray(results) ? results : [results]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">نتایج تشخیصی</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            نتایج ارزیابی بر اساس SCID-5-CV
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(`/interview/${id}/report`)}>
          <FileText className="ml-2 h-4 w-4" />
          گزارش کامل
        </Button>
      </div>

      {resultsArray.map((result, idx) => (
        <Card key={idx}>
          <CardHeader>
            <CardTitle>ماژول {result.module} - {result.diagnosis}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Severity */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">شدت:</span>
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                result.severity === 'severe' ? 'bg-red-100 text-red-800' :
                result.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              )}>
                {result.severity === 'severe' ? 'شدید' :
                 result.severity === 'moderate' ? 'متوسط' : 'خفیف'}
              </span>
            </div>

            {/* Criteria */}
            <div>
              <h4 className="text-sm font-medium mb-2">معیارهای تشخیصی:</h4>
              <div className="space-y-2">
                {result.criteria_met.map((criterion, cIdx) => (
                  <div key={cIdx} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{criterion}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confidence */}
            <div>
              <span className="text-sm font-medium">اطمینان تشخیصی: </span>
              <span className="text-sm">{result.confidence}%</span>
            </div>

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="rounded-lg bg-blue-50 p-4">
                <h4 className="text-sm font-medium mb-2 text-blue-800">توصیه‌ها:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.recommendations.map((rec, rIdx) => (
                    <li key={rIdx} className="text-sm text-blue-700">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            خلاصه تشخیصی
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">
              تعداد تشخیص‌ها: <strong>{resultsArray.length}</strong>
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button onClick={() => navigate('/sessions')}>
          <ArrowLeft className="ml-2 h-4 w-4" />
          بازگشت به لیست جلسات
        </Button>
        <Button variant="outline" onClick={() => navigate('/interview')}>
          شروع مصاحبه جدید
        </Button>
      </div>
    </div>
  )
}