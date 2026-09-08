from django.urls import path

from apps.billing.api.views import (
    AdminPlanDetailView,
    AdminPlanListCreateView,
    CheckoutSessionCreateView,
    CheckoutSessionStatusView,
    PublicPlanListView,
    StripeWebhookView,
)

app_name = "billing"

urlpatterns = [
    path("plans/", PublicPlanListView.as_view(), name="public-plan-list"),
    path("admin/plans/", AdminPlanListCreateView.as_view(), name="admin-plan-list-create"),
    path("admin/plans/<int:plan_id>/", AdminPlanDetailView.as_view(), name="admin-plan-detail"),
    path(
        "checkout-sessions/",
        CheckoutSessionCreateView.as_view(),
        name="checkout-create",
    ),
    path(
        "checkout-sessions/<str:session_id>/",
        CheckoutSessionStatusView.as_view(),
        name="checkout-status",
    ),
    path("webhooks/stripe/", StripeWebhookView.as_view(), name="stripe-webhook"),
]
