from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


class LowercaseTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Normalizar correo a minúsculas para login case-insensitive
        if "correo" in attrs and isinstance(attrs["correo"], str):
            attrs["correo"] = attrs["correo"].strip().lower()
        # Compatibilidad: si front envía 'username' por error, mapear a correo
        if "username" in attrs and "correo" not in attrs:
            attrs["correo"] = str(attrs["username"]).strip().lower()
        return super().validate(attrs)


class LowercaseTokenObtainPairView(TokenObtainPairView):
    serializer_class = LowercaseTokenObtainPairSerializer
