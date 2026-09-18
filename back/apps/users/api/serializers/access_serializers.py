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


class SucursalMiniSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    nombre = serializers.CharField()
    ciudad = serializers.CharField(allow_blank=True, required=False)
    direccion = serializers.CharField(allow_blank=True, required=False)

class UsuarioSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    nombre = serializers.CharField()
    apellido_paterno = serializers.CharField()
    apellido_materno = serializers.CharField(allow_blank=True)
    correo = serializers.EmailField()
    activo = serializers.BooleanField()
    es_superadministrador = serializers.BooleanField()
    roles = RolSerializer(many=True)
    # CU-03 perfil
    telefono = serializers.CharField(allow_blank=True, required=False)
    direccion = serializers.CharField(allow_blank=True, required=False)
    direccion_envio = serializers.CharField(allow_blank=True, required=False)
    metodo_pago_preferido = serializers.CharField(allow_blank=True, required=False)
    medida_pecho = serializers.FloatField(allow_null=True, required=False)
    medida_cintura = serializers.FloatField(allow_null=True, required=False)
    medida_cadera = serializers.FloatField(allow_null=True, required=False)
    altura = serializers.FloatField(allow_null=True, required=False)
    peso = serializers.FloatField(allow_null=True, required=False)
    talla_sugerida = serializers.CharField(allow_blank=True, required=False)
    correo_verificado = serializers.BooleanField(required=False)
    correo_pendiente_verificacion = serializers.CharField(allow_blank=True, required=False)
    sucursal = SucursalMiniSerializer(allow_null=True, required=False)


class ProfileSerializer(serializers.Serializer):
    """CU-03/16: Serializer para Mi Perfil (cliente autenticado)."""

    id = serializers.IntegerField(read_only=True)
    nombre = serializers.CharField()
    apellido_paterno = serializers.CharField()
    apellido_materno = serializers.CharField(allow_blank=True)
    correo = serializers.EmailField()
    telefono = serializers.CharField(allow_blank=True, required=False)
    direccion = serializers.CharField(allow_blank=True, required=False)
    direccion_envio = serializers.CharField(allow_blank=True, required=False)
    metodo_pago_preferido = serializers.ChoiceField(
        choices=["tarjeta", "paypal", "transferencia", "efectivo", ""],
        required=False,
        allow_blank=True,
    )
    medida_pecho = serializers.FloatField(allow_null=True, required=False)
    medida_cintura = serializers.FloatField(allow_null=True, required=False)
    medida_cadera = serializers.FloatField(allow_null=True, required=False)
    altura = serializers.FloatField(allow_null=True, required=False)
    peso = serializers.FloatField(allow_null=True, required=False)
    talla_sugerida = serializers.CharField(read_only=True, allow_blank=True)
    correo_verificado = serializers.BooleanField(read_only=True)
    correo_pendiente_verificacion = serializers.CharField(read_only=True, allow_blank=True)
    roles = RolSerializer(many=True, read_only=True)
    sucursal = SucursalMiniSerializer(allow_null=True, read_only=True)


class ProfileUpdateSerializer(serializers.Serializer):
    nombre = serializers.CharField(max_length=150, required=False)
    apellido_paterno = serializers.CharField(max_length=100, required=False)
    apellido_materno = serializers.CharField(max_length=100, required=False, allow_blank=True)
    correo = serializers.EmailField(max_length=254, required=False)
    telefono = serializers.CharField(max_length=20, required=False, allow_blank=True)
    direccion = serializers.CharField(max_length=255, required=False, allow_blank=True)
    direccion_envio = serializers.CharField(max_length=255, required=False, allow_blank=True)
    metodo_pago_preferido = serializers.ChoiceField(
        choices=["tarjeta", "paypal", "transferencia", "efectivo", ""],
        required=False,
        allow_blank=True,
    )
    medida_pecho = serializers.FloatField(required=False, allow_null=True, min_value=20, max_value=200)
    medida_cintura = serializers.FloatField(required=False, allow_null=True, min_value=20, max_value=200)
    medida_cadera = serializers.FloatField(required=False, allow_null=True, min_value=20, max_value=200)
    altura = serializers.FloatField(required=False, allow_null=True, min_value=0.5, max_value=2.5)
    peso = serializers.FloatField(required=False, allow_null=True, min_value=20, max_value=300)

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError("Debe enviar al menos un campo para actualizar.")
        return attrs


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


class ClienteRegistroSerializer(serializers.Serializer):
    nombre = serializers.CharField(max_length=150)
    apellido_paterno = serializers.CharField(max_length=100)
    apellido_materno = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
        default="",
    )
    correo = serializers.EmailField(max_length=254)
    password = serializers.CharField(
        min_length=8,
        write_only=True
    )

    def validate_password(self, value):
        validate_password(value)
        return value