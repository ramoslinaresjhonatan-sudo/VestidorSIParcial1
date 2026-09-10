from django.db import models


class Categoria(models.TextChoices):
    VESTIDOS = "vestidos", "Vestidos"
    BLUSAS = "blusas", "Blusas"
    FALDAS = "faldas", "Faldas"
    PANTALONES = "pantalones", "Pantalones"
    JEANS = "jeans", "Jeans"
    CONJUNTOS = "conjuntos", "Conjuntos"
    ROPA_INTERIOR = "ropa_interior", "Ropa interior"
    ABRIGOS = "abrigos", "Abrigos / Chaquetas"
    TOPS = "tops", "Tops"
    OTRO = "otro", "Otro"


class Talla(models.TextChoices):
    XS = "XS", "XS"
    S = "S", "S"
    M = "M", "M"
    L = "L", "L"
    XL = "XL", "XL"
    XXL = "XXL", "XXL"
    UNICA = "UNICA", "Talla única"
    T32 = "32", "32"
    T34 = "34", "34"
    T36 = "36", "36"
    T38 = "38", "38"
    T40 = "40", "40"
    T42 = "42", "42"
    T44 = "44", "44"
    T46 = "46", "46"


class Producto(models.Model):
    nombre = models.CharField(max_length=150)
    categoria = models.CharField(max_length=30, choices=Categoria.choices)
    descripcion = models.TextField(blank=True, help_text="Descripción corta")
    detalle = models.TextField(blank=True, help_text="Detalle largo, materiales, cuidados")
    color = models.CharField(max_length=50, help_text="Ej: Rojo, Negro, Beige")
    talla = models.CharField(max_length=10, choices=Talla.choices)
    precio_centavos = models.PositiveIntegerField(
        help_text="Precio en centavos de Bs. Ej: 19900 = 199.00 Bs"
    )
    stock = models.PositiveIntegerField(default=0)
    imagen = models.ImageField(
        upload_to="productos/%Y/%m/",
        blank=True,
        null=True,
        help_text="Imagen subida como archivo",
    )
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-creado_en",)
        verbose_name = "producto"
        verbose_name_plural = "productos"

    def __str__(self):
        return f"{self.nombre} ({self.categoria}/{self.talla}) - {self.precio_bs} Bs"

    @property
    def precio_bs(self):
        return self.precio_centavos / 100

    @property
    def precio_formateado(self):
        return f"{self.precio_bs:.2f} Bs"
