from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.users.api.responses import success_response
from apps.users.api.serializers.access_serializers import ProfileSerializer, ProfileUpdateSerializer
from apps.users.application.use_cases import GetProfileUseCase, UpdateProfileUseCase
from apps.users.infrastructure.database.Repositori import DjangoUsuarioRepository


class ProfileView(APIView):
    """CU-03 – Gestionar perfil de usuario."""

    permission_classes = [IsAuthenticated]

    @extend_schema(responses=ProfileSerializer)
    def get(self, request):
        usuario = GetProfileUseCase(DjangoUsuarioRepository()).execute(request.user.pk)
        return success_response(ProfileSerializer(usuario).data)

    @extend_schema(request=ProfileUpdateSerializer, responses=ProfileSerializer)
    def patch(self, request):
        serializer = ProfileUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        usuario = UpdateProfileUseCase(DjangoUsuarioRepository()).execute(
            request.user.pk, serializer.validated_data
        )
        # Determinar mensajes según flujo alterno
        data = ProfileSerializer(usuario).data
        message = "Perfil actualizado correctamente."
        if not usuario.correo_verificado and usuario.correo_pendiente_verificacion:
            message = "Perfil actualizado. Se ha enviado verificación a tu nuevo correo."
        # talla sugerida actualizada automáticamente ya viene en data
        return success_response(data, message)

    @extend_schema(request=ProfileUpdateSerializer, responses=ProfileSerializer)
    def put(self, request):
        return self.patch(request)
