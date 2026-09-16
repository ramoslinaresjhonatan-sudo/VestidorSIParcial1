from rest_framework import serializers
from apps.cart.models import Cart, CartItem, Coupon
from apps.catalog.api.serializers import ProductoSerializer
from apps.catalog.models import Talla

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ("id","codigo","tipo","valor","activo","expira_en")

class CartItemSerializer(serializers.ModelSerializer):
    producto = ProductoSerializer(read_only=True)
    producto_id = serializers.IntegerField(write_only=True)
    subtotal_centavos = serializers.IntegerField(read_only=True)
    precio_bs = serializers.FloatField(read_only=True)

    class Meta:
        model = CartItem
        fields = ("id","cart","producto","producto_id","talla","color","cantidad","precio_centavos","precio_bs","subtotal_centavos","creado_en")
        read_only_fields = ("id","cart","precio_centavos","creado_en")

    def validate_cantidad(self, value):
        if value < 1:
            raise serializers.ValidationError("La cantidad mínima es 1.")
        if value > 99:
            raise serializers.ValidationError("Máximo 99 unidades.")
        return value

class CartItemCreateSerializer(serializers.Serializer):
    producto_id = serializers.IntegerField()
    talla = serializers.ChoiceField(choices=Talla.choices)
    color = serializers.CharField(max_length=50)
    cantidad = serializers.IntegerField(min_value=1, max_value=99, default=1)

class CartItemUpdateSerializer(serializers.Serializer):
    cantidad = serializers.IntegerField(min_value=1, max_value=99, required=False)
    talla = serializers.ChoiceField(choices=Talla.choices, required=False)
    color = serializers.CharField(max_length=50, required=False)

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError("Debe enviar al menos un campo.")
        return attrs

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    subtotal_centavos = serializers.IntegerField(read_only=True)
    descuento_centavos = serializers.IntegerField(read_only=True)
    total_centavos = serializers.IntegerField(read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    coupon = CouponSerializer(read_only=True)

    class Meta:
        model = Cart
        fields = ("id","usuario","coupon","items","subtotal_centavos","descuento_centavos","total_centavos","total_items","actualizado_en")
        read_only_fields = fields

class CouponApplySerializer(serializers.Serializer):
    codigo = serializers.CharField(max_length=30)
