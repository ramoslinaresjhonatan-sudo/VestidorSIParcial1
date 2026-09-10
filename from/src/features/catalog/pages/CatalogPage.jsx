import { useState } from 'react'
import { Search } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState/EmptyState'
import { ErrorMessage } from '@/components/shared/ErrorMessage/ErrorMessage'
import { Spinner } from '@/components/ui/Spinner/Spinner'
import { handleApiError } from '@/utils/handleApiError'
import { usePublicProducts } from '../hooks/useCatalog'
import './CatalogPage.css'

export function CatalogPage() {
  const [filters, setFilters] = useState({ categoria: '', talla: '', search: '' })
  const query = usePublicProducts({ categoria: filters.categoria || undefined, talla: filters.talla || undefined })

  const products = (query.data || []).filter(p => {
    const term = filters.search.trim().toLowerCase()
    if (!term) return true
    return `${p.nombre} ${p.descripcion} ${p.color} ${p.categoria}`.toLowerCase().includes(term)
  })

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
          <option value="">Todas las categorías</option>
          <option value="vestidos">Vestidos</option><option value="blusas">Blusas</option><option value="faldas">Faldas</option>
          <option value="pantalones">Pantalones</option><option value="jeans">Jeans</option><option value="conjuntos">Conjuntos</option>
          <option value="abrigos">Abrigos</option><option value="tops">Tops</option><option value="otro">Otro</option>
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
                <span className="catalog-card__cat">{p.categoria_display} • Talla {p.talla}</span>
                <h3>{p.nombre}</h3>
                <p className="catalog-card__desc">{p.descripcion || 'Sin descripción'}</p>
                <p className="catalog-card__color">Color: <strong>{p.color}</strong> • Stock: {p.stock}</p>
                <p className="catalog-card__price">{p.precio_formateado}</p>
              </div>
            </article>
          ))}
        </div>
      ) : <EmptyState title="No hay productos" message="Pronto añadiremos nuevas prendas." />}
    </section>
  )
}
