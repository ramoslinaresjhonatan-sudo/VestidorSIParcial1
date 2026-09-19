import { useState } from 'react'
import {
  ChevronDown,
  Crown,
  Package,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  User,
} from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import platformLogo from '@/assets/edugestion-platform-logo.png'
import { ROUTES } from '@/constants/routes'
import { getUserRole, isSuperAdministrator } from '@/utils/accessControl'
import { getStoredUser } from '@/utils/authSession'
import './Sidebar.css'

const navigationGroups = [
  {
    key: 'cuenta',
    label: 'Mi Cuenta',
    icon: User,
    items: [
      { to: ROUTES.PROFILE, label: 'Mi Perfil', shortLabel: 'MP' },
    ],
  },
  {
    key: 'tienda',
    label: 'Tienda',
    icon: ShoppingBag,
    items: [
      { to: ROUTES.CATALOGO, label: 'Catálogo', shortLabel: 'C' },
      { to: ROUTES.CART, label: 'Mi Carrito', shortLabel: 'Ca' },
    ],
  },
  {
    key: 'pedidos',
    label: 'Pedidos',
    icon: Package,
    items: [
      { to: ROUTES.PEDIDOS, label: 'Mis Pedidos', shortLabel: 'Pe' },
    ],
  },
  {
    key: 'ventas',
    label: 'Ventas',
    icon: ShoppingCart,
    allowedRoles: ['administrador', 'vendedor'],
    items: [
      { to: ROUTES.POS, label: 'POS Venta', shortLabel: 'Po' },
    ],
  },
  {
    key: 'reportes',
    label: 'Reportes',
    icon: Crown,
    allowedRoles: ['administrador', 'vendedor'],
    items: [
      { to: ROUTES.REPORTES, label: 'Reportes IA', shortLabel: 'Re' },
    ],
  },
  {
    key: 'catalog',
    label: 'Catálogo Admin',
    icon: ShoppingBag,
    allowedRoles: ['administrador'],
    items: [
      { to: ROUTES.ADMIN_CATALOGO, label: 'Productos', shortLabel: 'Pr' },
    ],
  },
  {
    key: 'inventario',
    label: 'Inventario',
    icon: Package,
    allowedRoles: ['administrador', 'vendedor'],
    items: [
      { to: ROUTES.INVENTARIO, label: 'Gestión Inventario', shortLabel: 'Gi' },
    ],
  },
  {
    key: 'superAdministration',
    label: 'Superadministración',
    icon: Crown,
    allowedRoles: ['administrador'],
    items: [
      { to: ROUTES.PLANS, label: 'Planes', shortLabel: 'P' },
    ],
  },
  {
    key: 'access',
    label: 'Gestión de acceso',
    icon: ShieldCheck,
    allowedRoles: ['administrador'],
    items: [
      { to: ROUTES.USERS, label: 'Usuarios', shortLabel: 'U' },
      { to: ROUTES.ROLES, label: 'Roles', shortLabel: 'R' },
      { to: ROUTES.PERMISSIONS, label: 'Permisos', shortLabel: 'P' },
    ],
  },
]

function initials(user, email) {
  if (user?.nombre) {
    return `${user.nombre[0]}${user.apellido_paterno?.[0] || ''}`.toUpperCase()
  }
  return email?.slice(0, 2).toUpperCase() || 'US'
}

function SidebarLink({ item, onNavigate, nested = false }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      data-tooltip={item.label}
      className={({ isActive }) => `sidebar-link${nested ? ' sidebar-link--nested' : ''}${isActive ? ' active' : ''}`}
    >
      <span className="sidebar-link__compact-label" aria-hidden="true">
        {item.shortLabel || item.label.slice(0, 1)}
      </span>
      <span className="sidebar-link__label">{item.label}</span>
    </NavLink>
  )
}

