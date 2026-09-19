from datetime import timedelta
from django.db import transaction, models
from django.db.models import Q, Sum, Count, F
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.catalog.models import Apartado, Pedido, PedidoItem, Producto, StockSucursal, Sucursal
from apps.cart.models import Cart
from apps.users.api.responses import success_response

def _error(msg, code):
    return Response({"success": False, "message": msg, "errors": None}, status=code)

def _can_manage_all(user):
    return user.is_superuser or user.groups.filter(name__iexact="administrador").exists()

def _vendedor_sucursal(user):
    if user.sucursal_id and not user.is_superuser and not user.groups.filter(name__iexact="cajero").exists():
        return user.sucursal
    return None

# CU-07 Apartar
class ApartadoView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        # cliente ve sus apartados, vendedor/admin ve de su sucursal o todos
        if _can_manage_all(request.user):
            qs = Apartado.objects.select_related("producto","sucursal","usuario").order_by("-creado_en")[:100]
        elif _vendedor_sucursal(request.user):
            qs = Apartado.objects.filter(sucursal=_vendedor_sucursal(request.user)).select_related("producto","usuario").order_by("-creado_en")[:100]
        else:
            qs = Apartado.objects.filter(usuario=request.user).select_related("producto","sucursal").order_by("-creado_en")[:100]
        data=[{"id":a.id,"producto":{"id":a.producto.id,"nombre":a.producto.nombre},"sucursal":{"id":a.sucursal.id,"nombre":a.sucursal.nombre},"talla":a.talla,"color":a.color,"cantidad":a.cantidad,"estado":a.estado,"expira_en":a.expira_en} for a in qs]
        return success_response(data)

    def post(self, request):
        producto_id=request.data.get("producto_id")
        sucursal_id=request.data.get("sucursal_id")
        talla=request.data.get("talla","")
        color=request.data.get("color","")
        cantidad=int(request.data.get("cantidad",1))
        producto=get_object_or_404(Producto,pk=producto_id,activo=True)
        sucursal=get_object_or_404(Sucursal,pk=sucursal_id)
        # verificar stock
        ss, _ = StockSucursal.objects.get_or_create(producto=producto,sucursal=sucursal,talla=talla,color=color,defaults={"stock":0})
        if ss.stock < cantidad:
            return _error(f"Stock insuficiente en {sucursal.nombre} ({ss.stock} disponible)", status.HTTP_409_CONFLICT)
        with transaction.atomic():
            ss.stock -= cantidad
            ss.save(update_fields=["stock"])
            apartado=Apartado.objects.create(usuario=request.user,producto=producto,sucursal=sucursal,talla=talla,color=color,cantidad=cantidad,expira_en=timezone.now()+timedelta(days=2))
        return success_response({"id":apartado.id,"expira_en":apartado.expira_en},"Producto apartado por 48h. Recoge en tienda.", status.HTTP_201_CREATED)

# CU-10 Recomendación talla IA
class RecomendacionTallaView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, producto_id):
        producto=get_object_or_404(Producto,pk=producto_id)
        u=request.user
        # usa medidas perfil + lógica IA simple
        pecho=float(u.medida_pecho) if u.medida_pecho else None
        cintura=float(u.medida_cintura) if u.medida_cintura else None
        # IA mock: si no medidas, pide
        if not pecho and not cintura:
            return success_response({"talla_recomendada": producto.talla, "confianza": 0.4, "motivo": "Sin medidas, se sugiere talla estándar del producto. Completa tu perfil para precisión."})
        # lógica
        ref=pecho if pecho else cintura
        if ref<86: t="XS"
        elif ref<92: t="S"
        elif ref<98: t="M"
        elif ref<104: t="L"
        elif ref<110: t="XL"
        else: t="XXL"
        return success_response({"talla_recomendada": t, "confianza": 0.92, "motivo": f"IA analizó pecho {pecho} cintura {cintura} y tipo cuerpo {producto.get_tipo_cuerpo_display()}. Talla {t} tiene {producto.stock} unidades."})

