import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useDirection } from '@/hooks/useDirection'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { LandingPage } from '@/pages/landing/LandingPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { SetPasswordPage } from '@/pages/auth/SetPasswordPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { PatientsPage } from '@/pages/patients/PatientsPage'
import { PatientFormPage } from '@/pages/patients/PatientFormPage'
import { NewInterviewPage } from '@/pages/interview/NewInterviewPage'
import { InterviewSessionPage } from '@/pages/interview/InterviewSessionPage'
import { InterviewResultsPage } from '@/pages/interview/InterviewResultsPage'
import { SessionsListPage } from '@/pages/sessions/SessionsListPage'

function AppContent() {
  useDirection()

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/set-password" element={<SetPasswordPage />} />

      {/* Protected Routes with Layout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Patients */}
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/patients/new" element={<PatientFormPage />} />
        <Route path="/patients/:id/edit" element={<PatientFormPage />} />
        <Route path="/patients/:id" element={<PatientsPage />} />

        {/* Interview */}
        <Route path="/interview" element={<NewInterviewPage />} />
        <Route path="/interview/:id" element={<InterviewSessionPage />} />
        <Route path="/interview/:id/results" element={<InterviewResultsPage />} />

        {/* Sessions History */}
        <Route path="/sessions" element={<SessionsListPage />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}