function SidebarGroup({ group, isOpen, isActive, onToggle, onNavigate }) {
  const Icon = group.icon

  return (
    <section className={`sidebar-nav-group sidebar-nav-group--${group.key}`}>
      <button
        className={`sidebar-link sidebar-group-trigger${isActive ? ' active' : ''}`}
        type="button"
        onClick={() => onToggle(group.key)}
        aria-expanded={isOpen}
        data-tooltip={group.label}
      >
        <Icon size={19} aria-hidden="true" />
        <span className="sidebar-link__label">{group.label}</span>
        <ChevronDown className={`sidebar-group-chevron${isOpen ? ' open' : ''}`} size={16} />
      </button>

      <div className={`sidebar-nav-group__children${isOpen ? ' open' : ''}`}>
        {group.items.map((item) => (
          <SidebarLink key={item.to} item={item} onNavigate={onNavigate} nested />
        ))}
      </div>
    </section>
  )
}

export function Sidebar({
  collapsed,
  onToggleCollapsed,
  open,
  onClose,
  user,
  onLogout,
}) {
  const location = useLocation()
  const storedUser = getStoredUser()
  const [openGroups, setOpenGroups] = useState(() => Object.fromEntries(
    navigationGroups.map((group) => [
      group.key,
      group.key === 'access' || group.items.some(({ to }) => location.pathname.startsWith(to)),
    ]),
  ))
  const displayName = user
    ? `${user.nombre} ${user.apellido_paterno}`
    : 'Usuario del sistema'
  const email = user?.correo || storedUser.email
  const roleName = user?.roles?.[0]?.nombre || 'Administrador'
  const role = getUserRole(user)
  const visibleGroups = navigationGroups.filter((group) => {
    if (group.superAdminOnly && !isSuperAdministrator(user)) return false
    if (group.allowedRoles && !group.allowedRoles.includes(role)) return false
    return true
  })

  const toggleGroup = (groupKey) => {
    if (collapsed) {
      onToggleCollapsed()
      setOpenGroups((current) => ({ ...current, [groupKey]: true }))
      return
    }
    setOpenGroups((current) => ({ ...current, [groupKey]: !current[groupKey] }))
  }

  const handleBrandClick = () => {
    if (open) {
      onClose()
      return
    }
    onToggleCollapsed()
  }

  return (
    <>
      <aside className={`app-sidebar${collapsed ? ' app-sidebar--collapsed' : ''}${open ? ' app-sidebar--open' : ''}`}>
        <div className="sidebar-brand">
          <button
            className="sidebar-brand__identity"
            type="button"
            onClick={handleBrandClick}
            aria-label={open ? 'Cerrar menú' : collapsed ? 'Expandir menú' : 'Contraer menú'}
            title={open ? 'Cerrar menú' : collapsed ? 'Expandir menú' : 'Contraer menú'}
          >
            <span className="sidebar-brand__mark"><img src={platformLogo} alt="" /></span>
            <div className="sidebar-brand__copy">
              <strong>EduGestión</strong>
            </div>
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Navegación administrativa">
          <section>
            <SidebarLink
              item={{ to: ROUTES.DASHBOARD, label: 'Dashboard', shortLabel: 'D', end: true }}
              onNavigate={onClose}
            />
          </section>

          {visibleGroups.map((group) => (
            <SidebarGroup
              key={group.key}
              group={group}
              isOpen={openGroups[group.key]}
              isActive={group.items.some(({ to }) => location.pathname.startsWith(to))}
              onToggle={toggleGroup}
              onNavigate={onClose}
            />
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-profile" type="button" onClick={onLogout} data-tooltip="Cerrar sesión">
            <span className="sidebar-avatar">{initials(user, email)}</span>
            <span className="sidebar-profile__copy">
              <strong>{displayName}</strong>
              <small>{roleName}</small>
            </span>
            <span className="sidebar-logout">Salir</span>
          </button>
        </div>
      </aside>
      {open && <button className="sidebar-overlay" type="button" onClick={onClose} aria-label="Cerrar menú" />}
    </>
  )
}
