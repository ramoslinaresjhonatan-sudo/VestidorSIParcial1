from django.urls import path
from apps.cart.api.views import CartView, CartItemCreateView, CartItemDetailView, CouponApplyView

app_name = "cart"
urlpatterns = [
    path("", CartView.as_view(), name="cart-detail"),
    path("items/", CartItemCreateView.as_view(), name="cart-item-create"),
    path("items/<int:item_id>/", CartItemDetailView.as_view(), name="cart-item-detail"),
    path("coupon/", CouponApplyView.as_view(), name="cart-coupon"),
]