# CU-18 Alertas stock mínimo
class AlertasStockView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        qs=StockSucursal.objects.select_related("producto","sucursal").filter(stock__lte=F("stock_minimo")).exclude(talla="",color="")
        # filtrar por rol
        if _vendedor_sucursal(request.user):
            qs=qs.filter(sucursal=_vendedor_sucursal(request.user))
        elif not _can_manage_all(request.user):
            # cliente/cajero no ven alertas? devolver vacío o 403? Para demo cliente no
            return _error("Solo vendedor/administrador ve alertas", status.HTTP_403_FORBIDDEN)
        data=[{"id":s.id,"producto":s.producto.nombre,"sucursal":s.sucursal.nombre,"talla":s.talla,"color":s.color,"stock":s.stock,"minimo":s.stock_minimo} for s in qs[:100]]
        return success_response(data)
    def patch(self, request):
        # configurar stock_minimo
        if not _can_manage_all(request.user):
            return _error("Solo administrador configura alertas", status.HTTP_403_FORBIDDEN)
        stock_id=request.data.get("stock_id")
        minimo=request.data.get("stock_minimo")
        ss=get_object_or_404(StockSucursal,pk=stock_id)
        ss.stock_minimo=int(minimo)
        ss.save(update_fields=["stock_minimo"])
        return success_response({"id":ss.id,"minimo":ss.stock_minimo},"Alerta configurada")

# CU-19 Pedidos + CU-13/14/15/16 pagos
class PedidoListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        if _can_manage_all(request.user):
            qs=Pedido.objects.select_related("usuario","sucursal").order_by("-creado_en")[:100]
        elif _vendedor_sucursal(request.user):
            qs=Pedido.objects.filter(sucursal=_vendedor_sucursal(request.user)).order_by("-creado_en")[:100]
        else:
            qs=Pedido.objects.filter(usuario=request.user).order_by("-creado_en")[:100]
        data=[]
        for p in qs:
            data.append({"id":p.id,"usuario":p.usuario.correo,"sucursal":p.sucursal.nombre if p.sucursal else None,"tipo":p.tipo,"estado":p.estado,"pago_metodo":p.pago_metodo,"total_centavos":p.total_centavos,"total_bs":p.total_centavos/100,"creado_en":p.creado_en,"items":list(p.items.values("nombre","talla","color","cantidad","precio_centavos"))})
        return success_response(data)

    def post(self, request):
        # CU-13 online desde carrito, CU-14 POS desde vendedor
        tipo=request.data.get("tipo","online")
        pago_metodo=request.data.get("pago_metodo","tarjeta")
        sucursal_id=request.data.get("sucursal_id")
        items_data=request.data.get("items") # para POS: [{producto_id,talla,color,cantidad}]
        sucursal=None
        if sucursal_id:
            sucursal=get_object_or_404(Sucursal,pk=sucursal_id)
        # si tipo tienda, sucursal obligatoria y debe ser de vendedor
        if tipo=="tienda":
            if _vendedor_sucursal(request.user):
                sucursal=_vendedor_sucursal(request.user)
            elif not sucursal:
                return _error("POS requiere sucursal", status.HTTP_400_BAD_REQUEST)

        # construir items
        if tipo=="online":
            # desde carrito
            try:
                cart=Cart.objects.get(usuario=request.user)
                cart_items=list(cart.items.select_related("producto").all())
                if not cart_items:
                    return _error("Carrito vacío", status.HTTP_400_BAD_REQUEST)
                total=cart.total_centavos
                with transaction.atomic():
                    pedido=Pedido.objects.create(usuario=request.user,sucursal=sucursal,tipo=tipo,pago_metodo=pago_metodo,total_centavos=total,qr_data=f"QR:{request.user.id}:{total}" if pago_metodo=="qr" else "")
                    for ci in cart_items:
                        PedidoItem.objects.create(pedido=pedido,producto=ci.producto,nombre=ci.producto.nombre,talla=ci.talla,color=ci.color,cantidad=ci.cantidad,precio_centavos=ci.precio_centavos)
                        # descontar stock si hay sucursal? para online descontar de almacén central? simplificar descontar producto.stock
                        ci.producto.stock=max(0, ci.producto.stock - ci.cantidad)
                        ci.producto.save(update_fields=["stock"])
                    cart.items.all().delete()
                    if cart.coupon:
                        cart.coupon=None
                        cart.save()
            except Cart.DoesNotExist:
                return _error("Carrito no encontrado", status.HTTP_404_NOT_FOUND)
        else:
            # POS: items directos
            if not items_data:
                return _error("items requeridos para POS", status.HTTP_400_BAD_REQUEST)
            total=0
            with transaction.atomic():
                pedido=Pedido.objects.create(usuario=request.user,sucursal=sucursal,tipo=tipo,pago_metodo=pago_metodo,total_centavos=0)
                for it in items_data:
                    prod=get_object_or_404(Producto,pk=it["producto_id"])
                    cant=int(it.get("cantidad",1))
                    talla=it.get("talla",prod.talla)
                    color=it.get("color",prod.color)
                    precio=prod.precio_centavos
                    # verificar stock sucursal
                    ss,_=StockSucursal.objects.get_or_create(producto=prod,sucursal=sucursal,talla=talla,color=color,defaults={"stock":0})
                    if ss.stock < cant:
                        raise ValueError(f"Stock insuficiente {prod.nombre} {talla}/{color} ({ss.stock})")
                    ss.stock -= cant
                    ss.save(update_fields=["stock"])
                    PedidoItem.objects.create(pedido=pedido,producto=prod,nombre=prod.nombre,talla=talla,color=color,cantidad=cant,precio_centavos=precio)
                    total+=precio*cant
                pedido.total_centavos=total
                pedido.qr_data=f"QR:POS:{pedido.id}:{total}" if pago_metodo=="qr" else ""
                pedido.save(update_fields=["total_centavos","qr_data"])

        return success_response({"id":pedido.id,"total_centavos":pedido.total_centavos,"qr_data":pedido.qr_data},"Pedido creado", status.HTTP_201_CREATED)

