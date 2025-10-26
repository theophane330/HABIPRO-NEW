# Generated manually to transform Payment model
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models
from decimal import Decimal


def migrate_payment_data(apps, schema_editor):
    """Migrer les données de l'ancien modèle Payment vers le nouveau"""
    Payment = apps.get_model('backend_app', 'Payment')

    # Récupérer tous les paiements existants
    old_payments = list(Payment.objects.all().values(
        'id', 'tenant_id', 'linked_property_id', 'month', 'amount',
        'payment_date', 'payment_method', 'status', 'created_at', 'updated_at'
    ))

    # Sauvegarder temporairement
    return old_payments


class Migration(migrations.Migration):

    dependencies = [
        ('backend_app', '0012_alter_contract_status'),
    ]

    operations = [
        # Étape 1: Supprimer l'ancien modèle Payment
        migrations.DeleteModel(
            name='Payment',
        ),

        # Étape 2: Recréer le modèle Payment avec la nouvelle structure
        migrations.CreateModel(
            name='Payment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amount', models.DecimalField(decimal_places=2, max_digits=12, verbose_name='Montant')),
                ('payment_month', models.CharField(max_length=50, verbose_name='Mois concerné')),
                ('payment_method', models.CharField(
                    choices=[
                        ('orange', 'Orange Money'),
                        ('mtn', 'MTN Money'),
                        ('moov', 'Moov Money'),
                        ('card', 'Carte Bancaire'),
                        ('transfer', 'Virement Bancaire'),
                        ('cash', 'Espèces'),
                        ('cheque', 'Chèque'),
                    ],
                    max_length=50,
                    verbose_name='Mode de paiement'
                )),
                ('status', models.CharField(
                    choices=[
                        ('pending', 'En attente'),
                        ('completed', 'Complété'),
                        ('failed', 'Échoué'),
                        ('cancelled', 'Annulé'),
                    ],
                    default='completed',
                    max_length=50,
                    verbose_name='Statut'
                )),
                ('auto_payment_enabled', models.BooleanField(default=False, verbose_name='Paiement automatique activé')),
                ('transaction_reference', models.CharField(blank=True, max_length=100, verbose_name='Référence de transaction')),
                ('notes', models.TextField(blank=True, verbose_name='Notes')),
                ('receipt_pdf', models.FileField(blank=True, null=True, upload_to='payments/receipts/', verbose_name='Reçu PDF')),
                ('payment_date', models.DateTimeField(auto_now_add=True, verbose_name='Date de paiement')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Date de création')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Date de modification')),
                ('location', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='payments',
                    to='backend_app.location',
                    verbose_name='Location associée'
                )),
                ('owner', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='received_payments',
                    to=settings.AUTH_USER_MODEL,
                    verbose_name='Propriétaire'
                )),
                ('property', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='payments',
                    to='backend_app.property',
                    verbose_name='Propriété'
                )),
                ('tenant', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='payments',
                    to='backend_app.tenant',
                    verbose_name='Locataire'
                )),
            ],
            options={
                'verbose_name': 'Paiement',
                'verbose_name_plural': 'Paiements',
                'db_table': 'payments',
                'ordering': ['-payment_date'],
            },
        ),
    ]
