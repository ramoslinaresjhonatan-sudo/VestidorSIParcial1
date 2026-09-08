from rest_framework.permissions import BasePermission


class HasEndpointPermission(BasePermission):
    """Exige los permisos declarados por cada método de la vista."""

    message = "No tiene permisos para realizar esta operación."

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser:
            return True

        permission_map = getattr(view, "permission_map", {})
        required = permission_map.get(request.method, ())
        if isinstance(required, str):
            required = (required,)
        return user.has_perms(required)
