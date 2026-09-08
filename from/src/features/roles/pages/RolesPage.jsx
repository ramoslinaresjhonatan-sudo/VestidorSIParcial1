import { useState } from 'react'
import { KeyRound, Pencil, Plus, Search, ShieldCheck, UserCog } from 'lucide-react'
import { Button } from '@/components/ui/Button/Button'
import { Modal } from '@/components/ui/Modal/Modal'
import { Spinner } from '@/components/ui/Spinner/Spinner'
import { EmptyState } from '@/components/shared/EmptyState/EmptyState'
import { ErrorMessage } from '@/components/shared/ErrorMessage/ErrorMessage'
import { handleApiError } from '@/utils/handleApiError'
import { RoleForm } from '../components/RoleForm'
import { usePermissions, useRoleActions, useRoles } from '../hooks/useRoles'
import './RolesPage.css'

export function RolesPage() {
  const [editing, setEditing] = useState(undefined)
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')
  const [formError, setFormError] = useState('')
  const rolesQuery = useRoles()
  const permissionsQuery = usePermissions()
  const actions = useRoleActions()
  const roles = (rolesQuery.data || []).filter((role) => role.nombre.toLowerCase().includes(search.toLowerCase()))

  const openForm = (role) => { setEditing(role); setFormError(''); setModalOpen(true) }
  const save = (payload) => {
    const mutation = editing ? actions.update : actions.create
    mutation.mutate(editing ? { id: editing.id, payload } : payload, {
      onSuccess: () => { setModalOpen(false); setNotice(editing ? 'Rol actualizado correctamente.' : 'Rol creado correctamente.'); setTimeout(() => setNotice(''), 3500) },
      onError: (error) => setFormError(handleApiError(error)),
    })
  }

  return (
    <section className="page-shell management-page roles-page">
      <div className="page-heading"><div><h1>Roles y accesos</h1><p>Agrupa permisos en perfiles claros para cada responsabilidad.</p></div><Button icon={Plus} onClick={() => openForm(undefined)}>Nuevo rol</Button></div>
      {notice && <div className="page-notice">{notice}</div>}
      <div className="roles-summary">
        <article className="surface-card"><span><UserCog size={20} /></span><div><strong>{rolesQuery.data?.length || 0}</strong><small>Roles definidos</small></div></article>
        <article className="surface-card"><span><KeyRound size={20} /></span><div><strong>{permissionsQuery.data?.length || 0}</strong><small>Permisos disponibles</small></div></article>
        <article className="surface-card"><span><ShieldCheck size={20} /></span><div><strong>Activo</strong><small>Control de acceso</small></div></article>
      </div>
      <div className="management-card surface-card">
        <div className="management-toolbar"><div className="table-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar rol..." /></div><span>Los permisos son administrados por el sistema</span></div>
        {rolesQuery.isLoading ? <Spinner /> : rolesQuery.isError ? <ErrorMessage message={handleApiError(rolesQuery.error)} onRetry={rolesQuery.refetch} /> : roles.length ? <div className="role-card-grid">{roles.map((role) => <article key={role.id} className="role-card"><header><span><UserCog size={20} /></span><button type="button" onClick={() => openForm(role)}><Pencil size={16} /> Editar</button></header><h3>{role.nombre}</h3><p>{role.permisos.length} permisos asignados</p><div>{role.permisos.slice(0, 4).map((permission) => <span key={permission.id}>{permission.nombre}</span>)}{role.permisos.length > 4 && <span>+{role.permisos.length - 4} más</span>}{!role.permisos.length && <small>Sin permisos asignados</small>}</div></article>)}</div> : <EmptyState title="No hay roles" message="Crea el primer rol y asígnale permisos existentes." />}
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar rol y permisos' : 'Crear nuevo rol'} description="Los permisos disponibles son generados y controlados por el backend." size="lg">
        <RoleForm role={editing} permissions={permissionsQuery.data || []} onSubmit={save} onCancel={() => setModalOpen(false)} loading={actions.create.isPending || actions.update.isPending} serverError={formError} />
      </Modal>
    </section>
  )
}
