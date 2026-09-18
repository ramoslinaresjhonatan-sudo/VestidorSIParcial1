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
    NotificacionStockSerializer,
    OpinionSerializer,
    OpinionWriteSerializer,
    ProductoDetailSerializer,
    ProductoSerializer,
    ProductoWriteSerializer,
)
from apps.catalog.models import Categoria, NotificacionStock, Producto
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
        # Filtros CU-04
        tipo = request.query_params.get("categoria") or request.query_params.get("modelo")
        talla = request.query_params.get("talla")
        color = request.query_params.get("color")
        marca = request.query_params.get("marca")
        tipo_venta = request.query_params.get("tipo_venta")
        tipo_cuerpo = request.query_params.get("tipo_cuerpo")
        categoria_id = request.query_params.get("categoria_id")
        search = request.query_params.get("search") or request.query_params.get("q")

        # Precios: soporte precio_min/max en Bs o centavos
        precio_min = request.query_params.get("precio_min") or request.query_params.get("precio_desde")
        precio_max = request.query_params.get("precio_max") or request.query_params.get("precio_hasta")

        def _to_centavos(v):
            if v is None or v == "":
                return None
            try:
                f = float(str(v).replace(",", "."))
                # si valor > 10000 asumimos centavos, si no Bs
                # heurística: si tiene decimales o < 5000 es Bs, convertir
                if f < 10000:
                    return int(round(f * 100))
                return int(f)
            except:  # noqa: E722
                return None

        # Aplicar filtros
        if tipo:
            # permite múltiples valores separados por coma
            vals = [x.strip() for x in tipo.split(",") if x.strip()]
            if len(vals) == 1:
                queryset = queryset.filter(categoria=vals[0])
            elif vals:
                queryset = queryset.filter(categoria__in=vals)
        if talla:
            vals = [x.strip() for x in talla.split(",") if x.strip()]
            if len(vals) == 1:
                queryset = queryset.filter(talla=vals[0])
            elif vals:
                queryset = queryset.filter(talla__in=vals)
        if color:
            vals = [x.strip() for x in color.split(",") if x.strip()]
            if len(vals) == 1:
                queryset = queryset.filter(color__iexact=vals[0])
            elif vals:
                from django.db.models import Q
                q = Q()
                for v in vals:
                    q |= Q(color__iexact=v)
                queryset = queryset.filter(q)
        if marca:
            vals = [x.strip() for x in marca.split(",") if x.strip()]
            if len(vals) == 1:
                queryset = queryset.filter(marca__iexact=vals[0])
            elif vals:
                from django.db.models import Q
                q = Q()
                for v in vals:
                    q |= Q(marca__iexact=v)
                queryset = queryset.filter(q)
        if tipo_venta:
            queryset = queryset.filter(tipo_venta=tipo_venta)
        if tipo_cuerpo:
            # 'todos' significa no filtrar; si perfil sugiere tipo_cuerpo, se pasa exacto
            if tipo_cuerpo != "todos":
                queryset = queryset.filter(tipo_cuerpo__in=[tipo_cuerpo, "todos"])
        if categoria_id:
            vals = [x.strip() for x in str(categoria_id).split(",") if x.strip()]
            queryset = queryset.filter(categorias__id__in=vals)
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(nombre__icontains=search) | Q(descripcion__icontains=search) | Q(marca__icontains=search) | Q(color__icontains=search)
            )
        p_min = _to_centavos(precio_min)
        p_max = _to_centavos(precio_max)
        if p_min is not None:
            queryset = queryset.filter(precio_centavos__gte=p_min)
        if p_max is not None:
            queryset = queryset.filter(precio_centavos__lte=p_max)

        # Ordenamiento CU-04
        ordering = request.query_params.get("ordering") or request.query_params.get("orden") or "-creado_en"
        ordering_map = {
            "popularidad": "-popularidad",
            "-popularidad": "-popularidad",
            "precio": "precio_centavos",
            "precio_asc": "precio_centavos",
            "-precio": "-precio_centavos",
            "precio_desc": "-precio_centavos",
            "novedad": "-creado_en",
            "-novedad": "-creado_en",
            "calificacion": "-calificacion",
            "-calificacion": "-calificacion",
            "creado_en": "-creado_en",
            "-creado_en": "-creado_en",
        }
        # permite múltiples orderings separados por coma
        order_fields = []
        for o in ordering.split(","):
            o = o.strip()
            if not o:
                continue
            mapped = ordering_map.get(o, o)
            order_fields.append(mapped)
        if order_fields:
            queryset = queryset.order_by(*order_fields)

        serializer = ProductoSerializer(queryset.distinct(), many=True, context={"request": request})
        return success_response(serializer.data)


