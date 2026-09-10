from apps.billing.models import Plan


def serialize_plan(plan):
    return {
        "id": plan.pk,
        "code": plan.codigo,
        "name": plan.nombre,
        "description": plan.descripcion,
        "amount_minor": plan.precio_centavos,
        "currency": plan.moneda,
        "duration_days": plan.duracion_dias,
        "student_limit": plan.limite_estudiantes,
        "featured": plan.destacado,
        "modules": list(plan.modulos),
        "active": plan.activo,
        "order": plan.orden,
    }


def get_plan(code):
    plan = Plan.objects.filter(
        codigo=str(code).strip().lower(),
        activo=True,
    ).first()
    return serialize_plan(plan) if plan else None


def serialize_plans(public_only=False):
    plans = Plan.objects.all()
    if public_only:
        plans = plans.filter(activo=True)
    return [serialize_plan(plan) for plan in plans]
