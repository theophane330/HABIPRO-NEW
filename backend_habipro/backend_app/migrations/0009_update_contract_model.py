# Generated manually for Contract model updates
import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend_app', '0008_location'),
    ]

    operations = [
        # Rename linked_property to property
        migrations.RenameField(
            model_name='contract',
            old_name='linked_property',
            new_name='property',
        ),

        # Add owner field
        migrations.AddField(
            model_name='contract',
            name='owner',
            field=models.ForeignKey(
                default=1,  # Temporary default, will be updated
                on_delete=django.db.models.deletion.CASCADE,
                related_name='contracts',
                to=settings.AUTH_USER_MODEL,
                verbose_name='Propriétaire',
                limit_choices_to={'role': 'proprietaire'}
            ),
            preserve_default=False,
        ),

        # Add location field
        migrations.AddField(
            model_name='contract',
            name='location',
            field=models.OneToOneField(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='contract',
                to='backend_app.location',
                verbose_name='Location associée'
            ),
        ),

        # Add status field
        migrations.AddField(
            model_name='contract',
            name='status',
            field=models.CharField(
                choices=[
                    ('draft', 'Brouillon'),
                    ('active', 'Actif'),
                    ('terminated', 'Résilié'),
                    ('expired', 'Expiré'),
                ],
                default='draft',
                max_length=50,
                verbose_name='Statut'
            ),
        ),

        # Add signed_at field
        migrations.AddField(
            model_name='contract',
            name='signed_at',
            field=models.DateTimeField(
                blank=True,
                null=True,
                verbose_name='Date de signature'
            ),
        ),

        # Update contract_purpose to TextField
        migrations.AlterField(
            model_name='contract',
            name='contract_purpose',
            field=models.TextField(blank=True, verbose_name='Objet du contrat'),
        ),

        # Update amount to DecimalField
        migrations.AlterField(
            model_name='contract',
            name='amount',
            field=models.DecimalField(
                decimal_places=2,
                max_digits=12,
                verbose_name='Montant (loyer ou prix)'
            ),
        ),

        # Update security_deposit to CharField
        migrations.AlterField(
            model_name='contract',
            name='security_deposit',
            field=models.CharField(
                blank=True,
                max_length=100,
                verbose_name='Dépôt de garantie'
            ),
        ),

        # Update payment_frequency choices
        migrations.AlterField(
            model_name='contract',
            name='payment_frequency',
            field=models.CharField(
                blank=True,
                choices=[
                    ('Mensuel', 'Mensuel'),
                    ('Trimestriel', 'Trimestriel'),
                    ('Semestriel', 'Semestriel'),
                    ('Annuel', 'Annuel'),
                ],
                max_length=50,
                verbose_name='Fréquence de paiement'
            ),
        ),

        # Update contract_type max_length
        migrations.AlterField(
            model_name='contract',
            name='contract_type',
            field=models.CharField(
                choices=[('Location', 'Location'), ('Vente', 'Vente')],
                max_length=50,
                verbose_name='Type de contrat'
            ),
        ),

        # Update payment_method
        migrations.AlterField(
            model_name='contract',
            name='payment_method',
            field=models.CharField(
                blank=True,
                max_length=50,
                verbose_name='Mode de paiement'
            ),
        ),
    ]
