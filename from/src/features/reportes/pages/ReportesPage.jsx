import { useState } from 'react'
import { BarChart3, Sparkles, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button/Button'
import { Spinner } from '@/components/ui/Spinner/Spinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage/ErrorMessage'
import { handleApiError } from '@/utils/handleApiError'
import { useReportes } from '@/features/pedidos/hooks/usePedidos'
import { useSucursales } from '@/features/inventory/hooks/useInventory'
import { getUserRole } from '@/utils/accessControl'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import './ReportesPage.css'

export function ReportesPage() {
  const currentUser = useCurrentUser()
  const role = getUserRole(currentUser.data)
  const sucursalesQuery = useSucursales()
  const [sucursalId, setSucursalId] = useState('')
  const query = useReportes(sucursalId ? { sucursal_id: sucursalId } : {})

  if (currentUser.isSuccess && !['administrador','vendedor'].includes(role)) {
    return <section className="page-shell"><div className="page-notice page-notice--warning">Reportes solo para Administrador/Vendedor (tu rol: {role})</div></section>
  }

  return (
    <section className="page-shell reportes-page">
      <div className="page-heading">
        <div><h1><BarChart3 size={20} /> Reportes {role==='vendedor' ? 'de mi sucursal' : 'generales'}</h1><p>CU-20 Reportes con IA generativa</p></div>
        <Button icon={Download} variant="secondary" onClick={()=>window.print()}>Exportar</Button>
      </div>

      {role==='administrador' && (
        <div className="surface-card reportes-filtros">
          <select value={sucursalId} onChange={(e)=>setSucursalId(e.target.value)}>
            <option value="">Todas las sucursales</option>
            {(sucursalesQuery.data||[]).map((s)=><option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </div>
      )}

      {query.isLoading ? <Spinner /> : query.isError ? <ErrorMessage message={handleApiError(query.error)} onRetry={query.refetch} /> : (
        <div className="reportes-grid">
          <article className="stat-card surface-card"><strong>{query.data.total_pedidos}</strong><p>Pedidos totales</p></article>
          <article className="stat-card surface-card"><strong>{(query.data.total_ventas_bs).toFixed(2)} Bs</strong><p>Ventas totales</p></article>
          <article className="stat-card surface-card" style={{ borderColor: query.data.stock_bajo>0 ? '#fecaca' : '#bbf7d0', background: query.data.stock_bajo>0 ? '#fef2f2' : '#f0fdf4' }}><strong>{query.data.stock_bajo}</strong><p>Variantes con stock bajo</p></article>

          <article className="surface-card reportes-ia">
            <h3><Sparkles size={16} /> Análisis IA generativa</h3>
            <p>{query.data.ia_resumen}</p>
            <small>Generado automáticamente según ventas y stock mínimo</small>
          </article>

          <article className="surface-card">
            <h3>Top productos</h3>
            {query.data.top_productos.length ? query.data.top_productos.map((t,i)=><p key={i}>{t['items__nombre'] || 'Producto'} — {t.c} pedidos</p>) : <p>Sin datos</p>}
          </article>
        </div>
      )}
    </section>
  )
}
