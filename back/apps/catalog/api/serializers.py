from rest_framework import serializers

from apps.catalog.models import Categoria, Producto, Talla


class ProductoSerializer(serializers.ModelSerializer):
    """Serializer de lectura."""

    precio_bs = serializers.SerializerMethodField()
    precio_formateado = serializers.CharField(read_only=True)
    imagen_url = serializers.SerializerMethodField()
    categoria_display = serializers.CharField(source="get_categoria_display", read_only=True)
    talla_display = serializers.CharField(source="get_talla_display", read_only=True)

    class Meta:
        model = Producto
        fields = (
            "id",
            "nombre",
            "categoria",
            "categoria_display",
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
    """Serializer de escritura - solo admin."""

    nombre = serializers.CharField(max_length=150)
    categoria = serializers.ChoiceField(choices=Categoria.choices)
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
