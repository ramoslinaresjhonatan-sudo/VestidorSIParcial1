from collections.abc import Mapping
from typing import Any

from apps.users.application.services import UserService
from apps.users.domain.entidad import RolEntidad
from apps.users.domain.port import RolRepository


class UpdateRoleUseCase:
    def __init__(self, repository: RolRepository) -> None:
        self.repository = repository

    def execute(self, rol_id: int, data: Mapping[str, Any]) -> RolEntidad:
        payload = dict(data)
        if "nombre" in payload:
            payload["nombre"] = UserService.normalize_text(payload["nombre"])
        return self.repository.update(rol_id, payload)
