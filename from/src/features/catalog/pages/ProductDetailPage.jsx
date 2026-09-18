import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Star, ZoomIn, MapPin, Package, ArrowLeft, ShoppingCart, Bell, WifiOff, Store } from 'lucide-react'
import { DisponibilidadSucursal } from '../components/DisponibilidadSucursal'
import { Spinner } from '@/components/ui/Spinner/Spinner'
import { Button } from '@/components/ui/Button/Button'
import { ErrorMessage } from '@/components/shared/ErrorMessage/ErrorMessage'
import { Modal } from '@/components/ui/Modal/Modal'
import { handleApiError } from '@/utils/handleApiError'
import { useCartActions } from '@/features/cart/hooks/useCart'
import { useProductDetail, useAddOpinion, useNotifyStock } from '../hooks/useCatalog'
import './ProductDetailPage.css'

export function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const detailQuery = useProductDetail(id)
  const notifyMutation = useNotifyStock()
  const opinionMutation = useAddOpinion()
  const cartActions = useCartActions()

  const [selectedImg, setSelectedImg] = useState(0)
  const [zoomOpen, setZoomOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedTalla, setSelectedTalla] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [notifyEmail, setNotifyEmail] = useState('')
  const [notifyMsg, setNotifyMsg] = useState('')
  const [opinionForm, setOpinionForm] = useState({ usuario_nombre: '', calificacion: 5, comentario: '' })
  const [offlineData, setOfflineData] = useState(null)
  const [disponibilidadOpen, setDisponibilidadOpen] = useState(false)

  const product = detailQuery.data || offlineData

  // Offline cache
  useEffect(() => {
    if (detailQuery.data) {
      localStorage.setItem(`product_detail_${id}`, JSON.stringify(detailQuery.data))
    }
  }, [detailQuery.data, id])

  useEffect(() => {
    if (detailQuery.isError && !navigator.onLine) {
      const cached = localStorage.getItem(`product_detail_${id}`)
      if (cached) setOfflineData(JSON.parse(cached))
    }
  }, [detailQuery.isError, id])

  useEffect(() => {
    if (product) {
      setSelectedColor(product.color || Object.keys(product.tallas_por_color || {})[0] || '')
      setSelectedTalla(product.talla || '')
    }
  }, [product])

  if (detailQuery.isLoading && !offlineData) return <div className="page-shell"><Spinner /></div>
  if (detailQuery.isError && !offlineData) return <div className="page-shell"><ErrorMessage message={handleApiError(detailQuery.error)} onRetry={detailQuery.refetch} /></div>
  if (!product) return null

  const imagenes = product.imagenes_urls?.length ? product.imagenes_urls : product.imagen_url ? [product.imagen_url] : []
  const tallasPorColor = product.tallas_por_color || {}
  const tallasForColor = tallasPorColor[selectedColor] || tallasPorColor[Object.keys(tallasPorColor)[0]] || []
  const stockSucursales = product.stock_por_sucursal || []
  const opiniones = product.opiniones || []
  const isAgotado = product.stock === 0 || tallasForColor.every((t) => t.stock === 0)
  const isOffline = !navigator.onLine || !!offlineData

  const handleAddToCart = () => {
    cartActions.add.mutate({ producto_id: product.id, talla: selectedTalla, color: selectedColor, cantidad: Number(cantidad) }, {
      onSuccess: () => setNotifyMsg('✓ Agregado al carrito'),
      onError: (e) => setNotifyMsg(handleApiError(e)),
    })
    setTimeout(() => setNotifyMsg(''), 3000)
  }

  const handleNotify = () => {
    if (!notifyEmail) return setNotifyMsg('Ingresa tu email')
    notifyMutation.mutate({ id: product.id, payload: { email: notifyEmail, talla: selectedTalla, color: selectedColor } }, {
      onSuccess: (data) => setNotifyMsg(data?.message || 'Te notificaremos cuando haya stock'),
      onError: (e) => setNotifyMsg(handleApiError(e)),
    })
  }

  const handleOpinion = (e) => {
    e.preventDefault()
    opinionMutation.mutate({ id: product.id, payload: opinionForm }, {
      onSuccess: () => { setOpinionForm({ usuario_nombre: '', calificacion: 5, comentario: '' }); setNotifyMsg('Opinión publicada') },
      onError: (e) => setNotifyMsg(handleApiError(e)),
    })
  }

  return (
    <section className="page-shell product-detail-page">
      <button className="product-back" onClick={() => navigate(-1)}><ArrowLeft size={16} /> Volver al catálogo</button>
      {isOffline && <div className="page-notice page-notice--warning"><WifiOff size={14} /> Sin conexión — datos en caché</div>}
      {notifyMsg && <div className="page-notice page-notice--success">{notifyMsg}</div>}

      <div className="product-detail-grid">
        {/* Galería */}
        <div className="product-gallery">
          <div className="product-gallery__main" onClick={() => setZoomOpen(true)}>
            {imagenes[selectedImg] ? <img src={imagenes[selectedImg]} alt={product.nombre} /> : <span className="catalog-placeholder">Sin imagen</span>}
            <span className="gallery-zoom"><ZoomIn size={16} /> Zoom</span>
          </div>
          {imagenes.length > 1 && (
            <div className="product-gallery__thumbs">
              {imagenes.map((url, idx) => (
                <button key={idx} className={idx === selectedImg ? 'active' : ''} onClick={() => setSelectedImg(idx)}><img src={url} alt={`thumb ${idx}`} /></button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="product-info surface-card">
          <span className="eyebrow">{product.categoria_display} • {product.marca || 'Sin marca'}</span>
          <h1>{product.nombre}</h1>
          <div className="product-rating"><Star size={16} fill="#f59e0b" color="#f59e0b" /> {Number(product.promedio_calificacion || product.calificacion || 0).toFixed(1)} <small>({product.opiniones_count} opiniones)</small> • <span>{product.popularidad} vendidos</span></div>
          <p className="product-price">{product.precio_formateado} <span className={`badge-venta ${product.tipo_venta}`}>{product.tipo_venta_display}</span></p>
          <p className="product-desc">{product.descripcion}</p>
          {product.detalle && <p className="product-detalle">{product.detalle}</p>}

          {/* Especificaciones */}
          <div className="product-specs">
            <h3>Especificaciones</h3>
            <ul>
              <li><strong>Tela:</strong> {product.especificaciones?.tela || product.tela}</li>
              <li><strong>Cuidados:</strong> {product.especificaciones?.cuidados || product.cuidados}</li>
              <li><strong>Origen:</strong> {product.especificaciones?.origen || product.origen}</li>
              <li><strong>Tipo cuerpo:</strong> {product.tipo_cuerpo_display}</li>
              <li><strong>Categorías:</strong> {product.categorias?.map((c) => c.nombre).join(', ') || '—'}</li>
            </ul>
          </div>

          {/* Tallas por color */}
          <div className="product-variants">
            <h3>Tallas disponibles por color</h3>
            {Object.keys(tallasPorColor).length ? Object.entries(tallasPorColor).map(([color, tallas]) => (
              <div key={color} className={`variant-row ${color === selectedColor ? 'selected' : ''}`} onClick={() => setSelectedColor(color)}>
                <span className="variant-color" style={{ background: color === 'Rojo' ? '#ef4444' : color === 'Azul' ? '#3b82f6' : '#e5e7eb' }} title={color} />
                <strong>{color}</strong>
                <div className="variant-tallas">
                  {tallas.map((t) => (
                    <button key={t.talla} className={`${t.talla === selectedTalla && color === selectedColor ? 'active' : ''} ${t.stock === 0 ? 'out' : ''}`} onClick={(e) => { e.stopPropagation(); setSelectedColor(color); setSelectedTalla(t.talla) }}>{t.talla} {t.stock === 0 ? '(0)' : ''}</button>
                  ))}
                </div>
              </div>
            )) : <p>No hay variantes registradas</p>}
          </div>

          {/* Selector cantidad y añadir */}
          <div className="product-actions">
            <div className="qty-row">
              <label>Cantidad <input type="number" min="1" max="20" value={cantidad} onChange={(e) => setCantidad(e.target.value)} /></label>
              <span>Stock total: {product.stock}</span>
            </div>
            {isAgotado ? (
              <div className="product-agotado">
                <span className="badge-agotado"><Package size={14} /> Sin stock</span>
                <p>¿Quieres que te avisemos cuando llegue?</p>
                <div className="notify-row">
                  <input placeholder="tu@email.com" value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)} />
                  <Button icon={Bell} onClick={handleNotify} loading={notifyMutation.isPending}>Notificarme</Button>
                </div>
              </div>
            ) : (
              <Button icon={ShoppingCart} onClick={handleAddToCart} loading={cartActions.add.isPending} className="btn-add-cart">Agregar al carrito — {product.precio_formateado}</Button>
            )}
          </div>

          {/* Stock por sucursal */}
          <div className="product-stock-sucursal">
            <h3><MapPin size={16} /> Stock por sucursal</h3>
            <table>
              <thead><tr><th>Sucursal</th><th>Ciudad</th><th>Stock</th></tr></thead>
              <tbody>
                {stockSucursales.slice(0, 3).map((s) => (
                  <tr key={s.id}><td>{s.sucursal.nombre}</td><td>{s.sucursal.ciudad}</td><td className={s.stock === 0 ? 'stock-zero' : 'stock-ok'}>{s.stock}</td></tr>
                ))}
              </tbody>
            </table>
            <Button icon={Store} variant="secondary" onClick={() => setDisponibilidadOpen(true)} style={{ marginTop: 8, width: '100%' }}>Ver disponibilidad en tiendas</Button>
          </div>
        </div>
      </div>

      {/* Opiniones */}
      <div className="product-opiniones surface-card">
        <h2>Opiniones y calificaciones ({product.opiniones_count}) • Promedio {Number(product.promedio_calificacion).toFixed(1)} / 5</h2>
        <div className="opiniones-list">
          {opiniones.length ? opiniones.map((o) => (
            <div key={o.id} className="opinion">
              <div className="opinion-head"><strong>{o.usuario_nombre}</strong> <span className="opinion-stars">{'★'.repeat(o.calificacion)}{'☆'.repeat(5 - o.calificacion)}</span> <small>{new Date(o.creado_en).toLocaleDateString()}</small></div>
              <p>{o.comentario}</p>
            </div>
          )) : <p>Sin opiniones aún. ¡Sé el primero!</p>}
        </div>
        <form className="opinion-form" onSubmit={handleOpinion}>
          <h3>Deja tu opinión</h3>
          <input placeholder="Tu nombre" value={opinionForm.usuario_nombre} onChange={(e) => setOpinionForm((p) => ({ ...p, usuario_nombre: e.target.value }))} required />
          <select value={opinionForm.calificacion} onChange={(e) => setOpinionForm((p) => ({ ...p, calificacion: Number(e.target.value) }))}>
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} estrellas</option>)}
          </select>
          <textarea placeholder="Comentario" value={opinionForm.comentario} onChange={(e) => setOpinionForm((p) => ({ ...p, comentario: e.target.value }))} rows={3} />
          <Button type="submit" loading={opinionMutation.isPending}>Publicar opinión</Button>
        </form>
      </div>

      <Modal isOpen={zoomOpen} onClose={() => setZoomOpen(false)} title={product.nombre} size="lg">
        <div className="zoom-modal"><img src={imagenes[selectedImg]} alt={product.nombre} style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain' }} /></div>
      </Modal>

      <Modal isOpen={disponibilidadOpen} onClose={() => setDisponibilidadOpen(false)} title={`Disponibilidad — ${product.nombre}`} size="lg">
        <DisponibilidadSucursal productoId={product.id} talla={selectedTalla} color={selectedColor} onClose={() => setDisponibilidadOpen(false)} />
      </Modal>
    </section>
  )
}
