from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalog.api.permissions import IsAdminCatalog
from apps.catalog.api.serializers import (
    CategoriaSerializer,
    CategoriaWriteSerializer,
    ProductoSerializer,
    ProductoWriteSerializer,
)
from apps.catalog.models import Categoria, Producto
from apps.users.api.responses import success_response


def _catalog_error(message, status_code):
    return Response(
        {"success": False, "message": message, "errors": None},
        status=status_code,
    )


# ---------- Categorías ----------
class CategoriaPublicListView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(responses=CategoriaSerializer(many=True))
    def get(self, request):
        qs = Categoria.objects.filter(activo=True)
        return success_response(CategoriaSerializer(qs, many=True).data)


class CategoriaAdminListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminCatalog]

    @extend_schema(responses=CategoriaSerializer(many=True))
    def get(self, request):
        qs = Categoria.objects.all()
        return success_response(CategoriaSerializer(qs, many=True).data)

    @extend_schema(request=CategoriaWriteSerializer, responses={201: CategoriaSerializer})
    def post(self, request):
        ser = CategoriaWriteSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        cat = ser.save()
        return success_response(CategoriaSerializer(cat).data, "Categoría creada correctamente.", status.HTTP_201_CREATED)


class CategoriaAdminDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminCatalog]

    @staticmethod
    def _get(pk):
        return get_object_or_404(Categoria, pk=pk)

    @extend_schema(responses=CategoriaSerializer)
    def get(self, request, categoria_id):
        return success_response(CategoriaSerializer(self._get(categoria_id)).data)

    @extend_schema(request=CategoriaWriteSerializer, responses=CategoriaSerializer)
    def patch(self, request, categoria_id):
        cat = self._get(categoria_id)
        ser = CategoriaWriteSerializer(cat, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        cat = ser.save()
        return success_response(CategoriaSerializer(cat).data, "Categoría actualizada.")

    @extend_schema(request=CategoriaWriteSerializer, responses=CategoriaSerializer)
    def put(self, request, categoria_id):
        cat = self._get(categoria_id)
        ser = CategoriaWriteSerializer(cat, data=request.data)
        ser.is_valid(raise_exception=True)
        cat = ser.save()
        return success_response(CategoriaSerializer(cat).data, "Categoría actualizada.")

    def delete(self, request, categoria_id):
        cat = self._get(categoria_id)
        if cat.productos.exists():
            return _catalog_error("No se puede eliminar: hay productos usando esta categoría.", status.HTTP_409_CONFLICT)
        cat.delete()
        return success_response(message="Categoría eliminada.")


# ---------- Productos Público ----------
class ProductoPublicListView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(responses=ProductoSerializer(many=True))
    def get(self, request):
        queryset = Producto.objects.filter(activo=True).prefetch_related("categorias")
        tipo = request.query_params.get("categoria")  # compat: tipo prenda vestidos etc
        talla = request.query_params.get("talla")
        color = request.query_params.get("color")
        categoria_id = request.query_params.get("categoria_id")
        if tipo:
            queryset = queryset.filter(categoria=tipo)
        if talla:
            queryset = queryset.filter(talla=talla)
        if color:
            queryset = queryset.filter(color__iexact=color)
        if categoria_id:
            queryset = queryset.filter(categorias__id=categoria_id)
        serializer = ProductoSerializer(queryset.distinct(), many=True, context={"request": request})
        return success_response(serializer.data)


class ProductoPublicDetailView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(responses=ProductoSerializer)
    def get(self, request, producto_id):
        producto = get_object_or_404(Producto.objects.prefetch_related("categorias"), pk=producto_id, activo=True)
        serializer = ProductoSerializer(producto, context={"request": request})
        return success_response(serializer.data)


# ---------- Productos Admin ----------
class AdminProductoListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminCatalog]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    @extend_schema(responses=ProductoSerializer(many=True))
    def get(self, request):
        productos = Producto.objects.all().prefetch_related("categorias")
        serializer = ProductoSerializer(productos, many=True, context={"request": request})
        return success_response(serializer.data)

    @extend_schema(request=ProductoWriteSerializer, responses={201: ProductoSerializer})
    def post(self, request):
        # Soporta categoria_ids como "1,2,3" o lista, y multipart
        data = request.data.copy()
        # Normalizar categoria_ids si viene como string
        if "categoria_ids" in data and isinstance(data.get("categoria_ids"), str):
            val = data.get("categoria_ids", "")
            if val:
                data.setlist("categoria_ids", [v.strip() for v in val.split(",") if v.strip()])
        # Si viene como JSON stringificado
        serializer = ProductoWriteSerializer(data=data)
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
        return get_object_or_404(Producto.objects.prefetch_related("categorias"), pk=producto_id)

    @extend_schema(responses=ProductoSerializer)
    def get(self, request, producto_id):
        producto = self._get_producto(producto_id)
        return success_response(ProductoSerializer(producto, context={"request": request}).data)

    def _update(self, request, producto_id, partial):
        producto = self._get_producto(producto_id)
        data = request.data.copy() if hasattr(request.data, "copy") else dict(request.data)
        # Normalizar categoria_ids si es string
        if isinstance(data, dict) and "categoria_ids" in data and isinstance(data["categoria_ids"], str):
            val = data["categoria_ids"]
            data["categoria_ids"] = [v.strip() for v in val.split(",") if v.strip()] if val else []
        elif hasattr(data, "get") and "categoria_ids" in data and isinstance(data.get("categoria_ids"), str):
            val = data.get("categoria_ids")
            try:
                data.setlist("categoria_ids", [v.strip() for v in val.split(",") if v.strip()] if val else [])
            except Exception:
                pass
        serializer = ProductoWriteSerializer(producto, data=data, partial=partial)
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
