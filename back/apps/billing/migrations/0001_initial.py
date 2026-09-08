# Generated manually for the temporary Stripe plan prototype.

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="PagoPlanTemporal",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("codigo_plan", models.CharField(max_length=40)),
                ("stripe_session_id", models.CharField(max_length=255, unique=True)),
                ("stripe_payment_intent_id", models.CharField(blank=True, max_length=255)),
                ("monto_centavos", models.PositiveIntegerField()),
                ("moneda", models.CharField(max_length=3)),
                (
                    "estado",
                    models.CharField(
                        choices=[
                            ("created", "Creado"),
                            ("completed", "Completado"),
                            ("expired", "Expirado"),
                            ("failed", "Fallido"),
                        ],
                        default="created",
                        max_length=20,
                    ),
                ),
                ("fecha_inicio", models.DateTimeField(blank=True, null=True)),
                ("fecha_fin", models.DateTimeField(blank=True, null=True)),
                ("creado_en", models.DateTimeField(auto_now_add=True)),
                ("actualizado_en", models.DateTimeField(auto_now=True)),
                (
                    "usuario",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="pagos_planes_temporales",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "pago de plan temporal",
                "verbose_name_plural": "pagos de planes temporales",
                "ordering": ("-creado_en",),
            },
        )
    ]
