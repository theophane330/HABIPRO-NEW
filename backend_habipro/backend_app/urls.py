# ============================================
# URLS INTÉGRÉES - VERSION COMPLÈTE
# ============================================
# Remplacez votre fichier urls.py actuel par celui-ci

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    # Vues existantes
    DocumentViewSet,
    PropertyViewSet,
    PropertyMediaViewSet,
    VisitRequestViewSet,
    TenantViewSet,
    LocationViewSet,
    ContractViewSet,
    PaymentViewSet,
    JuridicalDocumentViewSet,
    RegisterView,
    LoginView,
    LogoutView,
    UserProfileView,
    ChangePasswordView,
    CheckAuthView,
    DeleteAccountView,
    PrestataireViewSet,
    MaintenanceRequestViewSet,
    dashboard_statistics,
    
    AdminDashboardView ,
    AdminDocumentViewSet,
    AdminUserViewSet,
    AdminPropertyViewSet,
    AdminTenantViewSet,
    AdminPrestataireViewSet ,
)

# === 1. ROUTER : Tous les ViewSets (existants + admin) ===
router = DefaultRouter()

# ViewSets existants
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'properties', PropertyViewSet, basename='property')
router.register(r'property-media', PropertyMediaViewSet, basename='property-media')
router.register(r'visit-requests', VisitRequestViewSet, basename='visit-request')
router.register(r'tenants', TenantViewSet, basename='tenant')
router.register(r'locations', LocationViewSet, basename='location')
router.register(r'contracts', ContractViewSet, basename='contract')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'juridical-documents', JuridicalDocumentViewSet, basename='juridicaldocument')
router.register(r'prestataires', PrestataireViewSet, basename='prestataire')
router.register(r'maintenance-requests', MaintenanceRequestViewSet, basename='maintenance-request')

# ✅ NOUVEAUX ViewSets ADMIN
router.register(r'admin/users', AdminUserViewSet, basename='admin-users')
router.register(r'admin/properties', AdminPropertyViewSet, basename='admin-properties')
router.register(r'admin/documents', AdminDocumentViewSet, basename='admin-documents')
router.register(r'admin/tenants', AdminTenantViewSet, basename='admin-tenants')
router.register(r'admin/prestataires', AdminPrestataireViewSet, basename='admin-prestataires')

# === 2. URLS PERSONNALISÉES ===
urlpatterns = [
    # === API RACINE : toutes les routes du router ===
    path('', include(router.urls)),
    
    # === AUTH ===
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    
    # === PROFIL UTILISATEUR ===
    path('auth/profile/', UserProfileView.as_view(), name='profile'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('auth/check/', CheckAuthView.as_view(), name='check-auth'),
    path('auth/delete-account/', DeleteAccountView.as_view(), name='delete-account'),
    
    # === DASHBOARD ===
    path('dashboard/statistics/', dashboard_statistics, name='dashboard-statistics'),
    
    # === MAINTENANCE REQUESTS - Actions personnalisées ===
    path('maintenance-requests/<int:pk>/start-work/', 
         MaintenanceRequestViewSet.as_view({'post': 'start_work'}), 
         name='maintenance-start-work'),
    path('maintenance-requests/<int:pk>/resolve/', 
         MaintenanceRequestViewSet.as_view({'post': 'resolve_request'}), 
         name='maintenance-resolve'),
    path('maintenance-requests/<int:pk>/reject/', 
         MaintenanceRequestViewSet.as_view({'post': 'reject_request'}), 
         name='maintenance-reject'),
    path('maintenance-requests/<int:pk>/assign-provider/', 
         MaintenanceRequestViewSet.as_view({'post': 'assign_provider'}), 
         name='maintenance-assign-provider'),
    
    # ✅ === ADMIN - Dashboard et Rapports ===
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
]

