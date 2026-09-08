from dataclasses import dataclass, field


@dataclass(frozen=True, slots=True)
class PermisoEntidad:
    id: int
    nombre: str
    codigo: str
    modulo: str


@dataclass(frozen=True, slots=True)
class RolEntidad:
    id: int
    nombre: str
    permisos: tuple[PermisoEntidad, ...] = field(default_factory=tuple)


@dataclass(frozen=True, slots=True)
class UsuarioEntidad:
    id: int
    nombre: str
    apellido_paterno: str
    apellido_materno: str
    correo: str
    activo: bool
    es_superadministrador: bool
    roles: tuple[RolEntidad, ...] = field(default_factory=tuple)
