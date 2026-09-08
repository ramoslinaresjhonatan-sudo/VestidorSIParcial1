from django.core.management.base import BaseCommand, CommandError

from apps.users.infrastructure.database.seed.seed import (
    SeedConfigurationError,
    seed_superadmin,
)


class Command(BaseCommand):
    help = "Crea el rol y el único superadministrador configurado en el seed."

    def handle(self, *args, **options):
        try:
            result = seed_superadmin()
        except (OSError, SeedConfigurationError) as exc:
            raise CommandError(str(exc)) from exc

        user_action = "creado" if result["usuario_creado"] else "actualizado"
        role_action = "creado" if result["rol_creado"] else "actualizado"
        self.stdout.write(
            self.style.SUCCESS(
                f"Superadministrador {user_action}: {result['usuario'].correo}. "
                f"Rol {role_action}: {result['rol'].name}. "
                f"Permisos asignados: {result['permisos_asignados']}."
            )
        )
