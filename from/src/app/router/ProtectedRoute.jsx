import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { isAuthenticated } from '@/utils/authSession'

export function ProtectedRoute() {
  const location = useLocation()
  if (!isAuthenticated()) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}
