from django.conf import settings
from django.db import models


class Plan(models.Model):
    codigo = models.SlugField(max_length=40, unique=True)
    nombre = models.CharField(max_length=100)
    descripcion = models.CharField(max_length=280, blank=True)
    precio_centavos = models.PositiveIntegerField()
    moneda = models.CharField(max_length=3, default="bob")
    duracion_dias = models.PositiveIntegerField()
    limite_estudiantes = models.PositiveIntegerField()
    modulos = models.JSONField(default=list)
    destacado = models.BooleanField(default=False)
    activo = models.BooleanField(default=True)
    orden = models.PositiveSmallIntegerField(default=0)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("orden", "precio_centavos", "nombre")
        verbose_name = "plan"
        verbose_name_plural = "planes"

    def __str__(self):
        return self.nombre


class PagoPlanTemporal(models.Model):
    class Estado(models.TextChoices):
        CREADO = "created", "Creado"
        COMPLETADO = "completed", "Completado"
        EXPIRADO = "expired", "Expirado"
        FALLIDO = "failed", "Fallido"

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="pagos_planes_temporales",
    )
    codigo_plan = models.CharField(max_length=40)
    stripe_session_id = models.CharField(max_length=255, unique=True)
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True)
    monto_centavos = models.PositiveIntegerField()
    moneda = models.CharField(max_length=3)
    estado = models.CharField(
        max_length=20,
        choices=Estado.choices,
        default=Estado.CREADO,
    )
    fecha_inicio = models.DateTimeField(null=True, blank=True)
    fecha_fin = models.DateTimeField(null=True, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-creado_en",)
        verbose_name = "pago de plan temporal"
        verbose_name_plural = "pagos de planes temporales"

    def __str__(self):
        return f"{self.codigo_plan} - {self.usuario_id} - {self.estado}"
