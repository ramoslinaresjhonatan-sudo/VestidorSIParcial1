import { Bell, ChevronDown, Menu, Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { getStoredUser } from '@/utils/authSession'
import './Header.css'

const titles = {
  [ROUTES.DASHBOARD]: ['Dashboard', 'Resumen general del sistema'],
  [ROUTES.USERS]: ['Usuarios', 'Personas y accesos institucionales'],
  [ROUTES.ROLES]: ['Roles', 'Perfiles y permisos asignados'],
  [ROUTES.PERMISSIONS]: ['Permisos', 'Catálogo de acciones disponibles'],
}

function initials(user, fallbackEmail) {
  if (user?.nombre) return `${user.nombre[0]}${user.apellido_paterno?.[0] || ''}`.toUpperCase()
  return fallbackEmail?.slice(0, 2).toUpperCase() || 'US'
}

export function Header({ user, onMenuClick, onLogout }) {
  const location = useLocation()
  const [title, subtitle] = titles[location.pathname] || ['Panel', 'Administración educativa']
  const storedUser = getStoredUser()
  const displayName = user ? `${user.nombre} ${user.apellido_paterno}` : 'Usuario del sistema'
  const roleName = user?.roles?.[0]?.nombre || 'Administrador'

  return (
    <header className="app-header">
      <div className="header-heading">
        <button className="header-menu" type="button" onClick={onMenuClick} aria-label="Abrir menú"><Menu size={21} /></button>
        <div><h1>{title}</h1><p>{subtitle}</p></div>
      </div>
      <div className="header-actions">
        <button className="header-icon-button header-search" type="button" aria-label="Buscar"><Search size={19} /></button>
        <button className="header-icon-button notification-button" type="button" aria-label="Notificaciones"><Bell size={19} /><i /></button>
        <div className="header-divider" />
        <button className="header-profile" type="button" onClick={onLogout} title="Cerrar sesión">
          <span className="header-avatar">{initials(user, storedUser.email)}</span>
          <span className="header-profile__text"><strong>{displayName}</strong><small>{roleName} · {user?.correo || storedUser.email}</small></span>
          <ChevronDown size={15} />
        </button>
      </div>
    </header>
  )
}
