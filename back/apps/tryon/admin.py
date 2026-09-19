from django.contrib import admin
from .models import PruebaGuardada

@admin.register(PruebaGuardada)
class PruebaGuardadaAdmin(admin.ModelAdmin):
    list_display = ("id", "usuario", "producto", "talla", "color", "creado_en")
    list_filter = ("talla", "color")
