import { ArrowLeft, GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

export function NotFoundPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeContent: 'center', justifyItems: 'center', gap: 16, padding: 24, textAlign: 'center' }}>
      <GraduationCap size={42} color="var(--color-primary)" />
      <span className="eyebrow">Error 404</span>
      <h1 style={{ color: 'var(--color-ink)', fontSize: '2.2rem' }}>Esta página no existe.</h1>
      <p>La ruta que buscas pudo cambiar o ya no está disponible.</p>
      <Link className="dashboard-primary-action" to={ROUTES.HOME}><ArrowLeft size={17} /> Volver al inicio</Link>
    </main>
  )
}
