import {
  ArrowRight,
  BarChart3,
  Check,
  Clock3,
  ShieldCheck,
  Star,
  UsersRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import platformLogo from '@/assets/edugestion-platform-logo.png'
import { ROUTES } from '@/constants/routes'
import { usePublicPlans } from '@/features/billing/hooks/useBilling'
import './LandingPage.css'

const features = [
  {
    icon: UsersRound,
    title: 'Personas organizadas',
    text: 'Administra usuarios y estados desde una vista clara, rápida y siempre actualizada.',
  },
  {
    icon: ShieldCheck,
    title: 'Accesos bajo control',
    text: 'Define roles y asigna permisos con precisión para cada responsabilidad institucional.',
  },
  {
    icon: BarChart3,
    title: 'Decisiones con contexto',
    text: 'Visualiza los indicadores esenciales de tu comunidad desde un dashboard sencillo.',
  },
]

function formatPrice(plan) {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: plan.currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(plan.amount_minor / 100)
}

export function LandingPage() {
  const plansQuery = usePublicPlans()

  return (
    <div className="landing-page">
      <header className="landing-nav">
        <Link className="landing-logo" to={ROUTES.HOME}>
          <span><img src={platformLogo} alt="" /></span>
          <strong>EduGestión</strong>
        </Link>
        <nav aria-label="Navegación principal">
          <a href="#beneficios">Beneficios</a>
          <a href="#planes">Planes</a>
          <a href="#seguridad">Seguridad</a>
        </nav>
        <div className="landing-nav__actions">
          <Link className="landing-nav__cta" to={ROUTES.LOGIN}>Ingresar <ArrowRight size={16} /></Link>
        </div>
      </header>

      <main>
        <section className="landing-hero-zone">
          <div className="landing-hero">
            <div className="landing-hero__copy">
              <span className="eyebrow">EduGestión</span>
              <h1>Gestión educativa <em>sin complicaciones.</em></h1>
              <p>Usuarios, roles y permisos en un solo lugar.</p>
              <div className="landing-hero__actions">
                <Link className="landing-primary-cta" to={ROUTES.LOGIN}>Ingresar a la plataforma <ArrowRight size={18} /></Link>
              </div>
            </div>

            <div className="landing-hero-logo-visual" aria-label="Identidad de EduGestión">
              <span><img src={platformLogo} alt="Logo de EduGestión" /></span>
            </div>
          </div>

          <div className="landing-wave landing-wave--hero" aria-hidden="true">
            <svg viewBox="0 0 1440 220" preserveAspectRatio="none">
              <path d="M0,126L60,114C120,102,240,78,360,91C480,104,600,154,720,151C840,148,960,92,1080,77C1200,62,1320,91,1380,106L1440,120L1440,220L0,220Z" />
            </svg>
          </div>
        </section>

        <section className="landing-features-zone" id="solucion">
          <div className="landing-features">
            <div className="landing-section-heading">
              <span className="eyebrow">Lo esencial</span>
              <h2>Todo lo que necesitas.</h2>
            </div>
            <div className="landing-feature-grid" id="beneficios">
              {features.map(({ icon: Icon, title, text }, index) => (
                <article key={title}>
                  <span className="feature-number">0{index + 1}</span>
                  <div className="feature-icon"><Icon size={22} /></div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <Link to={ROUTES.LOGIN}>Explorar módulo <ArrowRight size={15} /></Link>
                </article>
              ))}
            </div>
          </div>
          <div className="landing-wave landing-wave--features-bottom" aria-hidden="true">
            <svg viewBox="0 0 1440 220" preserveAspectRatio="none">
              <path d="M0,82L72,99C144,116,288,150,432,143C576,136,720,88,864,77C1008,66,1152,92,1296,110L1440,128L1440,220L0,220Z" />
            </svg>
          </div>
        </section>

        <section className="landing-plans" id="planes">
          <div className="landing-section-heading">
            <span className="eyebrow">Planes disponibles</span>
            <h2>Elige el alcance que necesitas.</h2>
            <p>Conoce el costo, la vigencia y los módulos incluidos antes de ingresar a la plataforma.</p>
          </div>

          {plansQuery.isLoading && <div className="landing-plans__status">Cargando planes…</div>}
          {plansQuery.isError && <div className="landing-plans__status">Los planes no están disponibles en este momento.</div>}
          {plansQuery.data?.length > 0 && (
            <div className="landing-plan-grid">
              {plansQuery.data.map((plan) => (
                <article key={plan.id} className={`landing-plan-card ${plan.featured ? 'landing-plan-card--featured' : ''}`}>
                  {plan.featured && <span className="landing-plan-card__featured"><Star size={13} /> Recomendado</span>}
                  <header>
                    <span>Plan {plan.name}</span>
                    <h3>{formatPrice(plan)}</h3>
                    <p>Vigencia de {plan.duration_days} días</p>
                  </header>
                  <p className="landing-plan-card__description">{plan.description}</p>
                  <div className="landing-plan-card__limits">
                    <span><Clock3 size={16} /> {plan.duration_days} días de acceso</span>
                    <span><UsersRound size={16} /> Hasta {plan.student_limit.toLocaleString('es-BO')} estudiantes</span>
                  </div>
                  <ul>
                    {plan.modules.map((module) => <li key={module}><Check size={15} /> {module}</li>)}
                  </ul>
                  <Link className="landing-plan-card__action" to={`${ROUTES.LOGIN}?plan=${encodeURIComponent(plan.code)}`}>Elegir plan <ArrowRight size={16} /></Link>
                </article>
              ))}
            </div>
          )}
          {plansQuery.data?.length === 0 && <div className="landing-plans__status">Próximamente publicaremos nuestros planes.</div>}
        </section>

        <section className="landing-security" id="seguridad">
          <div>
            <span className="eyebrow">Seguridad</span>
            <h2>Accesos claros y seguros.</h2>
            <p>Cada persona utiliza únicamente los módulos que necesita.</p>
          </div>
          <div className="security-orbit"><ShieldCheck size={54} /><span className="orbit orbit--one" /><span className="orbit orbit--two" /></div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-logo"><span><img src={platformLogo} alt="" /></span><strong>EduGestión</strong></div>
        <p>Gestión clara para comunidades que educan.</p>
        <span>© 2026 EduGestión</span>
      </footer>
    </div>
  )
}
