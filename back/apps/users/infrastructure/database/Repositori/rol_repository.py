from collections.abc import Iterable, Mapping, Sequence
from typing import Any

from django.contrib.auth.models import Group, Permission
from django.db import IntegrityError, transaction

from apps.users.domain.entidad import RolEntidad
from apps.users.domain.entidad.excepciones import (
    PermisoNoEncontradoError,
    RolDuplicadoError,
    RolNoEncontradoError,
)
from apps.users.domain.port import RolRepository

from .mappers import rol_to_entity


class DjangoRolRepository(RolRepository):
    @staticmethod
    def _queryset():
        return Group.objects.prefetch_related("permissions__content_type").order_by("name")

    @staticmethod
    def _permissions(permission_ids: Iterable[int]) -> list[Permission]:
        ids = set(permission_ids)
        permisos = list(
            Permission.objects.select_related("content_type").filter(pk__in=ids)
        )
        found = {permiso.pk for permiso in permisos}
        missing = sorted(ids - found)
        if missing:
            raise PermisoNoEncontradoError(
                f"No existen los permisos con id: {', '.join(map(str, missing))}."
            )
        return permisos

    def list(self) -> Sequence[RolEntidad]:
        return [rol_to_entity(rol) for rol in self._queryset()]

    def get(self, rol_id: int) -> RolEntidad:
        rol = self._queryset().filter(pk=rol_id).first()
        if rol is None:
            raise RolNoEncontradoError("Rol no encontrado.")
        return rol_to_entity(rol)

    @transaction.atomic
    def create(self, data: Mapping[str, Any]) -> RolEntidad:
        nombre = str(data["nombre"])
        if Group.objects.filter(name__iexact=nombre).exists():
            raise RolDuplicadoError("Ya existe un rol con este nombre.")

        permisos = self._permissions(data.get("permisos_ids", []))
        try:
            rol = Group.objects.create(name=nombre)
            rol.permissions.set(permisos)
        except IntegrityError as exc:
            raise RolDuplicadoError("Ya existe un rol con este nombre.") from exc
        return self.get(rol.pk)

    @transaction.atomic
    def update(self, rol_id: int, data: Mapping[str, Any]) -> RolEntidad:
        rol = Group.objects.filter(pk=rol_id).first()
        if rol is None:
            raise RolNoEncontradoError("Rol no encontrado.")

        if "nombre" in data:
            nombre = str(data["nombre"])
            if Group.objects.filter(name__iexact=nombre).exclude(pk=rol_id).exists():
                raise RolDuplicadoError("Ya existe un rol con este nombre.")
            rol.name = nombre

        try:
            rol.save()
        except IntegrityError as exc:
            raise RolDuplicadoError("Ya existe un rol con este nombre.") from exc

        if "permisos_ids" in data:
            rol.permissions.set(self._permissions(data["permisos_ids"]))
        return self.get(rol.pk)
