import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/hooks/useAppStore'
import { useGetMeQuery } from '@/store/api/authApi'
import { LoadingSpinner } from '@/components/ui'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading: authLoading } = useAppSelector((state) => state.auth)
  const { data: user, isLoading: userLoading } = useGetMeQuery(undefined, { skip: !isAuthenticated })
  const location = useLocation()

  if (authLoading || (isAuthenticated && userLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" label="در حال بررسی احراز هویت..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user && (!user.first_name || !user.has_password)) {
    return <Navigate to="/complete-registration" replace />
  }

  return <>{children}</>
}