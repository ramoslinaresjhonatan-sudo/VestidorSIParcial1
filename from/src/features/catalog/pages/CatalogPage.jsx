import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, Sparkles, SlidersHorizontal, X, Star, TrendingUp, Eye } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState/EmptyState'
import { ErrorMessage } from '@/components/shared/ErrorMessage/ErrorMessage'
import { Spinner } from '@/components/ui/Spinner/Spinner'
import { Button } from '@/components/ui/Button/Button'
import { handleApiError } from '@/utils/handleApiError'
import { useCartActions } from '@/features/cart/hooks/useCart'
import { useProfile } from '@/features/profile/hooks/useProfile'
import { usePublicCategorias, usePublicProducts, useFilterOptions } from '../hooks/useCatalog'
import './CatalogPage.css'

const CACHE_KEY = 'catalog_cache'
const CACHE_TIME_KEY = 'catalog_cache_time'

function saveCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
    localStorage.setItem(CACHE_TIME_KEY, String(Date.now()))
  } catch {}
}
function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function inferBodyTypeFromProfile(profile) {
  if (!profile) return ''
  const pecho = Number(profile.medida_pecho) || 0
  const cintura = Number(profile.medida_cintura) || 0
  const cadera = Number(profile.medida_cadera) || 0
  if (!pecho && !cintura && !cadera) return ''
  // Heurística simple
  if (pecho && cadera) {
    const diff = Math.abs(pecho - cadera)
    if (diff < 5 && cintura && cintura < pecho - 15) return 'reloj_arena'
    if (cadera > pecho + 8) return 'triangulo'
    if (pecho > cadera + 8) return 'triangulo_invertido'
    if (cintura && cintura > 95) return 'ovalo'
  }
  return 'rectangulo'
}

