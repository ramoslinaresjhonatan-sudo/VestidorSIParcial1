from dataclasses import dataclass
from datetime import timedelta

import stripe
from django.conf import settings
from django.utils import timezone

from apps.billing.models import PagoPlanTemporal
from apps.billing.services.plans import get_plan


class StripeConfigurationError(Exception):
    pass


class StripeGatewayError(Exception):
    pass


@dataclass(frozen=True)
class CheckoutResult:
    session_id: str
    client_secret: str


def _configure_stripe():
    if not settings.STRIPE_SECRET_KEY:
        raise StripeConfigurationError(
            "Falta STRIPE_SECRET_KEY en el .env del backend. Use una clave sk_test_ para probar."
        )
    stripe.api_key = settings.STRIPE_SECRET_KEY


def _stripe_value(value):
    return getattr(value, "id", value) if value else ""


def _mark_from_session(payment, session):
    payment_status = getattr(session, "payment_status", "")
    session_status = getattr(session, "status", "")

    if payment_status in {"paid", "no_payment_required"}:
        plan = get_plan(payment.codigo_plan)
        if plan and payment.estado != PagoPlanTemporal.Estado.COMPLETADO:
            start = timezone.now()
            payment.estado = PagoPlanTemporal.Estado.COMPLETADO
            payment.fecha_inicio = start
            payment.fecha_fin = start + timedelta(days=plan["duration_days"])
        payment.stripe_payment_intent_id = _stripe_value(
            getattr(session, "payment_intent", "")
        )
    elif session_status == "expired":
        payment.estado = PagoPlanTemporal.Estado.EXPIRADO

    payment.save(
        update_fields=(
            "estado",
            "fecha_inicio",
            "fecha_fin",
            "stripe_payment_intent_id",
            "actualizado_en",
        )
    )
    return payment


def create_checkout(plan, user):
    _configure_stripe()
    metadata = {"plan_code": plan["code"], "user_id": str(user.pk)}

    try:
        session = stripe.checkout.Session.create(
            ui_mode="custom",
            mode="payment",
            return_url=(
                f"{settings.STRIPE_RETURN_URL}"
                "?checkout=return&session_id={CHECKOUT_SESSION_ID}"
            ),
            customer_email=user.correo,
            client_reference_id=str(user.pk),
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": plan["currency"],
                        "unit_amount": plan["amount_minor"],
                        "product_data": {
                            "name": f"Plan {plan['name']}",
                            "description": (
                                f"Acceso por {plan['duration_days']} días, "
                                f"hasta {plan['student_limit']} estudiantes."
                            ),
                            "metadata": {"plan_code": plan["code"]},
                        },
                    },
                    "quantity": 1,
                }
            ],
            metadata=metadata,
            payment_intent_data={"metadata": metadata},
        )
    except stripe.StripeError as exc:
        raise StripeGatewayError("Stripe no pudo crear la sesión de pago.") from exc

    PagoPlanTemporal.objects.create(
        usuario=user,
        codigo_plan=plan["code"],
        stripe_session_id=session.id,
        monto_centavos=plan["amount_minor"],
        moneda=plan["currency"],
    )
    return CheckoutResult(session_id=session.id, client_secret=session.client_secret)


def retrieve_checkout(session_id, user):
    _configure_stripe()
    try:
        payment = PagoPlanTemporal.objects.get(
            stripe_session_id=session_id,
            usuario=user,
        )
        session = stripe.checkout.Session.retrieve(session_id)
    except PagoPlanTemporal.DoesNotExist as exc:
        raise StripeGatewayError("La sesión de pago no pertenece al usuario actual.") from exc
    except stripe.StripeError as exc:
        raise StripeGatewayError("No se pudo consultar la sesión en Stripe.") from exc

    return _mark_from_session(payment, session)


def process_webhook(payload, signature):
    if not settings.STRIPE_WEBHOOK_SECRET:
        raise StripeConfigurationError(
            "Falta STRIPE_WEBHOOK_SECRET en el .env del backend."
        )

    try:
        event = stripe.Webhook.construct_event(
            payload,
            signature,
            settings.STRIPE_WEBHOOK_SECRET,
        )
    except (ValueError, stripe.SignatureVerificationError) as exc:
        raise StripeGatewayError("La firma del webhook de Stripe no es válida.") from exc

    if event.type not in {"checkout.session.completed", "checkout.session.expired"}:
        return None

    session = event.data.object
    try:
        payment = PagoPlanTemporal.objects.get(stripe_session_id=session.id)
    except PagoPlanTemporal.DoesNotExist:
        return None
    return _mark_from_session(payment, session)
