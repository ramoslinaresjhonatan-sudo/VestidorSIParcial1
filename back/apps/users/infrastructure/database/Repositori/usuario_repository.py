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
        return Usuario.objects.select_related("sucursal").prefetch_related(
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

        # CU-03: cambio de email con verificación
        if "correo" in data:
            nuevo_correo = str(data["correo"])
            if nuevo_correo.lower() != usuario.correo.lower():
                duplicated = Usuario.objects.filter(correo__iexact=nuevo_correo).exclude(pk=usuario_id)
                if duplicated.exists():
                    raise CorreoDuplicadoError("Ya existe un usuario con este correo.")
                # Flujo alterno: requiere verificación nuevamente
                usuario.correo_pendiente_verificacion = nuevo_correo
                usuario.correo_verificado = False
                # No se cambia correo directamente hasta verificar, pero por ahora actualizamos y marcamos no verificado
                # Para demo: se actualiza correo y se marca pendiente
                usuario.correo = nuevo_correo
            else:
                usuario.correo = nuevo_correo

        for field in ("nombre", "apellido_paterno", "apellido_materno"):
            if field in data:
                setattr(usuario, field, str(data[field]))
        # CU-03 campos perfil
        for field in ("telefono", "direccion", "direccion_envio", "metodo_pago_preferido"):
            if field in data:
                setattr(usuario, field, str(data[field]))
        for field in ("medida_pecho", "medida_cintura", "medida_cadera", "altura", "peso"):
            if field in data:
                val = data[field]
                setattr(usuario, field, val if val is not None and val != "" else None)
        # Actualiza sugerencia de talla automática si hay medidas
        if any(k in data for k in ("medida_pecho", "medida_cintura", "medida_cadera")):
            # calcular nueva talla
            from apps.users.application.services import UserService

            pecho = data.get("medida_pecho", usuario.medida_pecho)
            cintura = data.get("medida_cintura", usuario.medida_cintura)
            talla = UserService.suggest_size(pecho, cintura)
            if talla:
                usuario.talla_sugerida = talla

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

    def get_by_correo(self, correo: str) -> UsuarioEntidad | None:
        usuario = self._queryset().filter(correo__iexact=correo).first()
        if usuario is None:
            return None
        return usuario_to_entity(usuario)

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
