# Arquitectura limpia para un proyecto React moderno

> Guía base para construir un frontend moderno, escalable, reutilizable y fácil de mantener con **React + Vite**.

---

## 1. Objetivo

La aplicación debe mantener una estructura clara y separada por responsabilidades.

Principios principales:

- Separar UI, lógica de aplicación, acceso a API y configuración.
- Evitar componentes gigantes.
- Reutilizar componentes y lógica siempre que tenga sentido.
- Evitar duplicar código.
- Centralizar Axios, rutas, variables de entorno y manejo de errores.
- Mantener componentes simples.
- Evitar llamadas HTTP directamente dentro de componentes visuales.
- Usar nombres claros y consistentes.
- Mantener una estructura que pueda crecer sin volverse difícil de mantener.

---

## 2. Stack recomendado

- React
- Vite
- React Router
- Axios
- React Hook Form
- Zod
- TanStack Query
- ESLint
- Prettier

Opcionales según el proyecto:

- Zustand para estado global simple.
- Redux Toolkit si el estado global es grande o complejo.
- Vitest para pruebas.
- React Testing Library para pruebas de componentes.

---

## 3. Crear el proyecto

```bash
npm create vite@latest front -- --template react
cd front
npm install
```

Instalar dependencias principales:

```bash
npm install react-router-dom axios @tanstack/react-query react-hook-form zod @hookform/resolvers
```

Opcional:

```bash
npm install zustand
```

---

## 4. Estructura recomendada

```text
front/
├── public/
│
├── src/
│   ├── app/
│   │   ├── router/
│   │   │   ├── AppRouter.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── routes.js
│   │   │
│   │   ├── providers/
│   │   │   ├── AppProviders.jsx
│   │   │   └── QueryProvider.jsx
│   │   │
│   │   └── App.jsx
│   │
│   ├── assets/
│   │   ├── icons/
│   │   ├── images/
│   │   └── fonts/
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button/
│   │   │   │   ├── Button.jsx
│   │   │   │   └── Button.css
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   ├── Spinner/
│   │   │   └── Alert/
│   │   │
│   │   └── shared/
│   │       ├── Header/
│   │       ├── Sidebar/
│   │       ├── EmptyState/
│   │       └── ErrorMessage/
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── api/
│   │   │   │   └── authApi.js
│   │   │   ├── components/
│   │   │   │   └── LoginForm.jsx
│   │   │   ├── hooks/
│   │   │   │   └── useLogin.js
│   │   │   ├── pages/
│   │   │   │   └── LoginPage.jsx
│   │   │   ├── schemas/
│   │   │   │   └── loginSchema.js
│   │   │   └── store/
│   │   │       └── authStore.js
│   │   │
│   │   ├── users/
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── pages/
│   │   │   └── schemas/
│   │   │
│   │   └── products/
│   │       ├── api/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── pages/
│   │       └── schemas/
│   │
│   ├── hooks/
│   │   ├── useDebounce.js
│   │   └── usePagination.js
│   │
│   ├── layouts/
│   │   ├── MainLayout.jsx
│   │   └── AuthLayout.jsx
│   │
│   ├── lib/
│   │   ├── axios/
│   │   │   └── apiClient.js
│   │   └── query/
│   │       └── queryClient.js
│   │
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── NotFoundPage.jsx
│   │   └── UnauthorizedPage.jsx
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   ├── variables.css
│   │   └── reset.css
│   │
│   ├── utils/
│   │   ├── formatDate.js
│   │   ├── formatCurrency.js
│   │   └── handleApiError.js
│   │
│   ├── constants/
│   │   ├── routes.js
│   │   └── messages.js
│   │
│   ├── config/
│   │   └── env.js
│   │
│   └── main.jsx
│
├── .env
├── .env.example
├── .gitignore
├── eslint.config.js
├── package.json
└── vite.config.js
```

---

# 5. Responsabilidad de cada carpeta

## `app/`

Contiene la configuración general de la aplicación.

Aquí deben estar:

- Router principal.
- Providers.
- Configuración global.
- Componente raíz.

No debe contener lógica específica de módulos como usuarios, productos o ventas.

---

## `features/`

Es la carpeta más importante.

Cada funcionalidad del sistema debe vivir en su propio módulo.

Ejemplo:

```text
features/
├── auth/
├── users/
├── products/
├── sales/
└── reports/
```

Cada feature puede tener:

```text
feature/
├── api/
├── components/
├── hooks/
├── pages/
├── schemas/
├── store/
└── utils/
```

