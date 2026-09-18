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


class TipoVenta(models.TextChoices):
    MENOR = "menor", "Menor (detal)"
    MAYOR = "mayor", "Mayor (por mayor)"

class TipoCuerpo(models.TextChoices):
    RELOJ_ARENA = "reloj_arena", "Reloj de arena"
    RECTANGULO = "rectangulo", "Rectángulo"
    TRIANGULO = "triangulo", "Triángulo"
    TRIANGULO_INVERTIDO = "triangulo_invertido", "Triángulo invertido"
    OVALO = "ovalo", "Óvalo"
    TODOS = "todos", "Todos los cuerpos"

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
    marca = models.CharField(max_length=80, blank=True, default="", help_text="Marca del producto")
    tipo_venta = models.CharField(max_length=10, choices=TipoVenta.choices, default=TipoVenta.MENOR)
    tipo_cuerpo = models.CharField(max_length=30, choices=TipoCuerpo.choices, default=TipoCuerpo.TODOS)
    popularidad = models.PositiveIntegerField(default=0, help_text="Veces agregado al carrito / comprado")
    calificacion = models.DecimalField(max_digits=3, decimal_places=2, default=0, help_text="Calificación 0-5")
    # CU-05 especificaciones
    tela = models.CharField(max_length=120, blank=True, default="", help_text="Ej: Algodón 100%, Poliéster")
    cuidados = models.CharField(max_length=255, blank=True, default="", help_text="Ej: Lavar a mano, no planchar")
    origen = models.CharField(max_length=80, blank=True, default="", help_text="Ej: Bolivia, Importado")
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


# === CU-05 ===
class ProductoImagen(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name="galeria")
    imagen = models.ImageField(upload_to="productos/galeria/%Y/%m/")
    orden = models.PositiveIntegerField(default=0)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("orden", "id")
        verbose_name = "imagen de producto"
        verbose_name_plural = "galería de productos"


class Sucursal(models.Model):
    nombre = models.CharField(max_length=80, unique=True)
    direccion = models.CharField(max_length=200, blank=True, default="")
    ciudad = models.CharField(max_length=50, blank=True, default="")
    telefono = models.CharField(max_length=30, blank=True, default="")
    horario = models.CharField(max_length=100, blank=True, default="Lun-Sáb 09:00-19:00")
    latitud = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitud = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    activo = models.BooleanField(default=True)

    class Meta:
        ordering = ("nombre",)
        verbose_name = "sucursal"
        verbose_name_plural = "sucursales"

    def __str__(self):
        return self.nombre


class StockSucursal(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name="stock_sucursales")
    sucursal = models.ForeignKey(Sucursal, on_delete=models.CASCADE, related_name="stocks")
    talla = models.CharField(max_length=10, blank=True, default="", help_text="Talla específica, vacío = stock total")
    color = models.CharField(max_length=50, blank=True, default="", help_text="Color específico")
    stock = models.PositiveIntegerField(default=0)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["producto", "sucursal", "talla", "color"], name="unique_stock_sucursal")]
        verbose_name = "stock por sucursal"
        verbose_name_plural = "stocks por sucursal"


class Opinion(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name="opiniones")
    usuario_nombre = models.CharField(max_length=80)
    calificacion = models.PositiveSmallIntegerField()  # 1-5
    comentario = models.TextField(blank=True, default="")
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-creado_en",)
        verbose_name = "opinión"
        verbose_name_plural = "opiniones"


class NotificacionStock(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name="notificaciones_stock")
    email = models.EmailField(max_length=254)
    talla = models.CharField(max_length=10, blank=True, default="")
    color = models.CharField(max_length=50, blank=True, default="")
    creado_en = models.DateTimeField(auto_now_add=True)
    notificado = models.BooleanField(default=False)

    class Meta:
        verbose_name = "notificación de stock"
        verbose_name_plural = "notificaciones de stock"
        constraints = [models.UniqueConstraint(fields=["producto", "email", "talla", "color"], name="unique_notif_stock")]


# === CU-16 Inventario por sucursal ===
class Traslado(models.Model):
    class Estado(models.TextChoices):
        COMPLETADO = "completado", "Completado"
        PENDIENTE = "pendiente", "Pendiente aprobación"

    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name="traslados")
    talla = models.CharField(max_length=10, blank=True, default="")
    color = models.CharField(max_length=50, blank=True, default="")
    origen = models.ForeignKey(Sucursal, on_delete=models.CASCADE, related_name="traslados_origen")
    destino = models.ForeignKey(Sucursal, on_delete=models.CASCADE, related_name="traslados_destino")
    cantidad = models.PositiveIntegerField()
    estado = models.CharField(max_length=20, choices=Estado.choices, default=Estado.COMPLETADO)
    creado_por = models.ForeignKey("users.Usuario", null=True, blank=True, on_delete=models.SET_NULL)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-creado_en",)
        verbose_name = "traslado"
        verbose_name_plural = "traslados"


class Merma(models.Model):
    class Motivo(models.TextChoices):
        DANADO = "danado", "Dañado"
        EXTRAVIADO = "extraviado", "Extraviado"
        VENCIDO = "vencido", "Vencido"
        OTRO = "otro", "Otro"

    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name="mermas")
    sucursal = models.ForeignKey(Sucursal, on_delete=models.CASCADE, related_name="mermas")
    talla = models.CharField(max_length=10, blank=True, default="")
    color = models.CharField(max_length=50, blank=True, default="")
    cantidad = models.PositiveIntegerField()
    motivo = models.CharField(max_length=20, choices=Motivo.choices, default=Motivo.OTRO)
    descripcion = models.CharField(max_length=255, blank=True, default="")
    creado_por = models.ForeignKey("users.Usuario", null=True, blank=True, on_delete=models.SET_NULL)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-creado_en",)
        verbose_name = "merma"
        verbose_name_plural = "mermas"
