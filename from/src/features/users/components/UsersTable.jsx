import { Ban, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge/Badge'

function avatar(user) {
  return `${user.nombre?.[0] || ''}${user.apellido_paterno?.[0] || ''}`.toUpperCase()
}

export function UsersTable({ users, onEdit, onAnnul, onDelete }) {
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead><tr><th>Usuario</th><th>Roles</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td><div className="user-cell"><span>{avatar(user)}</span><div><strong>{user.nombre} {user.apellido_paterno} {user.apellido_materno}</strong><small>{user.correo}</small></div></div></td>
              <td><div className="role-tags">{user.roles?.length ? user.roles.map((role) => <Badge key={role.id} tone="primary">{role.nombre}</Badge>) : <span>Sin rol</span>}</div></td>
              <td><Badge tone={user.activo ? 'success' : 'danger'}><i className="status-dot" />{user.activo ? 'Activo' : 'Anulado'}</Badge></td>
              <td>
                <div className="table-actions">
                  <button type="button" onClick={() => onEdit(user)} title="Editar usuario"><Pencil size={16} /></button>
                  <button type="button" disabled={!user.activo} onClick={() => onAnnul(user)} title={user.activo ? 'Anular usuario' : 'El usuario ya está anulado'}><Ban size={16} /></button>
                  <button className="danger" type="button" disabled={user.activo} onClick={() => onDelete(user)} title={user.activo ? 'Primero debes anular el usuario' : 'Eliminar usuario'}><Trash2 size={16} /></button>
                  <button type="button" title="Más opciones"><MoreHorizontal size={17} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
