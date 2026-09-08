from collections.abc import Iterable, Mapping, Sequence
from typing import Any

from django.contrib.auth.models import Group
from django.db import IntegrityError, transaction

from apps.users.domain.entidad import UsuarioEntidad
from apps.users.domain.entidad.excepciones import (
    CorreoDuplicadoError,
    RolNoEncontradoError,
    UsuarioActivoNoEliminableError,
    UsuarioNoEncontradoError,
)
from apps.users.domain.model import Usuario
from apps.users.domain.port import UsuarioRepository

from .mappers import usuario_to_entity


class DjangoUsuarioRepository(UsuarioRepository):
    @staticmethod
    def _queryset():
        return Usuario.objects.prefetch_related(
            "groups__permissions__content_type"
        ).order_by("nombre", "apellido_paterno", "apellido_materno")

    @staticmethod
    def _roles(role_ids: Iterable[int]) -> list[Group]:
        ids = set(role_ids)
        roles = list(Group.objects.filter(pk__in=ids))
        found = {rol.pk for rol in roles}
        missing = sorted(ids - found)
        if missing:
            raise RolNoEncontradoError(
                f"No existen los roles con id: {', '.join(map(str, missing))}."
            )
        return roles

    def _model(self, usuario_id: int) -> Usuario:
        usuario = Usuario.objects.filter(pk=usuario_id).first()
        if usuario is None:
            raise UsuarioNoEncontradoError("Usuario no encontrado.")
        return usuario

    def list(self) -> Sequence[UsuarioEntidad]:
        return [usuario_to_entity(usuario) for usuario in self._queryset()]

    def get(self, usuario_id: int) -> UsuarioEntidad:
        usuario = self._queryset().filter(pk=usuario_id).first()
        if usuario is None:
            raise UsuarioNoEncontradoError("Usuario no encontrado.")
        return usuario_to_entity(usuario)

    @transaction.atomic
    def create(self, data: Mapping[str, Any]) -> UsuarioEntidad:
        correo = str(data["correo"])
        if Usuario.objects.filter(correo__iexact=correo).exists():
            raise CorreoDuplicadoError("Ya existe un usuario con este correo.")

        roles = self._roles(data.get("roles_ids", []))
        try:
            usuario = Usuario.objects.create_user(
                correo=correo,
                password=str(data["password"]),
                nombre=str(data["nombre"]),
                apellido_paterno=str(data["apellido_paterno"]),
                apellido_materno=str(data.get("apellido_materno", "")),
                is_active=bool(data.get("activo", True)),
            )
            usuario.groups.set(roles)
        except IntegrityError as exc:
            raise CorreoDuplicadoError("Ya existe un usuario con este correo.") from exc
        return self.get(usuario.pk)

    @transaction.atomic
    def update(self, usuario_id: int, data: Mapping[str, Any]) -> UsuarioEntidad:
        usuario = self._model(usuario_id)

        if "correo" in data:
            correo = str(data["correo"])
            duplicated = Usuario.objects.filter(correo__iexact=correo).exclude(pk=usuario_id)
            if duplicated.exists():
                raise CorreoDuplicadoError("Ya existe un usuario con este correo.")
            usuario.correo = correo

        for field in ("nombre", "apellido_paterno", "apellido_materno"):
            if field in data:
                setattr(usuario, field, str(data[field]))
        if "activo" in data:
            usuario.is_active = bool(data["activo"])
        if "password" in data:
            usuario.set_password(str(data["password"]))

        try:
            usuario.save()
        except IntegrityError as exc:
            raise CorreoDuplicadoError("Ya existe un usuario con este correo.") from exc

        if "roles_ids" in data:
            usuario.groups.set(self._roles(data["roles_ids"]))
        return self.get(usuario.pk)

    @transaction.atomic
    def annul(self, usuario_id: int) -> UsuarioEntidad:
        usuario = self._model(usuario_id)
        if usuario.is_active:
            usuario.is_active = False
            usuario.save(update_fields=["is_active"])
        return self.get(usuario.pk)

    @transaction.atomic
    def delete(self, usuario_id: int) -> None:
        usuario = self._model(usuario_id)
        if usuario.is_active:
            raise UsuarioActivoNoEliminableError(
                "El usuario debe estar anulado antes de eliminarse."
            )
        usuario.delete()
