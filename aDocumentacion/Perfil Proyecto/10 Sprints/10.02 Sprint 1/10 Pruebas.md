# Pruebas

Pruebas mínimas del sprint:

- credenciales correctas e incorrectas;
- acceso con usuario activo e inactivo;
- creación, edición y desactivación de usuarios;
- asignación y retiro de roles y permisos;
- rechazo de Planes y Suscripciones para usuarios que no sean superadministradores;
- suscripción activa, vencida, suspendida y cancelada;
- intento de acceder a un módulo no incluido en el plan;
- límites de usuarios o estudiantes contratados.

La verificación actual del frontend superó lint y compilación. Las ocho pruebas del módulo de planes y Stripe validan listado público, CRUD protegido, autorización, configuración, precio resuelto por el servidor y rechazo de planes inexistentes. La suite general del backend conserva una falla asociada a que `Usuarios.csv` contiene más de un registro cuando su prueba exige exactamente uno; debe corregirse o aislarse antes de registrar el sprint como aprobado.
