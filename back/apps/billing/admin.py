from django.contrib import admin

from apps.billing.models import PagoPlanTemporal, Plan


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = (
        "nombre",
        "codigo",
        "precio_centavos",
        "moneda",
        "duracion_dias",
        "limite_estudiantes",
        "activo",
    )
    list_filter = ("activo", "destacado", "moneda")
    search_fields = ("nombre", "codigo", "descripcion")


@admin.register(PagoPlanTemporal)
class PagoPlanTemporalAdmin(admin.ModelAdmin):
    list_display = (
        "stripe_session_id",
        "usuario",
        "codigo_plan",
        "estado",
        "moneda",
        "monto_centavos",
        "creado_en",
    )
    list_filter = ("estado", "codigo_plan", "moneda")
    search_fields = ("stripe_session_id", "usuario__correo")
    readonly_fields = ("creado_en", "actualizado_en")
