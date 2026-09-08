import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/Button/Button'
import { planSchema } from '../schemas/planSchema'

const MODULE_OPTIONS = [
  'Gestión de acceso',
  'Administración',
  'Gestión estudiantil',
  'Gestión pedagógica',
  'Finanzas',
  'Reportes académicos',
  'Reportes financieros',
  'OCR e inteligencia artificial',
]

function defaults(plan) {
  return {
    code: plan?.code || '',
    name: plan?.name || '',
    description: plan?.description || '',
    price: plan ? plan.amount_minor / 100 : 1,
    currency: plan?.currency || 'bob',
    duration_days: plan?.duration_days || 30,
    student_limit: plan?.student_limit || 500,
    modules: plan?.modules || ['Gestión de acceso'],
    featured: plan?.featured ?? false,
    active: plan?.active ?? true,
    order: plan?.order ?? 0,
  }
}

export function PlanForm({ plan, onSubmit, onCancel, loading, serverError }) {
  const editing = Boolean(plan)
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(planSchema),
    defaultValues: defaults(plan),
  })

  useEffect(() => reset(defaults(plan)), [plan, reset])
  const modules = useWatch({ control, name: 'modules' }) || []

  const toggleModule = (module) => {
    const next = modules.includes(module)
      ? modules.filter((item) => item !== module)
      : [...modules, module]
    setValue('modules', next, { shouldDirty: true, shouldValidate: true })
  }

  const submit = ({ price, ...values }) => onSubmit({
    ...values,
    amount_minor: Math.round(price * 100),
  })

  return (
    <form className="management-form plan-form" onSubmit={handleSubmit(submit)}>
      {serverError && <div className="form-alert form-alert--danger">{serverError}</div>}

      <div className="form-grid form-grid--two">
        <label className="plain-field">Nombre<span>*</span><input {...register('name')} placeholder="Ej. Plan Académico" />{errors.name && <small>{errors.name.message}</small>}</label>
        <label className="plain-field">Código<span>*</span><input {...register('code')} readOnly={editing} placeholder="plan-academico" />{errors.code && <small>{errors.code.message}</small>}</label>
        <label className="plain-field">Precio<span>*</span><input type="number" min="1" step="0.01" {...register('price')} />{errors.price && <small>{errors.price.message}</small>}</label>
        <label className="plain-field">Moneda<span>*</span><select {...register('currency')}><option value="bob">Bolivianos (BOB)</option><option value="usd">Dólares (USD)</option></select>{errors.currency && <small>{errors.currency.message}</small>}</label>
        <label className="plain-field">Duración en días<span>*</span><input type="number" min="1" {...register('duration_days')} />{errors.duration_days && <small>{errors.duration_days.message}</small>}</label>
        <label className="plain-field">Límite de estudiantes<span>*</span><input type="number" min="1" {...register('student_limit')} />{errors.student_limit && <small>{errors.student_limit.message}</small>}</label>
        <label className="plain-field">Orden de aparición<input type="number" min="0" {...register('order')} />{errors.order && <small>{errors.order.message}</small>}</label>
      </div>

      <label className="plain-field">Descripción<textarea rows="3" {...register('description')} placeholder="Resume para quién es el plan y qué ofrece." />{errors.description && <small>{errors.description.message}</small>}</label>

      <fieldset className="choice-fieldset">
        <legend>Módulos incluidos</legend>
        <p>Estos beneficios se mostrarán en la tarjeta pública del plan.</p>
        <div className="plan-module-grid">
          {MODULE_OPTIONS.map((module) => {
            const selected = modules.includes(module)
            return <button key={module} className={selected ? 'selected' : ''} type="button" onClick={() => toggleModule(module)}><i>{selected ? '✓' : ''}</i><span>{module}</span></button>
          })}
        </div>
        {errors.modules && <small className="plan-field-error">{errors.modules.message}</small>}
      </fieldset>

      <div className="plan-switches">
        <label className="status-switch"><input type="checkbox" {...register('active')} /><span /><div><strong>Plan visible</strong><small>Se mostrará públicamente en el landing page.</small></div></label>
        <label className="status-switch"><input type="checkbox" {...register('featured')} /><span /><div><strong>Plan recomendado</strong><small>Lo resalta frente a los demás planes.</small></div></label>
      </div>

      <div className="form-actions"><Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button><Button type="submit" loading={loading}>{editing ? 'Guardar cambios' : 'Crear plan'}</Button></div>
    </form>
  )
}
