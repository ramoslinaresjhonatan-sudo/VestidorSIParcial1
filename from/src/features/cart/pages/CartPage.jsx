import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, Tag, ShoppingBag, QrCode, CreditCard, Banknote } from 'lucide-react'
import { Button } from '@/components/ui/Button/Button'
import { Modal } from '@/components/ui/Modal/Modal'
import { EmptyState } from '@/components/shared/EmptyState/EmptyState'
import { ErrorMessage } from '@/components/shared/ErrorMessage/ErrorMessage'
import { Spinner } from '@/components/ui/Spinner/Spinner'
import { handleApiError } from '@/utils/handleApiError'
import { ROUTES } from '@/constants/routes'
import { useCart, useCartActions } from '../hooks/useCart'
import { useCrearPedido } from '@/features/pedidos/hooks/usePedidos'
import './CartPage.css'

function formatBs(centavos) {
  return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(centavos / 100)
}

export function CartPage() {
  const cartQuery = useCart()
  const actions = useCartActions()
  const navigate = useNavigate()
  const crearPedido = useCrearPedido()
  const [coupon, setCoupon] = useState('')
  const [couponError, setCouponError] = useState('')
  const [notice, setNotice] = useState('')
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [pago, setPago] = useState('tarjeta')

  const cart = cartQuery.data
  const items = cart?.items || []

  const showNotice = (m) => { setNotice(m); setTimeout(()=>setNotice(''), 3000) }

  const changeQty = (item, delta) => {
    const newQty = item.cantidad + delta
    if (newQty < 1) return
    actions.update.mutate({ id: item.id, payload: { cantidad: newQty } }, {
      onError: (e) => {
        if (!e.response) {
          // offline -> guarda localmente
          const pending = JSON.parse(localStorage.getItem('offline_cart') || '[]')
          pending.push({ action: 'update', item, newQty })
          localStorage.setItem('offline_cart', JSON.stringify(pending))
          showNotice('Sin conexión, cambio guardado localmente.')
        } else {
          const msg = e.response?.data?.message || handleApiError(e)
          showNotice(msg)
          // si sin stock, alternativas
          if (e.response?.data?.alternativas) {
            console.log('Alternativas', e.response.data.alternativas)
          }
        }
      }
    })
  }

  const changeVariant = (item, field, value) => {
    actions.update.mutate({ id: item.id, payload: { [field]: value } }, {
      onError: (e) => showNotice(handleApiError(e))
    })
  }

  const removeItem = (item) => {
    actions.remove.mutate(item.id, {
      onSuccess: () => showNotice('Producto eliminado.'),
      onError: (e) => showNotice(handleApiError(e))
    })
  }

  const applyCoupon = () => {
    setCouponError('')
    actions.applyCoupon.mutate(coupon, {
      onSuccess: () => { setCoupon(''); showNotice('Cupón aplicado.') },
      onError: (e) => {
        if (!e.response) {
          const pending = JSON.parse(localStorage.getItem('offline_cart') || '[]')
          pending.push({ action: 'coupon', codigo: coupon })
          localStorage.setItem('offline_cart', JSON.stringify(pending))
          showNotice('Sin conexión, cupón guardado localmente.')
        } else setCouponError(handleApiError(e))
      }
    })
  }

  const removeCoupon = () => {
    actions.removeCoupon.mutate(undefined, {
      onSuccess: () => showNotice('Cupón removido.'),
    })
  }

  if (cartQuery.isLoading) return <Spinner />
  if (cartQuery.isError) return <ErrorMessage message={handleApiError(cartQuery.error)} onRetry={cartQuery.refetch} />

  if (!items.length) {
    return (
      <section className="page-shell cart-page">
        <div className="page-heading"><div><span className="eyebrow">Carrito</span><h1>Mi Carrito</h1><p>Tu carrito está vacío.</p></div></div>
        <EmptyState title="Carrito vacío" message="Explora el catálogo y agrega tus productos favoritos." />
        <Link to={ROUTES.CATALOGO} className="cart-empty-cta"><Button icon={ShoppingBag}>Ir al catálogo</Button></Link>
      </section>
    )
  }

  return (
    <section className="page-shell cart-page">
      <div className="page-heading">
        <div><span className="eyebrow">Carrito</span><h1>Mi Carrito</h1><p>{cart.total_items} productos • Total {formatBs(cart.total_centavos)}</p></div>
      </div>
      {notice && <div className="page-notice">{notice}</div>}

      <div className="cart-layout">
        <div className="cart-items surface-card">
          {items.map(item => (
            <article key={item.id} className="cart-item">
              <img src={item.producto.imagen_url || item.producto.imagen || ''} alt={item.producto.nombre} className="cart-item__img" />
              <div className="cart-item__info">
                <h3>{item.producto.nombre}</h3>
                <p>{item.producto.categoria_display} • {item.producto.categorias?.map(c=>c.nombre).join(', ')}</p>
                <p className="cart-item__price">{formatBs(item.precio_centavos)} {item.producto.precio_centavos !== item.precio_centavos && <span className="cart-item__promo">Promo!</span>}</p>
                <div className="cart-item__variant">
                  <label>Talla
                    <select value={item.talla} onChange={e=>changeVariant(item,'talla',e.target.value)}>
                      {['XS','S','M','L','XL','XXL','UNICA','32','34','36','38','40','42','44','46'].map(t=> <option key={t} value={t}>{t}</option>)}
                    </select>
                  </label>
                  <label>Color
                    <input value={item.color} onChange={e=>changeVariant(item,'color',e.target.value)} placeholder="Color" style={{width:90}} />
                  </label>
                </div>
              </div>
              <div className="cart-item__actions">
                <div className="qty-control">
                  <button type="button" onClick={()=>changeQty(item,-1)}><Minus size={14} /></button>
                  <span>{item.cantidad}</span>
                  <button type="button" onClick={()=>changeQty(item,1)}><Plus size={14} /></button>
                </div>
                <p className="cart-item__subtotal">{formatBs(item.subtotal_centavos)}</p>
                <button className="cart-item__delete" onClick={()=>removeItem(item)}><Trash2 size={16} /></button>
              </div>
            </article>
          ))}
        </div>

        <aside className="cart-summary surface-card">
          <h3>Resumen</h3>
          <div className="cart-summary__row"><span>Subtotal</span><span>{formatBs(cart.subtotal_centavos)}</span></div>
          {cart.coupon && <div className="cart-summary__row cart-summary__discount"><span>Descuento ({cart.coupon.codigo})</span><span>-{formatBs(cart.descuento_centavos)}</span></div>}
          <div className="cart-summary__total"><span>Total</span><span>{formatBs(cart.total_centavos)}</span></div>

          <div className="cart-coupon">
            {cart.coupon ? (
              <div className="cart-coupon__applied"><Tag size={14} /> {cart.coupon.codigo} <Button variant="secondary" onClick={removeCoupon}>Quitar</Button></div>
            ) : (
              <>
                <div className="cart-coupon__input"><Tag size={16} /><input value={coupon} onChange={e=>setCoupon(e.target.value)} placeholder="Cupón de descuento" /><Button onClick={applyCoupon} loading={actions.applyCoupon.isPending}>Aplicar</Button></div>
                {couponError && <small className="form-alert form-alert--danger">{couponError}</small>}
              </>
            )}
          </div>

          <Button icon={ShoppingBag} style={{width:'100%', marginTop:12}} onClick={()=>setCheckoutOpen(true)}>Proceder a comprar</Button>
          <p style={{fontSize:'.75rem', color:'#6b7280', marginTop:8}}>CU-13 Online • CU-15/16 QR/Tarjeta</p>
        </aside>
      </div>

      <Modal isOpen={checkoutOpen} onClose={()=>setCheckoutOpen(false)} title="Finalizar compra" size="sm">
        <div style={{ display: 'grid', gap: 12 }}>
          <p>Total a pagar: <strong>{formatBs(cart.total_centavos)}</strong></p>
          <div style={{ display: 'grid', gap: 6 }}>
            <label style={{ display:'flex', gap:6, alignItems:'center' }}><input type="radio" name="pago" checked={pago==='tarjeta'} onChange={()=>setPago('tarjeta')} /> <CreditCard size={14}/> Tarjeta</label>
            <label style={{ display:'flex', gap:6, alignItems:'center' }}><input type="radio" name="pago" checked={pago==='qr'} onChange={()=>setPago('qr')} /> <QrCode size={14}/> QR</label>
            <label style={{ display:'flex', gap:6, alignItems:'center' }}><input type="radio" name="pago" checked={pago==='efectivo'} onChange={()=>setPago('efectivo')} /> <Banknote size={14}/> Efectivo (solo tienda)</label>
          </div>
          {pago==='qr' && <div style={{ display:'grid', placeItems:'center', background:'#f9fafb', padding:10, borderRadius:8 }}><img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Pedido:${cart.total_centavos}:${Date.now()}`} alt="QR" /><small>QR {(cart.total_centavos/100).toFixed(2)} Bs — paga escaneando</small></div>}
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
            <Button variant="secondary" onClick={()=>setCheckoutOpen(false)}>Cancelar</Button>
            <Button loading={crearPedido.isPending} onClick={()=>{
              crearPedido.mutate({ tipo:'online', pago_metodo: pago }, {
                onSuccess:(d)=>{ setCheckoutOpen(false); setNotice(`Pedido #${d.id} creado por ${(d.total_centavos/100).toFixed(2)} Bs`); cartQuery.refetch(); setTimeout(()=>navigate('/app/pedidos'), 800) },
                onError:(e)=> setNotice(handleApiError(e))
              })
            }}>Confirmar pago — {formatBs(cart.total_centavos)}</Button>
          </div>
        </div>
      </Modal>
    </section>
  )
}
