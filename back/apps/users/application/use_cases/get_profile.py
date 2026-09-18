from apps.users.domain.entidad import UsuarioEntidad
from apps.users.infrastructure.database.Repositori.usuario_repository import DjangoUsuarioRepository
from apps.users.domain.entidad.excepciones import UsuarioNoEncontradoError

class GetProfileUseCase:
    def __init__(self, repository: DjangoUsuarioRepository) -> None:
        self.repository = repository

    def execute(self, usuario_id: int) -> UsuarioEntidad:
        return self.repository.get(usuario_id)
