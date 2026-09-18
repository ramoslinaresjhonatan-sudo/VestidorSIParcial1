from django.contrib import admin

from apps.catalog.models import Categoria, Merma, NotificacionStock, Opinion, Producto, ProductoCategoria, ProductoImagen, StockSucursal, Sucursal, Traslado


class ProductoCategoriaInline(admin.TabularInline):
    model = ProductoCategoria
    extra = 1
    autocomplete_fields = ("categoria",)


class ProductoImagenInline(admin.TabularInline):
    model = ProductoImagen
    extra = 1


class StockSucursalInline(admin.TabularInline):
    model = StockSucursal
    extra = 1
    autocomplete_fields = ("sucursal",)


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ("id", "nombre", "slug", "activo", "creado_en")
    list_filter = ("activo",)
    search_fields = ("nombre", "slug")
    prepopulated_fields = {"slug": ("nombre",)}


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ("id", "nombre", "categoria", "talla", "color", "marca", "precio_centavos", "stock", "activo", "creado_en")
    list_filter = ("categoria", "talla", "activo", "color", "categorias", "marca")
    search_fields = ("nombre", "descripcion", "color", "marca")
    list_editable = ("activo", "stock")
    readonly_fields = ("creado_en", "actualizado_en")
    inlines = [ProductoCategoriaInline, ProductoImagenInline, StockSucursalInline]
    filter_horizontal = ()


@admin.register(Sucursal)
class SucursalAdmin(admin.ModelAdmin):
    list_display = ("id", "nombre", "ciudad", "activo")
    list_filter = ("activo", "ciudad")
    search_fields = ("nombre", "ciudad")


@admin.register(Opinion)
class OpinionAdmin(admin.ModelAdmin):
    list_display = ("id", "producto", "usuario_nombre", "calificacion", "creado_en")
    list_filter = ("calificacion",)


@admin.register(NotificacionStock)
class NotificacionStockAdmin(admin.ModelAdmin):
    list_display = ("id", "producto", "email", "talla", "color", "notificado", "creado_en")


@admin.register(Traslado)
class TrasladoAdmin(admin.ModelAdmin):
    list_display = ("id", "producto", "talla", "color", "origen", "destino", "cantidad", "estado", "creado_en")
    list_filter = ("estado", "origen", "destino")


@admin.register(Merma)
class MermaAdmin(admin.ModelAdmin):
    list_display = ("id", "producto", "sucursal", "talla", "color", "cantidad", "motivo", "creado_en")
    list_filter = ("motivo", "sucursal")


@admin.register(ProductoCategoria)
class ProductoCategoriaAdmin(admin.ModelAdmin):
    list_display = ("id", "producto", "categoria", "creado_en")
    list_filter = ("categoria",)
    search_fields = ("producto__nombre", "categoria__nombre")
