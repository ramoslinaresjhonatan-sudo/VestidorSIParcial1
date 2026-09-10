from rest_framework.permissions import BasePermission


class IsAdminCatalog(BasePermission):
    message = "Solo el administrador / superadministrador puede gestionar productos."

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and (user.is_superuser or user.is_staff))