export function CatalogPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({
    search: '',
    talla: '',
    color: '',
    marca: '',
    categoria: '',
    categoria_id: '',
    tipo_cuerpo: '',
    tipo_venta: '',
    precio_min: '',
    precio_max: '',
    ordering: '',
  })
  const [appliedFilters, setAppliedFilters] = useState({})
  const [showFilters, setShowFilters] = useState(true)

  const categoriasQuery = usePublicCategorias()
  const filterOptionsQuery = useFilterOptions()
  const profileQuery = useProfile()

  // Build API params from appliedFilters
  const queryParams = useMemo(() => {
    const p = {}
    if (appliedFilters.talla) p.talla = appliedFilters.talla
    if (appliedFilters.color) p.color = appliedFilters.color
    if (appliedFilters.marca) p.marca = appliedFilters.marca
    if (appliedFilters.categoria) p.categoria = appliedFilters.categoria
    if (appliedFilters.categoria_id) p.categoria_id = appliedFilters.categoria_id
    if (appliedFilters.tipo_cuerpo) p.tipo_cuerpo = appliedFilters.tipo_cuerpo
    if (appliedFilters.tipo_venta) p.tipo_venta = appliedFilters.tipo_venta
    if (appliedFilters.precio_min) p.precio_min = appliedFilters.precio_min
    if (appliedFilters.precio_max) p.precio_max = appliedFilters.precio_max
    if (appliedFilters.ordering) p.ordering = appliedFilters.ordering
    if (appliedFilters.search) p.search = appliedFilters.search
    return p
  }, [appliedFilters])

  const query = usePublicProducts(queryParams)
  const cartActions = useCartActions()
  const [selections, setSelections] = useState({})
  const [notices, setNotices] = useState({})
  const [offlineProducts, setOfflineProducts] = useState(null)

  // Offline cache handling
  useEffect(() => {
    if (query.data) saveCache(query.data)
  }, [query.data])

  useEffect(() => {
    if (query.isError && !navigator.onLine) {
      const cached = loadCache()
      if (cached) setOfflineProducts(cached)
    } else {
      setOfflineProducts(null)
    }
  }, [query.isError])

  const rawProducts = offlineProducts || query.data || []
  // Client-side search already handled via API, but keep for cached fallback
  const products = rawProducts

  const hasActiveFilters = Object.values(appliedFilters).some((v) => v !== '' && v !== undefined)
  const clearFilters = () => {
    setFilters({ search: '', talla: '', color: '', marca: '', categoria: '', categoria_id: '', tipo_cuerpo: '', tipo_venta: '', precio_min: '', precio_max: '', ordering: '' })
    setAppliedFilters({})
  }
  const applyFilters = () => setAppliedFilters({ ...filters })

  const getSel = (p) => selections[p.id] || { talla: p.talla, color: p.color, cantidad: 1 }
  const setSel = (pid, patch) => setSelections((s) => ({ ...s, [pid]: { ...getSel({ id: pid, talla: 'M', color: '' }), ...s[pid], ...patch } }))

  const addToCart = (p) => {
    const sel = getSel(p)
    cartActions.add.mutate({ producto_id: p.id, talla: sel.talla, color: sel.color, cantidad: Number(sel.cantidad) }, {
      onSuccess: () => {
        setNotices((n) => ({ ...n, [p.id]: '✓ Agregado al carrito' }))
        setTimeout(() => setNotices((n) => ({ ...n, [p.id]: '' })), 2000)
      },
      onError: (e) => {
        if (!e.response) {
          const pending = JSON.parse(localStorage.getItem('offline_cart') || '[]')
          pending.push({ producto_id: p.id, ...sel, cantidad: Number(sel.cantidad) })
          localStorage.setItem('offline_cart', JSON.stringify(pending))
          setNotices((n) => ({ ...n, [p.id]: 'Sin conexión, guardado local' }))
        } else if (e.response?.status === 409) {
          setNotices((n) => ({ ...n, [p.id]: e.response.data.message }))
        } else {
          setNotices((n) => ({ ...n, [p.id]: handleApiError(e) }))
        }
        setTimeout(() => setNotices((n) => ({ ...n, [p.id]: '' })), 3000)
      },
    })
  }

  // IA sugeridos: filtrar por talla_sugerida del perfil o por popularidad
  const suggestedProducts = useMemo(() => {
    const perfil = profileQuery.data
    if (!perfil?.talla_sugerida) return []
    // productos que coinciden con talla sugerida
    return rawProducts.filter((p) => p.talla === perfil.talla_sugerida).slice(0, 3)
  }, [rawProducts, profileQuery.data])

  const bodyTypeSuggested = useMemo(() => inferBodyTypeFromProfile(profileQuery.data), [profileQuery.data])

  const options = filterOptionsQuery.data || {}
  const isOffline = !navigator.onLine || offlineProducts

  return (
    <section className="page-shell catalog-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Catálogo</span>
          <h1>Explorar productos</h1>
          <p>Filtra por talla, color, marca, modelo, tipo de cuerpo, tipo de venta y precio.</p>
        </div>
        <Button variant="secondary" icon={SlidersHorizontal} onClick={() => setShowFilters((v) => !v)}>
          {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
        </Button>
      </div>

      {isOffline && (
        <div className="page-notice page-notice--warning">Sin conexión — mostrando catálogo guardado localmente. Última actualización: {localStorage.getItem(CACHE_TIME_KEY) ? new Date(Number(localStorage.getItem(CACHE_TIME_KEY))).toLocaleString() : 'desconocida'}</div>
      )}

      {/* IA Sugerencias */}
      {suggestedProducts.length > 0 && (
        <div className="catalog-ai surface-card">
          <div className="catalog-ai__head">
            <Sparkles size={18} /> <strong>Sugeridos para ti</strong> <span>Basado en tu talla {profileQuery.data?.talla_sugerida} {bodyTypeSuggested ? `• Cuerpo ${bodyTypeSuggested.replace('_',' ')}` : ''}</span>
          </div>
          <div className="catalog-ai__grid">
            {suggestedProducts.map((p) => (
              <div key={`ai-${p.id}`} className="catalog-ai__item">
                <img src={p.imagen_url || p.imagen || ''} alt={p.nombre} onError={(e)=> e.target.style.display='none'} />
                <div><strong>{p.nombre}</strong><small>{p.marca || 'Sin marca'} • {p.precio_formateado}</small></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showFilters && (
        <div className="catalog-filters-wrap surface-card">
          <div className="catalog-filters-grid">
            <div className="table-search"><Search size={17} /><input value={filters.search} onChange={(e) => setFilters((s) => ({ ...s, search: e.target.value }))} placeholder="Buscar nombre, marca, color..." /></div>

            <select value={filters.talla} onChange={(e) => setFilters((s) => ({ ...s, talla: e.target.value }))}>
              <option value="">Talla: todas</option>
              {(options.tallas || ['XS','S','M','L','XL','XXL','UNICA','32','34','36','38','40','42','44','46']).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>

            <select value={filters.color} onChange={(e) => setFilters((s) => ({ ...s, color: e.target.value }))}>
              <option value="">Color: todos</option>
              {(options.colores || []).map((c) => <option key={c} value={c}>{c}</option>)}
              {!options.colores && <option value="Rojo">Rojo</option>}
            </select>

            <select value={filters.marca} onChange={(e) => setFilters((s) => ({ ...s, marca: e.target.value }))}>
              <option value="">Marca: todas</option>
              {(options.marcas || []).map((m) => <option key={m} value={m}>{m}</option>)}
            </select>

            <select value={filters.categoria} onChange={(e) => setFilters((s) => ({ ...s, categoria: e.target.value }))}>
              <option value="">Modelo: todos</option>
              <option value="vestidos">Vestidos</option><option value="blusas">Blusas</option><option value="faldas">Faldas</option>
              <option value="pantalones">Pantalones</option><option value="jeans">Jeans</option><option value="conjuntos">Conjuntos</option>
              <option value="abrigos">Abrigos</option><option value="tops">Tops</option><option value="otro">Otro</option>
            </select>

            <select value={filters.categoria_id} onChange={(e) => setFilters((s) => ({ ...s, categoria_id: e.target.value }))}>
              <option value="">Categoría edad: todas</option>
              {(categoriasQuery.data || []).map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>

            <select value={filters.tipo_cuerpo} onChange={(e) => setFilters((s) => ({ ...s, tipo_cuerpo: e.target.value }))}>
              <option value="">Tipo cuerpo: todos</option>
              <option value="reloj_arena">Reloj arena</option><option value="rectangulo">Rectángulo</option>
              <option value="triangulo">Triángulo</option><option value="triangulo_invertido">Triángulo invertido</option>
              <option value="ovalo">Óvalo</option><option value="todos">Todos los cuerpos</option>
            </select>

            <select value={filters.tipo_venta} onChange={(e) => setFilters((s) => ({ ...s, tipo_venta: e.target.value }))}>
              <option value="">Tipo venta: ambas</option>
              <option value="menor">Menor (detal)</option><option value="mayor">Mayor (por mayor)</option>
            </select>

            <div className="catalog-price-range">
              <input type="number" placeholder="Precio desde (Bs)" value={filters.precio_min} onChange={(e) => setFilters((s) => ({ ...s, precio_min: e.target.value }))} />
              <span>—</span>
              <input type="number" placeholder="Hasta (Bs)" value={filters.precio_max} onChange={(e) => setFilters((s) => ({ ...s, precio_max: e.target.value }))} />
            </div>

            <select value={filters.ordering} onChange={(e) => setFilters((s) => ({ ...s, ordering: e.target.value }))}>
              <option value="">Ordenar por: Novedad</option>
              <option value="popularidad">Popularidad</option>
              <option value="precio">Precio: menor a mayor</option>
              <option value="-precio">Precio: mayor a menor</option>
              <option value="calificacion">Calificación</option>
              <option value="-creado_en">Novedad</option>
            </select>
          </div>

          <div className="catalog-filters-actions">
            {profileQuery.data?.talla_sugerida && (
              <Button variant="secondary" onClick={() => { setFilters((s) => ({ ...s, talla: profileQuery.data.talla_sugerida, tipo_cuerpo: bodyTypeSuggested || s.tipo_cuerpo })); setTimeout(()=> setAppliedFilters((prev)=> ({...prev, talla: profileQuery.data.talla_sugerida, tipo_cuerpo: bodyTypeSuggested || prev.tipo_cuerpo})),0) }}>
                <Sparkles size={14} /> Usar mi talla {profileQuery.data.talla_sugerida}
              </Button>
            )}
            <Button onClick={applyFilters} icon={Search}>Aplicar filtros</Button>
            {hasActiveFilters && <Button variant="secondary" icon={X} onClick={clearFilters}>Quitar filtros</Button>}
            <small>{products.length} productos encontrados</small>
          </div>
        </div>
      )}

      {query.isLoading && !offlineProducts ? <Spinner /> : query.isError && !offlineProducts ? <ErrorMessage message={handleApiError(query.error)} onRetry={query.refetch} /> : products.length ? (
        <div className="catalog-grid">
          {products.map((p) => (
            <article key={p.id} className="catalog-card surface-card" onClick={() => navigate(`/catalogo/${p.id}`)} style={{ cursor: 'pointer' }}>
              <div className="catalog-card__image">
                {p.imagen_url || p.imagen ? <img src={p.imagen_url || p.imagen} alt={p.nombre} /> : <span className="catalog-placeholder">Sin imagen</span>}
                <span className={`catalog-badge ${p.tipo_venta === 'mayor' ? 'catalog-badge--mayor' : 'catalog-badge--menor'}`}>{p.tipo_venta === 'mayor' ? 'Mayor' : 'Menor'}</span>
              </div>
              <div className="catalog-card__body">
                <span className="catalog-card__cat">{p.categoria_display} • Talla {p.talla} • {p.marca || 'Sin marca'}</span>
                <h3>{p.nombre}</h3>
                <p className="catalog-card__desc">{p.descripcion || 'Sin descripción'}</p>
                <p className="catalog-card__meta">Color: <strong>{p.color}</strong> • Cuerpo: {p.tipo_cuerpo_display} • Stock: {p.stock}</p>
                <div className="catalog-card__stats"><span><TrendingUp size={12} /> Pop. {p.popularidad}</span><span><Star size={12} /> {Number(p.calificacion).toFixed(1)}</span></div>
                <p className="catalog-card__price">{p.precio_formateado}</p>
                <div className="catalog-card__cart" style={{ display: 'grid', gap: 8, marginTop: 8 }} onClick={(e) => e.stopPropagation()}>
                  <Button variant="secondary" icon={Eye} onClick={() => navigate(`/catalogo/${p.id}`)}>Ver detalle</Button>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <select value={getSel(p).talla} onChange={(e) => setSel(p.id, { talla: e.target.value })} style={{ flex: 1, padding: '6px', border: '1px solid #e5e7eb', borderRadius: 8 }}>
                      {['XS','S','M','L','XL','XXL','UNICA','32','34','36','38','40','42','44','46'].map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input value={getSel(p).color} onChange={(e) => setSel(p.id, { color: e.target.value })} placeholder="Color" style={{ flex: 1, padding: '6px', border: '1px solid #e5e7eb', borderRadius: 8 }} />
                    <input type="number" min="1" max="99" value={getSel(p).cantidad} onChange={(e) => setSel(p.id, { cantidad: e.target.value })} style={{ width: 60, padding: '6px', border: '1px solid #e5e7eb', borderRadius: 8 }} />
                  </div>
                  <Button icon={ShoppingCart} onClick={() => addToCart(p)} loading={cartActions.add.isPending}>Agregar al carrito</Button>
                  {notices[p.id] && <small style={{ color: notices[p.id].includes('✓') ? '#16a34a' : '#dc2626' }}>{notices[p.id]}</small>}
                  {p.stock === 0 && <small style={{ color: '#dc2626' }}>Sin stock</small>}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Sin productos con esos filtros"
          message="No encontramos coincidencias. Prueba quitando algunos filtros o ajustando el rango de precios."
          action={hasActiveFilters ? <Button onClick={clearFilters} icon={X}>Quitar filtros</Button> : undefined}
        />
      )}
    </section>
  )
}
