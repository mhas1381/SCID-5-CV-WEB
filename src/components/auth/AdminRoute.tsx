import { Navigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '@/hooks/useAppStore'
import { useGetMeQuery } from '@/store/api/authApi'
import { LoadingSpinner } from '@/components/ui'

interface AdminRouteProps {
  children: React.ReactNode
}

/**
 * Guards admin-only routes. Only users whose profile role is "admin"
 * (or who are staff/superuser) may access the admin panel.
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const { t } = useTranslation()
  const { isAuthenticated, isLoading: authLoading } = useAppSelector(
    (state) => state.auth
  )
  const { data: user, isLoading: userLoading } = useGetMeQuery(undefined, {
    skip: !isAuthenticated,
  })
  const location = useLocation()

  if (authLoading || (isAuthenticated && userLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" label={t('admin.accessChecking')} />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const isAdmin = user?.role === 'admin' || user?.is_staff || user?.is_superuser

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
