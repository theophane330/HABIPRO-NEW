"""
Script pour créer un superutilisateur
Exécutez: python manage.py shell
Puis collez ce code
"""

from backend_app.models import User
from django.contrib.auth.hashers import make_password

# Supprimer l'ancien superuser s'il existe
User.objects.filter(email='admin@habipro.com').delete()

# Créer un nouveau superutilisateur
superuser = User.objects.create(
    email='admin@habipro.com',
    nom='Admin',
    prenom='Super',
    telephone='0123456789',
    role='proprietaire',
    is_staff=True,
    is_superuser=True,
    is_active=True
)

# Définir le mot de passe
superuser.set_password('admin123')
superuser.save()

print("✅ Superutilisateur créé avec succès!")
print(f"Email: {superuser.email}")
print(f"Mot de passe: admin123")
print(f"Rôle: {superuser.role}")
print(f"Staff: {superuser.is_staff}")
print(f"Superuser: {superuser.is_superuser}")
print(f"Actif: {superuser.is_active}")

# Vérifier que le mot de passe fonctionne
from django.contrib.auth import authenticate
user = authenticate(username='admin@habipro.com', password='admin123')
if user:
    print("\n✅ Authentification réussie!")
else:
    print("\n❌ Échec de l'authentification")