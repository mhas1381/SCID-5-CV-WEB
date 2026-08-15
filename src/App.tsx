import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useDirection } from '@/hooks/useDirection'
import { useTheme } from '@/hooks/useTheme'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AppLayout } from '@/components/layout/AppLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminRoute } from '@/components/auth/AdminRoute'

const LandingPage = lazy(() => import('@/pages/landing/LandingPage').then(m => ({ default: m.LandingPage })))
const AboutPage = lazy(() => import('@/pages/landing/AboutPage').then(m => ({ default: m.AboutPage })))
const StructuredInterviewPage = lazy(() => import('@/pages/landing/StructuredInterviewPage').then(m => ({ default: m.StructuredInterviewPage })))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })))
const SetPasswordPage = lazy(() => import('@/pages/auth/SetPasswordPage').then(m => ({ default: m.SetPasswordPage })))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })))
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

const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })))
const AdminInterviewsPage = lazy(() => import('@/pages/admin/AdminInterviewsPage').then(m => ({ default: m.AdminInterviewsPage })))
const AdminAgreementPage = lazy(() => import('@/pages/admin/AdminAgreementPage').then(m => ({ default: m.AdminAgreementPage })))
const AdminDemographicsPage = lazy(() => import('@/pages/admin/AdminDemographicsPage').then(m => ({ default: m.AdminDemographicsPage })))
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })))
const AdminActivityPage = lazy(() => import('@/pages/admin/AdminActivityPage').then(m => ({ default: m.AdminActivityPage })))
const AdminFeedbackPage = lazy(() => import('@/pages/admin/AdminFeedbackPage').then(m => ({ default: m.AdminFeedbackPage })))

/**
 * Tracks navigation direction from the browser history index that react-router
 * stores in `history.state.idx`: going forward (push/link) slides in from the
 * right, going back (browser back button) slides in from the left. The new page
 * mounts while the direction is still computed against the previous index, so
 * the very first render already carries the correct direction.
 */
function useNavDirection(pathname: string): 'forward' | 'back' {
  const prevIdxRef = useRef<number | null>(null)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')

  useEffect(() => {
    const idx = (window.history.state as { idx?: number | null } | null)?.idx ?? null
    if (prevIdxRef.current !== null && idx !== null) {
      if (idx < prevIdxRef.current) setDirection('back')
      else if (idx > prevIdxRef.current) setDirection('forward')
    }
    prevIdxRef.current = idx
  }, [pathname])

  return direction
}

function AppContent() {
  useDirection()
  useTheme()
  const { i18n } = useTranslation()
  const location = useLocation()
  const isRtl = i18n.language === 'fa'
  const direction = useNavDirection(location.pathname)
  const slide = (isRtl ? -1 : 1) * (direction === 'back' ? -32 : 32)

  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="min-h-screen" />}>
        <AnimatePresence initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: slide }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -slide }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <Routes location={location}>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/structured-interview" element={<StructuredInterviewPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
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

                {/* Demographics (available to all users) */}
                <Route path="/demographics" element={<AdminDemographicsPage />} />
              </Route>

              {/* Admin Panel Routes */}
              <Route
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/interviews" element={<AdminInterviewsPage />} />
                <Route path="/admin/agreement" element={<AdminAgreementPage />} />
                <Route path="/admin/demographics" element={<AdminDemographicsPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/activity" element={<AdminActivityPage />} />
                <Route path="/admin/feedback" element={<AdminFeedbackPage />} />
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