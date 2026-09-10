from django.db import migrations, models


DEFAULT_PLANS = [
    {
        "codigo": "inicio",
        "nombre": "Inicio",
        "descripcion": "Base administrativa para una unidad educativa pequeña.",
        "precio_centavos": 30_000,
        "moneda": "bob",
        "duracion_dias": 30,
        "limite_estudiantes": 500,
        "destacado": False,
        "orden": 1,
        "modulos": ["Gestión de acceso", "Administración", "Gestión estudiantil"],
    },
    {
        "codigo": "academico",
        "nombre": "Académico",
        "descripcion": "Operación académica completa con seguimiento pedagógico.",
        "precio_centavos": 55_000,
        "moneda": "bob",
        "duracion_dias": 90,
        "limite_estudiantes": 1_000,
        "destacado": True,
        "orden": 2,
        "modulos": [
            "Gestión de acceso",
            "Administración",
            "Gestión estudiantil",
            "Pedagógica",
            "Reportes académicos",
        ],
    },
    {
        "codigo": "integral",
        "nombre": "Integral",
        "descripcion": "Todos los módulos previstos para la gestión institucional.",
        "precio_centavos": 300_000,
        "moneda": "bob",
        "duracion_dias": 365,
        "limite_estudiantes": 2_000,
        "destacado": False,
        "orden": 3,
        "modulos": [
            "Gestión de acceso",
            "Administración",
            "Gestión estudiantil",
            "Pedagógica",
            "Finanzas",
            "Reportes académicos y financieros",
        ],
    },
]


def create_default_plans(apps, schema_editor):
    plan_model = apps.get_model("billing", "Plan")
    for values in DEFAULT_PLANS:
        plan_model.objects.get_or_create(codigo=values["codigo"], defaults=values)


def remove_default_plans(apps, schema_editor):
    plan_model = apps.get_model("billing", "Plan")
    plan_model.objects.filter(codigo__in=[item["codigo"] for item in DEFAULT_PLANS]).delete()


class Migration(migrations.Migration):
    dependencies = [("billing", "0001_initial")]

    operations = [
        migrations.CreateModel(
            name="Plan",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("codigo", models.SlugField(max_length=40, unique=True)),
                ("nombre", models.CharField(max_length=100)),
                ("descripcion", models.CharField(blank=True, max_length=280)),
                ("precio_centavos", models.PositiveIntegerField()),
                ("moneda", models.CharField(default="bob", max_length=3)),
                ("duracion_dias", models.PositiveIntegerField()),
                ("limite_estudiantes", models.PositiveIntegerField()),
                ("modulos", models.JSONField(default=list)),
                ("destacado", models.BooleanField(default=False)),
                ("activo", models.BooleanField(default=True)),
                ("orden", models.PositiveSmallIntegerField(default=0)),
                ("creado_en", models.DateTimeField(auto_now_add=True)),
                ("actualizado_en", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "plan",
                "verbose_name_plural": "planes",
                "ordering": ("orden", "precio_centavos", "nombre"),
            },
        ),
        migrations.RunPython(create_default_plans, remove_default_plans),
    ]
