from django.urls import path

from apps.catalog.api.inventory_views import (
    AjustarStockView,
    HistorialInventarioView,
    InventarioListView,
    InventarioSucursalesView,
    RegistrarMermaView,
    TrasladarStockView,
)
from apps.catalog.api.views import (
    AdminProductoDetailView,
    AdminProductoListCreateView,
    CategoriaAdminDetailView,
    CategoriaAdminListCreateView,
    CategoriaPublicListView,
    ProductoDisponibilidadView,
    ProductoFilterOptionsView,
    ProductoNotifyStockView,
    ProductoOpinionListCreateView,
    ProductoPublicDetailView,
    ProductoPublicListView,
)

app_name = "catalog"

urlpatterns = [
    # Categorías - tabla aparte
    path("categorias/", CategoriaPublicListView.as_view(), name="public-categoria-list"),
    path("admin/categorias/", CategoriaAdminListCreateView.as_view(), name="admin-categoria-list-create"),
    path("admin/categorias/<int:categoria_id>/", CategoriaAdminDetailView.as_view(), name="admin-categoria-detail"),
    # Productos - público
    path("products/filter-options/", ProductoFilterOptionsView.as_view(), name="public-filter-options"),
    path("products/", ProductoPublicListView.as_view(), name="public-product-list"),
    path("products/<int:producto_id>/", ProductoPublicDetailView.as_view(), name="public-product-detail"),
    path("products/<int:producto_id>/opiniones/", ProductoOpinionListCreateView.as_view(), name="public-opinion-list-create"),
    path("products/<int:producto_id>/notificar-stock/", ProductoNotifyStockView.as_view(), name="public-notify-stock"),
    path("products/<int:producto_id>/disponibilidad/", ProductoDisponibilidadView.as_view(), name="public-disponibilidad"),
    # Productos - admin vía intermedia ProductoCategoria
    path("admin/products/", AdminProductoListCreateView.as_view(), name="admin-product-list-create"),
    path("admin/products/<int:producto_id>/", AdminProductoDetailView.as_view(), name="admin-product-detail"),
    # Inventario CU-16
    path("inventory/", InventarioListView.as_view(), name="inventory-list"),
    path("inventory/sucursales/", InventarioSucursalesView.as_view(), name="inventory-sucursales"),
    path("inventory/ajustar/", AjustarStockView.as_view(), name="inventory-ajustar"),
    path("inventory/trasladar/", TrasladarStockView.as_view(), name="inventory-trasladar"),
    path("inventory/merma/", RegistrarMermaView.as_view(), name="inventory-merma"),
    path("inventory/historial/", HistorialInventarioView.as_view(), name="inventory-historial"),
]
