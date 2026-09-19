import { useState } from 'react'
import { Package, Truck, CheckCircle, Clock, XCircle, QrCode, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/Button/Button'
import { Spinner } from '@/components/ui/Spinner/Spinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage/ErrorMessage'
import { EmptyState } from '@/components/shared/EmptyState/EmptyState'
import { handleApiError } from '@/utils/handleApiError'
import { usePedidos, useActualizarPedido } from '../hooks/usePedidos'
import { getUserRole } from '@/utils/accessControl'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import './PedidosPage.css'

export function PedidosPage() {
  const currentUser = useCurrentUser()
  const role = getUserRole(currentUser.data)
  const query = usePedidos()
  const actualizar = useActualizarPedido()
  const [msg, setMsg] = useState('')

  const pedidos = query.data || []

  const cambiarEstado = (id, estado) => {
    actualizar.mutate({ id, estado }, {
      onSuccess: () => setMsg(`Pedido ${id} → ${estado}`),
      onError: (e) => setMsg(handleApiError(e)),
    })
    setTimeout(() => setMsg(''), 3000)
  }

  if (query.isLoading) return <div className="page-shell"><Spinner /></div>
  if (query.isError) return <div className="page-shell"><ErrorMessage message={handleApiError(query.error)} onRetry={query.refetch} /></div>

  return (
    <section className="page-shell pedidos-page">
      <div className="page-heading">
        <div><h1><Package size={20} /> {role==='cliente' ? 'Mis Pedidos' : role==='vendedor' ? 'Pedidos de mi sucursal' : 'Todos los pedidos'}</h1><p>CU-19 Gestión de pedidos y estados • {role}</p></div>
      </div>
      {msg && <div className="page-notice page-notice--success">{msg}</div>}

      {pedidos.length === 0 ? <EmptyState title="Sin pedidos" message={role==='cliente' ? 'Compra en el catálogo y tu pedido aparecerá aquí.' : 'No hay pedidos para gestionar.'} /> : (
        <div className="pedidos-grid">
          {pedidos.map((p) => (
            <article key={p.id} className="pedido-card surface-card">
              <header>
                <strong>Pedido #{p.id}</strong>
                <span className={`estado estado--${p.estado}`}>{p.estado}</span>
              </header>
              <p><small>{new Date(p.creado_en).toLocaleString()} • {p.tipo} • {p.sucursal || 'Online'} • {p.usuario}</small></p>
              <div className="pedido-items">
                {p.items.map((it, idx) => <span key={idx}>{it.nombre} {it.talla}/{it.color} x{it.cantidad} — {(it.precio_centavos/100).toFixed(2)} Bs</span>)}
              </div>
              <p className="pedido-total">Total: <strong>{(p.total_centavos/100).toFixed(2)} Bs</strong> <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>{p.pago_metodo==='qr' ? <QrCode size={14}/> : p.pago_metodo==='tarjeta' ? <CreditCard size={14}/> : null} {p.pago_metodo}</span></p>
              {p.qr_data && <div className="pedido-qr"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(p.qr_data)}`} alt="QR" /><small>{p.qr_data}</small></div>}
              <div className="pedido-acciones">
                {(role==='cliente' && p.estado==='pendiente') && <Button variant="secondary" onClick={() => cambiarEstado(p.id, 'cancelado')} icon={XCircle}>Cancelar</Button>}
                {(role!=='cliente') && p.estado==='pendiente' && <Button icon={Clock} onClick={() => cambiarEstado(p.id, 'preparando')}>Preparar</Button>}
                {(role!=='cliente') && p.estado==='preparando' && <Button icon={Truck} onClick={() => cambiarEstado(p.id, 'listo')}>Listo</Button>}
                {(role!=='cliente') && p.estado==='listo' && <Button icon={CheckCircle} onClick={() => cambiarEstado(p.id, 'entregado')}>Entregar</Button>}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
