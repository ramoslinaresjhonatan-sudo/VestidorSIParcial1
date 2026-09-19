from django.urls import path
from .views import TryOnGuardarView, TryOnListView

app_name = "tryon"

urlpatterns = [
    path("guardar/", TryOnGuardarView.as_view(), name="tryon-guardar"),
    path("mis-pruebas/", TryOnListView.as_view(), name="tryon-list"),
]
