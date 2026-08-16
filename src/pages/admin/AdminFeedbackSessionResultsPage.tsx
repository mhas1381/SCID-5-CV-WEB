import { useParams } from 'react-router-dom'
import { InterviewResultsPage } from '@/pages/interview/InterviewResultsPage'

export function AdminFeedbackSessionResultsPage() {
  const { id } = useParams<{ id: string }>()

  return <InterviewResultsPage sessionIdOverride={Number(id)} />
}
