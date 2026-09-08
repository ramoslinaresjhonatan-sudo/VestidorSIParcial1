from django.contrib.auth.models import Group, Permission

from apps.users.domain.entidad import PermisoEntidad, RolEntidad, UsuarioEntidad
from apps.users.domain.model import Usuario


def permiso_to_entity(permiso: Permission) -> PermisoEntidad:
    return PermisoEntidad(
        id=permiso.pk,
        nombre=permiso.name,
        codigo=f"{permiso.content_type.app_label}.{permiso.codename}",
        modulo=permiso.content_type.app_label,
    )


def rol_to_entity(rol: Group) -> RolEntidad:
    return RolEntidad(
        id=rol.pk,
        nombre=rol.name,
        permisos=tuple(permiso_to_entity(item) for item in rol.permissions.all()),
    )


def usuario_to_entity(usuario: Usuario) -> UsuarioEntidad:
    return UsuarioEntidad(
        id=usuario.pk,
        nombre=usuario.nombre,
        apellido_paterno=usuario.apellido_paterno,
        apellido_materno=usuario.apellido_materno,
        correo=usuario.correo,
        activo=usuario.is_active,
        es_superadministrador=usuario.is_superuser,
        roles=tuple(rol_to_entity(rol) for rol in usuario.groups.all()),
    )
