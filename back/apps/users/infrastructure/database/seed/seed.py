"""Población inicial del superadministrador y sus accesos."""

from __future__ import annotations

import csv
import os
from pathlib import Path

from django.contrib.auth.models import Group, Permission
from django.db import transaction

from apps.users.domain.model import Usuario


STORAGE_DIR = Path(__file__).resolve().parent / "storage"


class SeedConfigurationError(ValueError):
    """Indica que los archivos de población tienen datos inválidos."""


def _read_rows(filename: str) -> list[dict[str, str]]:
    path = STORAGE_DIR / filename
    with path.open(mode="r", encoding="utf-8-sig", newline="") as csv_file:
        return [
            {key: (value or "").strip() for key, value in row.items()}
            for row in csv.DictReader(csv_file)
        ]


def _permissions_for_role(role_name: str) -> list[Permission]:
    rules = [
        row["codigo"]
        for row in _read_rows("Permisos.csv")
        if row.get("rol", "").casefold() == role_name.casefold()
    ]
    if not rules:
        raise SeedConfigurationError(
            f"El rol '{role_name}' no tiene permisos configurados en Permisos.csv."
        )

    if "*" in rules:
        return list(Permission.objects.all())

    permissions: list[Permission] = []
    for rule in rules:
        try:
            app_label, codename = rule.split(".", maxsplit=1)
        except ValueError as exc:
            raise SeedConfigurationError(
                f"Permiso inválido '{rule}'. Usa app_label.codename o *."
            ) from exc

        permission = Permission.objects.filter(
            content_type__app_label=app_label,
            codename=codename,
        ).first()
        if permission is None:
            raise SeedConfigurationError(
                f"El permiso existente '{rule}' no fue encontrado."
            )
        permissions.append(permission)
    return permissions


@transaction.atomic
def seed_superadmin() -> dict[str, object]:
    """Crea o actualiza el único superadministrador definido por el seed."""
    role_rows = _read_rows("Rol.csv")
    user_rows = _read_rows("Usuarios.csv")

    if len(role_rows) != 1:
        raise SeedConfigurationError("Rol.csv debe contener exactamente un rol.")
    if len(user_rows) != 1:
        raise SeedConfigurationError("Usuarios.csv debe contener exactamente un usuario.")

    role_name = role_rows[0].get("nombre", "")
    if not role_name:
        raise SeedConfigurationError("El nombre del rol es obligatorio.")

    user_data = user_rows[0]
    configured_role = user_data.get("rol", "")
    if configured_role.casefold() != role_name.casefold():
        raise SeedConfigurationError(
            "El rol del usuario debe coincidir con el definido en Rol.csv."
        )

    email = (os.getenv("SUPERADMIN_EMAIL") or user_data.get("correo", "")).lower()
    password = os.getenv("SUPERADMIN_PASSWORD") or user_data.get("password", "")
    if not email or not password:
        raise SeedConfigurationError(
            "El correo y la contraseña del superadministrador son obligatorios."
        )

    role, role_created = Group.objects.get_or_create(name=role_name)
    permissions = _permissions_for_role(role_name)
    role.permissions.set(permissions)

    user = Usuario.objects.filter(correo__iexact=email).first()
    user_created = user is None
    if user_created:
        user = Usuario.objects.create_superuser(
            correo=email,
            password=password,
            nombre=user_data.get("nombre", "Super"),
            apellido_paterno=user_data.get("apellido_paterno", "Administrador"),
            apellido_materno=user_data.get("apellido_materno", ""),
        )
    else:
        user.nombre = user_data.get("nombre", user.nombre)
        user.apellido_paterno = user_data.get(
            "apellido_paterno", user.apellido_paterno
        )
        user.apellido_materno = user_data.get(
            "apellido_materno", user.apellido_materno
        )
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.save(
            update_fields=[
                "nombre",
                "apellido_paterno",
                "apellido_materno",
                "is_staff",
                "is_superuser",
                "is_active",
            ]
        )

    user.groups.add(role)

    return {
        "usuario": user,
        "usuario_creado": user_created,
        "rol": role,
        "rol_creado": role_created,
        "permisos_asignados": len(permissions),
    }
