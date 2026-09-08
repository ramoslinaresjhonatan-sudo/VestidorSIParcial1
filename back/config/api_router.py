"""Router central de la API versionada."""

from django.urls import include, path

urlpatterns = [
    path("billing/", include("apps.billing.api.urls")),
    path("", include("apps.users.api.urls")),
]
