import { AlertTriangle } from 'lucide-react'
import './ErrorMessage.css'

export function ErrorMessage({ message = 'No se pudo cargar la información.', onRetry }) {
  return <div className="error-state"><AlertTriangle size={21} /><span>{message}</span>{onRetry && <button type="button" onClick={onRetry}>Reintentar</button>}</div>
}
