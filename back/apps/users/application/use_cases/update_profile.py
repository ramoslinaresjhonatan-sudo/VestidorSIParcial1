from collections.abc import Mapping
from typing import Any

from apps.users.application.services import UserService
from apps.users.domain.entidad import UsuarioEntidad
from apps.users.domain.port import UsuarioRepository


class UpdateProfileUseCase:
    """CU-03: Cliente actualiza su propio perfil."""

    def __init__(self, repository: UsuarioRepository) -> None:
        self.repository = repository

    def execute(self, usuario_id: int, data: Mapping[str, Any]) -> UsuarioEntidad:
        payload = dict(data)
        if "correo" in payload and payload["correo"]:
            payload["correo"] = UserService.normalize_email(str(payload["correo"]))
        for field in ("nombre", "apellido_paterno", "apellido_materno", "telefono", "direccion", "direccion_envio"):
            if field in payload and isinstance(payload[field], str):
                payload[field] = UserService.normalize_text(payload[field]) if payload[field].strip() else ""
        # medidas pueden venir como string -> convertir a Decimal o None
        for field in ("medida_pecho", "medida_cintura", "medida_cadera", "altura", "peso"):
            if field in payload:
                val = payload[field]
                if val == "" or val is None:
                    payload[field] = None
                else:
                    try:
                        payload[field] = float(val)
                    except (TypeError, ValueError):
                        payload[field] = None
        return self.repository.update(usuario_id, payload)
