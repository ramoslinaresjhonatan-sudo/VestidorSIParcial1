import pytest
from django.contrib.auth.models import Group, Permission

from apps.users.domain.model import Usuario
from apps.users.infrastructure.database.seed.seed import seed_superadmin


@pytest.mark.django_db
def test_seed_crea_un_solo_superadmin_con_rol_y_todos_los_permisos():
    first_result = seed_superadmin()
    second_result = seed_superadmin()

    user = Usuario.objects.get(correo="superadmin@edugestion.edu")
    role = Group.objects.get(name="Super Administrador")

    assert first_result["usuario_creado"] is True
    assert second_result["usuario_creado"] is False
    assert Usuario.objects.filter(correo="superadmin@edugestion.edu").count() == 1
    assert Group.objects.filter(name="Super Administrador").count() == 1
    assert user.is_superuser is True
    assert user.is_staff is True
    assert user.is_active is True
    assert user.check_password("SuperAdmin123!")
    assert user.groups.filter(pk=role.pk).exists()
    assert role.permissions.count() == Permission.objects.count()
