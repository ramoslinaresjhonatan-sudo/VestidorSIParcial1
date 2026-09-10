import { Badge } from '@/components/ui/Badge/Badge'
import './ModuleOverview.css'

export function ModuleOverview({ eyebrow, title, description, icon: Icon, fields, badgeLabel }) {
  return (
    <section className="page-shell module-overview-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <Badge tone="neutral"><Icon size={13} /> {badgeLabel}</Badge>
      </div>

      <article className="module-overview-card surface-card">
        <div className="module-overview-card__icon"><Icon size={28} aria-hidden="true" /></div>
        <div className="module-overview-card__copy">
          <h2>Información que administrará este módulo</h2>
          <p>La navegación está preparada para incorporar el registro y consulta de los siguientes datos:</p>
        </div>
        <div className="module-overview-fields">
          {fields.map((field) => <span key={field}>{field}</span>)}
        </div>
      </article>
    </section>
  )
}
