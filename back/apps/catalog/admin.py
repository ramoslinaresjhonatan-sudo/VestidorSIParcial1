from django.contrib import admin

from apps.catalog.models import Categoria, Producto, ProductoCategoria


class ProductoCategoriaInline(admin.TabularInline):
    model = ProductoCategoria
    extra = 1
    autocomplete_fields = ("categoria",)


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ("id", "nombre", "slug", "activo", "creado_en")
    list_filter = ("activo",)
    search_fields = ("nombre", "slug")
    prepopulated_fields = {"slug": ("nombre",)}


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ("id", "nombre", "categoria", "talla", "color", "precio_centavos", "stock", "activo", "creado_en")
    list_filter = ("categoria", "talla", "activo", "color", "categorias")
    search_fields = ("nombre", "descripcion", "color")
    list_editable = ("activo", "stock")
    readonly_fields = ("creado_en", "actualizado_en")
    inlines = [ProductoCategoriaInline]
    filter_horizontal = ()


@admin.register(ProductoCategoria)
class ProductoCategoriaAdmin(admin.ModelAdmin):
    list_display = ("id", "producto", "categoria", "creado_en")
    list_filter = ("categoria",)
    search_fields = ("producto__nombre", "categoria__nombre")
