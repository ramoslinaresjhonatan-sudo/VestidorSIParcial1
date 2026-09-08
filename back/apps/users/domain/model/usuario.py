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

    nombre = models.CharField(max_length=150)
    apellido_paterno = models.CharField(max_length=100)
    apellido_materno = models.CharField(max_length=100, blank=True)
    correo = models.EmailField(max_length=254, unique=True, db_index=True)

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
