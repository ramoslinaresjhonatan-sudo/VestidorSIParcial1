from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response
from rest_framework.views import exception_handler

from apps.users.domain.entidad.excepciones import (
    CorreoDuplicadoError,
    PermisoNoEncontradoError,
    RolDuplicadoError,
    RolNoEncontradoError,
    UsuarioActivoNoEliminableError,
    UsuarioNoEncontradoError,
)


def _error(message, status_code, errors=None):
    return Response(
        {"success": False, "message": message, "errors": errors},
        status=status_code,
    )


def custom_exception_handler(exc, context):
    if isinstance(exc, AuthenticationFailed):
        view_name = context.get("view", object()).__class__.__name__
        if view_name == "TokenObtainPairView":
            return _error(
                "Correo o contraseña incorrectos.",
                status.HTTP_401_UNAUTHORIZED,
            )
        return _error("La sesión no es válida.", status.HTTP_401_UNAUTHORIZED)

    if isinstance(exc, (UsuarioNoEncontradoError, RolNoEncontradoError)):
        return _error(str(exc), status.HTTP_404_NOT_FOUND)
    if isinstance(exc, PermisoNoEncontradoError):
        return _error(str(exc), status.HTTP_400_BAD_REQUEST)
    if isinstance(exc, (CorreoDuplicadoError, RolDuplicadoError)):
        return _error(str(exc), status.HTTP_409_CONFLICT)
    if isinstance(exc, UsuarioActivoNoEliminableError):
        return _error(str(exc), status.HTTP_409_CONFLICT)

    response = exception_handler(exc, context)
    if response is None:
        return None
    response.data = {
        "success": False,
        "message": "La solicitud no pudo procesarse.",
        "errors": response.data,
    }
    return response
