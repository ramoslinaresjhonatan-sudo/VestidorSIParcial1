from django.contrib import admin
from apps.cart.models import Cart, CartItem, Coupon

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ("codigo","tipo","valor","activo","usos_actual","usos_max","expira_en")
    list_filter = ("tipo","activo")
    search_fields = ("codigo",)

class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ("precio_centavos",)

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("id","usuario","coupon","total_items","subtotal_centavos","total_centavos","actualizado_en")
    inlines = [CartItemInline]
