from collections.abc import Sequence

from django.contrib.auth.models import Permission

from apps.users.domain.entidad import PermisoEntidad
from apps.users.domain.port import PermisoRepository

from .mappers import permiso_to_entity


class DjangoPermisoRepository(PermisoRepository):
    def list(self) -> Sequence[PermisoEntidad]:
        permisos = Permission.objects.select_related("content_type").order_by(
            "content_type__app_label",
            "name",
        )
        return [permiso_to_entity(permiso) for permiso in permisos]
