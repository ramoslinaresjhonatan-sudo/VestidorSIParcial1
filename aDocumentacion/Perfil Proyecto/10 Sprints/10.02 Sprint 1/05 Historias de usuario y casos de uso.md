# Historias de usuario y casos de uso

| ID | Historia resumida | Actor | Resultado esperado |
|---|---|---|---|
| C1 | Como usuario quiero iniciar y cerrar sesión para acceder de forma segura. | Usuario | Sesión válida con funciones según permisos. |
| C2 | Como administrador quiero gestionar cuentas para mantener usuarios autorizados. | Administrador | Crear, consultar, editar y desactivar usuarios. |
| C3 | Como administrador quiero asignar roles para definir responsabilidades. | Administrador | Usuario asociado a los roles seleccionados. |
| C4 | Como administrador quiero configurar roles y permisos para controlar operaciones. | Administrador | Permisos aplicados en interfaz y API. |
| C5 | Como superadministrador quiero crear planes para comercializar combinaciones de funciones. | Superadministrador | Plan con precio, tiempo, límites y módulos. |
| C6 | Como superadministrador quiero asignar suscripciones para habilitar instituciones por un periodo. | Superadministrador | Suscripción activa, suspendida, vencida o cancelada. |
| C7 | Como propietario del servicio quiero verificar la suscripción antes de autorizar un módulo. | Sistema | Acceso concedido solo si usuario, permiso, plan y vigencia son válidos. |

Las operaciones C5–C7 no son CRUD simples: incluyen reglas de fechas, límites, estados y autorización transversal.
