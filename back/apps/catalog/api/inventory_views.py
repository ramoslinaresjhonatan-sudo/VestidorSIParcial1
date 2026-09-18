from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalog.models import Merma, Producto, StockSucursal, Sucursal, Traslado
from apps.users.api.responses import success_response


def _get_allowed_sucursal(user, requested_id=None):
    """Vendedor solo ve su sucursal asignada. Superuser ve todo."""
    # Vendedor con sucursal asignada siempre restringido (aunque sea staff)
    if user.sucursal_id and not user.is_superuser:
        return user.sucursal
    if user.is_superuser:
        if requested_id:
            return get_object_or_404(Sucursal, pk=requested_id)
        return None
    # staff sin sucursal (admin) ve todo
    if requested_id:
        return get_object_or_404(Sucursal, pk=requested_id)
    return None

def _catalog_error(msg, code):
    return Response({"success": False, "message": msg, "errors": None}, status=code)

def _can_manage_inventory(user):
    # CU-16: solo administrador (superuser) o vendedor (sucursal asignada o grupo vendedor). Cajero/cliente no.
    if user.groups.filter(name__iexact="cajero").exists():
        return False
    if user.is_superuser:
        return True
    if getattr(user, "sucursal_id", None):
        # si tiene sucursal pero es cajero ya retornó False arriba
        return True
    if user.groups.filter(name__iexact="vendedor").exists() or user.groups.filter(name__iexact="administrador").exists():
        return True
    return False

class InventarioListView(APIView):
    permission_classes = [IsAuthenticated]

    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        if not _can_manage_inventory(request.user):
            self.permission_denied(request, message="Solo administrador o vendedor puede gestionar inventario.")

    def get(self, request):
        sucursal_id = request.query_params.get("sucursal_id") or request.query_params.get("sucursal")
        producto_q = request.query_params.get("producto") or request.query_params.get("search") or ""
        talla = request.query_params.get("talla", "")
        color = request.query_params.get("color", "")
        # filtrar por permiso
        allowed = _get_allowed_sucursal(request.user, sucursal_id)
        qs = StockSucursal.objects.select_related("producto", "sucursal").all()
        if allowed:
            qs = qs.filter(sucursal=allowed)
        elif sucursal_id:
            qs = qs.filter(sucursal_id=sucursal_id)
        if talla:
            qs = qs.filter(talla=talla)
        if color:
            qs = qs.filter(color__iexact=color)
        if producto_q:
            qs = qs.filter(Q(producto__nombre__icontains=producto_q) | Q(producto__marca__icontains=producto_q))
        # ocultar filas vacías (talla/color == "") son totales; mostrar solo variantes reales
        # pero incluir totales si se filtra sin talla/color: mostrar ambos?
        # Para CU-16 mostrar detalle por talla/color: excluimos totales vacíos
        qs = qs.exclude(talla="", color="").order_by("sucursal__nombre", "producto__nombre", "talla", "color")
        data = []
        for ss in qs[:500]:
            data.append({
                "id": ss.id,
                "producto": {"id": ss.producto.id, "nombre": ss.producto.nombre, "marca": ss.producto.marca, "categoria": ss.producto.categoria, "precio_formateado": ss.producto.precio_formateado},
                "sucursal": {"id": ss.sucursal.id, "nombre": ss.sucursal.nombre, "ciudad": ss.sucursal.ciudad},
                "talla": ss.talla,
                "color": ss.color,
                "stock": ss.stock,
                "actualizado_en": ss.actualizado_en,
            })
        return success_response(data)

class InventarioSucursalesView(APIView):
    permission_classes = [IsAuthenticated]
    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        if not _can_manage_inventory(request.user):
            self.permission_denied(request, message="Solo administrador o vendedor puede gestionar inventario.")
    def get(self, request):
        qs = Sucursal.objects.filter(activo=True)
        if request.user.sucursal_id and not request.user.is_superuser:
            qs = qs.filter(pk=request.user.sucursal_id)
        data = [{"id": s.id, "nombre": s.nombre, "direccion": s.direccion, "ciudad": s.ciudad, "telefono": s.telefono, "horario": s.horario} for s in qs]
        return success_response(data)

