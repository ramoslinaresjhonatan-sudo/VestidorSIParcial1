# Clases

Clases principales del sprint:

- **Usuario:** credenciales, datos básicos, estado y marcas de superadministrador.
- **Rol:** nombre, descripción y estado.
- **Permiso:** código, módulo y acción autorizada.
- **UsuarioRol:** relación entre usuario y rol.
- **RolPermiso:** relación entre rol y permiso.
- **Plan:** nombre, precio, moneda, duración, límites y estado.
- **PlanPermiso:** funciones incluidas en el plan.
- **Suscripción:** institución, plan, fechas, estado y condiciones contratadas.

La autorización efectiva resulta de combinar el estado del usuario, sus roles, los permisos y la suscripción institucional.
