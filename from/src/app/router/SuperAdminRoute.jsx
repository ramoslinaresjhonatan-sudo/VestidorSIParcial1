import { Navigate, Outlet } from 'react-router-dom'
import { Spinner } from '@/components/ui/Spinner/Spinner'
import { ROUTES } from '@/constants/routes'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { isSuperAdministrator } from '@/utils/accessControl'

export function SuperAdminRoute() {
  const currentUser = useCurrentUser()

  if (currentUser.isLoading) return <Spinner />
  if (!isSuperAdministrator(currentUser.data)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return <Outlet />
}
