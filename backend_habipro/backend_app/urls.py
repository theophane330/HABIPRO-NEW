from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DocumentViewSet, 
    PropertyViewSet, 
    PropertyMediaViewSet,
    RegisterView,
    LoginView,
    LogoutView,
    UserProfileView,
    ChangePasswordView,
    CheckAuthView,
    DeleteAccountView
)

# Configuration du router pour les ViewSets
router = DefaultRouter()
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'properties', PropertyViewSet, basename='property')
router.register(r'property-media', PropertyMediaViewSet, basename='property-media')

# Configuration des URLs
urlpatterns = [
    # Routes du router (documents, properties, property-media)
    path('', include(router.urls)),
    
    # Routes d'authentification
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    
    # Routes de profil utilisateur
    path('auth/profile/', UserProfileView.as_view(), name='profile'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('auth/check/', CheckAuthView.as_view(), name='check-auth'),
    path('auth/delete-account/', DeleteAccountView.as_view(), name='delete-account'),
]