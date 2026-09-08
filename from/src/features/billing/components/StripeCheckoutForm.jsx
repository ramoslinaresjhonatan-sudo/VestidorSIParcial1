import { useState } from 'react'
import { PaymentElement, useCheckoutElements } from '@stripe/react-stripe-js/checkout'
import { LockKeyhole, X } from 'lucide-react'
import { Button } from '@/components/ui/Button/Button'

export function StripeCheckoutForm({ plan, sessionId, onCancel, onCompleted }) {
  const checkoutState = useCheckoutElements()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (checkoutState.type === 'loading') {
    return <p className="stripe-checkout-state">Cargando el formulario seguro de Stripe…</p>
  }

  if (checkoutState.type === 'error') {
    return <p className="stripe-checkout-error">{checkoutState.error.message}</p>
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    const result = await checkoutState.checkout.confirm()
    if (result.type === 'error') {
      setError(result.error.message || 'Stripe no pudo confirmar el pago.')
      setSubmitting(false)
      return
    }

    onCompleted(sessionId)
  }

  return (
    <form className="stripe-checkout-form" onSubmit={handleSubmit}>
      <div className="stripe-checkout-form__heading">
        <div>
          <span>Pago protegido por Stripe</span>
          <h2>Plan {plan.name}</h2>
        </div>
        <button type="button" onClick={onCancel} aria-label="Cerrar pago"><X size={19} /></button>
      </div>

      <PaymentElement />

      {error && <p className="stripe-checkout-error" role="alert">{error}</p>}

      <div className="stripe-checkout-form__actions">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" icon={LockKeyhole} loading={submitting}>Confirmar pago</Button>
      </div>
      <small>Los datos de la tarjeta son procesados directamente por Stripe.</small>
    </form>
  )
}
