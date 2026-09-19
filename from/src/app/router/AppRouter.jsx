import { Navigate, Route, Routes } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { PlansPage } from '@/features/billing/pages/PlansPage'
import { LandingPage } from '@/features/landing/pages/LandingPage'
import { PermissionsPage } from '@/features/roles/pages/PermissionsPage'
import { RolesPage } from '@/features/roles/pages/RolesPage'
import { UsersPage } from '@/features/users/pages/UsersPage'
import { CatalogPage } from '@/features/catalog/pages/CatalogPage'
import { ProductDetailPage } from '@/features/catalog/pages/ProductDetailPage'
import { TryOnPage } from '@/features/tryon/pages/TryOnPage'
import { AdminCatalogPage } from '@/features/catalog/pages/AdminCatalogPage'
import { CartPage } from '@/features/cart/pages/CartPage'
import { ProfilePage } from '@/features/profile/pages/ProfilePage'
import { InventoryPage } from '@/features/inventory/pages/InventoryPage'
import { PedidosPage } from '@/features/pedidos/pages/PedidosPage'
import { POSPage } from '@/features/pos/pages/POSPage'
import { ReportesPage } from '@/features/reportes/pages/ReportesPage'
import { MainLayout } from '@/layouts/MainLayout'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProtectedRoute } from './ProtectedRoute'
import { SuperAdminRoute } from './SuperAdminRoute'

export function AppRouter() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<LandingPage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path={ROUTES.CATALOGO} element={<CatalogPage />} />
      <Route path="/catalogo/:id" element={<ProductDetailPage />} />
      <Route path="/catalogo/:id/probar" element={<TryOnPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route element={<SuperAdminRoute />}>
            <Route path={ROUTES.PLANS} element={<PlansPage />} />
            <Route path={ROUTES.ADMIN_CATALOGO} element={<AdminCatalogPage />} />
          </Route>
          <Route path={ROUTES.USERS} element={<UsersPage />} />
          <Route path={ROUTES.ROLES} element={<RolesPage />} />
          <Route path={ROUTES.PERMISSIONS} element={<PermissionsPage />} />
          <Route path={ROUTES.CART} element={<CartPage />} />
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          <Route path={ROUTES.INVENTARIO} element={<InventoryPage />} />
          <Route path={ROUTES.PEDIDOS} element={<PedidosPage />} />
          <Route path={ROUTES.POS} element={<POSPage />} />
          <Route path={ROUTES.REPORTES} element={<ReportesPage />} />
          <Route path="/app/perfil" element={<Navigate to={ROUTES.PROFILE} replace />} />
          <Route path="/app/usuarios" element={<Navigate to={ROUTES.USERS} replace />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
