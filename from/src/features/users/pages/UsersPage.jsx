import { useMemo, useState } from 'react'
import { Ban, ChevronLeft, ChevronRight, Plus, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button/Button'
import { Modal } from '@/components/ui/Modal/Modal'
import { EmptyState } from '@/components/shared/EmptyState/EmptyState'
import { ErrorMessage } from '@/components/shared/ErrorMessage/ErrorMessage'
import { Spinner } from '@/components/ui/Spinner/Spinner'
import { handleApiError } from '@/utils/handleApiError'
import { useRoles } from '@/features/roles/hooks/useRoles'
import { UserForm } from '../components/UserForm'
import { UsersTable } from '../components/UsersTable'
import { useUserActions, useUsers } from '../hooks/useUsers'
import './UsersPage.css'

export function UsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [formUser, setFormUser] = useState(undefined)
  const [formOpen, setFormOpen] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [notice, setNotice] = useState('')
  const [formError, setFormError] = useState('')
  const usersQuery = useUsers(page, 20)
  const rolesQuery = useRoles()
  const actions = useUserActions()

  const users = useMemo(() => {
    const items = usersQuery.data?.results || []
    const term = search.toLowerCase().trim()
    if (!term) return items
    return items.filter((user) => `${user.nombre} ${user.apellido_paterno} ${user.apellido_materno} ${user.correo}`.toLowerCase().includes(term))
  }, [search, usersQuery.data])

  const openCreate = () => { setFormUser(undefined); setFormError(''); setFormOpen(true) }
  const openEdit = (user) => { setFormUser(user); setFormError(''); setFormOpen(true) }

  const saveUser = (payload) => {
    const mutation = formUser ? actions.update : actions.create
    const variables = formUser ? { id: formUser.id, payload } : payload
    mutation.mutate(variables, {
      onSuccess: () => { setFormOpen(false); setNotice(formUser ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.'); setTimeout(() => setNotice(''), 3500) },
      onError: (error) => setFormError(handleApiError(error)),
    })
  }

  const runConfirmation = () => {
    if (!confirm) return
    const mutation = confirm.type === 'annul' ? actions.annul : actions.remove
    mutation.mutate(confirm.user.id, {
      onSuccess: () => { setNotice(confirm.type === 'annul' ? 'Usuario anulado correctamente.' : 'Usuario eliminado definitivamente.'); setConfirm(null); setTimeout(() => setNotice(''), 3500) },
      onError: (error) => { setNotice(handleApiError(error)); setConfirm(null) },
    })
  }

  const totalPages = Math.max(1, Math.ceil((usersQuery.data?.count || 0) / 20))
  const formLoading = actions.create.isPending || actions.update.isPending
  const confirmLoading = actions.annul.isPending || actions.remove.isPending

  return (
    <section className="page-shell management-page">
      <div className="page-heading"><div><h1>Gestión de usuarios</h1><p>Crea perfiles, asigna roles y controla el acceso de cada integrante.</p></div><Button icon={Plus} onClick={openCreate}>Nuevo usuario</Button></div>
      {notice && <div className="page-notice">{notice}</div>}
      <div className="management-card surface-card">
        <div className="management-toolbar"><div className="table-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o correo..." /></div><span>{usersQuery.data?.count || 0} usuarios registrados</span></div>
        {usersQuery.isLoading ? <Spinner /> : usersQuery.isError ? <ErrorMessage message={handleApiError(usersQuery.error)} onRetry={usersQuery.refetch} /> : users.length ? <UsersTable users={users} onEdit={openEdit} onAnnul={(user) => setConfirm({ type: 'annul', user })} onDelete={(user) => setConfirm({ type: 'delete', user })} /> : <EmptyState title="No encontramos usuarios" message={search ? 'Prueba con otro término de búsqueda.' : 'Crea el primer usuario para comenzar.'} />}
        <footer className="table-pagination"><span>Página {page} de {totalPages}</span><div><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft size={16} /></button><button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}><ChevronRight size={16} /></button></div></footer>
      </div>

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={formUser ? 'Editar usuario' : 'Crear nuevo usuario'} description={formUser ? 'Actualiza sus datos, estado o roles asignados.' : 'Completa la información para habilitar un nuevo acceso.'} size="lg">
        <UserForm user={formUser} roles={rolesQuery.data || []} onSubmit={saveUser} onCancel={() => setFormOpen(false)} loading={formLoading} serverError={formError} />
      </Modal>

      <Modal isOpen={Boolean(confirm)} onClose={() => setConfirm(null)} title={confirm?.type === 'annul' ? '¿Anular este usuario?' : '¿Eliminar definitivamente?'} description={confirm?.type === 'delete' ? 'Esta acción no se puede deshacer.' : 'El usuario ya no podrá iniciar sesión.'} size="sm">
        <div className="confirm-dialog"><span className={confirm?.type === 'delete' ? 'danger' : 'warning'}>{confirm?.type === 'delete' ? <Trash2 size={24} /> : <Ban size={24} />}</span><p><strong>{confirm?.user?.nombre} {confirm?.user?.apellido_paterno}</strong><small>{confirm?.user?.correo}</small></p><div><Button variant="secondary" onClick={() => setConfirm(null)}>Cancelar</Button><Button variant={confirm?.type === 'delete' ? 'danger' : 'primary'} loading={confirmLoading} onClick={runConfirmation}>{confirm?.type === 'delete' ? 'Eliminar' : 'Anular usuario'}</Button></div></div>
      </Modal>
    </section>
  )
}
