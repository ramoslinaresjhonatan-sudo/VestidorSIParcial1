from apps.users.domain.port import UsuarioRepository


class DeleteUserUseCase:
    def __init__(self, repository: UsuarioRepository) -> None:
        self.repository = repository

    def execute(self, usuario_id: int) -> None:
        self.repository.delete(usuario_id)
