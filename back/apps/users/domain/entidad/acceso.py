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
    # CU-03 Perfil
    telefono: str = ""
    direccion: str = ""
    direccion_envio: str = ""
    metodo_pago_preferido: str = ""
    medida_pecho: float | None = None
    medida_cintura: float | None = None
    medida_cadera: float | None = None
    altura: float | None = None
    peso: float | None = None
    talla_sugerida: str = ""
    correo_verificado: bool = True
    correo_pendiente_verificacion: str = ""
    # CU-16 sucursal
    sucursal: dict | None = None
