"""Router central de la API versionada."""

from django.urls import include, path

urlpatterns = [
    path("catalog/", include("apps.catalog.api.urls")),
    path("cart/", include("apps.cart.api.urls")),
    path("billing/", include("apps.billing.api.urls")),
    path("tryon/", include("apps.tryon.api.urls")),
    path("", include("apps.users.api.urls")),
]
