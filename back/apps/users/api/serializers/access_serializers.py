from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers


class UniqueIdListField(serializers.ListField):
    child = serializers.IntegerField(min_value=1)

    def to_internal_value(self, data):
        values = super().to_internal_value(data)
        return list(dict.fromkeys(values))


class PermisoSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    nombre = serializers.CharField()
    codigo = serializers.CharField()
    modulo = serializers.CharField()


class RolSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    nombre = serializers.CharField()
    permisos = PermisoSerializer(many=True)


class RolCreateSerializer(serializers.Serializer):
    nombre = serializers.CharField(max_length=150)
    permisos_ids = UniqueIdListField(required=False, default=list)


class RolUpdateSerializer(serializers.Serializer):
    nombre = serializers.CharField(max_length=150, required=False)
    permisos_ids = UniqueIdListField(required=False)

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError("Debe enviar al menos un campo.")
        return attrs


class AccessOptionsSerializer(serializers.Serializer):
    roles = RolSerializer(many=True)
    permisos = PermisoSerializer(many=True)


class UsuarioSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    nombre = serializers.CharField()
    apellido_paterno = serializers.CharField()
    apellido_materno = serializers.CharField(allow_blank=True)
    correo = serializers.EmailField()
    activo = serializers.BooleanField()
    es_superadministrador = serializers.BooleanField()
    roles = RolSerializer(many=True)


class UsuarioCreateSerializer(serializers.Serializer):
    nombre = serializers.CharField(max_length=150)
    apellido_paterno = serializers.CharField(max_length=100)
    apellido_materno = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
        default="",
    )
    correo = serializers.EmailField(max_length=254)
    password = serializers.CharField(min_length=8, write_only=True)
    roles_ids = UniqueIdListField(required=False, default=list)
    activo = serializers.BooleanField(required=False, default=True)

    def validate_password(self, value):
        validate_password(value)
        return value


class UsuarioUpdateSerializer(serializers.Serializer):
    nombre = serializers.CharField(max_length=150, required=False)
    apellido_paterno = serializers.CharField(max_length=100, required=False)
    apellido_materno = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
    )
    correo = serializers.EmailField(max_length=254, required=False)
    password = serializers.CharField(min_length=8, write_only=True, required=False)
    roles_ids = UniqueIdListField(required=False)
    activo = serializers.BooleanField(required=False)

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError("Debe enviar al menos un campo.")
        return attrs