class AjustarStockView(APIView):
    permission_classes = [IsAuthenticated]
    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        if not _can_manage_inventory(request.user):
            self.permission_denied(request, message="Solo administrador o vendedor puede gestionar inventario.")
    def post(self, request):
        sucursal_id = request.data.get("sucursal_id")
        producto_id = request.data.get("producto_id")
        talla = request.data.get("talla", "")
        color = request.data.get("color", "")
        cantidad = request.data.get("cantidad")
        # cantidad es stock final absoluto
        if sucursal_id is None or producto_id is None or cantidad is None:
            return _catalog_error("sucursal_id, producto_id y cantidad son obligatorios.", status.HTTP_400_BAD_REQUEST)
        try:
            cantidad = int(cantidad)
        except:
            return _catalog_error("cantidad debe ser entero.", status.HTTP_400_BAD_REQUEST)
        if cantidad < 0:
            return _catalog_error("Stock negativo no permitido.", status.HTTP_400_BAD_REQUEST)
        # permiso sucursal
        allowed = _get_allowed_sucursal(request.user, sucursal_id)
        sucursal = allowed if allowed else get_object_or_404(Sucursal, pk=sucursal_id)
        # vendedor restringido a su sucursal
        if request.user.sucursal_id and not request.user.is_superuser and sucursal.id != request.user.sucursal_id:
            return _catalog_error("Solo puedes ajustar stock de tu sucursal asignada.", status.HTTP_403_FORBIDDEN)
        producto = get_object_or_404(Producto, pk=producto_id)
        with transaction.atomic():
            ss, _ = StockSucursal.objects.select_for_update().get_or_create(producto=producto, sucursal=sucursal, talla=talla, color=color, defaults={"stock": 0})
            ss.stock = cantidad
            ss.save(update_fields=["stock"])
            # sincronizar stock total producto = suma sucursales (variantes)
            total = sum(s.stock for s in StockSucursal.objects.filter(producto=producto).exclude(talla="", color=""))
            # fallback si no hay variantes detalladas, usar este
            if total == 0:
                total = cantidad
            producto.stock = total
            producto.save(update_fields=["stock"])
        return success_response({"sucursal": sucursal.nombre, "producto": producto.nombre, "talla": talla, "color": color, "stock": cantidad}, "Stock ajustado correctamente. Sincronizado con almacén central.")

class TrasladarStockView(APIView):
    permission_classes = [IsAuthenticated]
    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        if not _can_manage_inventory(request.user):
            self.permission_denied(request, message="Solo administrador o vendedor puede gestionar inventario.")
    def post(self, request):
        producto_id = request.data.get("producto_id")
        talla = request.data.get("talla", "")
        color = request.data.get("color", "")
        origen_id = request.data.get("origen_id") or request.data.get("origen")
        destino_id = request.data.get("destino_id") or request.data.get("destino")
        cantidad = request.data.get("cantidad")
        if not all([producto_id, origen_id, destino_id, cantidad]):
            return _catalog_error("producto_id, origen_id, destino_id y cantidad son obligatorios.", status.HTTP_400_BAD_REQUEST)
        try:
            cantidad = int(cantidad)
            if cantidad <= 0: raise ValueError
        except:
            return _catalog_error("cantidad debe ser entero positivo.", status.HTTP_400_BAD_REQUEST)
        if str(origen_id) == str(destino_id):
            return _catalog_error("Origen y destino no pueden ser iguales.", status.HTTP_400_BAD_REQUEST)
        producto = get_object_or_404(Producto, pk=producto_id)
        origen = get_object_or_404(Sucursal, pk=origen_id)
        destino = get_object_or_404(Sucursal, pk=destino_id)
        # vendedor solo desde su sucursal
        if request.user.sucursal_id and not request.user.is_superuser and origen.id != request.user.sucursal_id:
            return _catalog_error("Solo puedes trasladar desde tu sucursal asignada.", status.HTTP_403_FORBIDDEN)
        with transaction.atomic():
            ss_origen, _ = StockSucursal.objects.select_for_update().get_or_create(producto=producto, sucursal=origen, talla=talla, color=color, defaults={"stock": 0})
            if ss_origen.stock < cantidad:
                return _catalog_error(f"Stock insuficiente en origen ({ss_origen.stock} disponible, {cantidad} solicitado).", status.HTTP_409_CONFLICT)
            ss_destino, _ = StockSucursal.objects.select_for_update().get_or_create(producto=producto, sucursal=destino, talla=talla, color=color, defaults={"stock": 0})
            ss_origen.stock -= cantidad
            ss_destino.stock += cantidad
            ss_origen.save(update_fields=["stock"])
            ss_destino.save(update_fields=["stock"])
            traslado = Traslado.objects.create(producto=producto, talla=talla, color=color, origen=origen, destino=destino, cantidad=cantidad, creado_por=request.user, estado=Traslado.Estado.COMPLETADO)
        return success_response({"traslado_id": traslado.id, "origen_stock": ss_origen.stock, "destino_stock": ss_destino.stock}, "Traslado completado. Inventario sincronizado.", status.HTTP_201_CREATED)

