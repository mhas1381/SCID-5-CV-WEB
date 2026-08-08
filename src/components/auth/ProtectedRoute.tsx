import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/hooks/useAppStore'
import { useGetMeQuery } from '@/store/api/authApi'
import { LoadingSpinner } from '@/components/ui'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const {
    isAuthenticated,
    isLoading: authLoading,
    user: authUser,
  } = useAppSelector((state) => state.auth)
  const { data: user, isLoading: userLoading } = useGetMeQuery(undefined, { skip: !isAuthenticated })
  const location = useLocation()

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" label="در حال بررسی احراز هویت..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Prefer the fresh profile from getMe, but fall back to the user object that
  // came back in the login response (setCredentials). This guarantees the
  // spinner can never block forever if getMe ever stalls after a login.
  const profileUser = user ?? authUser

  if (!profileUser && userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" label="در حال بررسی احراز هویت..." />
      </div>
    )
  }

  if (profileUser && (!profileUser.first_name || !profileUser.has_password)) {
    return <Navigate to="/complete-registration" replace />
  }

  return <>{children}</>
}