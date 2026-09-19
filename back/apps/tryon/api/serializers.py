from rest_framework import serializers
from apps.tryon.models import PruebaGuardada

class PruebaGuardadaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PruebaGuardada
        fields = ("id", "usuario", "producto", "talla", "color", "captura", "creado_en")
        read_only_fields = ("id", "usuario", "creado_en")

class PruebaCreateSerializer(serializers.Serializer):
    producto_id = serializers.IntegerField()
    talla = serializers.CharField(max_length=10, required=False, allow_blank=True, default="")
    color = serializers.CharField(max_length=50, required=False, allow_blank=True, default="")
    captura_base64 = serializers.CharField(required=False, allow_blank=True, default="")
    captura = serializers.ImageField(required=False, allow_null=True)
