from rest_framework.permissions import BasePermission


class IsSuperAdministrator(BasePermission):
    message = "Solo el superadministrador puede gestionar planes y pagos de prueba."

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.is_superuser)
