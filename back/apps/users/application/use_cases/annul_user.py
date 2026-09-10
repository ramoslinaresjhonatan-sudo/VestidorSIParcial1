from apps.users.domain.entidad import UsuarioEntidad
from apps.users.domain.port import UsuarioRepository


class AnnulUserUseCase:
    def __init__(self, repository: UsuarioRepository) -> None:
        self.repository = repository

    def execute(self, usuario_id: int) -> UsuarioEntidad:
        return self.repository.annul(usuario_id)
