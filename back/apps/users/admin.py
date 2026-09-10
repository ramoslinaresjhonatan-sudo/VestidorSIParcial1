from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from apps.users.domain.model import Usuario


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    model = Usuario
    ordering = ("correo",)
    list_display = ("correo", "nombre", "apellido_paterno", "is_active", "is_staff")
    search_fields = ("correo", "nombre", "apellido_paterno", "apellido_materno")
    fieldsets = (
        (None, {"fields": ("correo", "password")}),
        (
            "Información personal",
            {"fields": ("nombre", "apellido_paterno", "apellido_materno")},
        ),
        (
            "Acceso",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Fechas", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "correo",
                    "nombre",
                    "apellido_paterno",
                    "apellido_materno",
                    "password1",
                    "password2",
                    "is_active",
                    "is_staff",
                ),
            },
        ),
    )
