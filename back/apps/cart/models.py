from django.conf import settings
from django.db import models

from apps.catalog.models import Producto, Talla


class Coupon(models.Model):
    class Tipo(models.TextChoices):
        PORCENTAJE = "porcentaje", "Porcentaje"
        MONTO = "monto", "Monto fijo (Bs)"

    codigo = models.CharField(max_length=30, unique=True, help_text="Ej: BIENVENIDA10")
    tipo = models.CharField(max_length=10, choices=Tipo.choices, default=Tipo.PORCENTAJE)
    valor = models.PositiveIntegerField(help_text="Si porcentaje: 10 = 10%. Si monto: centavos (1000 = 10 Bs)")
    activo = models.BooleanField(default=True)
    usos_max = models.PositiveIntegerField(null=True, blank=True, help_text="Null = ilimitado")
    usos_actual = models.PositiveIntegerField(default=0)
    expira_en = models.DateTimeField(null=True, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("codigo",)
        verbose_name = "cupón"
        verbose_name_plural = "cupones"

    def __str__(self):
        return f"{self.codigo} ({self.get_tipo_display()} {self.valor})"


class Cart(models.Model):
    usuario = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="cart")
    coupon = models.ForeignKey(Coupon, null=True, blank=True, on_delete=models.SET_NULL, related_name="carts")
    actualizado_en = models.DateTimeField(auto_now=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "carrito"
        verbose_name_plural = "carritos"

    def __str__(self):
        return f"Carrito {self.usuario_id}"

    @property
    def subtotal_centavos(self):
        return sum(item.subtotal_centavos for item in self.items.all())

    @property
    def descuento_centavos(self):
        if not self.coupon or not self.coupon.activo:
            return 0
        if self.coupon.tipo == Coupon.Tipo.PORCENTAJE:
            return int(self.subtotal_centavos * self.coupon.valor / 100)
        return min(self.coupon.valor, self.subtotal_centavos)

    @property
    def total_centavos(self):
        return max(0, self.subtotal_centavos - self.descuento_centavos)

    @property
    def total_items(self):
        return sum(item.cantidad for item in self.items.all())


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name="cart_items")
    talla = models.CharField(max_length=10, choices=Talla.choices)
    color = models.CharField(max_length=50)
    cantidad = models.PositiveIntegerField(default=1)
    # snapshot precio y promoción
    precio_centavos = models.PositiveIntegerField()
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-creado_en",)
        verbose_name = "ítem de carrito"
        verbose_name_plural = "ítems de carrito"
        constraints = [
            models.UniqueConstraint(fields=["cart", "producto", "talla", "color"], name="unique_cart_producto_variante")
        ]

    def __str__(self):
        return f"{self.producto.nombre} x{self.cantidad} ({self.talla}/{self.color})"

    @property
    def subtotal_centavos(self):
        return self.precio_centavos * self.cantidad

    @property
    def precio_bs(self):
        return self.precio_centavos / 100
