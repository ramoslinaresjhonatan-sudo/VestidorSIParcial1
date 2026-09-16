from django.db import models


class TipoPrenda(models.TextChoices):
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


# Alias para compatibilidad
CategoriaPrenda = TipoPrenda


class Categoria(models.Model):
    """Tabla aparte para categorías demográficas: niña, adolescente, adulta."""

    nombre = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True)
    descripcion = models.CharField(max_length=200, blank=True)
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("nombre",)
        verbose_name = "categoría"
        verbose_name_plural = "categorías"

    def __str__(self):
        return self.nombre


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
    # Mantiene compatibilidad con tipo de prenda anterior (vestidos, blusas, etc.)
    categoria = models.CharField(max_length=30, choices=TipoPrenda.choices, default=TipoPrenda.VESTIDOS)
    # Nueva relación M2M vía tabla intermedia para categorías demográficas
    categorias = models.ManyToManyField(
        Categoria,
        through="ProductoCategoria",
        related_name="productos",
        blank=True,
    )
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
        cats = ", ".join(c.nombre for c in self.categorias.all()) or self.categoria
        return f"{self.nombre} ({cats}/{self.talla}) - {self.precio_bs} Bs"

    @property
    def precio_bs(self):
        return self.precio_centavos / 100

    @property
    def precio_formateado(self):
        return f"{self.precio_bs:.2f} Bs"


class ProductoCategoria(models.Model):
    """Tabla intermedia entre Producto y Categoria."""

    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name="producto_categorias")
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name="categoria_productos")
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "producto - categoría"
        verbose_name_plural = "productos - categorías"
        constraints = [
            models.UniqueConstraint(fields=["producto", "categoria"], name="unique_producto_categoria")
        ]

    def __str__(self):
        return f"{self.producto_id} - {self.categoria.nombre}"
