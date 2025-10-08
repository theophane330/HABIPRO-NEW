from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet

# Créer le router pour les ViewSets
router = DefaultRouter()
router.register(r'documents', DocumentViewSet, basename='document')

# URLs de l'application
urlpatterns = [
    # Inclure toutes les routes du router
    path('', include(router.urls)),
]

# Les URLs générées automatiquement par le router:
# 
# GET    /api/documents/                    - Liste tous les documents
# POST   /api/documents/                    - Crée un nouveau document
# GET    /api/documents/{id}/               - Récupère un document spécifique
# PUT    /api/documents/{id}/               - Met à jour un document (complet)
# PATCH  /api/documents/{id}/               - Met à jour partiellement un document
# DELETE /api/documents/{id}/               - Supprime un document
# 
# Actions personnalisées:
# POST   /api/documents/upload-multiple/    - Upload multiple de fichiers PDF
# GET    /api/documents/{id}/download/      - Télécharge un document
# GET    /api/documents/{id}/preview/       - Prévisualise un document (inline)
# GET    /api/documents/statistics/         - Statistiques sur les documents