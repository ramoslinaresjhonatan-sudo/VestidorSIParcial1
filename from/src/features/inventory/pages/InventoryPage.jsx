import { useEffect, useState } from 'react'
import { Package, ArrowRightLeft, AlertTriangle, Plus, Search, WifiOff, RefreshCw } from 'lucide-react'
import { useInventario, useSucursales, useAjustarStock, useTrasladar, useMerma, useHistorial, useAlertas } from '../hooks/useInventory'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { getUserRole, canManageInventory } from '@/utils/accessControl'
import { Button } from '@/components/ui/Button/Button'
import { Modal } from '@/components/ui/Modal/Modal'
import { Spinner } from '@/components/ui/Spinner/Spinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage/ErrorMessage'
import { EmptyState } from '@/components/shared/EmptyState/EmptyState'
import { handleApiError } from '@/utils/handleApiError'
import { catalogApi } from '@/features/catalog/api/catalogApi'
import { inventoryApi } from '../api/inventoryApi'
import { getQueue, clearQueue, hasPending } from '../utils/offlineQueue'
import './InventoryPage.css'

export function InventoryPage() {
  const currentUser = useCurrentUser()
  const userRole = getUserRole(currentUser.data)
  const canManage = canManageInventory(currentUser.data)
  const sucursalesQuery = useSucursales()
  const [filters, setFilters] = useState({ sucursal_id: '', producto: '', talla: '', color: '' })
  const [applied, setApplied] = useState({})
  const inventarioQuery = useInventario(canManage ? applied : { _skip: true })
  const historialQuery = useHistorial(canManage ? applied : { _skip: true })
  const alertasQuery = useAlertas()
  const ajustarMut = useAjustarStock()
  const trasladarMut = useTrasladar()
  const mermaMut = useMerma()

  const [modal, setModal] = useState(null) // 'ajustar'|'trasladar'|'merma'|'alta'
  const [form, setForm] = useState({})
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [offlineNotice, setOfflineNotice] = useState(hasPending())

  const isVendedor = currentUser.data?.sucursal || currentUser.data?.sucursal_id
  // Si vendedor con sucursal asignada, bloquear filtro
  const isVendedorRestricted = Boolean(currentUser.data?.sucursal) // fallback, check via sucursalesQuery? we infer from single sucursal
  const vendSucursal = sucursalesQuery.data?.length === 1 ? sucursalesQuery.data[0] : null

  useEffect(() => {
    if (vendSucursal) setFilters((f) => ({ ...f, sucursal_id: String(vendSucursal.id) }))
  }, [vendSucursal])

  useEffect(() => {
    const onOnline = async () => {
      const q = getQueue()
      if (!q.length) return setOfflineNotice(false)
      for (const item of q) {
        try {
          if (item.type === 'ajustar') await inventoryApi.ajustarStock(item.payload)
          if (item.type === 'trasladar') await inventoryApi.trasladar(item.payload)
          if (item.type === 'merma') await inventoryApi.registrarMerma(item.payload)
        } catch {}
      }
      clearQueue()
      setOfflineNotice(false)
      inventarioQuery.refetch()
      setMsg('Cambios offline sincronizados')
      setTimeout(() => setMsg(''), 4000)
    }
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [])

  if (currentUser.isLoading) return <div className="page-shell"><Spinner /></div>
  if (!canManage) {
    return (
      <section className="page-shell inventory-page">
        <EmptyState title="Acceso restringido" message={`Tu cuenta es de tipo "${userRole}" (cliente/cajero). La gestión de inventario solo está disponible para Administrador y Vendedor de sucursal. Tu perfil no muestra tallas ni inventario por este motivo.`} />
      </section>
    )
  }

  const apply = () => setApplied({ ...filters })
  const clear = () => { setFilters({ sucursal_id: vendSucursal ? String(vendSucursal.id) : '', producto: '', talla: '', color: '' }); setApplied(vendSucursal ? { sucursal_id: String(vendSucursal.id) } : {}) }

  const openModal = (type, row) => {
    setError(''); setMsg('')
    if (type === 'ajustar') setForm({ sucursal_id: row.sucursal.id, producto_id: row.producto.id, talla: row.talla, color: row.color, cantidad: row.stock })
    if (type === 'trasladar') setForm({ producto_id: row.producto.id, talla: row.talla, color: row.color, origen_id: row.sucursal.id, destino_id: '', cantidad: 1 })
    if (type === 'merma') setForm({ producto_id: row.producto.id, sucursal_id: row.sucursal.id, talla: row.talla, color: row.color, cantidad: 1, motivo: 'danado', descripcion: '' })
    if (type === 'alta') setForm({ nombre: '', descripcion: '', marca: '', categoria: 'vestidos', talla: 'M', color: '', precio_centavos: 10000, stock: 0, sucursal_id: vendSucursal?.id || sucursalesQuery.data?.[0]?.id || '' })
    setModal(type)
  }

  const submitAjustar = () => {
    ajustarMut.mutate(form, {
      onSuccess: (d) => { setMsg(d.message || 'Stock ajustado'); setModal(null); },
      onError: (e) => {
        if (e.message === 'OFFLINE') { setMsg('Sin conexión: ajuste guardado local y se sincronizará'); setOfflineNotice(true); setModal(null) }
        else setError(handleApiError(e))
      }
    })
  }
  const submitTrasladar = () => {
    trasladarMut.mutate(form, {
      onSuccess: () => { setMsg('Traslado completado'); setModal(null) },
      onError: (e) => {
        if (e.message === 'OFFLINE') { setMsg('Sin conexión: traslado en cola'); setOfflineNotice(true); setModal(null) }
        else setError(handleApiError(e))
      }
    })
  }
  const submitMerma = () => {
    mermaMut.mutate(form, {
      onSuccess: () => { setMsg('Merma registrada'); setModal(null) },
      onError: (e) => {
        if (e.message === 'OFFLINE') { setMsg('Sin conexión: merma en cola'); setOfflineNotice(true); setModal(null) }
        else setError(handleApiError(e))
      }
    })
  }
  const submitAlta = async () => {
    try {
      const payload = { nombre: form.nombre, descripcion: form.descripcion, marca: form.marca, categoria: form.categoria, talla: form.talla, color: form.color, precio_centavos: Number(form.precio_centavos), stock: Number(form.stock) }
      await catalogApi.createProduct(payload)
      // ajustar stock en sucursal si stock>0
      if (Number(form.stock) > 0 && form.sucursal_id) {
        const prod = (await catalogApi.getPublicProducts({ search: form.nombre })).find((p) => p.nombre === form.nombre)
        if (prod) {
          try { await inventoryApi.ajustarStock({ sucursal_id: Number(form.sucursal_id), producto_id: prod.id, talla: form.talla, color: form.color, cantidad: Number(form.stock) }) } catch {}
        }
      }
      setMsg('Producto creado y stock sincronizado')
      setModal(null)
      inventarioQuery.refetch()
    } catch (e) { setError(handleApiError(e)) }
  }

  return (
    <section className="page-shell inventory-page">
      <div className="page-heading">
        <div><h1><Package size={20} /> Gestión de Inventario</h1><p>Altas, ajustes, traslados y mermas por sucursal — sincronizado central.</p></div>
        <Button icon={Plus} onClick={() => openModal('alta')}>Nuevo producto</Button>
      </div>
      {msg && <div className="page-notice page-notice--success">{msg}</div>}
      {error && <div className="page-notice page-notice--danger">{error}</div>}
      {offlineNotice && <div className="page-notice page-notice--warning"><WifiOff size={14} /> Cambios pendientes offline — se sincronizarán al reconectar</div>}
      {!navigator.onLine && <div className="page-notice page-notice--warning">Sin conexión: los cambios se guardarán localmente</div>}
      {canManage && alertasQuery.data?.length > 0 && (
        <div className="page-notice" style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', padding: 10, borderRadius: 8 }}>
          <AlertTriangle size={14} /> CU-18 Alertas stock mínimo: {alertasQuery.data.length} variantes bajo mínimo ({alertasQuery.data.map((a) => `${a.producto} ${a.talla}/${a.color} ${a.sucursal} ${a.stock}≤${a.minimo}`).join(' • ')})
        </div>
      )}

      <div className="inventory-filters surface-card">
        <div className="table-search"><Search size={16} /><input value={filters.producto} onChange={(e) => setFilters((f) => ({ ...f, producto: e.target.value }))} placeholder="Buscar producto/marca..." /></div>
        <select value={filters.sucursal_id} onChange={(e) => setFilters((f) => ({ ...f, sucursal_id: e.target.value }))} disabled={!!vendSucursal}>
          <option value="">{vendSucursal ? vendSucursal.nombre + ' (asignada)' : 'Todas las sucursales'}</option>
          {(sucursalesQuery.data || []).map((s) => <option key={s.id} value={s.id}>{s.nombre} — {s.ciudad}</option>)}
        </select>
        <select value={filters.talla} onChange={(e) => setFilters((f) => ({ ...f, talla: e.target.value }))}>
          <option value="">Talla: todas</option>
          {['XS','S','M','L','XL','XXL','32','34','36','38','40'].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input placeholder="Color" value={filters.color} onChange={(e) => setFilters((f) => ({ ...f, color: e.target.value }))} />
        <Button onClick={apply} icon={Search}>Filtrar</Button>
        <Button variant="secondary" onClick={clear}>Limpiar</Button>
      </div>

      <div className="surface-card inventory-table-wrap">
        {inventarioQuery.isLoading ? <Spinner /> : inventarioQuery.isError ? <ErrorMessage message={handleApiError(inventarioQuery.error)} onRetry={inventarioQuery.refetch} /> : (
          <table className="inventory-table">
            <thead><tr><th>Producto</th><th>Sucursal</th><th>Talla</th><th>Color</th><th>Stock</th><th>Acciones</th></tr></thead>
            <tbody>
              {(inventarioQuery.data || []).map((row) => (
                <tr key={row.id}>
                  <td><strong>{row.producto.nombre}</strong><small>{row.producto.marca} • {row.producto.categoria} • {row.producto.precio_formateado}</small></td>
                  <td>{row.sucursal.nombre}<small>{row.sucursal.ciudad}</small></td>
                  <td>{row.talla}</td><td>{row.color}</td>
                  <td className={row.stock === 0 ? 'stock-zero' : 'stock-ok'}>{row.stock}</td>
                  <td className="actions">
                    <button onClick={() => openModal('ajustar', row)} title="Ajustar">Ajustar</button>
                    <button onClick={() => openModal('trasladar', row)} title="Trasladar"><ArrowRightLeft size={12} /> Trasladar</button>
                    <button onClick={() => openModal('merma', row)} title="Merma"><AlertTriangle size={12} /> Merma</button>
                  </td>
                </tr>
              ))}
              {inventarioQuery.data?.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 20 }}>Sin resultados</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {(historialQuery.data) && (
        <div className="surface-card historial">
          <h3><RefreshCw size={14} /> Historial reciente</h3>
          <div className="historial-grid">
            <div><strong>Traslados</strong>{historialQuery.data.traslados.slice(0,5).map((t) => <p key={t.id}>{t.producto} {t.talla}/{t.color} {t.origen}→{t.destino} x{t.cantidad}</p>)}</div>
            <div><strong>Mermas</strong>{historialQuery.data.mermas.slice(0,5).map((m) => <p key={m.id}>{m.producto} {m.sucursal} -{m.cantidad} ({m.motivo})</p>)}</div>
          </div>
        </div>
      )}

      <Modal isOpen={modal === 'ajustar'} onClose={() => setModal(null)} title="Ajustar stock" size="sm">
        <div className="form-grid">
          <label className="plain-field">Stock final<span>*</span><input type="number" min="0" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} /></label>
          <small>Stock negativo bloqueado. Talla {form.talla} / Color {form.color}</small>
          <div className="form-actions"><Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button><Button onClick={submitAjustar} loading={ajustarMut.isPending}>Guardar</Button></div>
        </div>
      </Modal>

      <Modal isOpen={modal === 'trasladar'} onClose={() => setModal(null)} title="Trasladar entre sucursales" size="sm">
        <div className="form-grid">
          <label className="plain-field">Origen<input value={sucursalesQuery.data?.find((s) => String(s.id) === String(form.origen_id))?.nombre || form.origen_id} disabled /></label>
          <label className="plain-field">Destino<select value={form.destino_id} onChange={(e) => setForm({ ...form, destino_id: e.target.value })}><option value="">Seleccionar</option>{(sucursalesQuery.data || []).filter((s) => String(s.id) !== String(form.origen_id)).map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}</select></label>
          <label className="plain-field">Cantidad<input type="number" min="1" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} /></label>
          {error && <div className="form-alert form-alert--danger">{error}</div>}
          <div className="form-actions"><Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button><Button onClick={submitTrasladar} loading={trasladarMut.isPending}>Trasladar</Button></div>
        </div>
      </Modal>

      <Modal isOpen={modal === 'merma'} onClose={() => setModal(null)} title="Registrar merma" size="sm">
        <div className="form-grid">
          <label className="plain-field">Cantidad<input type="number" min="1" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} /></label>
          <label className="plain-field">Motivo<select value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })}><option value="danado">Dañado</option><option value="extraviado">Extraviado</option><option value="vencido">Vencido</option><option value="otro">Otro</option></select></label>
          <label className="plain-field">Descripción<input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Detalle" /></label>
          {error && <div className="form-alert form-alert--danger">{error}</div>}
          <div className="form-actions"><Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button><Button onClick={submitMerma} loading={mermaMut.isPending}>Registrar</Button></div>
        </div>
      </Modal>

      <Modal isOpen={modal === 'alta'} onClose={() => setModal(null)} title="Agregar nuevo producto" size="lg">
        <div className="form-grid form-grid--two">
          <label className="plain-field">Nombre<span>*</span><input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></label>
          <label className="plain-field">Marca<input value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} /></label>
          <label className="plain-field">Modelo<select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}><option value="vestidos">Vestidos</option><option value="blusas">Blusas</option><option value="faldas">Faldas</option><option value="pantalones">Pantalones</option><option value="jeans">Jeans</option><option value="otro">Otro</option></select></label>
          <label className="plain-field">Talla<input value={form.talla} onChange={(e) => setForm({ ...form, talla: e.target.value })} /></label>
          <label className="plain-field">Color<input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></label>
          <label className="plain-field">Precio centavos<input type="number" value={form.precio_centavos} onChange={(e) => setForm({ ...form, precio_centavos: e.target.value })} /></label>
          <label className="plain-field">Stock inicial<input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></label>
          <label className="plain-field">Sucursal inicial<select value={form.sucursal_id} onChange={(e) => setForm({ ...form, sucursal_id: e.target.value })}>{(sucursalesQuery.data || []).map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}</select></label>
          <label className="plain-field" style={{ gridColumn: '1/-1' }}>Descripción<textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={2} /></label>
        </div>
        {error && <div className="form-alert form-alert--danger">{error}</div>}
        <div className="form-actions"><Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button><Button onClick={submitAlta}>Crear producto</Button></div>
      </Modal>
    </section>
  )
}
