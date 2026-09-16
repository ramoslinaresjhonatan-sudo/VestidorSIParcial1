from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.cart.api.serializers import CartSerializer, CartItemUpdateSerializer, CartItemCreateSerializer, CouponApplySerializer
from apps.cart.models import Cart, CartItem, Coupon
from apps.catalog.models import Producto
from apps.users.api.responses import success_response

def _get_or_create_cart(user):
    cart, _ = Cart.objects.get_or_create(usuario=user)
    return cart

def _alternativas(producto):
    # sugiere alternativas mismo tipo/categoria si sin stock
    qs = Producto.objects.filter(activo=True, categoria=producto.categoria).exclude(pk=producto.pk)[:3]
    return [{"id": p.id, "nombre": p.nombre, "talla": p.talla, "color": p.color, "precio_formateado": p.precio_formateado} for p in qs]

class CartView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses=CartSerializer)
    def get(self, request):
        cart = _get_or_create_cart(request.user)
        # prefetch
        cart = Cart.objects.prefetch_related("items__producto__categorias", "coupon").get(pk=cart.pk)
        return success_response(CartSerializer(cart).data)

class CartItemCreateView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=CartItemCreateSerializer, responses=CartSerializer)
    def post(self, request):
        ser = CartItemCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        producto = get_object_or_404(Producto, pk=ser.validated_data["producto_id"], activo=True)
        talla = ser.validated_data["talla"]
        color = ser.validated_data["color"].strip()
        cantidad = ser.validated_data["cantidad"]

        # verifica stock
        if producto.stock < cantidad:
            return Response({"success": False, "message": "Sin stock disponible.", "errors": None, "alternativas": _alternativas(producto)}, status=status.HTTP_409_CONFLICT)

        # precio: si producto en oferta? usa precio actual; si futuro oferta se puede aplicar promo
        precio = producto.precio_centavos

        cart = _get_or_create_cart(request.user)
        with transaction.atomic():
            item, created = CartItem.objects.get_or_create(
                cart=cart, producto=producto, talla=talla, color=color,
                defaults={"cantidad": cantidad, "precio_centavos": precio}
            )
            if not created:
                nueva_cant = item.cantidad + cantidad
                if producto.stock < nueva_cant:
                    return Response({"success": False, "message": "Sin stock suficiente para esa cantidad.", "errors": None, "alternativas": _alternativas(producto)}, status=status.HTTP_409_CONFLICT)
                item.cantidad = nueva_cant
                item.save(update_fields=["cantidad","actualizado_en"])

        cart = Cart.objects.prefetch_related("items__producto__categorias","coupon").get(pk=cart.pk)
        # muestra precio promocional si aplica (ejemplo: si producto tiene descuento futuro, aquí se calcularía)
        return success_response(CartSerializer(cart).data, "Producto agregado al carrito.", status.HTTP_201_CREATED)

class CartItemDetailView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=CartItemUpdateSerializer, responses=CartSerializer)
    def patch(self, request, item_id):
        cart = _get_or_create_cart(request.user)
        item = get_object_or_404(CartItem, pk=item_id, cart=cart)
        ser = CartItemUpdateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        # si cambia talla/color, verificar que no duplique variante
        nueva_talla = data.get("talla", item.talla)
        nuevo_color = data.get("color", item.color).strip() if "color" in data else item.color
        nueva_cantidad = data.get("cantidad", item.cantidad)

        # verifica stock del producto
        if item.producto.stock < nueva_cantidad:
            return Response({"success": False, "message": "Sin stock suficiente.", "errors": None, "alternativas": _alternativas(item.producto)}, status=status.HTTP_409_CONFLICT)

        # si cambia variante, verificar duplicado
        if (nueva_talla != item.talla or nuevo_color != item.color):
            if CartItem.objects.filter(cart=cart, producto=item.producto, talla=nueva_talla, color=nuevo_color).exclude(pk=item.pk).exists():
                return Response({"success": False, "message": "Ya existe ese producto con esa talla/color en el carrito.", "errors": None}, status=status.HTTP_409_CONFLICT)

        for field, val in data.items():
            if field == "color":
                val = val.strip()
            setattr(item, field, val)
        item.save()

        cart = Cart.objects.prefetch_related("items__producto__categorias","coupon").get(pk=cart.pk)
        return success_response(CartSerializer(cart).data, "Carrito actualizado.")

    def delete(self, request, item_id):
        cart = _get_or_create_cart(request.user)
        item = get_object_or_404(CartItem, pk=item_id, cart=cart)
        item.delete()
        cart = Cart.objects.prefetch_related("items__producto__categorias","coupon").get(pk=cart.pk)
        return success_response(CartSerializer(cart).data, "Producto eliminado.")

class CouponApplyView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=CouponApplySerializer, responses=CartSerializer)
    def post(self, request):
        ser = CouponApplySerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        codigo = ser.validated_data["codigo"].strip().upper()
        coupon = Coupon.objects.filter(codigo__iexact=codigo, activo=True).first()
        if not coupon:
            return Response({"success": False, "message": "Cupón inválido.", "errors": {"codigo": ["Cupón no existe o está inactivo."]}}, status=status.HTTP_400_BAD_REQUEST)
        if coupon.expira_en and coupon.expira_en < timezone.now():
            return Response({"success": False, "message": "Cupón expirado.", "errors": None}, status=status.HTTP_400_BAD_REQUEST)
        if coupon.usos_max and coupon.usos_actual >= coupon.usos_max:
            return Response({"success": False, "message": "Cupón sin usos disponibles.", "errors": None}, status=status.HTTP_400_BAD_REQUEST)

        cart = _get_or_create_cart(request.user)
        cart.coupon = coupon
        cart.save(update_fields=["coupon","actualizado_en"])
        cart = Cart.objects.prefetch_related("items__producto__categorias","coupon").get(pk=cart.pk)
        return success_response(CartSerializer(cart).data, "Cupón aplicado correctamente.")

    def delete(self, request):
        cart = _get_or_create_cart(request.user)
        cart.coupon = None
        cart.save(update_fields=["coupon","actualizado_en"])
        cart = Cart.objects.prefetch_related("items__producto__categorias","coupon").get(pk=cart.pk)
        return success_response(CartSerializer(cart).data, "Cupón removido.")
