from django.urls import path

from apps.catalog.api.views import (
    AdminProductoDetailView,
    AdminProductoListCreateView,
    CategoriaAdminDetailView,
    CategoriaAdminListCreateView,
    CategoriaPublicListView,
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
    path("products/", ProductoPublicListView.as_view(), name="public-product-list"),
    path("products/<int:producto_id>/", ProductoPublicDetailView.as_view(), name="public-product-detail"),
    # Productos - admin vía intermedia ProductoCategoria
    path("admin/products/", AdminProductoListCreateView.as_view(), name="admin-product-list-create"),
    path("admin/products/<int:producto_id>/", AdminProductoDetailView.as_view(), name="admin-product-detail"),
]
