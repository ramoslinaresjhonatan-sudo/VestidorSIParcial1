from rest_framework import serializers

from apps.billing.models import Plan


class UniqueStringListField(serializers.ListField):
    child = serializers.CharField(max_length=100)

    def to_internal_value(self, data):
        values = [value.strip() for value in super().to_internal_value(data)]
        values = [value for value in values if value]
        if not values:
            raise serializers.ValidationError("Seleccione al menos un módulo.")
        return list(dict.fromkeys(values))


class PlanSerializer(serializers.ModelSerializer):
    code = serializers.SlugField(source="codigo")
    name = serializers.CharField(source="nombre")
    description = serializers.CharField(source="descripcion")
    amount_minor = serializers.IntegerField(source="precio_centavos")
    currency = serializers.CharField(source="moneda")
    duration_days = serializers.IntegerField(source="duracion_dias")
    student_limit = serializers.IntegerField(source="limite_estudiantes")
    featured = serializers.BooleanField(source="destacado")
    modules = serializers.ListField(source="modulos")
    active = serializers.BooleanField(source="activo")
    order = serializers.IntegerField(source="orden")

    class Meta:
        model = Plan
        fields = (
            "id",
            "code",
            "name",
            "description",
            "amount_minor",
            "currency",
            "duration_days",
            "student_limit",
            "featured",
            "modules",
            "active",
            "order",
        )


class PlanWriteSerializer(serializers.ModelSerializer):
    code = serializers.SlugField(source="codigo", max_length=40)
    name = serializers.CharField(source="nombre", max_length=100)
    description = serializers.CharField(
        source="descripcion",
        max_length=280,
        required=False,
        allow_blank=True,
        default="",
    )
    amount_minor = serializers.IntegerField(source="precio_centavos", min_value=100)
    currency = serializers.ChoiceField(
        source="moneda",
        choices=("bob", "usd"),
        default="bob",
    )
    duration_days = serializers.IntegerField(source="duracion_dias", min_value=1)
    student_limit = serializers.IntegerField(source="limite_estudiantes", min_value=1)
    featured = serializers.BooleanField(source="destacado", required=False, default=False)
    modules = UniqueStringListField(source="modulos")
    active = serializers.BooleanField(source="activo", required=False, default=True)
    order = serializers.IntegerField(source="orden", min_value=0, required=False, default=0)

    class Meta:
        model = Plan
        fields = (
            "id",
            "code",
            "name",
            "description",
            "amount_minor",
            "currency",
            "duration_days",
            "student_limit",
            "featured",
            "modules",
            "active",
            "order",
        )

    def validate_code(self, value):
        queryset = Plan.objects.filter(codigo=value.lower())
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("Ya existe un plan con este código.")
        return value.lower()


class CheckoutCreateSerializer(serializers.Serializer):
    plan_code = serializers.CharField(max_length=40)


class CheckoutStatusSerializer(serializers.Serializer):
    session_id = serializers.CharField(source="stripe_session_id")
    plan_code = serializers.CharField(source="codigo_plan")
    status = serializers.CharField(source="estado")
    currency = serializers.CharField(source="moneda")
    amount_minor = serializers.IntegerField(source="monto_centavos")
    starts_at = serializers.DateTimeField(source="fecha_inicio", allow_null=True)
    ends_at = serializers.DateTimeField(source="fecha_fin", allow_null=True)
