from rest_framework import serializers

from apps.catalog.models import Categoria, Producto, Talla, TipoPrenda


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
    """Serializer de lectura."""

    precio_bs = serializers.SerializerMethodField()
    precio_formateado = serializers.CharField(read_only=True)
    imagen_url = serializers.SerializerMethodField()
    categoria_display = serializers.CharField(source="get_categoria_display", read_only=True)
    talla_display = serializers.CharField(source="get_talla_display", read_only=True)
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
