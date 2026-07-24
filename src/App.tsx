import { lazy, Suspense } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useDirection } from '@/hooks/useDirection'
import { useTheme } from '@/hooks/useTheme'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

const LandingPage = lazy(() => import('@/pages/landing/LandingPage').then(m => ({ default: m.LandingPage })))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then(m => ({ default: m.LoginPage })))
const SetPasswordPage = lazy(() => import('@/pages/auth/SetPasswordPage').then(m => ({ default: m.SetPasswordPage })))
const CompleteRegistrationPage = lazy(() => import('@/pages/auth/CompleteRegistrationPage').then(m => ({ default: m.CompleteRegistrationPage })))
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })))
const PatientsPage = lazy(() => import('@/pages/patients/PatientsPage').then(m => ({ default: m.PatientsPage })))
const PatientFormPage = lazy(() => import('@/pages/patients/PatientFormPage').then(m => ({ default: m.PatientFormPage })))
const NewInterviewPage = lazy(() => import('@/pages/interview/NewInterviewPage').then(m => ({ default: m.NewInterviewPage })))
const OverviewPage = lazy(() => import('@/pages/interview/OverviewPage').then(m => ({ default: m.OverviewPage })))
const InterviewSessionPage = lazy(() => import('@/pages/interview/InterviewSessionPage').then(m => ({ default: m.InterviewSessionPage })))
const InterviewResultsPage = lazy(() => import('@/pages/interview/InterviewResultsPage').then(m => ({ default: m.InterviewResultsPage })))
const OverviewResultsPage = lazy(() => import('@/pages/interview/OverviewResultsPage').then(m => ({ default: m.OverviewResultsPage })))
const SessionsListPage = lazy(() => import('@/pages/sessions/SessionsListPage').then(m => ({ default: m.SessionsListPage })))
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage').then(m => ({ default: m.ProfilePage })))
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage').then(m => ({ default: m.SettingsPage })))

function AppContent() {
  useDirection()
  useTheme()
  const { i18n } = useTranslation()
  const location = useLocation()
  const isRtl = i18n.language === 'fa'

  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="min-h-screen" />}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <Routes location={location}>
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
                <Route path="/interview/:id/background" element={<OverviewResultsPage />} />

                {/* Profile */}
                <Route path="/profile" element={<ProfilePage />} />

                {/* Settings */}
                <Route path="/settings" element={<SettingsPage />} />

                {/* Sessions History */}
                <Route path="/sessions" element={<SessionsListPage />} />
              </Route>
            </Routes>
          </motion.div>
        </AnimatePresence>
      </Suspense>
      <Toaster richColors position={isRtl ? 'top-left' : 'top-right'} />
    </ErrorBoundary>
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