import { useCallback, useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Header } from '@/components/shared/Header/Header'
import { Sidebar } from '@/components/shared/Sidebar/Sidebar'
import { Button } from '@/components/ui/Button/Button'
import { Modal } from '@/components/ui/Modal/Modal'
import { ROUTES } from '@/constants/routes'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { queryClient } from '@/lib/query/queryClient'
import { clearSession } from '@/utils/authSession'
import './MainLayout.css'

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [logoutConfirmationOpen, setLogoutConfirmationOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => window.localStorage.getItem('edu_sidebar_collapsed') === 'true',
  )
  const navigate = useNavigate()
  const currentUser = useCurrentUser()

  const logout = useCallback(() => {
    clearSession()
    queryClient.clear()
    navigate(ROUTES.LOGIN, { replace: true })
  }, [navigate])

  const requestLogout = useCallback(() => setLogoutConfirmationOpen(true), [])
  const cancelLogout = useCallback(() => setLogoutConfirmationOpen(false), [])
  const confirmLogout = useCallback(() => {
    setLogoutConfirmationOpen(false)
    logout()
  }, [logout])

  useEffect(() => {
    window.addEventListener('auth:logout', logout)
    return () => window.removeEventListener('auth:logout', logout)
  }, [logout])

  const toggleSidebar = () => {
    setSidebarCollapsed((value) => {
      const nextValue = !value
      window.localStorage.setItem('edu_sidebar_collapsed', String(nextValue))
      return nextValue
    })
  }

  return (
    <>
      <div className={`admin-layout${sidebarCollapsed ? ' admin-layout--sidebar-collapsed' : ''}`}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapsed={toggleSidebar}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          user={currentUser.data}
          onLogout={requestLogout}
        />
        <div className="admin-layout__main">
          <Header user={currentUser.data} onMenuClick={() => setSidebarOpen(true)} onLogout={requestLogout} />
          <main className="admin-content"><Outlet /></main>
        </div>
      </div>

      <Modal
        isOpen={logoutConfirmationOpen}
        onClose={cancelLogout}
        title="¿Seguro que deseas cerrar sesión?"
        description="Tendrás que ingresar nuevamente para acceder al sistema."
        size="sm"
      >
        <div className="logout-confirmation__actions">
          <Button variant="secondary" onClick={cancelLogout}>Cancelar</Button>
          <Button onClick={confirmLogout}>Cerrar sesión</Button>
        </div>
      </Modal>
    </>
  )
}
