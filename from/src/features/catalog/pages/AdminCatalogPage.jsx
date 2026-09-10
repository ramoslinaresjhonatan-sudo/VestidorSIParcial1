import { useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button/Button'
import { Modal } from '@/components/ui/Modal/Modal'
import { EmptyState } from '@/components/shared/EmptyState/EmptyState'
import { ErrorMessage } from '@/components/shared/ErrorMessage/ErrorMessage'
import { Spinner } from '@/components/ui/Spinner/Spinner'
import { handleApiError } from '@/utils/handleApiError'
import { CatalogForm } from '../components/CatalogForm'
import { useAdminProducts, useCatalogActions } from '../hooks/useCatalog'

export function AdminCatalogPage() {
  const query = useAdminProducts()
  const actions = useCatalogActions()
  const [search, setSearch] = useState('')
  const [formProduct, setFormProduct] = useState(undefined)
  const [formOpen, setFormOpen] = useState(false)
  const [formError, setFormError] = useState('')
  const [confirm, setConfirm] = useState(null)
  const [notice, setNotice] = useState('')

  const products = useMemo(() => {
    const items = query.data || []
    const term = search.trim().toLowerCase()
    if (!term) return items
    return items.filter(p => `${p.nombre} ${p.categoria} ${p.color} ${p.talla}`.toLowerCase().includes(term))
  }, [query.data, search])

  const showNotice = (m) => { setNotice(m); setTimeout(()=>setNotice(''), 3500) }
  const openCreate = () => { setFormProduct(undefined); setFormError(''); setFormOpen(true) }
  const openEdit = (p) => { setFormProduct(p); setFormError(''); setFormOpen(true) }

  const save = (fd) => {
    const mut = formProduct ? actions.update : actions.create
    const vars = formProduct ? { id: formProduct.id, payload: fd } : fd
    mut.mutate(vars, {
      onSuccess: () => { setFormOpen(false); showNotice(formProduct ? 'Producto actualizado.' : 'Producto creado.') },
      onError: (e) => setFormError(handleApiError(e)),
    })
  }

  const del = () => {
    if (!confirm) return
    actions.remove.mutate(confirm.id, {
      onSuccess: () => { setConfirm(null); showNotice('Producto eliminado.') },
      onError: (e) => { setConfirm(null); showNotice(handleApiError(e)) },
    })
  }

  const loading = actions.create.isPending || actions.update.isPending

  return (
    <section className="page-shell catalog-admin-page management-page">
      <div className="page-heading">
        <div><span className="eyebrow">Administración</span><h1>Catálogo - Ropa femenina</h1><p>El administrador crea productos con categoría, talla exacta, precio en Bs y foto.</p></div>
        <Button icon={Plus} onClick={openCreate}>Nuevo producto</Button>
      </div>
      {notice && <div className="page-notice">{notice}</div>}
      <div className="management-card surface-card">
        <div className="management-toolbar">
          <div className="table-search"><Search size={17} /><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nombre, categoría, color, talla..." /></div>
          <span>{query.data?.length || 0} productos</span>
        </div>
        {query.isLoading ? <Spinner /> : query.isError ? <ErrorMessage message={handleApiError(query.error)} onRetry={query.refetch} /> : products.length ? (
          <div className="catalog-admin-grid">
            {products.map(p => (
              <article key={p.id} className={`admin-plan-card ${!p.activo ? 'admin-plan-card--inactive':''}`}>
                <div className="catalog-admin-image">{p.imagen_url || p.imagen ? <img src={p.imagen_url || p.imagen} alt={p.nombre} /> : <span>Sin imagen</span>}</div>
                <span className="admin-plan-card__code">{p.categoria_display} • {p.talla}</span>
                <h3>{p.nombre}</h3>
                <p className="admin-plan-card__price">{p.precio_formateado}</p>
                <p className="admin-plan-card__description">Color: {p.color} • Stock: {p.stock} {p.activo ? '• Activo' : '• Inactivo'}</p>
                <footer>
                  <button type="button" onClick={()=>openEdit(p)}><Pencil size={17} /><span>Editar</span></button>
                  <button className="danger" type="button" onClick={()=>setConfirm(p)}><Trash2 size={17} /><span>Eliminar</span></button>
                </footer>
              </article>
            ))}
          </div>
        ) : <EmptyState title="No hay productos" message="Crea el primer producto para el catálogo." />}
      </div>

      <Modal isOpen={formOpen} onClose={()=>setFormOpen(false)} title={formProduct ? 'Editar producto' : 'Crear producto'} description="Categoría, nombre, talla exacta, precio en centavos Bs e imagen archivo." size="lg">
        <CatalogForm product={formProduct} onSubmit={save} onCancel={()=>setFormOpen(false)} loading={loading} serverError={formError} />
      </Modal>
      <Modal isOpen={Boolean(confirm)} onClose={()=>setConfirm(null)} title="¿Eliminar producto?" description="Esta acción no se puede deshacer." size="sm">
        <div className="confirm-dialog">
          <span className="danger"><Trash2 size={24} /></span>
          <p><strong>{confirm?.nombre}</strong><small>{confirm?.categoria_display} • {confirm?.talla}</small></p>
          <div><Button variant="secondary" onClick={()=>setConfirm(null)}>Cancelar</Button><Button variant="danger" loading={actions.remove.isPending} onClick={del}>Eliminar</Button></div>
        </div>
      </Modal>
    </section>
  )
}
