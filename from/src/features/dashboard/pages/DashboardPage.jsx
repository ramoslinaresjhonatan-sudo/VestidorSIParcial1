import {
  ArrowRight,
  KeyRound,
  MoreHorizontal,
  Plus,
  ShieldCheck,
  UserCheck,
  UserCog,
  UsersRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge/Badge'
import { ROUTES } from '@/constants/routes'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { useAccessOptions } from '@/features/roles/hooks/useRoles'
import { useUsers } from '@/features/users/hooks/useUsers'
import './DashboardPage.css'

const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const bars = [45, 72, 57, 88, 68, 79, 52]

function initials(user) {
  return `${user.nombre?.[0] || ''}${user.apellido_paterno?.[0] || ''}`.toUpperCase()
}

export function DashboardPage() {
  const currentUser = useCurrentUser()
  const usersQuery = useUsers(1, 5)
  const accessQuery = useAccessOptions()
  const users = usersQuery.data?.results || []
  const roles = accessQuery.data?.roles || []
  const permissions = accessQuery.data?.permisos || []
  const activeUsers = users.filter((user) => user.activo).length
  const modules = new Set(permissions.map((permission) => permission.modulo)).size
  const firstName = currentUser.data?.nombre || 'Administrador'

  const stats = [
    { label: 'Usuarios registrados', value: usersQuery.data?.count ?? '—', note: `${activeUsers} activos en esta página`, icon: UsersRound, tone: 'green' },
    { label: 'Roles definidos', value: accessQuery.isSuccess ? roles.length : '—', note: 'Perfiles de acceso', icon: UserCog, tone: 'blue' },
    { label: 'Permisos disponibles', value: accessQuery.isSuccess ? permissions.length : '—', note: `${modules || 0} módulos del sistema`, icon: KeyRound, tone: 'gold' },
    { label: 'Estado del sistema', value: 'Operativo', note: 'Servicios disponibles', icon: ShieldCheck, tone: 'violet' },
  ]

  return (
    <section className="page-shell dashboard-page">
      <div className="dashboard-welcome">
        <div><span className="eyebrow">Resumen de hoy</span><h1>Buenos días, {firstName}.</h1><p>Aquí tienes una vista rápida del estado de tu plataforma.</p></div>
        <Link className="dashboard-primary-action" to={ROUTES.USERS}><Plus size={17} /> Nuevo usuario</Link>
      </div>

      <div className="stats-grid">
        {stats.map(({ label, value, note, icon: Icon, tone }) => (
          <article className="stat-card surface-card" key={label}><div><span className={`stat-icon stat-icon--${tone}`}><Icon size={20} /></span><button type="button"><MoreHorizontal size={18} /></button></div><strong>{value}</strong><p>{label}</p><small>{note}</small></article>
        ))}
      </div>

      <div className="dashboard-grid">
        <article className="dashboard-chart surface-card">
          <header><div><h2>Actividad semanal</h2><p>Interacciones registradas en el sistema</p></div><select aria-label="Periodo"><option>Últimos 7 días</option><option>Este mes</option></select></header>
          <div className="chart-area"><div className="chart-lines"><i /><i /><i /><i /></div><div className="dashboard-bars">{bars.map((height, index) => <div key={days[index]}><span style={{ height: `${height}%` }} /><small>{days[index]}</small></div>)}</div></div>
          <footer><span><i /> Actividad del sistema</span><strong>+18% <small>frente a la semana anterior</small></strong></footer>
        </article>

        <article className="quick-panel surface-card">
          <header><div><h2>Acciones rápidas</h2><p>Atajos frecuentes</p></div></header>
          <div className="quick-actions">
            <Link to={ROUTES.USERS}><span><UsersRound size={19} /></span><div><strong>Gestionar usuarios</strong><small>Crear, editar o anular accesos</small></div><ArrowRight size={16} /></Link>
            <Link to={ROUTES.ROLES}><span><UserCog size={19} /></span><div><strong>Configurar roles</strong><small>Organizar permisos por perfil</small></div><ArrowRight size={16} /></Link>
            <Link to={ROUTES.PERMISSIONS}><span><KeyRound size={19} /></span><div><strong>Ver permisos</strong><small>Consultar el catálogo del sistema</small></div><ArrowRight size={16} /></Link>
          </div>
        </article>
      </div>

      <div className="dashboard-bottom-grid">
        <article className="recent-users surface-card">
          <header><div><h2>Usuarios recientes</h2><p>Últimos perfiles registrados</p></div><Link to={ROUTES.USERS}>Ver todos <ArrowRight size={14} /></Link></header>
          <div>{users.length ? users.map((user) => <div className="recent-user" key={user.id}><span>{initials(user)}</span><div><strong>{user.nombre} {user.apellido_paterno}</strong><small>{user.correo}</small></div><div className="recent-role">{user.roles?.[0]?.nombre || 'Sin rol'}</div><Badge tone={user.activo ? 'success' : 'danger'}>{user.activo ? 'Activo' : 'Anulado'}</Badge></div>) : <div className="dashboard-empty"><UserCheck size={24} /><span>No hay usuarios para mostrar.</span></div>}</div>
        </article>

        <article className="access-health surface-card">
          <header><div><h2>Cobertura de acceso</h2><p>Distribución de permisos</p></div></header>
          <div className="health-score"><div><strong>{modules || 0}</strong><span>módulos</span></div><p><b>Configuración centralizada</b><small>Permisos disponibles para asignar a roles.</small></p></div>
          <div className="health-progress"><span><i style={{ width: `${Math.min(100, roles.length * 16 + 28)}%` }} /></span><div><small>Roles configurados</small><strong>{roles.length}</strong></div></div>
        </article>
      </div>
    </section>
  )
}
