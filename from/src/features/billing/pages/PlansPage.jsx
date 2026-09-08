import { useMemo, useState } from 'react'
import {
  Check,
  Clock3,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  UsersRound,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge/Badge'
import { Button } from '@/components/ui/Button/Button'
import { Modal } from '@/components/ui/Modal/Modal'
import { EmptyState } from '@/components/shared/EmptyState/EmptyState'
import { ErrorMessage } from '@/components/shared/ErrorMessage/ErrorMessage'
import { Spinner } from '@/components/ui/Spinner/Spinner'
import { handleApiError } from '@/utils/handleApiError'
import { PlanForm } from '../components/PlanForm'
import { useAdminPlans, usePlanActions } from '../hooks/useBilling'
import './PlansPage.css'

function formatPrice(plan) {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: plan.currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(plan.amount_minor / 100)
}

export function PlansPage() {
  const plansQuery = useAdminPlans()
  const actions = usePlanActions()
  const [search, setSearch] = useState('')
  const [formPlan, setFormPlan] = useState(undefined)
  const [formOpen, setFormOpen] = useState(false)
  const [formError, setFormError] = useState('')
  const [confirmPlan, setConfirmPlan] = useState(null)
  const [notice, setNotice] = useState('')

  const plans = useMemo(() => {
    const items = plansQuery.data || []
    const term = search.trim().toLowerCase()
    if (!term) return items
    return items.filter((plan) => `${plan.name} ${plan.code} ${plan.description}`.toLowerCase().includes(term))
  }, [plansQuery.data, search])

  const showNotice = (message) => {
    setNotice(message)
    setTimeout(() => setNotice(''), 3500)
  }

  const openCreate = () => {
    setFormPlan(undefined)
    setFormError('')
    setFormOpen(true)
  }

  const openEdit = (plan) => {
    setFormPlan(plan)
    setFormError('')
    setFormOpen(true)
  }

  const savePlan = (payload) => {
    const mutation = formPlan ? actions.update : actions.create
    const variables = formPlan ? { id: formPlan.id, payload } : payload
    mutation.mutate(variables, {
      onSuccess: () => {
        setFormOpen(false)
        showNotice(formPlan ? 'Plan actualizado correctamente.' : 'Plan creado correctamente.')
      },
      onError: (error) => setFormError(handleApiError(error)),
    })
  }

  const toggleVisibility = (plan) => {
    actions.update.mutate({ id: plan.id, payload: { active: !plan.active } }, {
      onSuccess: () => showNotice(plan.active ? 'Plan ocultado del landing page.' : 'Plan publicado en el landing page.'),
      onError: (error) => showNotice(handleApiError(error)),
    })
  }

  const deletePlan = () => {
    if (!confirmPlan) return
    actions.remove.mutate(confirmPlan.id, {
      onSuccess: () => {
        setConfirmPlan(null)
        showNotice('Plan eliminado correctamente.')
      },
      onError: (error) => {
        setConfirmPlan(null)
        showNotice(handleApiError(error))
      },
    })
  }

  const formLoading = actions.create.isPending || actions.update.isPending

  return (
    <section className="page-shell plans-page management-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Superadministración</span>
          <h1>Gestión de planes</h1>
          <p>Crea, edita y publica los planes que se muestran antes de iniciar sesión.</p>
        </div>
        <Button icon={Plus} onClick={openCreate}>Nuevo plan</Button>
      </div>

      {notice && <div className="page-notice">{notice}</div>}

      <div className="management-card surface-card">
        <div className="management-toolbar">
          <div className="table-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o código..." /></div>
          <span>{plansQuery.data?.length || 0} planes registrados</span>
        </div>

        {plansQuery.isLoading ? <Spinner /> : plansQuery.isError ? (
          <ErrorMessage message={handleApiError(plansQuery.error)} onRetry={plansQuery.refetch} />
        ) : plans.length ? (
          <div className="admin-plan-grid">
            {plans.map((plan) => (
              <article key={plan.id} className={`admin-plan-card ${plan.featured ? 'admin-plan-card--featured' : ''}`}>
                <div className="admin-plan-card__top">
                  <div>
                    <span className="admin-plan-card__code">{plan.code}</span>
                    <h2>{plan.name}</h2>
                  </div>
                  <div className="admin-plan-card__badges">
                    {plan.featured && <Badge tone="warning"><Star size={12} /> Recomendado</Badge>}
                    <Badge tone={plan.active ? 'success' : 'neutral'}>{plan.active ? 'Visible' : 'Oculto'}</Badge>
                  </div>
                </div>

                <p className="admin-plan-card__price">{formatPrice(plan)}</p>
                <p className="admin-plan-card__description">{plan.description || 'Sin descripción.'}</p>

                <div className="admin-plan-card__limits">
                  <span><Clock3 size={15} /> {plan.duration_days} días</span>
                  <span><UsersRound size={15} /> {plan.student_limit.toLocaleString('es-BO')} estudiantes</span>
                </div>

                <ul>
                  {plan.modules.map((module) => <li key={module}><Check size={14} /> {module}</li>)}
                </ul>

                <footer>
                  <button type="button" onClick={() => toggleVisibility(plan)} title={plan.active ? 'Ocultar del landing' : 'Publicar en el landing'}>{plan.active ? <EyeOff size={17} /> : <Eye size={17} />}<span>{plan.active ? 'Ocultar' : 'Publicar'}</span></button>
                  <button type="button" onClick={() => openEdit(plan)}><Pencil size={17} /><span>Editar</span></button>
                  <button className="danger" type="button" onClick={() => setConfirmPlan(plan)}><Trash2 size={17} /><span>Eliminar</span></button>
                </footer>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="No encontramos planes" message={search ? 'Prueba con otro término de búsqueda.' : 'Crea el primer plan para publicarlo en el landing page.'} />
        )}
      </div>

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={formPlan ? 'Editar plan' : 'Crear nuevo plan'} description="Define el costo, la vigencia, los límites y los módulos disponibles." size="lg">
        <PlanForm plan={formPlan} onSubmit={savePlan} onCancel={() => setFormOpen(false)} loading={formLoading} serverError={formError} />
      </Modal>

      <Modal isOpen={Boolean(confirmPlan)} onClose={() => setConfirmPlan(null)} title="¿Eliminar este plan?" description="Esta acción no se puede deshacer." size="sm">
        <div className="confirm-dialog">
          <span className="danger"><Trash2 size={24} /></span>
          <p><strong>{confirmPlan?.name}</strong><small>{confirmPlan?.code}</small></p>
          <div><Button variant="secondary" onClick={() => setConfirmPlan(null)}>Cancelar</Button><Button variant="danger" loading={actions.remove.isPending} onClick={deletePlan}>Eliminar</Button></div>
        </div>
      </Modal>
    </section>
  )
}
