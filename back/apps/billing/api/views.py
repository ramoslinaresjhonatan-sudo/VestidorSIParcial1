import stripe
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.billing.api.permissions import IsSuperAdministrator
from apps.billing.api.serializers import (
    CheckoutCreateSerializer,
    CheckoutStatusSerializer,
    PlanSerializer,
    PlanWriteSerializer,
)
from apps.billing.models import PagoPlanTemporal, Plan
from apps.billing.services import (
    StripeConfigurationError,
    StripeGatewayError,
    create_checkout,
    get_plan,
    process_webhook,
    retrieve_checkout,
)
from apps.users.api.responses import success_response


def _billing_error(message, status_code):
    return Response(
        {"success": False, "message": message, "errors": None},
        status=status_code,
    )


class PublicPlanListView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(responses=PlanSerializer(many=True))
    def get(self, request):
        plans = Plan.objects.filter(activo=True)
        return success_response(PlanSerializer(plans, many=True).data)


class AdminPlanListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdministrator]

    @extend_schema(responses=PlanSerializer(many=True))
    def get(self, request):
        return success_response(PlanSerializer(Plan.objects.all(), many=True).data)

    @extend_schema(request=PlanWriteSerializer, responses={201: PlanSerializer})
    def post(self, request):
        serializer = PlanWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        plan = serializer.save()
        return success_response(
            PlanSerializer(plan).data,
            "Plan creado correctamente.",
            status.HTTP_201_CREATED,
        )


class AdminPlanDetailView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdministrator]

    @staticmethod
    def _get_plan(plan_id):
        return get_object_or_404(Plan, pk=plan_id)

    @extend_schema(responses=PlanSerializer)
    def get(self, request, plan_id):
        return success_response(PlanSerializer(self._get_plan(plan_id)).data)

    def _update(self, request, plan_id, partial):
        plan = self._get_plan(plan_id)
        serializer = PlanWriteSerializer(plan, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        plan = serializer.save()
        return success_response(
            PlanSerializer(plan).data,
            "Plan actualizado correctamente.",
        )

    @extend_schema(request=PlanWriteSerializer, responses=PlanSerializer)
    def put(self, request, plan_id):
        return self._update(request, plan_id, partial=False)

    @extend_schema(request=PlanWriteSerializer, responses=PlanSerializer)
    def patch(self, request, plan_id):
        return self._update(request, plan_id, partial=True)

    def delete(self, request, plan_id):
        plan = self._get_plan(plan_id)
        if PagoPlanTemporal.objects.filter(codigo_plan=plan.codigo).exists():
            return _billing_error(
                "El plan tiene pagos asociados; desactívelo en lugar de eliminarlo.",
                status.HTTP_409_CONFLICT,
            )
        plan.delete()
        return success_response(message="Plan eliminado correctamente.")


class CheckoutSessionCreateView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdministrator]

    @extend_schema(request=CheckoutCreateSerializer)
    def post(self, request):
        serializer = CheckoutCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        plan = get_plan(serializer.validated_data["plan_code"])
        if not plan:
            return _billing_error("El plan seleccionado no existe.", status.HTTP_400_BAD_REQUEST)

        try:
            checkout = create_checkout(plan, request.user)
        except StripeConfigurationError as exc:
            return _billing_error(str(exc), status.HTTP_503_SERVICE_UNAVAILABLE)
        except StripeGatewayError as exc:
            return _billing_error(str(exc), status.HTTP_502_BAD_GATEWAY)

        return success_response(
            {
                "session_id": checkout.session_id,
                "client_secret": checkout.client_secret,
            },
            "Sesión de pago creada correctamente.",
            status.HTTP_201_CREATED,
        )


class CheckoutSessionStatusView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdministrator]

    def get(self, request, session_id):
        try:
            payment = retrieve_checkout(session_id, request.user)
        except StripeConfigurationError as exc:
            return _billing_error(str(exc), status.HTTP_503_SERVICE_UNAVAILABLE)
        except StripeGatewayError as exc:
            return _billing_error(str(exc), status.HTTP_502_BAD_GATEWAY)

        return success_response(CheckoutStatusSerializer(payment).data)


class StripeWebhookView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(exclude=True)
    def post(self, request):
        try:
            process_webhook(
                request.body,
                request.headers.get("Stripe-Signature", ""),
            )
        except StripeConfigurationError as exc:
            return _billing_error(str(exc), status.HTTP_503_SERVICE_UNAVAILABLE)
        except StripeGatewayError as exc:
            return _billing_error(str(exc), status.HTTP_400_BAD_REQUEST)
        except stripe.StripeError:
            return _billing_error(
                "Stripe no pudo procesar el evento.",
                status.HTTP_502_BAD_GATEWAY,
            )
        return Response(status=status.HTTP_200_OK)
