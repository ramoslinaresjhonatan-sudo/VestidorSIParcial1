import { useMemo, useState } from 'react'
import { KeyRound, Search, ShieldCheck } from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner/Spinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage/ErrorMessage'
import { EmptyState } from '@/components/shared/EmptyState/EmptyState'
import { Badge } from '@/components/ui/Badge/Badge'
import { handleApiError } from '@/utils/handleApiError'
import { usePermissions } from '../hooks/useRoles'
import './RolesPage.css'

export function PermissionsPage() {
  const [search, setSearch] = useState('')
  const query = usePermissions()
  const permissions = useMemo(() => {
    const term = search.toLowerCase().trim()
    return (query.data || []).filter((item) => `${item.nombre} ${item.codigo} ${item.modulo}`.toLowerCase().includes(term))
  }, [query.data, search])

  return (
    <section className="page-shell management-page permissions-page">
      <div className="page-heading"><div><h1>Catálogo de permisos</h1><p>Consulta las acciones generadas por el sistema para asignarlas a los roles.</p></div><Badge tone="warning"><ShieldCheck size={13} /> Solo lectura</Badge></div>
      <div className="management-card surface-card">
        <div className="management-toolbar"><div className="table-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar permiso o módulo..." /></div><span>{permissions.length} permisos visibles</span></div>
        {query.isLoading ? <Spinner /> : query.isError ? <ErrorMessage message={handleApiError(query.error)} onRetry={query.refetch} /> : permissions.length ? <div className="data-table-wrap"><table className="data-table permission-table"><thead><tr><th>Permiso</th><th>Código</th><th>Módulo</th></tr></thead><tbody>{permissions.map((permission) => <tr key={permission.id}><td><div className="permission-name"><span><KeyRound size={16} /></span><strong>{permission.nombre}</strong></div></td><td><code>{permission.codigo}</code></td><td><Badge tone="neutral">{permission.modulo}</Badge></td></tr>)}</tbody></table></div> : <EmptyState title="No hay coincidencias" message="Prueba con otro nombre de permiso o módulo." />}
      </div>
    </section>
  )
}