class ProductoFilterOptionsView(APIView):
    """Opciones disponibles para filtros CU-04."""
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        from apps.catalog.models import TipoCuerpo, TipoVenta
        qs = Producto.objects.filter(activo=True)
        colores = sorted(set(qs.exclude(color="").values_list("color", flat=True)))
        marcas = sorted(set(qs.exclude(marca="").values_list("marca", flat=True)))
        tallas = sorted(set(qs.values_list("talla", flat=True)))
        tipos_venta = [c[0] for c in TipoVenta.choices]
        tipos_cuerpo = [c[0] for c in TipoCuerpo.choices]
        modelos = [c[0] for c in qs.model._meta.get_field("categoria").choices]  # TipoPrenda
        # Precios extremos
        from django.db.models import Max, Min
        agg = qs.aggregate(min_precio=Min("precio_centavos"), max_precio=Max("precio_centavos"))
        return success_response({
            "colores": colores,
            "marcas": marcas,
            "tallas": tallas,
            "tipos_venta": tipos_venta,
            "tipos_cuerpo": tipos_cuerpo,
            "modelos": modelos,
            "precio_min_centavos": agg["min_precio"],
            "precio_max_centavos": agg["max_precio"],
            "precio_min_bs": (agg["min_precio"] or 0) / 100 if agg["min_precio"] else 0,
            "precio_max_bs": (agg["max_precio"] or 0) / 100 if agg["max_precio"] else 0,
        })


class ProductoPublicDetailView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(responses=ProductoDetailSerializer)
    def get(self, request, producto_id):
        producto = get_object_or_404(
            Producto.objects.prefetch_related("categorias", "galeria", "stock_sucursales__sucursal", "opiniones"),
            pk=producto_id,
            activo=True,
        )
        serializer = ProductoDetailSerializer(producto, context={"request": request})
        return success_response(serializer.data)


class ProductoOpinionListCreateView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(responses=OpinionSerializer(many=True))
    def get(self, request, producto_id):
        producto = get_object_or_404(Producto, pk=producto_id, activo=True)
        qs = producto.opiniones.all()
        return success_response(OpinionSerializer(qs, many=True).data)

    @extend_schema(request=OpinionWriteSerializer, responses={201: OpinionSerializer})
    def post(self, request, producto_id):
        producto = get_object_or_404(Producto, pk=producto_id, activo=True)
        ser = OpinionWriteSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        opinion = ser.save(producto=producto)
        # recalcular calificación promedio
        from django.db.models import Avg
        avg = producto.opiniones.aggregate(avg=Avg("calificacion"))["avg"] or 0
        producto.calificacion = round(avg, 2)
        producto.save(update_fields=["calificacion"])
        return success_response(OpinionSerializer(opinion).data, "Opinión registrada.", status.HTTP_201_CREATED)


class ProductoNotifyStockView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(request=NotificacionStockSerializer, responses={201: None})
    def post(self, request, producto_id):
        producto = get_object_or_404(Producto, pk=producto_id, activo=True)
        if producto.stock > 0:
            return _catalog_error("El producto aún tiene stock disponible.", status.HTTP_400_BAD_REQUEST)
        ser = NotificacionStockSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        obj, created = NotificacionStock.objects.get_or_create(
            producto=producto,
            email=ser.validated_data["email"].lower(),
            talla=ser.validated_data.get("talla", ""),
            color=ser.validated_data.get("color", ""),
        )
        if not created:
            return success_response(message="Ya estás suscrito para esta variante.")
        return success_response(message="Te notificaremos cuando llegue stock.", status_code=status.HTTP_201_CREATED)


