from django.urls import path

from apps.catalog.api.views import (
    AdminProductoDetailView,
    AdminProductoListCreateView,
    ProductoPublicDetailView,
    ProductoPublicListView,
)

app_name = "catalog"

urlpatterns = [
    # Público - ropa femenina
    path("products/", ProductoPublicListView.as_view(), name="public-product-list"),
    path("products/<int:producto_id>/", ProductoPublicDetailView.as_view(), name="public-product-detail"),
    # Admin
    path("admin/products/", AdminProductoListCreateView.as_view(), name="admin-product-list-create"),
    path("admin/products/<int:producto_id>/", AdminProductoDetailView.as_view(), name="admin-product-detail"),
]
