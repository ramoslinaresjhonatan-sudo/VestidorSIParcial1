import { useState } from 'react'
import { Search, ShoppingCart } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState/EmptyState'
import { ErrorMessage } from '@/components/shared/ErrorMessage/ErrorMessage'
import { Spinner } from '@/components/ui/Spinner/Spinner'
import { Button } from '@/components/ui/Button/Button'
import { handleApiError } from '@/utils/handleApiError'
import { useCartActions } from '@/features/cart/hooks/useCart'
import { usePublicCategorias, usePublicProducts } from '../hooks/useCatalog'
import './CatalogPage.css'

export function CatalogPage() {
  const [filters, setFilters] = useState({ categoria: '', talla: '', search: '', categoria_id: '' })
  const categoriasQuery = usePublicCategorias()
  const query = usePublicProducts({ categoria: filters.categoria || undefined, talla: filters.talla || undefined, categoria_id: filters.categoria_id || undefined })
  const cartActions = useCartActions()
  const [selections, setSelections] = useState({}) // { [productId]: {talla, color, cantidad} }
  const [notices, setNotices] = useState({}) // { [productId]: message }

  const products = (query.data || []).filter(p => {
    const term = filters.search.trim().toLowerCase()
    if (!term) return true
    return `${p.nombre} ${p.descripcion} ${p.color} ${p.categoria} ${p.categorias?.map(c=>c.nombre).join(' ')}`.toLowerCase().includes(term)
  })

  const getSel = (p) => selections[p.id] || { talla: p.talla, color: p.color, cantidad: 1 }
  const setSel = (pid, patch) => setSelections(s => ({ ...s, [pid]: { ...getSel({id: pid, talla:'M', color:''}), ...s[pid], ...patch } }))

  const addToCart = (p) => {
    const sel = getSel(p)
    cartActions.add.mutate({ producto_id: p.id, talla: sel.talla, color: sel.color, cantidad: Number(sel.cantidad) }, {
      onSuccess: () => {
        setNotices(n => ({ ...n, [p.id]: '✓ Agregado al carrito' }))
        setTimeout(()=> setNotices(n=> ({...n, [p.id]: ''})), 2000)
      },
      onError: (e) => {
        if (!e.response) {
          // offline -> guarda local
          const pending = JSON.parse(localStorage.getItem('offline_cart')||'[]')
          pending.push({ producto_id: p.id, ...sel, cantidad: Number(sel.cantidad) })
          localStorage.setItem('offline_cart', JSON.stringify(pending))
          setNotices(n=> ({...n, [p.id]: 'Sin conexión, guardado local'}))
        } else if (e.response?.status===409) {
          const alt = e.response?.data?.alternativas
          setNotices(n=> ({...n, [p.id]: e.response.data.message + (alt? ' Alternativas sugeridas.' : '')}))
        } else if (e.response?.data?.precio_promocional) {
          setNotices(n=> ({...n, [p.id]: `Precio promo ${e.response.data.precio_promocional}`}))
        } else {
          setNotices(n=> ({...n, [p.id]: handleApiError(e)}))
        }
        setTimeout(()=> setNotices(n=> ({...n, [p.id]: ''})), 3000)
      }
    })
  }

  return (
    <section className="page-shell catalog-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Catálogo</span>
          <h1>Ropa femenina</h1>
          <p>Descubre nuestra colección - vestidos, blusas, faldas y más.</p>
        </div>
      </div>

      <div className="catalog-filters surface-card">
        <div className="table-search"><Search size={17} /><input value={filters.search} onChange={e=>setFilters(s=>({...s, search:e.target.value}))} placeholder="Buscar por nombre, color..." /></div>
        <select value={filters.categoria} onChange={e=>setFilters(s=>({...s, categoria:e.target.value}))}>
          <option value="">Todos los tipos</option>
          <option value="vestidos">Vestidos</option><option value="blusas">Blusas</option><option value="faldas">Faldas</option>
          <option value="pantalones">Pantalones</option><option value="jeans">Jeans</option><option value="conjuntos">Conjuntos</option>
          <option value="abrigos">Abrigos</option><option value="tops">Tops</option><option value="otro">Otro</option>
        </select>
        <select value={filters.categoria_id} onChange={e=>setFilters(s=>({...s, categoria_id:e.target.value}))}>
          <option value="">Todas: Niña/Adolescente/Adulta</option>
          {(categoriasQuery.data||[]).map(c=> <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <select value={filters.talla} onChange={e=>setFilters(s=>({...s, talla:e.target.value}))}>
          <option value="">Todas las tallas</option>
          {['XS','S','M','L','XL','XXL','UNICA','32','34','36','38','40','42','44','46'].map(t=> <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {query.isLoading ? <Spinner /> : query.isError ? <ErrorMessage message={handleApiError(query.error)} onRetry={query.refetch} /> : products.length ? (
        <div className="catalog-grid">
          {products.map(p => (
            <article key={p.id} className="catalog-card surface-card">
              <div className="catalog-card__image">
                {p.imagen_url || p.imagen ? <img src={p.imagen_url || p.imagen} alt={p.nombre} /> : <span className="catalog-placeholder">Sin imagen</span>}
                {!p.activo && <span className="catalog-badge catalog-badge--inactive">Inactivo</span>}
              </div>
              <div className="catalog-card__body">
                <span className="catalog-card__cat">{p.categoria_display} • Talla {p.talla} • {p.categorias?.map(c=>c.nombre).join(', ') || 'Sin categoría edad'}</span>
                <h3>{p.nombre}</h3>
                <p className="catalog-card__desc">{p.descripcion || 'Sin descripción'}</p>
                <p className="catalog-card__color">Color: <strong>{p.color}</strong> • Stock: {p.stock}</p>
                <p className="catalog-card__price">{p.precio_formateado}</p>
                {/* CU-11 Agregar al carrito */}
                <div className="catalog-card__cart" style={{display:'grid', gap:8, marginTop:8}}>
                  <div style={{display:'flex', gap:6}}>
                    <select value={getSel(p).talla} onChange={e=>setSel(p.id,{talla:e.target.value})} style={{flex:1, padding:'6px', border:'1px solid #e5e7eb', borderRadius:8}}>
                      {['XS','S','M','L','XL','XXL','UNICA','32','34','36','38','40','42','44','46'].map(t=> <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input value={getSel(p).color} onChange={e=>setSel(p.id,{color:e.target.value})} placeholder="Color" style={{flex:1, padding:'6px', border:'1px solid #e5e7eb', borderRadius:8}} />
                    <input type="number" min="1" max="99" value={getSel(p).cantidad} onChange={e=>setSel(p.id,{cantidad:e.target.value})} style={{width:60, padding:'6px', border:'1px solid #e5e7eb', borderRadius:8}} />
                  </div>
                  <Button icon={ShoppingCart} onClick={()=>addToCart(p)} loading={cartActions.add.isPending}>Agregar al carrito</Button>
                  {notices[p.id] && <small style={{color: notices[p.id].includes('✓') ? '#16a34a' : '#dc2626'}}>{notices[p.id]}</small>}
                  {p.stock===0 && <small style={{color:'#dc2626'}}>Sin stock</small>}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : <EmptyState title="No hay productos" message="Pronto añadiremos nuevas prendas." />}
    </section>
  )
}
