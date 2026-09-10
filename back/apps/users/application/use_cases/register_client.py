from collections.abc import Mapping
from typing import Any

from apps.users.application.services import UserService
from apps.users.domain.entidad import UsuarioEntidad
from apps.users.domain.port import UsuarioRepository


class RegisterClientUseCase:

    def __init__(self, repository: UsuarioRepository) -> None:
        self.repository = repository

    def execute(self, data: Mapping[str, Any]) -> UsuarioEntidad:

        payload = dict(data)

        payload["correo"] = UserService.normalize_email(
            payload["correo"]
        )

        for field in (
            "nombre",
            "apellido_paterno",
            "apellido_materno",
        ):
            if field in payload:
                payload[field] = UserService.normalize_text(
                    payload[field]
                )

        # El cliente se registra sin roles administrativos
        payload["roles_ids"] = []

        # El cliente queda activo automáticamente
        payload["activo"] = True

        return self.repository.create(payload)