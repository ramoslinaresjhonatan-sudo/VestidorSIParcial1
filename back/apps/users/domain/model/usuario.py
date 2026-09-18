from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.db.models.functions import Lower


class UsuarioManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, correo, password=None, **extra_fields):
        if not correo:
            raise ValueError("El correo es obligatorio.")
        correo = self.normalize_email(correo).lower()
        usuario = self.model(correo=correo, **extra_fields)
        usuario.set_password(password)
        usuario.save(using=self._db)
        return usuario

    def create_superuser(self, correo, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("El superusuario debe tener is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("El superusuario debe tener is_superuser=True.")
        return self.create_user(correo, password, **extra_fields)


class Usuario(AbstractUser):
    username = None
    first_name = None
    last_name = None
    email = None

    class MetodoPago(models.TextChoices):
        TARJETA = "tarjeta", "Tarjeta"
        PAYPAL = "paypal", "PayPal"
        TRANSFERENCIA = "transferencia", "Transferencia"
        EFECTIVO = "efectivo", "Efectivo contra entrega"

    class Talla(models.TextChoices):
        XS = "XS", "XS"
        S = "S", "S"
        M = "M", "M"
        L = "L", "L"
        XL = "XL", "XL"
        XXL = "XXL", "XXL"

    nombre = models.CharField(max_length=150)
    apellido_paterno = models.CharField(max_length=100)
    apellido_materno = models.CharField(max_length=100, blank=True)
    correo = models.EmailField(max_length=254, unique=True, db_index=True)

    # --- CU-03 Perfil ---
    telefono = models.CharField(max_length=20, blank=True, default="")
    direccion = models.CharField(max_length=255, blank=True, default="")
    direccion_envio = models.CharField(max_length=255, blank=True, default="")
    metodo_pago_preferido = models.CharField(
        max_length=20,
        choices=MetodoPago.choices,
        blank=True,
        default="",
    )
    medida_pecho = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    medida_cintura = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    medida_cadera = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    altura = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True, help_text="Altura en metros")
    peso = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Peso en kg")
    talla_sugerida = models.CharField(max_length=4, choices=Talla.choices, blank=True, default="")
    correo_verificado = models.BooleanField(default=True)
    correo_pendiente_verificacion = models.EmailField(max_length=254, blank=True, default="")
    # CU-16: sucursal asignada para vendedor
    sucursal = models.ForeignKey("catalog.Sucursal", null=True, blank=True, on_delete=models.SET_NULL, related_name="usuarios")

    USERNAME_FIELD = "correo"
    REQUIRED_FIELDS = ["nombre", "apellido_paterno"]

    objects = UsuarioManager()

    class Meta:
        verbose_name = "usuario"
        verbose_name_plural = "usuarios"
        ordering = ("nombre", "apellido_paterno", "apellido_materno")
        constraints = [
            models.UniqueConstraint(
                Lower("correo"),
                name="usuario_correo_unico_sin_mayusculas",
            )
        ]

    def __str__(self) -> str:
        return f"{self.nombre} {self.apellido_paterno}".strip()

    def get_full_name(self) -> str:
        return " ".join(
            value
            for value in (self.nombre, self.apellido_paterno, self.apellido_materno)
            if value
        )

    def get_short_name(self) -> str:
        return self.nombre

    def calcular_talla_sugerida(self) -> str:
        """Calcula talla sugerida basada en medidas corporales (pecho como referencia principal)."""
        # Prioridad: pecho > cintura > fallback
        pecho = float(self.medida_pecho) if self.medida_pecho is not None else None
        cintura = float(self.medida_cintura) if self.medida_cintura is not None else None
        ref = pecho if pecho is not None else cintura
        if ref is None:
            return self.talla_sugerida  # sin datos, mantener actual
        if ref < 86:
            return self.Talla.XS
        if ref < 92:
            return self.Talla.S
        if ref < 98:
            return self.Talla.M
        if ref < 104:
            return self.Talla.L
        if ref < 110:
            return self.Talla.XL
        return self.Talla.XXL

    def actualizar_talla_sugerida(self) -> None:
        nueva = self.calcular_talla_sugerida()
        if nueva != self.talla_sugerida:
            self.talla_sugerida = nueva
