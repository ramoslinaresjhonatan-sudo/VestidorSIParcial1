# Generated for CU-03 Gestionar perfil de usuario
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='usuario',
            name='telefono',
            field=models.CharField(blank=True, default='', max_length=20),
        ),
        migrations.AddField(
            model_name='usuario',
            name='direccion',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AddField(
            model_name='usuario',
            name='direccion_envio',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AddField(
            model_name='usuario',
            name='metodo_pago_preferido',
            field=models.CharField(blank=True, choices=[('tarjeta', 'Tarjeta'), ('paypal', 'PayPal'), ('transferencia', 'Transferencia'), ('efectivo', 'Efectivo contra entrega')], default='', max_length=20),
        ),
        migrations.AddField(
            model_name='usuario',
            name='medida_pecho',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True),
        ),
        migrations.AddField(
            model_name='usuario',
            name='medida_cintura',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True),
        ),
        migrations.AddField(
            model_name='usuario',
            name='medida_cadera',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True),
        ),
        migrations.AddField(
            model_name='usuario',
            name='altura',
            field=models.DecimalField(blank=True, decimal_places=2, help_text='Altura en cm', max_digits=5, null=True),
        ),
        migrations.AddField(
            model_name='usuario',
            name='peso',
            field=models.DecimalField(blank=True, decimal_places=2, help_text='Peso en kg', max_digits=5, null=True),
        ),
        migrations.AddField(
            model_name='usuario',
            name='talla_sugerida',
            field=models.CharField(blank=True, choices=[('XS', 'XS'), ('S', 'S'), ('M', 'M'), ('L', 'L'), ('XL', 'XL'), ('XXL', 'XXL')], default='', max_length=4),
        ),
        migrations.AddField(
            model_name='usuario',
            name='correo_verificado',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='usuario',
            name='correo_pendiente_verificacion',
            field=models.EmailField(blank=True, default='', max_length=254),
        ),
    ]
