from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalog.api.permissions import IsAdminCatalog
from apps.catalog.api.serializers import ProductoSerializer, ProductoWriteSerializer
from apps.catalog.models import Producto
from apps.users.api.responses import success_response


def _catalog_error(message, status_code):
    return Response(
        {"success": False, "message": message, "errors": None},
        status=status_code,
    )


# ---------- Público ----------
class ProductoPublicListView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(responses=ProductoSerializer(many=True))
    def get(self, request):
        queryset = Producto.objects.filter(activo=True)
        # filtros opcionales
        categoria = request.query_params.get("categoria")
        talla = request.query_params.get("talla")
        color = request.query_params.get("color")
        if categoria:
            queryset = queryset.filter(categoria=categoria)
        if talla:
            queryset = queryset.filter(talla=talla)
        if color:
            queryset = queryset.filter(color__iexact=color)
        serializer = ProductoSerializer(queryset, many=True, context={"request": request})
        return success_response(serializer.data)


class ProductoPublicDetailView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(responses=ProductoSerializer)
    def get(self, request, producto_id):
        producto = get_object_or_404(Producto, pk=producto_id, activo=True)
        serializer = ProductoSerializer(producto, context={"request": request})
        return success_response(serializer.data)


# ---------- Admin ----------
class AdminProductoListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminCatalog]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    @extend_schema(responses=ProductoSerializer(many=True))
    def get(self, request):
        productos = Producto.objects.all()
        serializer = ProductoSerializer(productos, many=True, context={"request": request})
        return success_response(serializer.data)

    @extend_schema(request=ProductoWriteSerializer, responses={201: ProductoSerializer})
    def post(self, request):
        serializer = ProductoWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        producto = serializer.save()
        return success_response(
            ProductoSerializer(producto, context={"request": request}).data,
            "Producto creado correctamente.",
            status.HTTP_201_CREATED,
        )


class AdminProductoDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminCatalog]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    @staticmethod
    def _get_producto(producto_id):
        return get_object_or_404(Producto, pk=producto_id)

    @extend_schema(responses=ProductoSerializer)
    def get(self, request, producto_id):
        producto = self._get_producto(producto_id)
        return success_response(ProductoSerializer(producto, context={"request": request}).data)

    def _update(self, request, producto_id, partial):
        producto = self._get_producto(producto_id)
        serializer = ProductoWriteSerializer(producto, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        producto = serializer.save()
        return success_response(
            ProductoSerializer(producto, context={"request": request}).data,
            "Producto actualizado correctamente.",
        )

    @extend_schema(request=ProductoWriteSerializer, responses=ProductoSerializer)
    def put(self, request, producto_id):
        return self._update(request, producto_id, partial=False)

    @extend_schema(request=ProductoWriteSerializer, responses=ProductoSerializer)
    def patch(self, request, producto_id):
        return self._update(request, producto_id, partial=True)

    def delete(self, request, producto_id):
        producto = self._get_producto(producto_id)
        producto.delete()
        return success_response(message="Producto eliminado correctamente.")
