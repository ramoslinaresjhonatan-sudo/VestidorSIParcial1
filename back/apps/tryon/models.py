from django.db import models

class PruebaGuardada(models.Model):
    usuario = models.ForeignKey("users.Usuario", on_delete=models.CASCADE, related_name="pruebas_tryon")
    producto = models.ForeignKey("catalog.Producto", on_delete=models.CASCADE, related_name="pruebas")
    talla = models.CharField(max_length=10, blank=True, default="")
    color = models.CharField(max_length=50, blank=True, default="")
    captura = models.ImageField(upload_to="tryon/capturas/%Y/%m/", blank=True, null=True)
    captura_base64 = models.TextField(blank=True, default="", help_text="Fallback base64 si offline")
    video = models.FileField(upload_to="tryon/videos/%Y/%m/", blank=True, null=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-creado_en",)
        verbose_name = "prueba guardada"
        verbose_name_plural = "pruebas guardadas"

    def __str__(self):
        return f"Prueba {self.id} {self.usuario.correo} {self.producto.nombre} {self.talla}/{self.color}"