class ProductoDisponibilidadView(APIView):
    """CU-06: disponibilidad por sucursal con detalle talla/color, geolocalización y tiempo estimado."""
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(responses={200: None})
    def get(self, request, producto_id):
        producto = get_object_or_404(Producto, pk=producto_id, activo=True)
        talla = request.query_params.get("talla", "").strip()
        color = request.query_params.get("color", "").strip()
        lat = request.query_params.get("lat")
        lon = request.query_params.get("lon")
        try:
            lat_f = float(lat) if lat not in (None, "") else None
            lon_f = float(lon) if lon not in (None, "") else None
        except:
            lat_f = lon_f = None

        from math import radians, sin, cos, sqrt, atan2

        def haversine(lat1, lon1, lat2, lon2):
            R = 6371
            dlat = radians(lat2 - lat1)
            dlon = radians(lon2 - lon1)
            a = sin(dlat/2)**2 + cos(radians(lat1))*cos(radians(lat2))*sin(dlon/2)**2
            return R * 2 * atan2(sqrt(a), sqrt(1-a))

        sucursales = []
        solo_almacen = True
        has_store_stock = False
        for suc in producto.stock_sucursales.select_related("sucursal").all():
            # agrupado por sucursal: calcular stock filtrado y detalle
            pass
        # Reagrupar por sucursal
        from collections import defaultdict
        grouped = defaultdict(list)
        for ss in producto.stock_sucursales.select_related("sucursal").all():
            grouped[ss.sucursal].append(ss)

        result = []
        for sucursal, stocks in grouped.items():
            # Si filtro talla/color, buscar stock específico
            stock_filtrado = None
            detalle = []
            for ss in stocks:
                if ss.talla == "" and ss.color == "":
                    continue
                detalle.append({"talla": ss.talla, "color": ss.color, "stock": ss.stock})
                if talla and color:
                    if ss.talla == talla and ss.color.lower() == color.lower():
                        stock_filtrado = ss.stock
                elif talla and not color:
                    if ss.talla == talla:
                        stock_filtrado = (stock_filtrado or 0) + ss.stock
                elif color and not talla:
                    if ss.color.lower() == color.lower():
                        stock_filtrado = (stock_filtrado or 0) + ss.stock
            # stock total filtrado o suma general
            if stock_filtrado is None:
                if talla or color:
                    stock_filtrado = 0
                    # si no hay detalle matching, stock 0
                    if detalle:
                        # ya calculado
                        pass
                    else:
                        stock_filtrado = 0
                else:
                    # sin filtro: sumar todos variantes (excluyendo row vacío)
                    stock_filtrado = sum(s.stock for s in stocks if not (s.talla == "" and s.color == ""))
                    # fallback a stock total producto si no hay variantes
                    if stock_filtrado == 0:
                        stock_filtrado = sum(s.stock for s in stocks)
            # Marcar solo_almacen: si sucursal no es almacén y tiene stock >0 => no solo almacén
            is_almacen = "almacén" in sucursal.nombre.lower() or "almacen" in sucursal.nombre.lower()
            if not is_almacen and stock_filtrado > 0:
                solo_almacen = False
                has_store_stock = True
            if is_almacen and stock_filtrado > 0:
                has_store_stock = True

            dist = None
            tiempo = None
            if lat_f is not None and lon_f is not None and sucursal.latitud is not None and sucursal.longitud is not None:
                try:
                    dist = haversine(lat_f, lon_f, float(sucursal.latitud), float(sucursal.longitud))
                    tiempo = int(round((dist / 30) * 60))  # 30 km/h
                except:
                    dist = None

            result.append({
                "id": sucursal.id,
                "nombre": sucursal.nombre,
                "direccion": sucursal.direccion,
                "ciudad": sucursal.ciudad,
                "telefono": sucursal.telefono,
                "horario": sucursal.horario,
                "latitud": float(sucursal.latitud) if sucursal.latitud is not None else None,
                "longitud": float(sucursal.longitud) if sucursal.longitud is not None else None,
                "stock": stock_filtrado,
                "detalle_por_talla_color": detalle,
                "distance_km": round(dist, 2) if dist is not None else None,
                "tiempo_estimado_min": tiempo,
            })

        # Ordenar por distancia si hay geolocalización, sino por stock desc
        if lat_f is not None:
            result.sort(key=lambda x: (x["distance_km"] is None, x["distance_km"] if x["distance_km"] is not None else 9999))
        else:
            result.sort(key=lambda x: (-x["stock"], x["nombre"]))

        # Si solo almacén tiene stock
        solo_almacen_flag = solo_almacen and has_store_stock and not any(r["stock"] > 0 and "almacén" not in r["nombre"].lower() and "almacen" not in r["nombre"].lower() for r in result)

        return success_response({
            "producto_id": producto.id,
            "producto_nombre": producto.nombre,
            "filtros": {"talla": talla, "color": color},
            "solo_almacen": solo_almacen_flag,
            "sucursales": result,
        })


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