Esto evita tener carpetas globales con cientos de archivos mezclados.

---

## `components/ui/`

Componentes visuales completamente reutilizables.

Ejemplos:

- Button
- Input
- Select
- Modal
- Table
- Card
- Spinner
- Badge
- Pagination

Estos componentes no deben conocer reglas específicas del negocio.

Correcto:

```jsx
<Button loading={isLoading}>
  Guardar
</Button>
```

Incorrecto:

```jsx
<ButtonGuardarProducto />
```

si ese botón solamente cambia el texto y ejecuta una función externa.

---

## `components/shared/`

Componentes utilizados en diferentes partes del sistema, pero con mayor contexto que los componentes UI.

Ejemplos:

- Header
- Sidebar
- Navbar
- Breadcrumb
- ErrorMessage
- EmptyState

---

## `layouts/`

Define la estructura visual de las páginas.

Ejemplo:

```jsx
function MainLayout() {
  return (
    <>
      <Sidebar />
      <main>
        <Header />
        <Outlet />
      </main>
    </>
  );
}
```

---

## `lib/`

Configuraciones de librerías externas.

Ejemplos:

- Axios
- TanStack Query
- i18n

No configurar Axios repetidamente en diferentes módulos.

---

## `config/`

Configuración propia de la aplicación.

Ejemplo:

```js
export const env = {
  apiUrl: import.meta.env.VITE_API_URL,
};
```

---

## `utils/`

Funciones genéricas que no dependen de React.

Ejemplo:

```js
export function formatCurrency(value) {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
  }).format(value);
}
```

---

# 6. Variables de entorno

Archivo `.env`:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Archivo `.env.example`:

```env
VITE_API_URL=
```

Nunca colocar URLs directamente en componentes.

Incorrecto:

```js
axios.get("http://127.0.0.1:8000/api/users/");
```

Correcto:

```js
apiClient.get("/users/");
```

---

# 7. Configuración de Axios

Crear:

```text
src/lib/axios/apiClient.js
```

```js
import axios from "axios";
import { env } from "../../config/env";

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});
```

Puede agregarse un interceptor para autenticación:

```js
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
```

Y uno para errores comunes:

```js
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // manejar sesión vencida
    }

    return Promise.reject(error);
  }
);
```

---

# 8. No llamar Axios directamente desde una página

Evitar:

```jsx
function UsersPage() {
  useEffect(() => {
    axios.get("/users");
  }, []);
}
```

Preferir separar la comunicación HTTP.

```text
features/users/api/usersApi.js
```

```js
import { apiClient } from "../../../lib/axios/apiClient";

export async function getUsers() {
  const response = await apiClient.get("/users/");
  return response.data;
}
```

---

# 9. Hooks para lógica de aplicación

Crear:

```text
features/users/hooks/useUsers.js
```

Ejemplo con TanStack Query:

```js
import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../api/usersApi";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });
}
```

La página queda limpia:

```jsx
import { useUsers } from "../hooks/useUsers";

export function UsersPage() {
  const { data, isLoading, isError } = useUsers();

  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return <ErrorMessage />;
  }

  return <UsersTable users={data} />;
}
```

---

# 10. Mutaciones

Para crear, actualizar o eliminar información utilizar `useMutation`.

Ejemplo:

```js
export function useCreateUser() {
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });
}
```

---

# 11. Evitar doble clic y peticiones duplicadas

Todo botón que realice una petición debe bloquearse mientras esté procesando.

Ejemplo:

```jsx
<button
  type="submit"
  disabled={isPending}
>
  {isPending ? "Guardando..." : "Guardar"}
</button>
```

Preferiblemente centralizar este comportamiento en un componente `Button`.

```jsx
export function Button({
  children,
  loading = false,
  disabled = false,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Procesando..." : children}
    </button>
  );
}
```

---

# 12. Formularios

Para formularios grandes utilizar:

- React Hook Form
- Zod

Ejemplo de esquema:

```js
import { z } from "zod";

export const userSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre es obligatorio"),

  email: z
    .string()
    .email("Correo inválido"),
});
```

No repetir validaciones manuales en cada input.

---

# 13. Router

Centralizar las rutas.

```text
src/app/router/AppRouter.jsx
```

```jsx
import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<MainLayout />}>
          <Route path="/users" element={<UsersPage />} />
          <Route path="/products" element={<ProductsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

# 14. Constantes de rutas

Evitar strings repetidos:

```js
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  USERS: "/users",
  PRODUCTS: "/products",
};
```

Uso:

```js
navigate(ROUTES.USERS);
```

---

# 15. Rutas protegidas

Crear un componente:

```text
src/app/router/ProtectedRoute.jsx
```

Ejemplo:

```jsx
import { Navigate, Outlet } from "react-router-dom";

