import { GoogleOAuthProvider } from '@react-oauth/google'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useDirection } from '@/hooks/useDirection'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { LandingPage } from '@/pages/landing/LandingPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { SetPasswordPage } from '@/pages/auth/SetPasswordPage'
import { CompleteRegistrationPage } from '@/pages/auth/CompleteRegistrationPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { PatientsPage } from '@/pages/patients/PatientsPage'
import { PatientFormPage } from '@/pages/patients/PatientFormPage'
import { NewInterviewPage } from '@/pages/interview/NewInterviewPage'
import { OverviewPage } from '@/pages/interview/OverviewPage'
import { InterviewSessionPage } from '@/pages/interview/InterviewSessionPage'
import { InterviewResultsPage } from '@/pages/interview/InterviewResultsPage'
import { SessionsListPage } from '@/pages/sessions/SessionsListPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'

function AppContent() {
  useDirection()
  const { i18n } = useTranslation()
  const isRtl = i18n.language === 'fa'

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/complete-registration" element={<CompleteRegistrationPage />} />
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
          <Route path="/interview/:id/overview" element={<OverviewPage />} />
          <Route path="/interview/:id" element={<InterviewSessionPage />} />
          <Route path="/interview/:id/results" element={<InterviewResultsPage />} />

          {/* Profile */}
          <Route path="/profile" element={<ProfilePage />} />

          {/* Sessions History */}
          <Route path="/sessions" element={<SessionsListPage />} />
        </Route>
      </Routes>
      <Toaster richColors position={isRtl ? 'top-left' : 'top-right'} />
    </>
  )
}

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

export default function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </GoogleOAuthProvider>
  )
}