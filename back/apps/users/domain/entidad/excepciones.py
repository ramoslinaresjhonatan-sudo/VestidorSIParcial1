class AccesoError(Exception):
    """Error de negocio base del módulo de acceso."""


class UsuarioNoEncontradoError(AccesoError):
    pass


class CorreoDuplicadoError(AccesoError):
    pass


class UsuarioActivoNoEliminableError(AccesoError):
    pass


class RolNoEncontradoError(AccesoError):
    pass


class RolDuplicadoError(AccesoError):
    pass


class PermisoNoEncontradoError(AccesoError):
    pass
