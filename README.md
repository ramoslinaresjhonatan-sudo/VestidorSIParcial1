# EduGestión

Sistema web de gestión académica con frontend React y API Django REST.

## Inicio local

Backend:

```powershell
cd back
.\venv\Scripts\python.exe manage.py migrate
.\venv\Scripts\python.exe manage.py runserver
```

Frontend:

```powershell
cd from
npm install
npm run dev
```

## Planes y Stripe en modo de prueba

La pantalla pública de inicio muestra los planes activos antes del inicio de sesión. En **Superadministración > Planes**, el superadministrador puede crear, editar, publicar, ocultar y eliminar planes sin modificar código.

El Checkout de Stripe queda preparado en el backend para el flujo posterior de contratación; no es necesario configurar Stripe para probar el CRUD ni la publicación en el landing page.

Frontend (`from/.env`):

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

El nombre existente `KEY_STRIPE` también es compatible mientras se migra a la convención de Vite.

Backend (`back/.env`):

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_RETURN_URL=http://localhost:5173/app/superadministracion/planes
```

La clave secreta nunca debe copiarse al frontend ni confirmarse en el repositorio. Sin `STRIPE_SECRET_KEY`, el CRUD y el listado público de planes continúan funcionando.

Para probar webhooks localmente con Stripe CLI:

```powershell
stripe listen --forward-to localhost:8000/api/v1/billing/webhooks/stripe/
```

El comando entrega un valor `whsec_...` temporal que debe colocarse en `back/.env`. Los precios, moneda y vigencia se resuelven en Django; el navegador solo envía el código del plan.
