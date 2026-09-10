from types import SimpleNamespace
from unittest.mock import patch

import pytest
from django.test import override_settings
from rest_framework.test import APIClient

from apps.billing.models import PagoPlanTemporal, Plan
from apps.billing.services.plans import serialize_plan
from apps.billing.services.stripe_checkout import create_checkout
from apps.users.domain.model import Usuario


@pytest.fixture
def superadmin(db):
    return Usuario.objects.create_superuser(
        correo="stripe-admin@example.com",
        password="AdminPass-123!",
        nombre="Stripe",
        apellido_paterno="Admin",
    )


@pytest.fixture
def superadmin_client(superadmin):
    client = APIClient()
    client.force_authenticate(superadmin)
    return client


@pytest.mark.django_db
def test_lista_planes_activos_es_publica(db):
    response = APIClient().get("/api/v1/billing/plans/")

    assert response.status_code == 200
    assert [plan["code"] for plan in response.data["data"]] == [
        "inicio",
        "academico",
        "integral",
    ]


@pytest.mark.django_db
def test_superadministrador_lista_todos_los_planes(superadmin_client):
    response = superadmin_client.get("/api/v1/billing/admin/plans/")

    assert response.status_code == 200
    assert len(response.data["data"]) == 3


@pytest.mark.django_db
def test_superadministrador_crea_edita_y_elimina_plan(superadmin_client):
    create_response = superadmin_client.post(
        "/api/v1/billing/admin/plans/",
        {
            "code": "prueba-semestral",
            "name": "Prueba semestral",
            "description": "Plan creado desde el CRUD.",
            "amount_minor": 120_000,
            "currency": "bob",
            "duration_days": 180,
            "student_limit": 750,
            "featured": False,
            "modules": ["Administración", "Pedagógica"],
            "active": True,
            "order": 4,
        },
        format="json",
    )

    assert create_response.status_code == 201
    plan_id = create_response.data["data"]["id"]

    update_response = superadmin_client.patch(
        f"/api/v1/billing/admin/plans/{plan_id}/",
        {"name": "Semestral", "active": False},
        format="json",
    )
    assert update_response.status_code == 200
    assert update_response.data["data"]["name"] == "Semestral"
    assert update_response.data["data"]["active"] is False

    public_response = APIClient().get("/api/v1/billing/plans/")
    assert "prueba-semestral" not in {
        plan["code"] for plan in public_response.data["data"]
    }

    delete_response = superadmin_client.delete(
        f"/api/v1/billing/admin/plans/{plan_id}/"
    )
    assert delete_response.status_code == 200
    assert not Plan.objects.filter(pk=plan_id).exists()


@pytest.mark.django_db
def test_usuario_comun_no_accede_al_crud_de_planes(db):
    user = Usuario.objects.create_user(
        correo="user@example.com",
        password="UserPass-123!",
        nombre="Usuario",
        apellido_paterno="Prueba",
    )
    client = APIClient()
    client.force_authenticate(user)

    response = client.get("/api/v1/billing/admin/plans/")

    assert response.status_code == 403


@pytest.mark.django_db
def test_checkout_requiere_superadministrador(db):
    user = Usuario.objects.create_user(
        correo="buyer@example.com",
        password="UserPass-123!",
        nombre="Comprador",
        apellido_paterno="Prueba",
    )
    client = APIClient()
    client.force_authenticate(user)

    response = client.post(
        "/api/v1/billing/checkout-sessions/",
        {"plan_code": "inicio"},
        format="json",
    )

    assert response.status_code == 403


@pytest.mark.django_db
@override_settings(STRIPE_SECRET_KEY="")
def test_checkout_informa_si_falta_clave_secreta(superadmin_client):
    response = superadmin_client.post(
        "/api/v1/billing/checkout-sessions/",
        {"plan_code": "inicio"},
        format="json",
    )

    assert response.status_code == 503
    assert "STRIPE_SECRET_KEY" in response.data["message"]


@pytest.mark.django_db
@override_settings(
    STRIPE_SECRET_KEY="sk_test_fake",
    STRIPE_RETURN_URL="http://localhost:5173/app/superadministracion/planes",
)
def test_checkout_usa_precio_del_servidor(superadmin):
    stripe_session = SimpleNamespace(
        id="cs_test_servidor",
        client_secret="cs_test_servidor_secret_demo",
    )

    with patch(
        "apps.billing.services.stripe_checkout.stripe.checkout.Session.create",
        return_value=stripe_session,
    ) as stripe_create:
        checkout = create_checkout(
            serialize_plan(Plan.objects.get(codigo="inicio")),
            superadmin,
        )

    assert checkout.session_id == "cs_test_servidor"
    assert stripe_create.call_args.kwargs["line_items"][0]["price_data"]["unit_amount"] == 30_000
    payment = PagoPlanTemporal.objects.get(stripe_session_id="cs_test_servidor")
    assert payment.monto_centavos == 30_000
    assert payment.moneda == "bob"


@pytest.mark.django_db
@override_settings(STRIPE_SECRET_KEY="sk_test_fake")
def test_checkout_rechaza_plan_inexistente(superadmin_client):
    response = superadmin_client.post(
        "/api/v1/billing/checkout-sessions/",
        {"plan_code": "inventado"},
        format="json",
    )

    assert response.status_code == 400
    assert response.data["message"] == "El plan seleccionado no existe."
