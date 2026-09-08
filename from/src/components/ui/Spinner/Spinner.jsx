import { LoaderCircle } from 'lucide-react'
import './Spinner.css'

export function Spinner({ label = 'Cargando información...' }) {
  return (
    <div className="spinner-state" role="status">
      <LoaderCircle size={26} />
      <span>{label}</span>
    </div>
  )
}
