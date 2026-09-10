# Implementación

## Implementado

- autenticación JWT e identificación del usuario actual;
- inicio y cierre de sesión en la interfaz;
- CRUD de usuarios;
- CRUD de roles;
- consulta y asignación de permisos;
- asignación de roles a usuarios;
- protección de rutas y opción exclusiva de superadministrador en el frontend.
- planes persistentes con costo, moneda, duración, límites, módulos, orden y estado;
- CRUD de planes exclusivo para el superadministrador;
- publicación de los planes activos en el landing page antes del inicio de sesión;
- API pública de consulta y API protegida de administración;
- servicio backend de Stripe Checkout preparado para una contratación posterior;
- precio, moneda y duración resueltos en Django;
- registro local de la sesión de pago, consulta de estado y webhook firmado.

## Pendiente para cerrar el sprint

- suscripciones vinculadas a una institución, no solo al usuario de prueba;
- reglas de acceso por plan, vigencia y límites;
- pruebas completas de C5–C7.

La pantalla de Planes permite probar todo el CRUD sin configurar Stripe. Suscripciones continúa como base de navegación y el servicio de Checkout no reemplaza el modelo institucional definitivo.
