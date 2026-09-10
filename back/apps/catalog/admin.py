from django.contrib import admin

from apps.catalog.models import Producto


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ("id", "nombre", "categoria", "talla", "color", "precio_centavos", "stock", "activo", "creado_en")
    list_filter = ("categoria", "talla", "activo", "color")
    search_fields = ("nombre", "descripcion", "color")
    list_editable = ("activo", "stock")
    readonly_fields = ("creado_en", "actualizado_en")
