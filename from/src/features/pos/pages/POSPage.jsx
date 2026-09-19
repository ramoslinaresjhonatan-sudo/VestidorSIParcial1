import { useState, useMemo } from 'react'
import { ShoppingCart, Plus, Trash2, CreditCard, QrCode, Banknote, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button/Button'
import { Spinner } from '@/components/ui/Spinner/Spinner'
import { handleApiError } from '@/utils/handleApiError'
import { usePublicProducts } from '@/features/catalog/hooks/useCatalog'
import { useCrearPedido } from '@/features/pedidos/hooks/usePedidos'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { getUserRole } from '@/utils/accessControl'
import './POSPage.css'

export function POSPage() {
  const currentUser = useCurrentUser()
  const role = getUserRole(currentUser.data)
  const productsQuery = usePublicProducts({})
  const crearPedido = useCrearPedido()
  const [search, setSearch] = useState('')
  const [carrito, setCarrito] = useState([]) // [{producto_id, nombre, talla, color, cantidad, precio}]
  const [pago, setPago] = useState('efectivo')
  const [msg, setMsg] = useState('')

  const productos = useMemo(() => {
    const term = search.toLowerCase().trim()
    if (!term) return productsQuery.data || []
    return (productsQuery.data || []).filter((p) => `${p.nombre} ${p.marca} ${p.color}`.toLowerCase().includes(term))
  }, [search, productsQuery.data])

  const add = (p) => {
    setCarrito((c) => {
      const idx = c.findIndex((i) => i.producto_id===p.id && i.talla===p.talla && i.color===p.color)
      if (idx>=0) { const n=[...c]; n[idx].cantidad+=1; return n }
      return [...c, { producto_id: p.id, nombre: p.nombre, talla: p.talla, color: p.color, cantidad: 1, precio_centavos: p.precio_centavos }]
    })
  }
  const quitar = (idx) => setCarrito((c) => c.filter((_,i)=>i!==idx))
  const total = carrito.reduce((s,i)=> s + i.precio_centavos*i.cantidad, 0)

  const vender = () => {
    if (!carrito.length) return setMsg('Carrito vacío')
    crearPedido.mutate({ tipo: 'tienda', pago_metodo: pago, items: carrito }, {
      onSuccess: (d) => { setMsg(`Venta registrada Pedido #${d.id} Total ${(d.total_centavos/100).toFixed(2)} Bs`); setCarrito([]) },
      onError: (e) => setMsg(handleApiError(e)),
    })
    setTimeout(() => setMsg(''), 4000)
  }

  if (!['vendedor','administrador'].includes(role) && currentUser.isSuccess) {
    return <section className="page-shell"><div className="page-notice page-notice--warning">POS solo para Vendedor/Administrador (tu rol: {role})</div></section>
  }

  return (
    <section className="page-shell pos-page">
      <div className="page-heading"><div><h1><ShoppingCart size={20} /> POS — Venta en tienda</h1><p>CU-14 {role} {currentUser.data?.sucursal ? `— ${currentUser.data.sucursal.nombre}` : ''}</p></div></div>
      {msg && <div className="page-notice page-notice--success">{msg}</div>}

      <div className="pos-layout">
        <div className="pos-productos surface-card">
          <div className="table-search"><Search size={16} /><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Buscar producto..." /></div>
          {productsQuery.isLoading ? <Spinner /> : (
            <div className="pos-grid">
              {productos.slice(0,12).map((p)=>(
                <article key={p.id} className="pos-card">
                  <img src={p.imagen_url || p.imagen} alt={p.nombre} />
                  <strong>{p.nombre}</strong><small>{p.talla}/{p.color} • {p.precio_formateado}</small>
                  <Button size="sm" icon={Plus} onClick={()=>add(p)}>Agregar</Button>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="pos-carrito surface-card">
          <h3>Carrito POS ({carrito.length})</h3>
          {carrito.length===0 ? <p style={{color:'#6b7280'}}>Vacío</p> : carrito.map((it, idx)=>(
            <div key={idx} className="pos-item">
              <span>{it.nombre} {it.talla}/{it.color} x{it.cantidad}</span>
              <span>{(it.precio_centavos/100).toFixed(2)} Bs</span>
              <button onClick={()=>quitar(idx)}><Trash2 size={14} /></button>
            </div>
          ))}
          <div className="pos-total"><span>Total</span><strong>{(total/100).toFixed(2)} Bs</strong></div>
          <div className="pos-pago">
            <label><input type="radio" name="pago" checked={pago==='efectivo'} onChange={()=>setPago('efectivo')} /> <Banknote size={14}/> Efectivo</label>
            <label><input type="radio" name="pago" checked={pago==='tarjeta'} onChange={()=>setPago('tarjeta')} /> <CreditCard size={14}/> Tarjeta</label>
            <label><input type="radio" name="pago" checked={pago==='qr'} onChange={()=>setPago('qr')} /> <QrCode size={14}/> QR</label>
          </div>
          {pago==='qr' && total>0 && <div className="pos-qr"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=POS:${total}`} alt="QR" /><small>QR {(total/100).toFixed(2)} Bs — escanea para pagar</small></div>}
          <Button icon={ShoppingCart} onClick={vender} loading={crearPedido.isPending} disabled={!carrito.length}>Cobrar — {(total/100).toFixed(2)} Bs</Button>
        </aside>
      </div>
    </section>
  )
}
