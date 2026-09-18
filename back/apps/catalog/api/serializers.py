from rest_framework import serializers

from apps.catalog.models import Categoria, Opinion, Producto, ProductoImagen, StockSucursal, Sucursal, Talla, TipoCuerpo, TipoPrenda, TipoVenta


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ("id", "nombre", "slug", "descripcion", "activo", "creado_en")
        read_only_fields = ("id", "creado_en")


class CategoriaWriteSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(max_length=50)
    slug = serializers.SlugField(max_length=50, required=False)
    descripcion = serializers.CharField(max_length=200, required=False, allow_blank=True, default="")
    activo = serializers.BooleanField(required=False, default=True)

    class Meta:
        model = Categoria
        fields = ("id", "nombre", "slug", "descripcion", "activo")
        read_only_fields = ("id",)

    def validate_nombre(self, value):
        qs = Categoria.objects.filter(nombre__iexact=value.strip())
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Ya existe una categoría con ese nombre.")
        return value.strip()

    def validate_slug(self, value):
        if not value:
            return value
        value = value.lower().strip()
        qs = Categoria.objects.filter(slug=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Ya existe una categoría con ese slug.")
        return value

    def create(self, validated_data):
        if not validated_data.get("slug"):
            validated_data["slug"] = validated_data["nombre"].lower().replace(" ", "-")
        return super().create(validated_data)


class ProductoSerializer(serializers.ModelSerializer):
    """Serializer de lectura - CU-04 con campos extendidos."""

    precio_bs = serializers.SerializerMethodField()
    precio_formateado = serializers.CharField(read_only=True)
    imagen_url = serializers.SerializerMethodField()
    categoria_display = serializers.CharField(source="get_categoria_display", read_only=True)
    talla_display = serializers.CharField(source="get_talla_display", read_only=True)
    tipo_venta_display = serializers.CharField(source="get_tipo_venta_display", read_only=True)
    tipo_cuerpo_display = serializers.CharField(source="get_tipo_cuerpo_display", read_only=True)
    categorias = CategoriaSerializer(many=True, read_only=True)

    class Meta:
        model = Producto
        fields = (
            "id",
            "nombre",
            "categoria",
            "categoria_display",
            "categorias",
            "descripcion",
            "detalle",
            "color",
            "talla",
            "talla_display",
            "marca",
            "tipo_venta",
            "tipo_venta_display",
            "tipo_cuerpo",
            "tipo_cuerpo_display",
            "popularidad",
            "calificacion",
            "precio_centavos",
            "precio_bs",
            "precio_formateado",
            "stock",
            "imagen",
            "imagen_url",
            "activo",
            "creado_en",
            "actualizado_en",
        )
        read_only_fields = fields

    def get_precio_bs(self, obj):
        return obj.precio_bs

    def get_imagen_url(self, obj):
        if obj.imagen:
            request = self.context.get("request")
            url = obj.imagen.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None


class ProductoImagenSerializer(serializers.ModelSerializer):
    imagen_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductoImagen
        fields = ("id", "imagen", "imagen_url", "orden")

    def get_imagen_url(self, obj):
        if obj.imagen:
            request = self.context.get("request")
            url = obj.imagen.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None


class SucursalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sucursal
        fields = ("id", "nombre", "direccion", "ciudad")


class StockSucursalSerializer(serializers.ModelSerializer):
    sucursal = SucursalSerializer(read_only=True)
    sucursal_nombre = serializers.CharField(source="sucursal.nombre", read_only=True)

    class Meta:
        model = StockSucursal
        fields = ("id", "sucursal", "sucursal_nombre", "stock", "actualizado_en")


class OpinionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Opinion
        fields = ("id", "usuario_nombre", "calificacion", "comentario", "creado_en")


class ProductoDetailSerializer(ProductoSerializer):
    """CU-05 detalle completo."""
    galeria = ProductoImagenSerializer(many=True, read_only=True)
    imagenes_urls = serializers.SerializerMethodField()
    tallas_por_color = serializers.SerializerMethodField()
    stock_por_sucursal = StockSucursalSerializer(source="stock_sucursales", many=True, read_only=True)
    opiniones = OpinionSerializer(many=True, read_only=True)
    opiniones_count = serializers.SerializerMethodField()
    promedio_calificacion = serializers.SerializerMethodField()
    especificaciones = serializers.SerializerMethodField()

    class Meta(ProductoSerializer.Meta):
        fields = ProductoSerializer.Meta.fields + (
            "galeria",
            "imagenes_urls",
            "tela",
            "cuidados",
            "origen",
            "especificaciones",
            "tallas_por_color",
            "stock_por_sucursal",
            "opiniones",
            "opiniones_count",
            "promedio_calificacion",
        )

    def get_imagenes_urls(self, obj):
        request = self.context.get("request")
        urls = []
        if obj.imagen:
            urls.append(self.get_imagen_url(obj))
        for img in obj.galeria.all():
            if img.imagen:
                url = img.imagen.url
                if request:
                    url = request.build_absolute_uri(url)
                urls.append(url)
        return urls

    def get_tallas_por_color(self, obj):
        # Variantes con mismo nombre base (agrupar por producto que comparte nombre)
        variants = Producto.objects.filter(nombre=obj.nombre, activo=True).values("color", "talla", "stock")
        # Estructura {color: [{talla, stock}]}
        from collections import defaultdict
        grouped = defaultdict(list)
        for v in variants:
            grouped[v["color"]].append({"talla": v["talla"], "stock": v["stock"]})
        # ordenar tallas
        orden = ["XS","S","M","L","XL","XXL","UNICA","32","34","36","38","40","42","44","46"]
        for col in grouped:
            grouped[col].sort(key=lambda x: orden.index(x["talla"]) if x["talla"] in orden else 99)
        return dict(grouped)

    def get_opiniones_count(self, obj):
        return obj.opiniones.count()

    def get_promedio_calificacion(self, obj):
        qs = obj.opiniones.all()
        if not qs.exists():
            return float(obj.calificacion) if obj.calificacion else 0
        total = sum(o.calificacion for o in qs)
        return round(total / qs.count(), 2)

    def get_especificaciones(self, obj):
        return {
            "tela": obj.tela or "No especificado",
            "cuidados": obj.cuidados or "Lavar según etiqueta",
            "origen": obj.origen or "No especificado",
            "marca": obj.marca or "Genérico",
            "tipo_cuerpo": obj.get_tipo_cuerpo_display(),
            "tipo_venta": obj.get_tipo_venta_display(),
        }


class OpinionWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Opinion
        fields = ("id", "usuario_nombre", "calificacion", "comentario")
        read_only_fields = ("id",)

    def validate_calificacion(self, v):
        if not 1 <= v <= 5:
            raise serializers.ValidationError("Calificación debe ser 1-5")
        return v


class NotificacionStockSerializer(serializers.Serializer):
    email = serializers.EmailField()
    talla = serializers.CharField(max_length=10, required=False, allow_blank=True, default="")
    color = serializers.CharField(max_length=50, required=False, allow_blank=True, default="")


class ProductoWriteSerializer(serializers.ModelSerializer):
    """Serializer de escritura - solo admin. Soporta M2M vía categoria_ids."""

    nombre = serializers.CharField(max_length=150)
    categoria = serializers.ChoiceField(choices=TipoPrenda.choices, required=False, default=TipoPrenda.VESTIDOS)
    categoria_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        required=False,
        allow_empty=True,
        write_only=True,
        help_text="IDs de categorías (niña, adolescente, adulta)",
    )
    descripcion = serializers.CharField(required=False, allow_blank=True, default="")
    detalle = serializers.CharField(required=False, allow_blank=True, default="")
    color = serializers.CharField(max_length=50)
    talla = serializers.ChoiceField(choices=Talla.choices)
    marca = serializers.CharField(max_length=80, required=False, allow_blank=True, default="")
    tipo_venta = serializers.ChoiceField(choices=TipoVenta.choices, required=False, default=TipoVenta.MENOR)
    tipo_cuerpo = serializers.ChoiceField(choices=TipoCuerpo.choices, required=False, default=TipoCuerpo.TODOS)
    popularidad = serializers.IntegerField(min_value=0, required=False, default=0)
    calificacion = serializers.DecimalField(max_digits=3, decimal_places=2, min_value=0, max_value=5, required=False, default=0)
    precio_centavos = serializers.IntegerField(min_value=100, help_text="Precio en centavos Bs, mínimo 100 (1 Bs)")
    stock = serializers.IntegerField(min_value=0, required=False, default=0)
    imagen = serializers.ImageField(required=False, allow_null=True)
    activo = serializers.BooleanField(required=False, default=True)

    class Meta:
        model = Producto
        fields = (
            "id",
            "nombre",
            "categoria",
            "categoria_ids",
            "descripcion",
            "detalle",
            "color",
            "talla",
            "marca",
            "tipo_venta",
            "tipo_cuerpo",
            "popularidad",
            "calificacion",
            "precio_centavos",
            "stock",
            "imagen",
            "activo",
        )
        read_only_fields = ("id",)

    def validate_precio_centavos(self, value):
        if value < 100:
            raise serializers.ValidationError("El precio mínimo es 1.00 Bs (100 centavos).")
        return value

    def validate_categoria_ids(self, value):
        if not value:
            return value
        # eliminar duplicados
        value = list(dict.fromkeys(value))
        existing = set(Categoria.objects.filter(id__in=value).values_list("id", flat=True))
        missing = set(value) - existing
        if missing:
            raise serializers.ValidationError(f"Categorías no encontradas: {missing}")
        return value

    def create(self, validated_data):
        categoria_ids = validated_data.pop("categoria_ids", [])
        producto = super().create(validated_data)
        if categoria_ids:
            producto.categorias.set(categoria_ids)
        return producto

    def update(self, instance, validated_data):
        categoria_ids = validated_data.pop("categoria_ids", None)
        producto = super().update(instance, validated_data)
        if categoria_ids is not None:
            producto.categorias.set(categoria_ids)
        return producto