class RegistrarMermaView(APIView):
    permission_classes = [IsAuthenticated]
    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        if not _can_manage_inventory(request.user):
            self.permission_denied(request, message="Solo administrador o vendedor puede gestionar inventario.")
    def post(self, request):
        producto_id = request.data.get("producto_id")
        sucursal_id = request.data.get("sucursal_id")
        talla = request.data.get("talla", "")
        color = request.data.get("color", "")
        cantidad = request.data.get("cantidad")
        motivo = request.data.get("motivo", "otro")
        descripcion = request.data.get("descripcion", "")
        if not all([producto_id, sucursal_id, cantidad]):
            return _catalog_error("producto_id, sucursal_id y cantidad son obligatorios.", status.HTTP_400_BAD_REQUEST)
        try:
            cantidad = int(cantidad)
            if cantidad <= 0: raise ValueError
        except:
            return _catalog_error("cantidad debe ser entero positivo.", status.HTTP_400_BAD_REQUEST)
        producto = get_object_or_404(Producto, pk=producto_id)
        sucursal = get_object_or_404(Sucursal, pk=sucursal_id)
        if request.user.sucursal_id and not request.user.is_superuser and sucursal.id != request.user.sucursal_id:
            return _catalog_error("Solo puedes registrar mermas de tu sucursal.", status.HTTP_403_FORBIDDEN)
        with transaction.atomic():
            ss, _ = StockSucursal.objects.select_for_update().get_or_create(producto=producto, sucursal=sucursal, talla=talla, color=color, defaults={"stock": 0})
            if ss.stock < cantidad:
                return _catalog_error(f"Stock insuficiente para merma ({ss.stock} disponible).", status.HTTP_409_CONFLICT)
            ss.stock -= cantidad
            ss.save(update_fields=["stock"])
            merma = Merma.objects.create(producto=producto, sucursal=sucursal, talla=talla, color=color, cantidad=cantidad, motivo=motivo, descripcion=descripcion, creado_por=request.user)
            # actualizar stock total
            total = sum(s.stock for s in StockSucursal.objects.filter(producto=producto).exclude(talla="", color=""))
            producto.stock = total
            producto.save(update_fields=["stock"])
        return success_response({"merma_id": merma.id, "stock_restante": ss.stock}, "Merma registrada. Inventario actualizado.", status.HTTP_201_CREATED)

class HistorialInventarioView(APIView):
    permission_classes = [IsAuthenticated]
    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        if not _can_manage_inventory(request.user):
            self.permission_denied(request, message="Solo administrador o vendedor puede gestionar inventario.")
    def get(self, request):
        producto_id = request.query_params.get("producto_id")
        sucursal_id = request.query_params.get("sucursal_id")
        traslados = Traslado.objects.select_related("producto", "origen", "destino").order_by("-creado_en")[:50]
        mermas = Merma.objects.select_related("producto", "sucursal").order_by("-creado_en")[:50]
        if producto_id:
            traslados = traslados.filter(producto_id=producto_id)
            mermas = mermas.filter(producto_id=producto_id)
        allowed = _get_allowed_sucursal(request.user, sucursal_id) if sucursal_id else None
        if allowed:
            traslados = traslados.filter(origen=allowed) | traslados.filter(destino=allowed)
            mermas = mermas.filter(sucursal=allowed)
        elif sucursal_id:
            traslados = traslados.filter(Q(origen_id=sucursal_id) | Q(destino_id=sucursal_id))
            mermas = mermas.filter(sucursal_id=sucursal_id)
        data = {
            "traslados": [{"id": t.id, "producto": t.producto.nombre, "talla": t.talla, "color": t.color, "origen": t.origen.nombre, "destino": t.destino.nombre, "cantidad": t.cantidad, "estado": t.estado, "creado_en": t.creado_en} for t in traslados],
            "mermas": [{"id": m.id, "producto": m.producto.nombre, "sucursal": m.sucursal.nombre, "talla": m.talla, "color": m.color, "cantidad": m.cantidad, "motivo": m.motivo, "creado_en": m.creado_en} for m in mermas],
        }
        return success_response(data)
