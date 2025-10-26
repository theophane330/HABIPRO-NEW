# Generated manually for adding owner field to Tenant
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


def set_owner_from_property(apps, schema_editor):
    """Définir le owner depuis la propriété liée pour les locataires existants"""
    Tenant = apps.get_model('backend_app', 'Tenant')

    for tenant in Tenant.objects.all():
        if tenant.linked_property:
            # Définir le owner depuis la propriété liée
            tenant.owner_id = tenant.linked_property.owner_id
            tenant.save()
        else:
            # Si pas de propriété liée, supprimer le locataire ou assigner un propriétaire par défaut
            # Ici, on va essayer de trouver le premier propriétaire
            User = apps.get_model('backend_app', 'User')
            first_owner = User.objects.filter(role='proprietaire').first()
            if first_owner:
                tenant.owner_id = first_owner.id
                tenant.save()


class Migration(migrations.Migration):

    dependencies = [
        ('backend_app', '0009_update_contract_model'),
    ]

    operations = [
        # Étape 1: Ajouter le champ owner comme nullable d'abord
        migrations.AddField(
            model_name='tenant',
            name='owner',
            field=models.ForeignKey(
                null=True,
                blank=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='owned_tenants',
                to=settings.AUTH_USER_MODEL,
                verbose_name='Propriétaire',
                limit_choices_to={'role': 'proprietaire'}
            ),
        ),

        # Étape 2: Remplir le champ owner pour les enregistrements existants
        migrations.RunPython(set_owner_from_property, migrations.RunPython.noop),

        # Étape 3: Rendre le champ owner non-nullable
        migrations.AlterField(
            model_name='tenant',
            name='owner',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='owned_tenants',
                to=settings.AUTH_USER_MODEL,
                verbose_name='Propriétaire',
                limit_choices_to={'role': 'proprietaire'}
            ),
        ),
    ]
