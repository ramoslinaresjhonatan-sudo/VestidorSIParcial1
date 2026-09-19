import base64
import uuid
from django.core.files.base import ContentFile
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from apps.catalog.models import Producto
from apps.tryon.api.serializers import PruebaCreateSerializer, PruebaGuardadaSerializer
from apps.tryon.models import PruebaGuardada
from apps.users.api.responses import success_response

class TryOnGuardarView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ser = PruebaCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        producto = get_object_or_404(Producto, pk=ser.validated_data["producto_id"])
        captura_file = ser.validated_data.get("captura")
        captura_b64 = ser.validated_data.get("captura_base64", "")

        prueba = PruebaGuardada(
            usuario=request.user,
            producto=producto,
            talla=ser.validated_data.get("talla", ""),
            color=ser.validated_data.get("color", ""),
            captura=captura_file,
            captura_base64=captura_b64[:200000] if captura_b64 else "",
        )
        # si viene base64 sin archivo, convertir a file
        if not captura_file and captura_b64:
            try:
                header, data = captura_b64.split(",", 1) if "," in captura_b64 else ("", captura_b64)
                ext = "png"
                if "jpeg" in header: ext = "jpg"
                fname = f"captura_{uuid.uuid4().hex[:8]}.{ext}"
                prueba.captura.save(fname, ContentFile(base64.b64decode(data)), save=False)
            except Exception:
                pass
        prueba.save()
        return success_response(PruebaGuardadaSerializer(prueba).data, "Prueba guardada en tu perfil.", 201)

class TryOnListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = PruebaGuardada.objects.filter(usuario=request.user).select_related("producto").order_by("-creado_en")[:20]
        return success_response(PruebaGuardadaSerializer(qs, many=True).data)