export function ProtectedRoute() {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
```

La protección del frontend mejora la experiencia de usuario, pero la seguridad real siempre debe validarse también en el backend.

---

# 16. Estado global

No guardar todo en un estado global.

Usar estado local para:

- Modales.
- Inputs.
- Tabs.
- Estados visuales.

Usar TanStack Query para:

- Datos provenientes del backend.
- Caché.
- Refetch.
- Loading.
- Mutaciones.

Usar Zustand o Redux solamente para estados globales reales.

Ejemplos:

- Usuario autenticado.
- Tema.
- Preferencias globales.
- Carrito compartido entre muchas pantallas.

---

# 17. Manejo de errores

No repetir:

```js
try {
  ...
} catch (error) {
  alert(error.response.data.message);
}
```

en cada componente.

Crear una función común:

```text
src/utils/handleApiError.js
```

```js
export function handleApiError(error) {
  if (!error.response) {
    return "No se pudo conectar con el servidor.";
  }

  if (error.response.status === 400) {
    return "Los datos enviados no son válidos.";
  }

  if (error.response.status === 401) {
    return "Tu sesión ha expirado.";
  }

  if (error.response.status === 403) {
    return "No tienes permisos para realizar esta acción.";
  }

  if (error.response.status >= 500) {
    return "Ocurrió un error en el servidor.";
  }

  return "Ocurrió un error inesperado.";
}
```

---

# 18. Loading, vacío y error

Toda pantalla que obtenga datos debe contemplar como mínimo:

```text
Loading
Success
Empty
Error
```

Ejemplo:

```jsx
if (isLoading) {
  return <Spinner />;
}

if (isError) {
  return <ErrorMessage />;
}

if (!users?.length) {
  return <EmptyState message="No existen usuarios." />;
}

return <UsersTable users={users} />;
```

---

# 19. CSS

Separar presentación y lógica.

Ejemplo:

```text
Button/
├── Button.jsx
└── Button.css
```

Usar variables CSS globales:

```css
:root {
  --color-primary: #2563eb;
  --color-danger: #dc2626;
  --color-success: #16a34a;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;

  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
}
```

Evitar valores repetidos por toda la aplicación.

---

# 20. Componentes pequeños

Evitar componentes de cientos de líneas.

Incorrecto:

```text
UsersPage.jsx
800 líneas
```

Preferir:

```text
UsersPage.jsx
UsersTable.jsx
UserForm.jsx
UserFilters.jsx
UserModal.jsx
UserDeleteDialog.jsx
```

La página debe principalmente coordinar componentes.

---

# 21. Reutilización

Antes de crear un componente nuevo revisar si ya existe uno reutilizable.

Evitar:

```text
SaveUserButton.jsx
SaveProductButton.jsx
SaveOrderButton.jsx
```

Preferir:

```jsx
<Button
  type="submit"
  loading={isPending}
>
  Guardar
</Button>
```

---

# 22. Regla de dependencias

La UI puede depender de hooks.

```text
Page
 ↓
Component
 ↓
Hook
 ↓
API
 ↓
Axios Client
 ↓
Backend
```

Ejemplo:

```text
UsersPage
   ↓
useUsers
   ↓
usersApi
   ↓
apiClient
   ↓
Django REST API
```

Evitar:

```text
UsersPage
   ↓
Axios directamente
```

---

# 23. Flujo recomendado

Ejemplo para listar usuarios:

```text
UsersPage
    ↓
useUsers()
    ↓
getUsers()
    ↓
apiClient.get("/users/")
    ↓
Django REST Framework
    ↓
JSON
    ↓
TanStack Query
    ↓
UsersPage
    ↓
UsersTable
```

---

# 24. Convención de nombres

Componentes:

```text
UserCard.jsx
UsersTable.jsx
LoginForm.jsx
```

Hooks:

```text
useUsers.js
useAuth.js
usePagination.js
```

Servicios/API:

```text
usersApi.js
authApi.js
productsApi.js
```

Schemas:

```text
userSchema.js
loginSchema.js
```

Utilidades:

```text
formatDate.js
formatCurrency.js
```

---

# 25. Imports

Evitar imports extremadamente largos:

```js
import Button from "../../../../components/ui/Button/Button";
```

Configurar alias en Vite.

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

Entonces:

```js
import { Button } from "@/components/ui/Button/Button";
```

---

# 26. Reglas para componentes

Cada componente debe:

- Tener una única responsabilidad principal.
- Recibir datos mediante props cuando sea posible.
- No conocer detalles innecesarios del backend.
- No hacer llamadas HTTP directamente.
- No duplicar lógica existente.
- Manejar correctamente loading y disabled.
- Mantener JSX legible.
- Evitar lógica extensa dentro del `return`.

---

# 27. Reglas para páginas

Una página puede:

- Obtener datos mediante hooks.
- Controlar navegación.
- Coordinar componentes.
- Mostrar estados generales.

Una página no debería:

- Crear configuraciones Axios.
- Contener cientos de líneas de formulario.
- Tener validaciones repetitivas.
- Implementar lógica reutilizable directamente.
- Duplicar componentes existentes.

---

# 28. Reglas para API

Cada feature debe tener su propio archivo de API.

Ejemplo:

```js
export const usersApi = {
  getAll: async () => {
    const { data } = await apiClient.get("/users/");
    return data;
  },

  getById: async (id) => {
    const { data } = await apiClient.get(`/users/${id}/`);
    return data;
  },

  create: async (payload) => {
    const { data } = await apiClient.post("/users/", payload);
    return data;
  },

  update: async (id, payload) => {
    const { data } = await apiClient.put(`/users/${id}/`, payload);
    return data;
  },

  remove: async (id) => {
    await apiClient.delete(`/users/${id}/`);
  },
};
```

---

# 29. Seguridad básica

Nunca colocar en el frontend:

- Passwords privados.
- Secret keys.
- Credenciales de base de datos.
- Claves privadas.
- Tokens permanentes del backend.

Las variables `VITE_*` terminan disponibles en el código compilado del navegador.

Por tanto:

```env
VITE_API_URL=https://api.ejemplo.com
```

es correcto.

Pero esto no:

```env
VITE_DATABASE_PASSWORD=123456
VITE_SECRET_KEY=supersecreto
```

---

# 30. Calidad de código

Antes de considerar una funcionalidad terminada:

```bash
npm run lint
npm run build
```

Debe compilar sin errores.

Evitar dejar:

```js
console.log(...)
```

innecesarios en producción.

---

# 31. Principios DRY, KISS y separación de responsabilidades

## DRY

Don't Repeat Yourself.

Si una lógica aparece varias veces, evaluar si corresponde extraerla.

---

## KISS

Keep It Simple.

No crear abstracciones complejas para problemas simples.

---

## Separación de responsabilidades

Cada archivo debe tener una función clara.

Ejemplo:

```text
UsersPage.jsx
```

no debería encargarse al mismo tiempo de:

- HTTP
- validación
- formato de fechas
- manejo de tokens
- componentes visuales
- reglas de navegación

Cada responsabilidad debe separarse.

---

# 32. Lo que NO debe hacerse

No crear una estructura como:

```text
src/
├── components/
│   ├── 150 componentes
├── pages/
│   ├── 80 páginas
├── services/
│   ├── 70 servicios
```

sin separación por funcionalidades.

Tampoco:

```jsx
function App() {
  // 1500 líneas
}
```

Ni llamadas repetidas:

```js
axios.get(...)
axios.post(...)
axios.put(...)
```

configuradas independientemente en cada componente.

---

# 33. Estructura de una nueva feature

Cuando se agregue una funcionalidad llamada `products`, crear:

```text
features/products/
├── api/
│   └── productsApi.js
├── components/
│   ├── ProductForm.jsx
│   ├── ProductCard.jsx
│   └── ProductsTable.jsx
├── hooks/
│   ├── useProducts.js
│   ├── useCreateProduct.js
│   └── useDeleteProduct.js
├── pages/
│   ├── ProductsPage.jsx
│   └── ProductDetailPage.jsx
├── schemas/
│   └── productSchema.js
└── utils/
```

No crear archivos fuera de la feature si solamente serán utilizados por esa feature.

---

# 34. Regla para mover código a `shared`

Un componente pasa a `components/shared` solamente cuando realmente es utilizado por varias features.

Ejemplo:

Si `ProductCard` solamente pertenece a productos:

```text
features/products/components/ProductCard.jsx
```

No:

```text
components/shared/ProductCard.jsx
```

---

# 35. Diseño responsive

La interfaz debe funcionar como mínimo en:

- Desktop.
- Tablet.
- Mobile.

Evitar anchos fijos innecesarios.

Incorrecto:

```css
.container {
  width: 1200px;
}
```

Preferir:

```css
.container {
  width: min(100% - 32px, 1200px);
  margin-inline: auto;
}
```

---

# 36. Accesibilidad

Usar HTML semántico:

```html
<header>
<nav>
<main>
<section>
<article>
<footer>
```

Los botones deben ser botones:

```jsx
<button onClick={handleSave}>
  Guardar
</button>
```

Evitar:

```jsx
<div onClick={handleSave}>
  Guardar
</div>
```

Inputs con label:

```jsx
<label htmlFor="email">
  Correo
</label>

<input
  id="email"
  type="email"
/>
```

---

# 37. Arquitectura resumida

```text
┌─────────────────────────────┐
│            Pages            │
│ Presentan y coordinan vistas│
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│         Components          │
│       UI reutilizable       │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│            Hooks            │
│    Lógica de aplicación     │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│             API             │
│ Comunicación con el backend │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│         Axios Client        │
│ Configuración HTTP común    │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│       Django REST API       │
└─────────────────────────────┘
```

---

# 38. Reglas estrictas para una IA o Codex

Cuando una IA trabaje sobre este proyecto deberá respetar las siguientes reglas.

## Estructura

1. No modificar la arquitectura sin una razón técnica clara.
2. No crear carpetas nuevas si una existente cumple la misma función.
3. Mantener funcionalidades dentro de `features/`.
4. Mantener componentes globales únicamente en `components/`.
5. Mantener la configuración HTTP únicamente en `lib/axios/`.
6. Mantener variables de entorno centralizadas.

## Reutilización

7. Antes de crear un componente, revisar si existe uno reutilizable.
8. No duplicar funciones.
9. No duplicar validaciones.
10. No duplicar componentes con diferencias mínimas.
11. Extraer lógica repetida a hooks o utilidades cuando corresponda.

## API

12. No usar Axios directamente en páginas o componentes visuales.
13. Todas las llamadas al backend deben pasar por `apiClient`.
14. Separar endpoints por feature.
15. Manejar errores HTTP de forma consistente.
16. No colocar URLs del backend directamente en componentes.

## Formularios

17. Utilizar React Hook Form para formularios medianos o grandes.
18. Utilizar Zod para validaciones.
19. Mostrar mensajes de error claros.
20. Bloquear el botón mientras una operación esté en progreso.

## Estado

21. No guardar datos del servidor innecesariamente en Zustand o Redux.
22. Utilizar TanStack Query para server state.
23. Utilizar estado local para comportamiento visual local.
24. Utilizar estado global únicamente cuando varios módulos realmente lo necesiten.

## UX

25. Toda petición debe manejar loading.
26. Toda acción debe manejar error.
27. Toda lista debe contemplar estado vacío.
28. Los botones de envío deben bloquear doble ejecución.
29. Mostrar feedback al usuario después de guardar, actualizar o eliminar.
30. No congelar la interfaz mientras se procesa una petición.

## Código

31. Mantener funciones pequeñas.
32. Usar nombres descriptivos.
33. Evitar archivos excesivamente grandes.
34. Evitar comentarios que expliquen código obvio.
35. Eliminar código muerto.
36. Evitar `console.log` innecesarios.
37. Mantener ESLint sin errores.
38. El proyecto debe compilar correctamente con `npm run build`.

## Diseño

39. Mantener diseño responsive.
40. Reutilizar variables CSS.
41. Evitar estilos inline salvo casos justificados.
42. Mantener una identidad visual consistente.
43. Utilizar componentes UI comunes.

## Seguridad

44. Nunca guardar secretos en variables `VITE_*`.
45. No confiar en el frontend para autorización real.
46. No exponer información sensible.
47. La autorización debe ser validada por el backend.

---

# 39. Regla principal

Antes de escribir código nuevo, seguir este orden:

```text
1. Revisar si ya existe.
2. Revisar si puede reutilizarse.
3. Revisar si pertenece a una feature existente.
4. Revisar si debe ser un componente, hook, utilidad o función API.
5. Crear código nuevo solamente si realmente es necesario.
```

---

# 40. Resultado esperado

El proyecto debe poder crecer de:

```text
5 pantallas
```

a:

```text
50+ pantallas
```

sin tener que reorganizar completamente el código.

La arquitectura debe priorizar:

```text
Claridad
   +
Reutilización
   +
Separación de responsabilidades
   +
Escalabilidad
   +
Mantenibilidad
```

por encima de agregar capas innecesarias.
