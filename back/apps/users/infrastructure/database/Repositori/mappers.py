from django.contrib.auth.models import Group, Permission

from apps.users.domain.entidad import PermisoEntidad, RolEntidad, UsuarioEntidad
from apps.users.domain.model import Usuario


_PERMISO_TRADUCCION = {
    "Can add": "Puede crear",
    "Can change": "Puede editar",
    "Can delete": "Puede eliminar",
    "Can view": "Puede ver",
}

_MODULO_TRADUCCION = {
    "users": "Usuarios",
    "auth": "Roles y permisos",
    "admin": "Administración",
    "contenttypes": "Tipos de contenido",
    "sessions": "Sesiones",
    "catalog": "Catálogo",
    "cart": "Carrito",
    "billing": "Facturación",
}

_MODELO_TRADUCCION = {
    "usuario": "usuario",
    "group": "rol",
    "permission": "permiso",
    "producto": "producto",
    "categoria": "categoría",
    "productocategoria": "producto-categoría",
    "productoimagen": "imagen de producto",
    "sucursal": "sucursal",
    "stocksucursal": "stock por sucursal",
    "opinion": "opinión",
    "notificacionstock": "notificación de stock",
    "traslado": "traslado",
    "merma": "merma",
    "log entry": "registro de auditoría",
    "plan": "plan",
    "content type": "tipo de contenido",
    "session": "sesión",
}


def _traducir_permiso(nombre: str) -> str:
    for eng, esp in _PERMISO_TRADUCCION.items():
        if nombre.startswith(eng):
            resto = nombre[len(eng):].strip()
            modelo = _MODELO_TRADUCCION.get(resto.lower(), resto.lower())
            return f"{esp} {modelo}"
    return nombre


def permiso_to_entity(permiso: Permission) -> PermisoEntidad:
    return PermisoEntidad(
        id=permiso.pk,
        nombre=_traducir_permiso(permiso.name),
        codigo=f"{permiso.content_type.app_label}.{permiso.codename}",
        modulo=_MODULO_TRADUCCION.get(permiso.content_type.app_label, permiso.content_type.app_label),
    )


def rol_to_entity(rol: Group) -> RolEntidad:
    return RolEntidad(
        id=rol.pk,
        nombre=rol.name,
        permisos=tuple(permiso_to_entity(item) for item in rol.permissions.all()),
    )


def usuario_to_entity(usuario: Usuario) -> UsuarioEntidad:
    suc = None
    if usuario.sucursal_id and hasattr(usuario, "sucursal") and usuario.sucursal:
        suc = {"id": usuario.sucursal.id, "nombre": usuario.sucursal.nombre, "ciudad": usuario.sucursal.ciudad, "direccion": usuario.sucursal.direccion}
    return UsuarioEntidad(
        id=usuario.pk,
        nombre=usuario.nombre,
        apellido_paterno=usuario.apellido_paterno,
        apellido_materno=usuario.apellido_materno,
        correo=usuario.correo,
        activo=usuario.is_active,
        es_superadministrador=usuario.is_superuser,
        roles=tuple(rol_to_entity(rol) for rol in usuario.groups.all()),
        telefono=usuario.telefono or "",
        direccion=usuario.direccion or "",
        direccion_envio=usuario.direccion_envio or "",
        metodo_pago_preferido=usuario.metodo_pago_preferido or "",
        medida_pecho=float(usuario.medida_pecho) if usuario.medida_pecho is not None else None,
        medida_cintura=float(usuario.medida_cintura) if usuario.medida_cintura is not None else None,
        medida_cadera=float(usuario.medida_cadera) if usuario.medida_cadera is not None else None,
        altura=float(usuario.altura) if usuario.altura is not None else None,
        peso=float(usuario.peso) if usuario.peso is not None else None,
        talla_sugerida=usuario.talla_sugerida or "",
        correo_verificado=usuario.correo_verificado,
        correo_pendiente_verificacion=usuario.correo_pendiente_verificacion or "",
        sucursal=suc,
    )
