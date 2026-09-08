from django.urls import path

from apps.users.api.views import (
    AccessOptionsView,
    PermisoListView,
    RolDetailView,
    RolListCreateView,
    UsuarioAnnulView,
    UsuarioDetailView,
    UsuarioListCreateView,
)

app_name = "users"

urlpatterns = [
    path("users/", UsuarioListCreateView.as_view(), name="usuario-list-create"),
    path("users/<int:usuario_id>/", UsuarioDetailView.as_view(), name="usuario-detail"),
    path(
        "users/<int:usuario_id>/anular/",
        UsuarioAnnulView.as_view(),
        name="usuario-annul",
    ),
    path("roles/", RolListCreateView.as_view(), name="rol-list-create"),
    path("roles/<int:rol_id>/", RolDetailView.as_view(), name="rol-detail"),
    path("permissions/", PermisoListView.as_view(), name="permiso-list"),
    path("access-options/", AccessOptionsView.as_view(), name="access-options"),
]
