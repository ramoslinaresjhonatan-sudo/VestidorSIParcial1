import { Inbox } from 'lucide-react'
import './EmptyState.css'

export function EmptyState({ title = 'No hay registros', message = 'Aún no existe información para mostrar.' }) {
  return <div className="empty-state"><span><Inbox size={26} /></span><h3>{title}</h3><p>{message}</p></div>
}
