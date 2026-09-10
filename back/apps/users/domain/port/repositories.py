from abc import ABC, abstractmethod
from collections.abc import Mapping, Sequence
from typing import Any

from apps.users.domain.entidad import PermisoEntidad, RolEntidad, UsuarioEntidad


class UsuarioRepository(ABC):
    @abstractmethod
    def list(self) -> Sequence[UsuarioEntidad]: ...

    @abstractmethod
    def get(self, usuario_id: int) -> UsuarioEntidad: ...

    @abstractmethod
    def create(self, data: Mapping[str, Any]) -> UsuarioEntidad: ...

    @abstractmethod
    def update(self, usuario_id: int, data: Mapping[str, Any]) -> UsuarioEntidad: ...

    @abstractmethod
    def annul(self, usuario_id: int) -> UsuarioEntidad: ...

    @abstractmethod
    def delete(self, usuario_id: int) -> None: ...


class RolRepository(ABC):
    @abstractmethod
    def list(self) -> Sequence[RolEntidad]: ...

    @abstractmethod
    def get(self, rol_id: int) -> RolEntidad: ...

    @abstractmethod
    def create(self, data: Mapping[str, Any]) -> RolEntidad: ...

    @abstractmethod
    def update(self, rol_id: int, data: Mapping[str, Any]) -> RolEntidad: ...


class PermisoRepository(ABC):
    @abstractmethod
    def list(self) -> Sequence[PermisoEntidad]: ...