class PedidoEstadoView(APIView):
    permission_classes = [IsAuthenticated]
    def patch(self, request, pedido_id):
        pedido=get_object_or_404(Pedido,pk=pedido_id)
        # cliente solo puede cancelar pendiente, vendedor/admin puede avanzar estados
        nuevo=request.data.get("estado")
        if not nuevo:
            return _error("estado requerido", status.HTTP_400_BAD_REQUEST)
        if pedido.usuario==request.user and nuevo=="cancelado" and pedido.estado=="pendiente":
            pedido.estado=nuevo
            pedido.save(update_fields=["estado"])
            return success_response({"id":pedido.id,"estado":pedido.estado},"Pedido cancelado")
        if _can_manage_all(request.user) or _vendedor_sucursal(request.user):
            # vendedor solo si es su sucursal
            if _vendedor_sucursal(request.user) and pedido.sucursal != _vendedor_sucursal(request.user):
                return _error("Solo pedidos de tu sucursal", status.HTTP_403_FORBIDDEN)
            pedido.estado=nuevo
            pedido.save(update_fields=["estado"])
            return success_response({"id":pedido.id,"estado":pedido.estado},"Estado actualizado")
        return _error("Sin permiso", status.HTTP_403_FORBIDDEN)

# CU-20 Reportes IA generativa
class ReportesView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        # vendedor ve solo su sucursal, admin ve todas
        sucursal_id=request.query_params.get("sucursal_id")
        if _vendedor_sucursal(request.user):
            sucursal=_vendedor_sucursal(request.user)
            qs_pedidos=Pedido.objects.filter(sucursal=sucursal)
            qs_stock=StockSucursal.objects.filter(sucursal=sucursal)
        elif _can_manage_all(request.user):
            if sucursal_id:
                qs_pedidos=Pedido.objects.filter(sucursal_id=sucursal_id)
                qs_stock=StockSucursal.objects.filter(sucursal_id=sucursal_id)
            else:
                qs_pedidos=Pedido.objects.all()
                qs_stock=StockSucursal.objects.all()
        else:
            return _error("Solo vendedor/administrador genera reportes", status.HTTP_403_FORBIDDEN)

        total_pedidos=qs_pedidos.count()
        total_ventas=qs_pedidos.aggregate(s=Sum("total_centavos"))["s"] or 0
        top_productos=qs_pedidos.values("items__nombre").annotate(c=Count("id")).order_by("-c")[:3]
        stock_bajo=qs_stock.filter(stock__lte=F("stock_minimo")).count()
        # IA generativa mock
        ia_resumen=f"IA: En {sucursal.nombre if _vendedor_sucursal(request.user) else 'todas las sucursales'} se registraron {total_pedidos} pedidos por {total_ventas/100:.2f} Bs. Stock bajo en {stock_bajo} variantes. Recomendación: reponer tallas M/L de vestidos en Central y potenciar pago QR (30% pedidos)."
        data={
            "total_pedidos": total_pedidos,
            "total_ventas_centavos": total_ventas,
            "total_ventas_bs": total_ventas/100,
            "stock_bajo": stock_bajo,
            "top_productos": list(top_productos),
            "ia_resumen": ia_resumen,
        }
        return success_response(data)
