from collections.abc import Mapping
from typing import Any

from apps.users.application.services import UserService
from apps.users.domain.entidad import UsuarioEntidad
from apps.users.domain.port import UsuarioRepository


class UpdateUserUseCase:
    def __init__(self, repository: UsuarioRepository) -> None:
        self.repository = repository

    def execute(self, usuario_id: int, data: Mapping[str, Any]) -> UsuarioEntidad:
        payload = dict(data)
        if "correo" in payload:
            payload["correo"] = UserService.normalize_email(payload["correo"])
        for field in ("nombre", "apellido_paterno", "apellido_materno"):
            if field in payload:
                payload[field] = UserService.normalize_text(payload[field])
        return self.repository.update(usuario_id, payload)
