import pytest
from django.contrib.auth.models import Permission
from rest_framework.test import APIClient

from apps.users.domain.model import Usuario


@pytest.fixture
def admin_client(db):
    admin = Usuario.objects.create_superuser(
        correo="admin@example.com",
        password="AdminPass-123!",
        nombre="Admin",
        apellido_paterno="Sistema",
    )
    client = APIClient()
    client.force_authenticate(admin)
    return client


@pytest.mark.django_db
def test_login_informa_cuando_las_credenciales_son_incorrectas():
    Usuario.objects.create_superuser(
        correo="login@example.com",
        password="AdminPass-123!",
        nombre="Admin",
        apellido_paterno="Sistema",
    )

    response = APIClient().post(
        "/api/v1/auth/token/",
        {"correo": "login@example.com", "password": "incorrecta"},
        format="json",
    )

    assert response.status_code == 401
    assert response.data["message"] == "Correo o contraseña incorrectos."


@pytest.mark.django_db
def test_usuario_solo_puede_eliminarse_despues_de_anularse(admin_client):
    create_response = admin_client.post(
        "/api/v1/users/",
        {
            "nombre": "Ana",
            "apellido_paterno": "Pérez",
            "apellido_materno": "López",
            "correo": "ana@example.com",
            "password": "UserPass-123!",
            "roles_ids": [],
        },
        format="json",
    )
    assert create_response.status_code == 201
    usuario_id = create_response.data["data"]["id"]

    active_delete = admin_client.delete(f"/api/v1/users/{usuario_id}/")
    assert active_delete.status_code == 409

    annul_response = admin_client.post(f"/api/v1/users/{usuario_id}/anular/")
    assert annul_response.status_code == 200
    assert annul_response.data["data"]["activo"] is False

    delete_response = admin_client.delete(f"/api/v1/users/{usuario_id}/")
    assert delete_response.status_code == 200
    assert not Usuario.objects.filter(pk=usuario_id).exists()


@pytest.mark.django_db
def test_usuario_informa_si_es_superadministrador(admin_client):
    admin = Usuario.objects.get(correo="admin@example.com")

    response = admin_client.get(f"/api/v1/users/{admin.pk}/")

    assert response.status_code == 200
    assert response.data["data"]["es_superadministrador"] is True


@pytest.mark.django_db
def test_crea_y_edita_rol_con_permisos_existentes(admin_client):
    permisos = list(Permission.objects.order_by("id")[:2])
    create_response = admin_client.post(
        "/api/v1/roles/",
        {"nombre": "Secretaría", "permisos_ids": [item.pk for item in permisos]},
        format="json",
    )
    assert create_response.status_code == 201
    rol_id = create_response.data["data"]["id"]
    assert {item["id"] for item in create_response.data["data"]["permisos"]} == {
        item.pk for item in permisos
    }

    update_response = admin_client.patch(
        f"/api/v1/roles/{rol_id}/",
        {"nombre": "Administración", "permisos_ids": [permisos[0].pk]},
        format="json",
    )
    assert update_response.status_code == 200
    assert update_response.data["data"]["nombre"] == "Administración"
    assert [item["id"] for item in update_response.data["data"]["permisos"]] == [
        permisos[0].pk
    ]


@pytest.mark.django_db
def test_permisos_son_solo_lectura(admin_client):
    list_response = admin_client.get("/api/v1/permissions/")
    create_response = admin_client.post(
        "/api/v1/permissions/",
        {"nombre": "No permitido"},
        format="json",
    )

    assert list_response.status_code == 200
    assert create_response.status_code == 405


@pytest.mark.django_db
def test_access_options_entrega_datos_para_formularios(admin_client):
    response = admin_client.get("/api/v1/access-options/")

    assert response.status_code == 200
    assert "roles" in response.data["data"]
    assert "permisos" in response.data["data"]
