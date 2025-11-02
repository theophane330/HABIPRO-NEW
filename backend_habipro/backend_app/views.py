import os
import io
import csv
from datetime import datetime
from io import BytesIO
from mimetypes import guess_type

import requests
from django.db import models
from django.db.models import Q, Count, Sum
from django.http import FileResponse, HttpResponse
from django.contrib.auth import get_user_model
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import viewsets, status, filters, generics, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.authtoken.models import Token

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

from .models import (
    Document, 
    Property, 
    PropertyMedia, 
    VisitRequest, 
    Tenant, 
    Location, 
    Contract, 
    Payment,
    JuridicalDocument, 
    JuridicalChatMessage,
    Prestataire,
    Notification,
    MaintenanceRequest,
)

from .serializers import (
    # Serializers d'authentification
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    ChangePasswordSerializer,
    
    # Serializers de données
    DocumentSerializer,
    DocumentListSerializer,
    DocumentUploadSerializer,
    PropertySerializer,
    PropertyMediaSerializer,
    VisitRequestSerializer,
    VisitRequestUpdateSerializer,
    TenantSerializer,
    TenantCreateFromVisitSerializer,
    LocationSerializer,
    LocationCreateSerializer,
    ContractSerializer,
    ContractCreateSerializer,
    PaymentSerializer,
    TenantPaymentCreateSerializer,
    JuridicalDocumentSerializer,
    JuridicalChatMessageSerializer,
    AskQuestionSerializer,
    PrestataireSerializer, 
    PrestataireListSerializer, 
    PrestataireCreateSerializer,
    MaintenanceRequestSerializer,
    MaintenanceRequestCreateSerializer,
    MaintenanceRequestUpdateSerializer,
    AdminDocumentSerializer,
    AdminPrestataireSerializer,
    AdminPropertySerializer,
    AdminStatisticsSerializer,
    AdminTenantSerializer,
    AdminUserSerializer,
)

User = get_user_model()


# ==============================================
# VUES D'AUTHENTIFICATION
# ==============================================

class RegisterView(generics.CreateAPIView):
    """Vue pour l'inscription d'un nouvel utilisateur"""
    
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Créer un token pour l'utilisateur
        token, created = Token.objects.get_or_create(user=user)
        
        # Préparer les données utilisateur
        user_data = UserSerializer(user).data
        
        return Response({
            'message': 'Inscription réussie',
            'user': user_data,
            'token': token.key
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """Vue pour la connexion d'un utilisateur"""
    
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer
    
    def post(self, request):
        serializer = LoginSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        
        # Obtenir ou créer un token
        token, created = Token.objects.get_or_create(user=user)
        
        # Mettre à jour last_login
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        
        # Préparer les données utilisateur
        user_data = UserSerializer(user).data
        
        return Response({
            'message': 'Connexion réussie',
            'user': user_data,
            'token': token.key
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """Vue pour la déconnexion d'un utilisateur"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            # Supprimer le token de l'utilisateur
            request.user.auth_token.delete()
            return Response({
                'message': 'Déconnexion réussie'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': 'Erreur lors de la déconnexion'
            }, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Vue pour récupérer et mettre à jour le profil utilisateur"""
    
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial
        )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'message': 'Profil mis à jour avec succès',
            'user': serializer.data
        })


class ChangePasswordView(APIView):
    """Vue pour changer le mot de passe"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        # Changer le mot de passe
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        # Supprimer l'ancien token et en créer un nouveau
        try:
            request.user.auth_token.delete()
        except:
            pass
        
        token = Token.objects.create(user=user)
        
        return Response({
            'message': 'Mot de passe changé avec succès',
            'token': token.key
        }, status=status.HTTP_200_OK)


class CheckAuthView(APIView):
    """Vue pour vérifier si l'utilisateur est authentifié"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user_data = UserSerializer(request.user).data
        return Response({
            'authenticated': True,
            'user': user_data
        }, status=status.HTTP_200_OK)


class DeleteAccountView(APIView):
    """Vue pour supprimer le compte utilisateur"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request):
        user = request.user
        user.delete()
        
        return Response({
            'message': 'Compte supprimé avec succès'
        }, status=status.HTTP_200_OK)


# ==============================================
# VUES POUR LES DOCUMENTS
# ==============================================

class DocumentViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les documents"""
    
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    
    def get_serializer_class(self):
        """Retourne le serializer approprié selon l'action"""
        if self.action == 'list':
            return DocumentListSerializer
        elif self.action == 'upload_multiple':
            return DocumentUploadSerializer
        return DocumentSerializer
    
    def get_queryset(self):
        """Filtre les documents selon les paramètres de requête"""
        # Filtrer par propriétaire si l'utilisateur est authentifié
        if self.request.user.is_authenticated and self.request.user.role == 'proprietaire':
            queryset = Document.objects.filter(owner=self.request.user)
        else:
            queryset = Document.objects.all()

        # Filtre par catégorie
        category = self.request.query_params.get('category', None)
        if category and category != 'all':
            queryset = queryset.filter(category=category)

        # Filtre par statut
        status_param = self.request.query_params.get('status', None)
        if status_param:
            queryset = queryset.filter(status=status_param)

        # Filtre par locataire
        tenant = self.request.query_params.get('tenant', None)
        if tenant:
            queryset = queryset.filter(tenant__icontains=tenant)

        # Filtre par propriété
        property_param = self.request.query_params.get('property', None)
        if property_param:
            queryset = queryset.filter(property__icontains=property_param)

        # Recherche globale
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(tenant__icontains=search) |
                Q(property__icontains=search)
            )

        return queryset.order_by('-date', '-created_at')
    
    def perform_create(self, serializer):
        """Affecter automatiquement le propriétaire lors de la création"""
        if self.request.user.is_authenticated and self.request.user.role == 'proprietaire':
            serializer.save(owner=self.request.user)
        else:
            serializer.save()

    def create(self, request, *args, **kwargs):
        """Crée un nouveau document"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                'message': 'Document créé avec succès',
                'data': serializer.data
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )
    
    def update(self, request, *args, **kwargs):
        """Met à jour un document"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'message': 'Document mis à jour avec succès',
            'data': serializer.data
        })
    
    def destroy(self, request, *args, **kwargs):
        """Supprime un document"""
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {'message': 'Document supprimé avec succès'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['post'], url_path='upload-multiple')
    def upload_multiple(self, request):
        """Upload multiple de documents PDF"""
        serializer = DocumentUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        files = serializer.validated_data.get('files', [])
        category = serializer.validated_data.get('category')
        tenant = serializer.validated_data.get('tenant', 'Non spécifié')
        property_name = serializer.validated_data.get('property', 'Non spécifiée')
        status_val = serializer.validated_data.get('status', 'active')
        
        created_documents = []
        errors = []
        
        for file in files:
            try:
                # Créer le document
                document_data = {
                    'title': file.name.replace('.pdf', ''),
                    'category': category,
                    'type': self._get_type_from_category(category),
                    'tenant': tenant,
                    'property': property_name,
                    'status': status_val,
                    'date': datetime.now().date(),
                    'file': file
                }

                doc_serializer = DocumentSerializer(
                    data=document_data,
                    context={'request': request}
                )

                if doc_serializer.is_valid():
                    # Affecter automatiquement le propriétaire si l'utilisateur est authentifié
                    if request.user.is_authenticated and request.user.role == 'proprietaire':
                        doc_serializer.save(owner=request.user)
                    else:
                        doc_serializer.save()
                    created_documents.append(doc_serializer.data)
                else:
                    errors.append({
                        'file': file.name,
                        'errors': doc_serializer.errors
                    })
                    
            except Exception as e:
                errors.append({
                    'file': file.name,
                    'error': str(e)
                })
        
        return Response({
            'message': f'{len(created_documents)} document(s) créé(s) avec succès',
            'created': created_documents,
            'errors': errors,
            'total_uploaded': len(created_documents),
            'total_errors': len(errors)
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'], url_path='download')
    def download(self, request, pk=None):
        """Télécharge un document"""
        document = self.get_object()
        
        if not document.file:
            return Response(
                {'error': 'Aucun fichier associé à ce document'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            response = FileResponse(
                document.file.open('rb'),
                content_type='application/pdf'
            )
            response['Content-Disposition'] = f'attachment; filename="{document.title}.pdf"'
            return response
        except Exception as e:
            return Response(
                {'error': f'Erreur lors du téléchargement: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'], url_path='preview')
    def preview(self, request, pk=None):
        """Prévisualise un document (inline)"""
        document = self.get_object()
        
        if not document.file:
            return Response(
                {'error': 'Aucun fichier associé à ce document'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            response = FileResponse(
                document.file.open('rb'),
                content_type='application/pdf'
            )
            response['Content-Disposition'] = f'inline; filename="{document.title}.pdf"'
            return response
        except Exception as e:
            return Response(
                {'error': f'Erreur lors de la prévisualisation: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='statistics')
    def statistics(self, request):
        """Retourne les statistiques sur les documents"""
        stats = {
            'total': Document.objects.count(),
            'by_category': {},
            'by_status': {},
            'recent': Document.objects.order_by('-created_at')[:5].values(
                'id', 'title', 'category', 'created_at'
            )
        }
        
        # Statistiques par catégorie
        categories = Document.objects.values('category').annotate(
            count=Count('id')
        )
        for cat in categories:
            stats['by_category'][cat['category']] = cat['count']
        
        # Statistiques par statut
        statuses = Document.objects.values('status').annotate(
            count=Count('id')
        )
        for stat in statuses:
            stats['by_status'][stat['status']] = stat['count']
        
        return Response(stats)
    
    def _get_type_from_category(self, category):
        """Retourne le type par défaut selon la catégorie"""
        types_map = {
            'contracts': 'Contrat de bail',
            'inventory': 'État des lieux',
            'receipts': 'Quittance de loyer',
            'insurance': 'Police d\'assurance'
        }
        return types_map.get(category, 'Document')



# ==============================================
# VUES POUR LES MÉDIAS DE PROPRIÉTÉS
# ==============================================

class PropertyMediaViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les médias des propriétés"""
    
    queryset = PropertyMedia.objects.all()
    serializer_class = PropertyMediaSerializer
    parser_classes = (MultiPartParser, FormParser)
    
    def get_queryset(self):
        """Filtre optionnel par property_id"""
        queryset = PropertyMedia.objects.all()
        property_id = self.request.query_params.get('property_id')
        if property_id:
            queryset = queryset.filter(property_id=property_id)
        return queryset.order_by('order', '-uploaded_at')
    
    @action(detail=False, methods=['post'])
    def bulk_upload(self, request):
        """Upload multiple de médias pour une propriété"""
        property_id = request.data.get('property_id')
        files = request.FILES.getlist('files')
        
        if not property_id:
            return Response(
                {'error': 'property_id requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            property_obj = Property.objects.get(id=property_id)
        except Property.DoesNotExist:
            return Response(
                {'error': 'Propriété introuvable'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not files:
            return Response(
                {'error': 'Aucun fichier fourni'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        created_medias = []
        existing_count = PropertyMedia.objects.filter(property=property_obj).count()
        
        for index, file in enumerate(files):
            # Déterminer si c'est le premier média (média principal)
            is_primary = (existing_count == 0 and index == 0)
            
            media = PropertyMedia.objects.create(
                property=property_obj,
                file=file,
                is_primary=is_primary,
                order=existing_count + index
            )
            created_medias.append(media)
        
        serializer = self.get_serializer(created_medias, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['patch'])
    def set_primary(self, request, pk=None):
        """Définir un média comme principal"""
        media = self.get_object()
        
        # Désactiver tous les autres médias principaux de cette propriété
        PropertyMedia.objects.filter(
            property=media.property,
            is_primary=True
        ).update(is_primary=False)
        
        # Activer ce média comme principal
        media.is_primary = True
        media.save()
        
        serializer = self.get_serializer(media)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def reorder(self, request):
        """Réorganiser l'ordre des médias"""
        media_orders = request.data.get('orders', [])
        
        for item in media_orders:
            media_id = item.get('id')
            order = item.get('order')
            
            try:
                media = PropertyMedia.objects.get(id=media_id)
                media.order = order
                media.save()
            except PropertyMedia.DoesNotExist:
                continue
        
        return Response({'message': 'Ordre mis à jour'})


# ==============================================
# VUES POUR LES PROPRIÉTÉS
# ==============================================

class PropertyViewSet(viewsets.ModelViewSet):
    """ViewSet pour les propriétés avec support des médias multiples"""

    queryset = Property.objects.all().prefetch_related('medias')
    serializer_class = PropertySerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['statut', 'type']
    search_fields = ['titre', 'adresse', 'locataire']
    ordering_fields = ['date_ajout', 'prix', 'titre']
    ordering = ['-date_ajout']
    # L'authentification est requise pour toutes les opérations
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        # Les propriétaires voient seulement leurs propres propriétés
        if user.is_authenticated and user.role == 'proprietaire':
            queryset = queryset.filter(owner=user)
        # Les locataires voient toutes les propriétés disponibles
        elif user.is_authenticated and user.role == 'locataire':
            # Les locataires peuvent voir toutes les propriétés
            pass

        # Filtrage par statut
        statut = self.request.query_params.get('statut', None)
        if statut and statut != 'all':
            queryset = queryset.filter(statut=statut)

        return queryset

    def perform_create(self, serializer):
        """Assigner automatiquement le propriétaire connecté lors de la création"""
        # Assigner l'utilisateur connecté comme propriétaire
        if not self.request.user.is_authenticated:
            raise permissions.PermissionDenied("Vous devez être connecté pour créer une propriété")
        serializer.save(owner=self.request.user)
    
    @action(detail=False, methods=['get'])
    def statistiques(self, request):
        """Endpoint pour obtenir les statistiques des propriétés"""
        total = self.get_queryset().count()
        louees = self.get_queryset().filter(statut='loué').count()
        disponibles = self.get_queryset().filter(statut='disponible').count()
        en_vente = self.get_queryset().filter(statut='en_vente').count()
        
        # Calcul des revenus mensuels (propriétés louées)
        revenus = sum(
            prop.prix for prop in self.get_queryset().filter(statut='loué')
        )
        
        return Response({
            'total': total,
            'louees': louees,
            'disponibles': disponibles,
            'en_vente': en_vente,
            'revenus_mensuels': revenus
        })
    
    @action(detail=False, methods=['get'])
    def export(self, request):
        """Endpoint pour exporter les données des propriétés"""
        proprietes = self.get_queryset()
        serializer = self.get_serializer(proprietes, many=True)
        
        return Response({
            'count': proprietes.count(),
            'data': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def upload_media(self, request, pk=None):
        """Upload de médias pour une propriété spécifique"""
        property_obj = self.get_object()
        files = request.FILES.getlist('files')
        
        if not files:
            return Response(
                {'error': 'Aucun fichier fourni'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        created_medias = []
        existing_count = property_obj.medias.count()
        
        for index, file in enumerate(files):
            # Si c'est le premier média de la propriété, le marquer comme principal
            is_primary = (existing_count == 0 and index == 0)
            
            media = PropertyMedia.objects.create(
                property=property_obj,
                file=file,
                is_primary=is_primary,
                order=existing_count + index
            )
            created_medias.append(media)
        
        serializer = PropertyMediaSerializer(
            created_medias,
            many=True,
            context={'request': request}
        )
        return Response(
            {
                'message': f'{len(created_medias)} média(s) ajouté(s) avec succès',
                'medias': serializer.data
            },
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['delete'])
    def delete_media(self, request, pk=None):
        """Supprimer un média spécifique d'une propriété"""
        property_obj = self.get_object()
        media_id = request.data.get('media_id')
        
        if not media_id:
            return Response(
                {'error': 'media_id requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            media = PropertyMedia.objects.get(id=media_id, property=property_obj)
            was_primary = media.is_primary
            media.delete()
            
            # Si le média supprimé était principal, définir un nouveau média principal
            if was_primary:
                first_media = property_obj.medias.first()
                if first_media:
                    first_media.is_primary = True
                    first_media.save()
            
            return Response({'message': 'Média supprimé avec succès'})
        except PropertyMedia.DoesNotExist:
            return Response(
                {'error': 'Média introuvable'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def medias(self, request, pk=None):
        """Liste tous les médias d'une propriété"""
        property_obj = self.get_object()
        medias = property_obj.medias.all()
        serializer = PropertyMediaSerializer(
            medias,
            many=True,
            context={'request': request}
        )
        return Response({
            'count': medias.count(),
            'medias': serializer.data
        })
    
    def destroy(self, request, *args, **kwargs):
        """Suppression d'une propriété et de tous ses médias"""
        instance = self.get_object()
        titre = instance.titre

        # Les médias seront supprimés automatiquement grâce au on_delete=CASCADE
        self.perform_destroy(instance)

        return Response(
            {'message': f'La propriété "{titre}" et tous ses médias ont été supprimés avec succès.'},
            status=status.HTTP_200_OK
        )


# ==============================================
# VUES POUR LES DEMANDES DE VISITE
# ==============================================

class VisitRequestViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les demandes de visite"""

    serializer_class = VisitRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filtre les demandes selon le rôle de l'utilisateur"""
        user = self.request.user

        if user.role == 'locataire':
            # Le locataire ne voit que ses propres demandes
            return VisitRequest.objects.filter(tenant=user).order_by('-created_at')
        elif user.role == 'proprietaire':
            # Le propriétaire voit les demandes pour ses propriétés
            return VisitRequest.objects.filter(
                property__owner=user
            ).order_by('-created_at')
        else:
            return VisitRequest.objects.none()

    def get_serializer_class(self):
        """Retourne le serializer approprié selon l'action"""
        if self.action in ['update', 'partial_update']:
            return VisitRequestUpdateSerializer
        return VisitRequestSerializer

    def create(self, request, *args, **kwargs):
        """Crée une nouvelle demande de visite (locataire uniquement)"""
        # Debug: afficher les infos de l'utilisateur
        print(f"[DEBUG] User: {request.user}")
        print(f"[DEBUG] User authenticated: {request.user.is_authenticated}")
        print(f"[DEBUG] User role: {getattr(request.user, 'role', 'NO ROLE')}")

        if not request.user.is_authenticated:
            return Response(
                {'error': 'Vous devez être connecté pour créer une demande de visite'},
                status=status.HTTP_403_FORBIDDEN
            )

        # TEMPORAIRE: Permettre aux propriétaires de tester (à retirer en production)
        # if request.user.role != 'locataire':
        #     return Response(
        #         {'error': f'Seuls les locataires peuvent créer des demandes de visite. Votre rôle actuel: {request.user.role}'},
        #         status=status.HTTP_403_FORBIDDEN
        #     )

        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                'message': 'Demande de visite envoyée avec succès',
                'data': serializer.data
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )

    def update(self, request, *args, **kwargs):
        """Met à jour une demande de visite (propriétaire ou locataire)"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        # Vérifier les permissions selon le rôle
        if request.user.role == 'proprietaire':
            # Le propriétaire peut modifier les demandes pour ses propriétés
            if instance.property.owner != request.user:
                return Response(
                    {'error': 'Vous ne pouvez modifier que les demandes pour vos propriétés'},
                    status=status.HTTP_403_FORBIDDEN
                )
        elif request.user.role == 'locataire':
            # Le locataire peut modifier uniquement ses propres demandes
            if instance.tenant != request.user:
                return Response(
                    {'error': 'Vous ne pouvez modifier que vos propres demandes'},
                    status=status.HTTP_403_FORBIDDEN
                )
            # Le locataire ne peut modifier que le statut (pour accepter/refuser une proposition)
            allowed_fields = {'status'}
            if not set(request.data.keys()).issubset(allowed_fields):
                return Response(
                    {'error': 'Vous ne pouvez modifier que le statut de la demande'},
                    status=status.HTTP_403_FORBIDDEN
                )
        else:
            return Response(
                {'error': 'Vous n\'avez pas la permission de modifier cette demande'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # Retourner les données complètes avec VisitRequestSerializer
        response_serializer = VisitRequestSerializer(instance, context={'request': request})

        return Response({
            'message': 'Demande de visite mise à jour avec succès',
            'data': response_serializer.data
        })

    @action(detail=False, methods=['get'], url_path='pending')
    def pending_requests(self, request):
        """Retourne uniquement les demandes en attente"""
        queryset = self.get_queryset().filter(status='pending')
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'count': queryset.count(),
            'results': serializer.data
        })

    @action(detail=False, methods=['get'], url_path='by-property/(?P<property_id>[^/.]+)')
    def by_property(self, request, property_id=None):
        """Retourne les demandes pour une propriété spécifique"""
        queryset = self.get_queryset().filter(property_id=property_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'count': queryset.count(),
            'results': serializer.data
        })

    @action(detail=True, methods=['post'], url_path='accept')
    def accept_request(self, request, pk=None):
        """Accepte une demande de visite (propriétaire)"""
        if request.user.role != 'proprietaire':
            return Response(
                {'error': 'Seuls les propriétaires peuvent accepter les demandes'},
                status=status.HTTP_403_FORBIDDEN
            )

        instance = self.get_object()

        if instance.property.owner != request.user:
            return Response(
                {'error': 'Vous ne pouvez accepter que les demandes pour vos propriétés'},
                status=status.HTTP_403_FORBIDDEN
            )

        instance.status = 'accepted'
        instance.save()

        serializer = VisitRequestSerializer(instance, context={'request': request})
        return Response({
            'message': 'Demande de visite acceptée',
            'data': serializer.data
        })

    @action(detail=True, methods=['post'], url_path='reject')
    def reject_request(self, request, pk=None):
        """Rejette une demande de visite (propriétaire)"""
        if request.user.role != 'proprietaire':
            return Response(
                {'error': 'Seuls les propriétaires peuvent rejeter les demandes'},
                status=status.HTTP_403_FORBIDDEN
            )

        instance = self.get_object()

        if instance.property.owner != request.user:
            return Response(
                {'error': 'Vous ne pouvez rejeter que les demandes pour vos propriétés'},
                status=status.HTTP_403_FORBIDDEN
            )

        instance.status = 'rejected'
        instance.owner_message = request.data.get('owner_message', '')
        instance.save()

        serializer = VisitRequestSerializer(instance, context={'request': request})
        return Response({
            'message': 'Demande de visite rejetée',
            'data': serializer.data
        })

    @action(detail=True, methods=['post'], url_path='propose-date')
    def propose_date(self, request, pk=None):
        """Propose une nouvelle date (propriétaire)"""
        if request.user.role != 'proprietaire':
            return Response(
                {'error': 'Seuls les propriétaires peuvent proposer une nouvelle date'},
                status=status.HTTP_403_FORBIDDEN
            )

        instance = self.get_object()

        if instance.property.owner != request.user:
            return Response(
                {'error': 'Vous ne pouvez proposer une date que pour vos propriétés'},
                status=status.HTTP_403_FORBIDDEN
            )

        proposed_date = request.data.get('proposed_date')
        if not proposed_date:
            return Response(
                {'error': 'La date proposée est requise'},
                status=status.HTTP_400_BAD_REQUEST
            )

        instance.status = 'proposed'
        instance.proposed_date = proposed_date
        instance.owner_message = request.data.get('owner_message', '')
        instance.save()

        serializer = VisitRequestSerializer(instance, context={'request': request})
        return Response({
            'message': 'Nouvelle date proposée',
            'data': serializer.data
        })

    def destroy(self, request, *args, **kwargs):
        """Supprime une demande de visite"""
        instance = self.get_object()

        # Vérifier les permissions
        if request.user.role == 'proprietaire':
            # Le propriétaire peut supprimer les demandes pour ses propriétés
            if instance.property.owner != request.user:
                return Response(
                    {'error': 'Vous ne pouvez supprimer que les demandes pour vos propriétés'},
                    status=status.HTTP_403_FORBIDDEN
                )
        elif request.user.role == 'locataire':
            # Le locataire peut supprimer uniquement ses propres demandes
            if instance.tenant != request.user:
                return Response(
                    {'error': 'Vous ne pouvez supprimer que vos propres demandes'},
                    status=status.HTTP_403_FORBIDDEN
                )
        else:
            return Response(
                {'error': 'Vous n\'avez pas la permission de supprimer cette demande'},
                status=status.HTTP_403_FORBIDDEN
            )

        self.perform_destroy(instance)
        return Response(
            {'message': 'Demande de visite supprimée avec succès'},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'], url_path='unread-count')
    def unread_count(self, request):
        """Retourne le nombre de messages non lus pour l'utilisateur connecté"""
        user = request.user

        if user.role == 'locataire':
            # Pour le locataire : messages non lus où il y a une réponse du propriétaire
            # (status='proposed' ou 'accepted' ou 'rejected') et read_by_tenant=False
            unread = VisitRequest.objects.filter(
                tenant=user,
                read_by_tenant=False
            ).exclude(status='pending').count()
        elif user.role == 'proprietaire':
            # Pour le propriétaire : nouvelles demandes ou mises à jour non lues
            unread = VisitRequest.objects.filter(
                property__owner=user,
                read_by_owner=False
            ).count()
        else:
            unread = 0

        return Response({'unread_count': unread})

    @action(detail=True, methods=['post'], url_path='mark-as-read')
    def mark_as_read(self, request, pk=None):
        """Marque un message comme lu pour l'utilisateur connecté"""
        instance = self.get_object()
        user = request.user

        if user.role == 'locataire' and instance.tenant == user:
            instance.read_by_tenant = True
            instance.save(update_fields=['read_by_tenant'])
            return Response({'message': 'Message marqué comme lu'})
        elif user.role == 'proprietaire' and instance.property.owner == user:
            instance.read_by_owner = True
            instance.save(update_fields=['read_by_owner'])
            return Response({'message': 'Message marqué comme lu'})
        else:
            return Response(
                {'error': 'Vous n\'avez pas la permission de modifier ce message'},
                status=status.HTTP_403_FORBIDDEN
            )

# ==============================================
# VUES POUR LES LOCATAIRES (TENANTS)
# ==============================================

class TenantViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les locataires"""

    serializer_class = TenantSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'linked_property']
    search_fields = ['full_name', 'email', 'phone']
    ordering_fields = ['created_at', 'full_name']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filtre les locataires selon le rôle de l'utilisateur"""
        user = self.request.user

        if user.role == 'proprietaire':
            # Le propriétaire ne voit que les locataires qui ont une location dans ses propriétés
            from django.db.models import Q
            return Tenant.objects.filter(
                Q(locations__property__owner=user) | Q(linked_property__owner=user)
            ).distinct().select_related('user', 'linked_property')
        else:
            return Tenant.objects.none()

    def get_serializer_class(self):
        """Retourne le serializer approprié selon l'action"""
        if self.action == 'create':
            return TenantCreateFromVisitSerializer
        return TenantSerializer

    def create(self, request, *args, **kwargs):
        """Crée un nouveau locataire et une location associée"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Créer le locataire avec le propriétaire connecté
        tenant = serializer.save(owner=request.user)

        # Si une propriété est liée, créer automatiquement une Location
        linked_property = serializer.validated_data.get('linked_property')
        if linked_property:
            # Vérifier qu'il n'y a pas déjà une location active
            existing_location = Location.objects.filter(
                property=linked_property,
                status='active'
            ).first()

            if existing_location:
                # Supprimer le locataire créé car la propriété est déjà louée
                tenant.delete()
                return Response(
                    {'error': f'Cette propriété est déjà louée'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Créer la location
            location_data = {
                'tenant': tenant,
                'property': linked_property,
                'owner': linked_property.owner,
                'lease_start_date': serializer.validated_data.get('lease_start_date'),
                'lease_end_date': serializer.validated_data.get('lease_end_date'),
                'monthly_rent': serializer.validated_data.get('monthly_rent'),
                'security_deposit': serializer.validated_data.get('security_deposit'),
                'payment_method': serializer.validated_data.get('payment_method'),
                'status': 'active',
                'additional_notes': serializer.validated_data.get('additional_notes', '')
            }

            location = Location.objects.create(**location_data)

        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                'message': 'Locataire et location créés avec succès',
                'data': serializer.data
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )

    @action(detail=False, methods=['get'], url_path='from-accepted-visits')
    def from_accepted_visits(self, request):
        """Retourne la liste des locataires (users) ayant des visites acceptées"""
        user = request.user

        if user.role != 'proprietaire':
            return Response(
                {'error': 'Seuls les propriétaires peuvent accéder à cette ressource'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Récupérer les demandes de visite acceptées pour les propriétés du propriétaire
        accepted_visits = VisitRequest.objects.filter(
            property__owner=user,
            status='accepted'
        ).select_related('tenant', 'property')

        # Créer une liste des locataires avec leurs infos et la propriété concernée
        tenants_data = []
        for visit in accepted_visits:
            tenant_user = visit.tenant
            tenants_data.append({
                'id': tenant_user.id,
                'visit_request_id': visit.id,
                'full_name': f"{tenant_user.prenom} {tenant_user.nom}",
                'email': tenant_user.email,
                'phone': tenant_user.telephone,
                'property_id': visit.property.id,
                'property_title': visit.property.titre,
                'requested_date': visit.requested_date,
                'accepted_date': visit.updated_at
            })

        return Response(tenants_data)


# ==============================================
# VUES POUR LES LOCATIONS
# ==============================================

class LocationViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les locations (baux)"""

    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'property', 'tenant']
    search_fields = ['tenant__full_name', 'property__titre']
    ordering_fields = ['created_at', 'lease_start_date']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filtre les locations selon le rôle de l'utilisateur"""
        user = self.request.user

        if user.role == 'proprietaire':
            # Le propriétaire ne voit que les locations de ses propriétés
            return Location.objects.filter(
                owner=user
            ).select_related('tenant', 'property', 'owner')
        elif user.role == 'locataire':
            # Le locataire voit ses propres locations
            # D'abord trouver son profil Tenant
            tenant_profile = Tenant.objects.filter(user=user).first()
            if tenant_profile:
                return Location.objects.filter(
                    tenant=tenant_profile
                ).select_related('tenant', 'property', 'owner')
            return Location.objects.none()
        else:
            return Location.objects.none()

    def get_serializer_class(self):
        """Retourne le serializer approprié selon l'action"""
        if self.action == 'create':
            return LocationCreateSerializer
        return LocationSerializer

    def create(self, request, *args, **kwargs):
        """Crée une nouvelle location"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Auto-remplir le propriétaire si non fourni
        if not serializer.validated_data.get('owner'):
            if request.user.role == 'proprietaire':
                serializer.validated_data['owner'] = request.user
            elif serializer.validated_data.get('property'):
                serializer.validated_data['owner'] = serializer.validated_data['property'].owner

        # Créer la location
        location = serializer.save()

        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                'message': 'Location créée avec succès',
                'data': LocationSerializer(location, context={'request': request}).data
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )

    def update(self, request, *args, **kwargs):
        """Met à jour une location"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response({
            'message': 'Location mise à jour avec succès',
            'data': serializer.data
        })

    def destroy(self, request, *args, **kwargs):
        """Supprime (résilie) une location"""
        instance = self.get_object()

        # Au lieu de supprimer, marquer comme résilié
        instance.status = 'terminated'
        instance.terminated_at = timezone.now()
        instance.save()

        return Response(
            {'message': 'Location résiliée avec succès'},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'], url_path='active')
    def active_locations(self, request):
        """Retourne uniquement les locations actives"""
        queryset = self.get_queryset().filter(status='active')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='by-property/(?P<property_id>[^/.]+)')
    def by_property(self, request, property_id=None):
        """Retourne les locations pour une propriété spécifique"""
        queryset = self.get_queryset().filter(property_id=property_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


# ============================================
# STATISTIQUES DU DASHBOARD PROPRIÉTAIRE
# ============================================
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_statistics(request):
    """
    Retourne les statistiques globales pour le dashboard du propriétaire
    - Nombre de propriétés
    - Nombre de locataires
    - Taux d'occupation
    - Revenus mensuels
    """
    user = request.user

    if user.role != 'proprietaire':
        return Response(
            {'error': 'Seuls les propriétaires peuvent accéder à ces statistiques'},
            status=status.HTTP_403_FORBIDDEN
        )

    # Nombre de propriétés
    total_properties = Property.objects.filter(owner=user).count()

    # Nombre de locataires (locations actives)
    total_tenants = Location.objects.filter(
        property__owner=user,
        status='active'
    ).count()

    # Taux d'occupation
    if total_properties > 0:
        occupied_properties = Location.objects.filter(
            property__owner=user,
            status='active'
        ).values('property').distinct().count()
        occupation_rate = round((occupied_properties / total_properties) * 100)
    else:
        occupation_rate = 0

    # Revenus mensuels (somme des loyers des locations actives)
    monthly_revenue = Location.objects.filter(
        property__owner=user,
        status='active'
    ).aggregate(total=Sum('monthly_rent'))['total'] or 0

    return Response({
        'total_properties': total_properties,
        'total_tenants': total_tenants,
        'occupation_rate': occupation_rate,
        'monthly_revenue': monthly_revenue
    })


# ============================================
# VUES POUR LES CONTRATS
# ============================================

class ContractViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les contrats"""

    queryset = Contract.objects.all()
    serializer_class = ContractSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_serializer_class(self):
        """Retourne le serializer approprié selon l'action"""
        if self.action == 'create':
            return ContractCreateSerializer
        return ContractSerializer

    def get_queryset(self):
        """Filtre les contrats selon l'utilisateur"""
        user = self.request.user

        if user.role == 'proprietaire':
            # Le propriétaire voit ses contrats
            return Contract.objects.filter(owner=user).select_related(
                'tenant', 'property', 'owner'
            )
        elif user.role == 'locataire':
            # Le locataire voit ses contrats
            tenant = Tenant.objects.filter(user=user).first()
            if tenant:
                return Contract.objects.filter(tenant=tenant).select_related(
                    'tenant', 'property', 'owner'
                )

        return Contract.objects.none()

    def create(self, request, *args, **kwargs):
        """Crée un nouveau contrat avec validation"""
        import json
        
        # 🔍 DEBUG : Afficher les données reçues
        print("=" * 80)
        print("📥 DONNÉES CONTRAT REÇUES:")
        print(json.dumps(request.data, indent=2, ensure_ascii=False, default=str))
        print("=" * 80)
        
        serializer = self.get_serializer(data=request.data)
        
        # Valider les données
        if not serializer.is_valid():
            print("❌ ERREURS DE VALIDATION CONTRAT:")
            print(json.dumps(serializer.errors, indent=2, ensure_ascii=False))
            print("=" * 80)
            return Response(
                {
                    'error': 'Erreur de validation',
                    'details': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # ✅ Validation manuelle du propriétaire
        property_obj = serializer.validated_data.get('property')
        tenant_obj = serializer.validated_data.get('tenant')
        
        if not property_obj:
            return Response(
                {'error': 'La propriété est requise'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not tenant_obj:
            return Response(
                {'error': 'Le locataire est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifier que la propriété appartient au propriétaire connecté
        if property_obj.owner != request.user:
            return Response(
                {'error': 'Cette propriété ne vous appartient pas'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Vérifier que le locataire appartient au propriétaire
        if tenant_obj.owner != request.user:
            return Response(
                {'error': 'Ce locataire ne vous appartient pas'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            # Créer le contrat
            contract = serializer.save(owner=request.user)
            
            # Sérialiser avec le serializer complet
            response_serializer = ContractSerializer(
                contract,
                context={'request': request}
            )
            
            print("✅ CONTRAT CRÉÉ AVEC SUCCÈS")
            print("=" * 80)
            
            headers = self.get_success_headers(serializer.data)
            return Response(
                {
                    'message': 'Contrat créé avec succès',
                    'data': response_serializer.data
                },
                status=status.HTTP_201_CREATED,
                headers=headers
            )
            
        except Exception as e:
            print(f"💥 ERREUR LORS DE LA CRÉATION DU CONTRAT: {e}")
            import traceback
            traceback.print_exc()
            print("=" * 80)
            
            return Response(
                {
                    'error': 'Erreur lors de la création du contrat',
                    'details': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        """Met à jour un contrat"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Vérifier que c'est bien le propriétaire
        if instance.owner != request.user:
            return Response(
                {'error': 'Vous ne pouvez modifier que vos propres contrats'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response({
            'message': 'Contrat mis à jour avec succès',
            'data': serializer.data
        })

    def destroy(self, request, *args, **kwargs):
        """Supprime un contrat"""
        instance = self.get_object()
        
        # Vérifier que c'est bien le propriétaire
        if instance.owner != request.user:
            return Response(
                {'error': 'Vous ne pouvez supprimer que vos propres contrats'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        titre = f"{instance.contract_type} - {instance.property.titre}"
        self.perform_destroy(instance)
        
        return Response(
            {'message': f'Le contrat "{titre}" a été supprimé avec succès'},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], url_path='activate')
    def activate_contract(self, request, pk=None):
        """Activer un contrat"""
        contract = self.get_object()

        if contract.status == 'active':
            return Response({
                'error': 'Ce contrat est déjà actif'
            }, status=status.HTTP_400_BAD_REQUEST)

        contract.status = 'active'
        contract.save()

        serializer = self.get_serializer(contract)
        return Response({
            'message': 'Contrat activé avec succès',
            'data': serializer.data
        })

    @action(detail=True, methods=['post'], url_path='terminate')
    def terminate_contract(self, request, pk=None):
        """Résilier un contrat"""
        contract = self.get_object()

        if contract.status == 'terminated':
            return Response({
                'error': 'Ce contrat est déjà résilié'
            }, status=status.HTTP_400_BAD_REQUEST)

        contract.status = 'terminated'
        contract.save()

        serializer = self.get_serializer(contract)
        return Response({
            'message': 'Contrat résilié avec succès',
            'data': serializer.data
        })

    @action(detail=False, methods=['get'], url_path='statistics')
    def statistics(self, request):
        """Retourne les statistiques des contrats"""
        user = request.user

        if user.role != 'proprietaire':
            return Response({
                'error': 'Seuls les propriétaires peuvent accéder aux statistiques'
            }, status=status.HTTP_403_FORBIDDEN)

        queryset = self.get_queryset()

        stats = {
            'total': queryset.count(),
            'by_type': {},
            'by_status': {},
            'active_count': queryset.filter(status='active').count(),
            'draft_count': queryset.filter(status='draft').count(),
        }

        # Statistiques par type
        for contract_type in queryset.values('contract_type').distinct():
            type_val = contract_type['contract_type']
            stats['by_type'][type_val] = queryset.filter(contract_type=type_val).count()

        # Statistiques par statut
        for status_obj in queryset.values('status').distinct():
            status_val = status_obj['status']
            stats['by_status'][status_val] = queryset.filter(status=status_val).count()

        return Response(stats)

    @action(detail=True, methods=['get'], url_path='documents')
    def documents(self, request, pk=None):
        """Retourne la liste des documents liés à ce contrat"""
        contract = self.get_object()
        docs = []

        def add_file(f, title, category):
            if f:
                url = f.url if hasattr(f, 'url') else None
                if url:
                    abs_url = request.build_absolute_uri(url)
                    mime, _ = guess_type(abs_url)
                    docs.append({
                        "title": title,
                        "url": abs_url,
                        "mime": mime or "application/octet-stream",
                        "category": category
                    })

        # Contrat PDF principal
        add_file(contract.contract_pdf, "Contrat signé (PDF)", "contract_pdf")

        # Documents du locataire
        if contract.tenant:
            if hasattr(contract.tenant, "id_document") and contract.tenant.id_document:
                add_file(contract.tenant.id_document, "Pièce d'identité (CNI)", "tenant_id")
            if hasattr(contract.tenant, "signed_contract") and contract.tenant.signed_contract:
                add_file(contract.tenant.signed_contract, "Contrat locataire (copie)", "tenant_contract")

        # Documents de la location associée
        if contract.location:
            if hasattr(contract.location, "signed_contract") and contract.location.signed_contract:
                add_file(contract.location.signed_contract, "Contrat de location signé", "location_contract")

        return Response(docs, status=status.HTTP_200_OK)

# ==============================================
# VIEWSET POUR LES PAIEMENTS
# ==============================================

class PaymentViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les paiements"""

    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        """Retourne le serializer approprié"""
        if self.action == 'create' and self.request.user.role == 'locataire':
            return TenantPaymentCreateSerializer
        return PaymentSerializer

    def get_queryset(self):
        """Filtre les paiements selon l'utilisateur"""
        user = self.request.user

        if user.role == 'proprietaire':
            # Le propriétaire voit tous les paiements reçus
            return Payment.objects.filter(owner=user).select_related(
                'tenant', 'contract', 'contract__property'
            )
        elif user.role == 'locataire':
            # Le locataire voit ses propres paiements
            tenant = Tenant.objects.filter(user=user).first()
            if tenant:
                return Payment.objects.filter(tenant=tenant).select_related(
                    'contract', 'contract__property', 'owner'
                )

        return Payment.objects.none()

    def create(self, request, *args, **kwargs):
        """Créer un nouveau paiement (locataire uniquement)"""
        if request.user.role != 'locataire':
            return Response({
                'error': 'Seuls les locataires peuvent effectuer des paiements'
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment = serializer.save()

        # Créer une notification pour le propriétaire
        Notification.objects.create(
            user=payment.owner,
            notification_type='payment',
            title='Nouveau paiement reçu',
            message=f'{payment.tenant.full_name} a effectué un paiement de {payment.amount} FCFA pour le mois de {payment.payment_month}.'
        )

        return Response({
            'message': 'Paiement effectué avec succès',
            'data': PaymentSerializer(payment, context={'request': request}).data
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='confirm')
    def confirm_payment(self, request, pk=None):
        """Confirmer un paiement (propriétaire uniquement)"""
        if request.user.role != 'proprietaire':
            return Response({
                'error': 'Seuls les propriétaires peuvent confirmer les paiements'
            }, status=status.HTTP_403_FORBIDDEN)

        payment = self.get_object()

        if payment.owner != request.user:
            return Response({
                'error': 'Ce paiement ne vous appartient pas'
            }, status=status.HTTP_403_FORBIDDEN)

        payment.status = 'completed'
        payment.owner_notified = True
        payment.save()

        # Notifier le locataire
        Notification.objects.create(
            user=payment.tenant.user,
            notification_type='payment',
            title='Paiement confirmé',
            message=f'Votre paiement de {payment.amount} FCFA pour {payment.payment_month} a été confirmé.'
        )

        return Response({
            'message': 'Paiement confirmé avec succès',
            'data': self.get_serializer(payment).data
        })

    @action(detail=True, methods=['post'], url_path='reject')
    def reject_payment(self, request, pk=None):
        """Rejeter un paiement (propriétaire uniquement)"""
        if request.user.role != 'proprietaire':
            return Response({
                'error': 'Seuls les propriétaires peuvent rejeter les paiements'
            }, status=status.HTTP_403_FORBIDDEN)

        payment = self.get_object()

        if payment.owner != request.user:
            return Response({
                'error': 'Ce paiement ne vous appartient pas'
            }, status=status.HTTP_403_FORBIDDEN)

        reason = request.data.get('reason', 'Aucune raison fournie')
        
        payment.status = 'failed'
        payment.notes = f"Rejeté: {reason}"
        payment.save()

        # Notifier le locataire
        Notification.objects.create(
            user=payment.tenant.user,
            notification_type='payment',
            title='Paiement rejeté',
            message=f'Votre paiement de {payment.amount} FCFA pour {payment.payment_month} a été rejeté. Raison: {reason}'
        )

        return Response({
            'message': 'Paiement rejeté',
            'data': self.get_serializer(payment).data
        })
    

    @action(detail=False, methods=['get'], url_path='statistics')
    def statistics(self, request):
        """Statistiques des paiements"""
        queryset = self.get_queryset()

        if request.user.role == 'proprietaire':
            # Statistiques pour le propriétaire
            stats = {
                'total_received': queryset.filter(status='completed').aggregate(
                    Sum('amount')
                )['amount__sum'] or 0,
                'pending_amount': queryset.filter(status='pending').aggregate(
                    Sum('amount')
                )['amount__sum'] or 0,
                'completed_count': queryset.filter(status='completed').count(),
                'pending_count': queryset.filter(status='pending').count(),
                'failed_count': queryset.filter(status='failed').count(),
            }
        else:
            # Statistiques pour le locataire
            stats = {
                'total_paid': queryset.filter(status='completed').aggregate(
                    Sum('amount')
                )['amount__sum'] or 0,
                'pending_amount': queryset.filter(status='pending').aggregate(
                    Sum('amount')
                )['amount__sum'] or 0,
                'completed_count': queryset.filter(status='completed').count(),
                'pending_count': queryset.filter(status='pending').count(),
            }

        return Response(stats)

    @action(detail=False, methods=['get'], url_path='pending')
    def pending_payments(self, request):
        """Liste des paiements en attente"""
        queryset = self.get_queryset().filter(status='pending')
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'count': queryset.count(),
            'results': serializer.data
        })

from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings


# URL de ton microservice Gemini (ajuste si besoin)
GEMINI_API_URL = getattr(settings, 'GEMINI_API_URL', 'http://localhost:8002')


class JuridicalDocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet complet pour :
    - Upload de documents
    - Pose de questions IA
    - Historique de chat
    """
    serializer_class = JuridicalDocumentSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)  # <-- ADD THIS LINE
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Seuls les documents de l'utilisateur connecté"""
        return JuridicalDocument.objects.filter(user=self.request.user).order_by('-uploaded_at')

    def perform_create(self, serializer):
        """Lie le document à l'utilisateur"""
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        """Upload + réponse immédiate"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        document = serializer.save(user=request.user)

        # Optionnel : lancer un traitement asynchrone ici
        # process_document.delay(document.id)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # ===============================================
    # ACTION 1 : Récupérer l'historique du chat
    # ===============================================
    @action(detail=True, methods=['get'], url_path='chat_history')
    def chat_history(self, request, pk=None):
        """
        GET /api/juridical-documents/{id}/chat_history/
        Retourne tous les messages (user + IA)
        """
        document = self.get_object()
        messages = document.chat_messages.all().order_by('created_at')
        serializer = JuridicalChatMessageSerializer(messages, many=True)
        return Response(serializer.data)

    # ===============================================
    # ACTION 2 : Poser une question à l'IA
    # ===============================================
    @action(detail=True, methods=['post'], url_path='ask_question')
    def ask_question(self, request, pk=None):
        """
        POST /api/juridical-documents/{id}/ask_question/
        Body: { "question": "de quoi parle le document" }
        """
        document = self.get_object()

        # 1. Vérifier que le document est prêt
        if not document.is_processed:
            return Response({
                "error": "Le document n'est pas encore analysé. Veuillez patienter."
            }, status=status.HTTP_400_BAD_REQUEST)

        # 2. Récupérer et valider la question
        question = request.data.get('question', '').strip()
        if not question:
            return Response({
                "error": "La question est requise."
            }, status=status.HTTP_400_BAD_REQUEST)

        # 3. Sauvegarder le message utilisateur
        user_message = JuridicalChatMessage.objects.create(
            document=document,
            user=request.user,
            message_type='user',
            content=question
        )

        try:
            # === ÉTAPE 1 : Upload du PDF vers Gemini API ===
            document.file.seek(0)  # Important !
            files = {
                'file': (document.name, document.file, 'application/pdf')
            }
            upload_response = requests.post(
                f"{GEMINI_API_URL}/upload-pdf/",
                files=files,
                timeout=30
            )

            if upload_response.status_code != 200:
                error = f"Upload échoué: {upload_response.text}"
                self._save_error_message(document, request.user, error)
                return Response({"error": error}, status=500)

            # === ÉTAPE 2 : Poser la question ===
            payload = {
                'question': question,
                'max_tokens': request.data.get('max_tokens', 1024),
                'model_name': request.data.get('model_name', 'models/gemini-2.0-flash-exp')
            }

            ask_response = requests.post(
                f"{GEMINI_API_URL}/ask/",
                json=payload,
                timeout=60
            )

            if ask_response.status_code == 200:
                result = ask_response.json()
                answer = result.get('answer', 'Aucune réponse.')
                model = result.get('model', 'inconnu')

                # Sauvegarder la réponse IA
                ai_message = JuridicalChatMessage.objects.create(
                    document=document,
                    user=request.user,
                    message_type='ai',
                    content=answer
                )

                return Response({
                    "user_message": JuridicalChatMessageSerializer(user_message).data,
                    "ai_message": JuridicalChatMessageSerializer(ai_message).data,
                    "answer": answer,
                    "model": model
                })

            else:
                error = f"Gemini API erreur {ask_response.status_code}: {ask_response.text}"
                self._save_error_message(document, request.user, error)
                return Response({"error": error}, status=500)

        except requests.exceptions.Timeout:
            error = "Délai d'attente dépassé (timeout)"
            self._save_error_message(document, request.user, error)
            return Response({"error": error}, status=504)

        except Exception as e:
            error = f"Erreur interne: {str(e)}"
            logger.error(f"ask_question error (doc {document.id}): {e}")
            self._save_error_message(document, request.user, error)
            return Response({"error": error}, status=500)
        
        # ============================================
# AJOUTER CETTE ACTION DANS JuridicalDocumentViewSet
# ============================================

    @action(detail=False, methods=['post'], url_path='upload-multiple')
    def upload_multiple(self, request):
        """
        Upload multiple de documents juridiques
        Les documents sont directement marqués comme traités
        """
        files = request.FILES.getlist('files')
        
        if not files:
            return Response(
                {'error': 'Aucun fichier fourni'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        created_documents = []
        errors = []
        
        for index, file in enumerate(files):
            try:
                print(f'📤 Upload {index + 1}/{len(files)}: {file.name}')
                
                # Vérifier que c'est un PDF
                if not file.name.lower().endswith('.pdf'):
                    errors.append({
                        'file': file.name,
                        'error': 'Type de fichier invalide (PDF uniquement)'
                    })
                    continue
                
                # Vérifier la taille (max 10MB)
                if file.size > 10 * 1024 * 1024:
                    errors.append({
                        'file': file.name,
                        'error': 'Fichier trop volumineux (max 10MB)'
                    })
                    continue
                
                # Calculer la taille formatée
                if file.size < 1024:
                    file_size = f"{file.size} B"
                elif file.size < 1024 * 1024:
                    file_size = f"{file.size / 1024:.1f} KB"
                else:
                    file_size = f"{file.size / (1024 * 1024):.1f} MB"
                
                # ✅ CORRECTION : Créer le document déjà "traité"
                document = JuridicalDocument.objects.create(
                    user=request.user,
                    name=file.name,
                    file=file,
                    file_type='PDF',
                    file_size=file_size,
                    status='completed',      # ✅ Directement "Traité"
                    is_processed=True        # ✅ Marqué comme traité
                )
                
                created_documents.append(document)
                print(f'✅ Document {index + 1} créé et traité: {document.name}')
                
            except Exception as e:
                print(f'💥 Erreur upload {file.name if file else "unknown"}: {e}')
                errors.append({
                    'file': file.name if file else 'unknown',
                    'error': str(e)
                })
        
        # Sérialiser les documents créés
        serializer = JuridicalDocumentSerializer(
            created_documents,
            many=True,
            context={'request': request}
        )
        
        response_status = status.HTTP_201_CREATED if created_documents else status.HTTP_400_BAD_REQUEST
        
        return Response({
            'message': f'{len(created_documents)} document(s) uploadé(s) avec succès',
            'data': serializer.data,
            'errors': errors,
            'total_uploaded': len(created_documents),
            'total_errors': len(errors)
        }, status=response_status)

class PrestataireViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les prestataires"""
    
    serializer_class = PrestataireSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom', 'contact', 'zone', 'email']
    ordering_fields = ['created_at', 'nom', 'note']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filtre les prestataires selon l'utilisateur"""
        user = self.request.user
        
        if user.role == 'proprietaire':
            # Le propriétaire voit ses prestataires
            queryset = Prestataire.objects.filter(owner=user)
        else:
            # Les autres utilisateurs ne voient aucun prestataire
            queryset = Prestataire.objects.none()
        
        # Filtrage par disponibilité
        disponibilite = self.request.query_params.get('disponibilite', None)
        if disponibilite:
            queryset = queryset.filter(disponibilite=disponibilite)
        
        # Filtrage par spécialité
        specialite = self.request.query_params.get('specialite', None)
        if specialite:
            queryset = queryset.filter(specialites__contains=[specialite])
        
        # Filtrage par zone
        zone = self.request.query_params.get('zone', None)
        if zone:
            queryset = queryset.filter(zone__icontains=zone)
        
        return queryset
    
    def get_serializer_class(self):
        """Retourne le serializer approprié selon l'action"""
        if self.action == 'list':
            return PrestataireListSerializer
        elif self.action == 'create':
            return PrestataireCreateSerializer
        return PrestataireSerializer
    
    def perform_create(self, serializer):
        """Affecter automatiquement le propriétaire lors de la création"""
        if self.request.user.role != 'proprietaire':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Seuls les propriétaires peuvent ajouter des prestataires")
        
        serializer.save(owner=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Crée un nouveau prestataire avec debug"""
        import json
        
        # 🔍 LOG 1 : Afficher les données reçues
        print("=" * 80)
        print("📥 DONNÉES REÇUES:")
        print(json.dumps(request.data, indent=2, ensure_ascii=False))
        print("=" * 80)
        
        serializer = self.get_serializer(data=request.data)
        
        # 🔍 LOG 2 : Vérifier la validation
        if not serializer.is_valid():
            print("❌ ERREURS DE VALIDATION:")
            print(json.dumps(serializer.errors, indent=2, ensure_ascii=False))
            print("=" * 80)
            return Response(
                {
                    'error': 'Erreur de validation',
                    'details': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 🔍 LOG 3 : Données validées
        print("✅ DONNÉES VALIDÉES:")
        print(json.dumps(serializer.validated_data, indent=2, ensure_ascii=False, default=str))
        print("=" * 80)
        
        try:
            # ✅ CORRECTION : Créer d'abord l'objet, puis le récupérer
            self.perform_create(serializer)
            
            # Récupérer l'instance créée depuis le serializer
            prestataire_instance = serializer.instance
            
            # Sérialiser avec le serializer complet
            response_serializer = PrestataireSerializer(
                prestataire_instance,
                context={'request': request}
            )
            
            headers = self.get_success_headers(serializer.data)
            return Response(
                {
                    'message': 'Prestataire ajouté avec succès',
                    'data': response_serializer.data
                },
                status=status.HTTP_201_CREATED,
                headers=headers
            )
        except Exception as e:
            print(f"💥 ERREUR LORS DE LA CRÉATION: {e}")
            print(f"Type d'erreur: {type(e)}")
            import traceback
            traceback.print_exc()
            print("=" * 80)
            
            return Response(
                {
                    'error': 'Erreur lors de la création',
                    'details': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # 🔍 LOG 3 : Données validées
        print("✅ DONNÉES VALIDÉES:")
        print(json.dumps(serializer.validated_data, indent=2, ensure_ascii=False, default=str))
        print("=" * 80)
        
        try:
            self.perform_create(serializer)
            
            headers = self.get_success_headers(serializer.data)
            return Response(
                {
                    'message': 'Prestataire ajouté avec succès',
                    'data': PrestataireSerializer(
                        Prestataire.objects.get(id=serializer.data['id']),
                        context={'request': request}
                    ).data
                },
                status=status.HTTP_201_CREATED,
                headers=headers
            )
        except Exception as e:
            print(f"💥 ERREUR LORS DE LA CRÉATION: {e}")
            print(f"Type d'erreur: {type(e)}")
            import traceback
            traceback.print_exc()
            print("=" * 80)
            
            return Response(
                {
                    'error': 'Erreur lors de la création',
                    'details': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def update(self, request, *args, **kwargs):
        """Met à jour un prestataire"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Vérifier que le propriétaire est bien le propriétaire du prestataire
        if instance.owner != request.user:
            return Response(
                {'error': 'Vous ne pouvez modifier que vos propres prestataires'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'message': 'Prestataire mis à jour avec succès',
            'data': serializer.data
        })
    
    def destroy(self, request, *args, **kwargs):
        """Supprime un prestataire"""
        instance = self.get_object()
        
        # Vérifier que le propriétaire est bien le propriétaire du prestataire
        if instance.owner != request.user:
            return Response(
                {'error': 'Vous ne pouvez supprimer que vos propres prestataires'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        nom = instance.nom
        self.perform_destroy(instance)
        
        return Response(
            {'message': f'Le prestataire "{nom}" a été supprimé avec succès'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'], url_path='statistics')
    def statistics(self, request):
        """Retourne les statistiques des prestataires"""
        user = request.user
        
        if user.role != 'proprietaire':
            return Response(
                {'error': 'Seuls les propriétaires peuvent accéder aux statistiques'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        queryset = self.get_queryset()
        
        # Comptage par spécialité
        specialites_count = {}
        for prestataire in queryset:
            for specialite in prestataire.specialites:
                specialites_count[specialite] = specialites_count.get(specialite, 0) + 1
        
        stats = {
            'total': queryset.count(),
            'disponibles': queryset.filter(disponibilite='Disponible').count(),
            'occupes': queryset.filter(disponibilite='Occupé').count(),
            'note_moyenne': queryset.aggregate(models.Avg('note'))['note__avg'] or 0,
            'par_specialite': specialites_count
        }
        
        return Response(stats)
    
    @action(detail=False, methods=['get'], url_path='disponibles')
    def disponibles(self, request):
        """Retourne uniquement les prestataires disponibles"""
        queryset = self.get_queryset().filter(disponibilite='Disponible')
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'count': queryset.count(),
            'results': serializer.data
        })
    
    @action(detail=False, methods=['get'], url_path='by-specialite')
    def by_specialite(self, request):
        """Filtre les prestataires par spécialité"""
        specialite = request.query_params.get('specialite', None)
        
        if not specialite:
            return Response(
                {'error': 'Le paramètre "specialite" est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(specialites__contains=[specialite])
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'specialite': specialite,
            'count': queryset.count(),
            'results': serializer.data
        })
    
    @action(detail=True, methods=['patch'], url_path='toggle-disponibilite')
    def toggle_disponibilite(self, request, pk=None):
        """Change la disponibilité d'un prestataire"""
        prestataire = self.get_object()
        
        # Vérifier les permissions
        if prestataire.owner != request.user:
            return Response(
                {'error': 'Vous ne pouvez modifier que vos propres prestataires'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Toggle de la disponibilité
        if prestataire.disponibilite == 'Disponible':
            prestataire.disponibilite = 'Occupé'
        else:
            prestataire.disponibilite = 'Disponible'
        
        prestataire.save()
        
        serializer = self.get_serializer(prestataire)
        return Response({
            'message': f'Disponibilité mise à jour: {prestataire.disponibilite}',
            'data': serializer.data
        })
    
class MaintenanceRequestViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les demandes de maintenance"""

    serializer_class = MaintenanceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'request_type']
    search_fields = ['request_id', 'description', 'tenant__full_name']
    ordering_fields = ['created_at', 'priority', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filtre les demandes selon le rôle de l'utilisateur - VERSION CORRIGÉE"""
        user = self.request.user
        
        # Logs simplifiés avec logging
        import logging
        logger = logging.getLogger(__name__)
        
        if not user.is_authenticated:
            logger.warning("⚠️ Utilisateur non authentifié tentant d'accéder aux demandes")
            return MaintenanceRequest.objects.none()
        
        if user.role == 'proprietaire':
            # 🔧 CORRECTION : Utiliser select_related pour optimiser les requêtes
            queryset = MaintenanceRequest.objects.filter(
                linked_property__owner=user
            ).select_related(
                'tenant', 
                'tenant__user',
                'linked_property', 
                'linked_property__owner'
            ).prefetch_related(
                'tenant__user'
            ).order_by('-created_at')
            
            # Logs en mode DEBUG
            logger.debug(f"🏠 Propriétaire {user.email} - {queryset.count()} demande(s)")
            
            # 🔍 Diagnostic si aucune demande
            if queryset.count() == 0:
                props_count = Property.objects.filter(owner=user).count()
                logger.info(f"📊 Propriétés du propriétaire: {props_count}")
                
                # Vérifier s'il y a des demandes sans filtre
                all_requests = MaintenanceRequest.objects.all().count()
                logger.info(f"📊 Total demandes dans la DB: {all_requests}")
            
            return queryset
        
        elif user.role == 'locataire':
            # Récupérer le profil Tenant
            tenant = Tenant.objects.filter(user=user).select_related('user').first()
            
            if not tenant:
                logger.warning(f"⚠️ Aucun profil Tenant trouvé pour {user.email}")
                return MaintenanceRequest.objects.none()
            
            queryset = MaintenanceRequest.objects.filter(
                tenant=tenant
            ).select_related(
                'tenant',
                'tenant__user',
                'linked_property',
                'linked_property__owner'
            ).order_by('-created_at')
            
            logger.debug(f"👤 Locataire {tenant.full_name} - {queryset.count()} demande(s)")
            return queryset
        
        logger.error(f"⚠️ Rôle invalide ou non reconnu: {user.role}")
        return MaintenanceRequest.objects.none()

    def get_serializer_class(self):
        """Retourne le serializer approprié selon l'action"""
        if self.action == 'create':
            return MaintenanceRequestCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return MaintenanceRequestUpdateSerializer
        return MaintenanceRequestSerializer

    def create(self, request, *args, **kwargs):
        """Crée une nouvelle demande de maintenance (locataire uniquement)"""
        if request.user.role != 'locataire':
            return Response(
                {'error': 'Seuls les locataires peuvent créer des demandes de maintenance'},
                status=status.HTTP_403_FORBIDDEN
            )  # ✅ Enlevé le point

        # Vérifier que le locataire a un profil Tenant
        tenant = Tenant.objects.filter(user=request.user).first()
        if not tenant:
            return Response(
                {'error': 'Vous devez avoir un profil locataire pour créer une demande'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Créer la demande avec le tenant automatique
        maintenance_request = serializer.save(tenant=tenant)

        # Créer une notification pour le propriétaire
        Notification.objects.create(
            user=maintenance_request.linked_property.owner,
            notification_type='maintenance',
            title='Nouvelle demande de maintenance',
            message=f'{tenant.full_name} a créé une demande de maintenance ({maintenance_request.request_type}) pour {maintenance_request.linked_property.titre}'
        )

        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                'message': 'Demande de maintenance créée avec succès',
                'data': MaintenanceRequestSerializer(
                    maintenance_request,
                    context={'request': request}
                ).data
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )

    def update(self, request, *args, **kwargs):
        """Met à jour une demande de maintenance"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        # Vérifier les permissions selon le rôle
        if request.user.role == 'proprietaire':
            # Le propriétaire peut modifier les demandes pour ses propriétés
            if instance.linked_property.owner != request.user:
                return Response(
                    {'error': 'Vous ne pouvez modifier que les demandes pour vos propriétés'},
                    status=status.HTTP_403_FORBIDDEN
                )
        elif request.user.role == 'locataire':
            # Le locataire peut modifier uniquement ses propres demandes
            tenant = Tenant.objects.filter(user=request.user).first()
            if not tenant or instance.tenant != tenant:
                return Response(
                    {'error': 'Vous ne pouvez modifier que vos propres demandes'},
                    status=status.HTTP_403_FORBIDDEN
                )
            # Le locataire ne peut modifier que certains champs
            allowed_fields = {'description', 'priority'}
            if not set(request.data.keys()).issubset(allowed_fields):
                return Response(
                    {'error': 'Vous ne pouvez modifier que la description et la priorité'},
                    status=status.HTTP_403_FORBIDDEN
                )
        else:
            return Response(
                {'error': 'Vous n\'avez pas la permission de modifier cette demande'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # Retourner les données complètes
        response_serializer = MaintenanceRequestSerializer(instance, context={'request': request})

        return Response({
            'message': 'Demande de maintenance mise à jour avec succès',
            'data': response_serializer.data
        })

    def destroy(self, request, *args, **kwargs):
        """Supprime une demande de maintenance"""
        instance = self.get_object()

        # Vérifier les permissions
        if request.user.role == 'proprietaire':
            if instance.linked_property.owner != request.user:
                return Response(
                    {'error': 'Vous ne pouvez supprimer que les demandes pour vos propriétés'},
                    status=status.HTTP_403_FORBIDDEN
                )
        elif request.user.role == 'locataire':
            tenant = Tenant.objects.filter(user=request.user).first()
            if not tenant or instance.tenant != tenant:
                return Response(
                    {'error': 'Vous ne pouvez supprimer que vos propres demandes'},
                    status=status.HTTP_403_FORBIDDEN
                )
            # Le locataire ne peut supprimer que les demandes en attente
            if instance.status != 'pending':
                return Response(
                    {'error': 'Vous ne pouvez supprimer que les demandes en attente'},
                    status=status.HTTP_403_FORBIDDEN
                )
        else:
            return Response(
                {'error': 'Vous n\'avez pas la permission de supprimer cette demande'},
                status=status.HTTP_403_FORBIDDEN
            )

        request_id = instance.request_id
        self.perform_destroy(instance)
        
        return Response(
            {'message': f'La demande {request_id} a été supprimée avec succès'},
            status=status.HTTP_200_OK
        )

    # ============================================
    # ACTIONS PERSONNALISÉES
    # ============================================

    @action(detail=False, methods=['get'], url_path='pending')
    def pending_requests(self, request):
        """Retourne uniquement les demandes en attente"""
        queryset = self.get_queryset().filter(status='pending')
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'count': queryset.count(),
            'results': serializer.data
        })

    @action(detail=False, methods=['get'], url_path='urgent')
    def urgent_requests(self, request):
        """Retourne les demandes urgentes"""
        queryset = self.get_queryset().filter(
            priority='urgent',
            status__in=['pending', 'in_progress']
        )
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'count': queryset.count(),
            'results': serializer.data
        })

    @action(detail=True, methods=['post'], url_path='start-work')
    def start_work(self, request, pk=None):
        """Marque une demande comme en cours (propriétaire uniquement)"""
        if request.user.role != 'proprietaire':
            return Response(
                {'error': 'Seuls les propriétaires peuvent démarrer le travail'},
                status=status.HTTP_403_FORBIDDEN
            )

        instance = self.get_object()

        if instance.linked_property.owner != request.user:
            return Response(
                {'error': 'Vous ne pouvez modifier que les demandes pour vos propriétés'},
                status=status.HTTP_403_FORBIDDEN
            )

        if instance.status != 'pending':
            return Response(
                {'error': 'Cette demande n\'est pas en attente'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Mise à jour du statut et du prestataire si fourni
        instance.status = 'in_progress'
        provider = request.data.get('provider')
        if provider:
            instance.provider = provider
        instance.save()

        # Notifier le locataire
        Notification.objects.create(
            user=instance.tenant.user,
            notification_type='maintenance',
            title='Demande en cours de traitement',
            message=f'Votre demande de maintenance ({instance.request_type}) est maintenant en cours de traitement.'
        )

        serializer = self.get_serializer(instance)
        return Response({
            'message': 'Demande marquée comme en cours',
            'data': serializer.data
        })

    @action(detail=True, methods=['post'], url_path='resolve')
    def resolve_request(self, request, pk=None):
        """Marque une demande comme résolue (propriétaire uniquement)"""
        if request.user.role != 'proprietaire':
            return Response(
                {'error': 'Seuls les propriétaires peuvent résoudre les demandes'},
                status=status.HTTP_403_FORBIDDEN
            )

        instance = self.get_object()

        if instance.linked_property.owner != request.user:
            return Response(
                {'error': 'Vous ne pouvez modifier que les demandes pour vos propriétés'},
                status=status.HTTP_403_FORBIDDEN
            )

        if instance.status not in ['pending', 'in_progress']:
            return Response(
                {'error': 'Cette demande ne peut pas être résolue'},
                status=status.HTTP_400_BAD_REQUEST
            )

        instance.status = 'resolved'
        instance.save()

        # Notifier le locataire
        Notification.objects.create(
            user=instance.tenant.user,
            notification_type='maintenance',
            title='Demande résolue',
            message=f'Votre demande de maintenance ({instance.request_type}) a été résolue.'
        )

        serializer = self.get_serializer(instance)
        return Response({
            'message': 'Demande marquée comme résolue',
            'data': serializer.data
        })

    @action(detail=True, methods=['post'], url_path='reject')
    def reject_request(self, request, pk=None):
        """Rejette une demande (propriétaire uniquement)"""
        if request.user.role != 'proprietaire':
            return Response(
                {'error': 'Seuls les propriétaires peuvent rejeter les demandes'},
                status=status.HTTP_403_FORBIDDEN
            )

        instance = self.get_object()

        if instance.linked_property.owner != request.user:
            return Response(
                {'error': 'Vous ne pouvez modifier que les demandes pour vos propriétés'},
                status=status.HTTP_403_FORBIDDEN
            )

        if instance.status != 'pending':
            return Response(
                {'error': 'Seules les demandes en attente peuvent être rejetées'},
                status=status.HTTP_400_BAD_REQUEST
            )

        reason = request.data.get('reason', 'Aucune raison fournie')
        instance.status = 'rejected'
        instance.save()

        # Notifier le locataire
        Notification.objects.create(
            user=instance.tenant.user,
            notification_type='maintenance',
            title='Demande rejetée',
            message=f'Votre demande de maintenance ({instance.request_type}) a été rejetée. Raison: {reason}'
        )

        serializer = self.get_serializer(instance)
        return Response({
            'message': 'Demande rejetée',
            'data': serializer.data
        })

    @action(detail=True, methods=['post'], url_path='assign-provider')
    def assign_provider(self, request, pk=None):
        """Assigne un prestataire à une demande (propriétaire uniquement)"""
        if request.user.role != 'proprietaire':
            return Response(
                {'error': 'Seuls les propriétaires peuvent assigner des prestataires'},
                status=status.HTTP_403_FORBIDDEN
            )

        instance = self.get_object()

        if instance.linked_property.owner != request.user:
            return Response(
                {'error': 'Vous ne pouvez modifier que les demandes pour vos propriétés'},
                status=status.HTTP_403_FORBIDDEN
            )

        provider = request.data.get('provider')
        if not provider:
            return Response(
                {'error': 'Le nom du prestataire est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        instance.provider = provider
        if instance.status == 'pending':
            instance.status = 'in_progress'
        instance.save()

        serializer = self.get_serializer(instance)
        return Response({
            'message': f'Prestataire "{provider}" assigné avec succès',
            'data': serializer.data
        })

    @action(detail=False, methods=['get'], url_path='by-property/(?P<property_id>[^/.]+)')
    def by_property(self, request, property_id=None):
        """Retourne les demandes pour une propriété spécifique"""
        queryset = self.get_queryset().filter(linked_property_id=property_id)
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'count': queryset.count(),
            'results': serializer.data
        })

    @action(detail=False, methods=['get'], url_path='statistics')
    def statistics(self, request):
        """Retourne les statistiques des demandes de maintenance"""
        user = request.user
        queryset = self.get_queryset()

        stats = {
            'total': queryset.count(),
            'pending': queryset.filter(status='pending').count(),
            'in_progress': queryset.filter(status='in_progress').count(),
            'resolved': queryset.filter(status='resolved').count(),
            'rejected': queryset.filter(status='rejected').count(),
            'urgent': queryset.filter(priority='urgent').count(),
            'by_type': {},
            'by_location': {}
        }

        # Statistiques par type
        for request_type in queryset.values('request_type').distinct():
            type_val = request_type['request_type']
            stats['by_type'][type_val] = queryset.filter(request_type=type_val).count()

        # Statistiques par emplacement
        for location in queryset.values('location').distinct():
            loc_val = location['location']
            stats['by_location'][loc_val] = queryset.filter(location=loc_val).count()

        return Response(stats)

    @action(detail=False, methods=['get'], url_path='by-status/(?P<status_name>[^/.]+)')
    def by_status(self, request, status_name=None):
        """Retourne les demandes filtrées par statut"""
        valid_statuses = ['pending', 'in_progress', 'resolved', 'rejected']
        
        if status_name not in valid_statuses:
            return Response(
                {'error': f'Statut invalide. Valeurs autorisées: {", ".join(valid_statuses)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(status=status_name)
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'status': status_name,
            'count': queryset.count(),
            'results': serializer.data
        })

# ==============================================
# VUES POUR L'ADMINISTRATEUR SYSTÈME
# ==============================================

class AdminDashboardView(APIView):
    """Dashboard avec statistiques globales pour l'admin"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        # Vérifier que l'utilisateur est admin
        if request.user.role != 'admin':
            return Response(
                {'error': 'Accès réservé aux administrateurs'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Statistiques
        stats = {
            'total_users': User.objects.count(),
            'total_proprietaires': User.objects.filter(role='proprietaire').count(),
            'total_locataires': User.objects.filter(role='locataire').count(),
            'total_properties': Property.objects.count(),
            'total_documents': Document.objects.count(),
            'total_tenants': Tenant.objects.count(),
            'total_prestataires': Prestataire.objects.count(),
            'recent_users': User.objects.order_by('-date_joined')[:5]
        }
        
        serializer = AdminStatisticsSerializer(stats)
        return Response(serializer.data)


class AdminUserViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer tous les utilisateurs (admin uniquement)"""
    
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['role', 'is_active']
    search_fields = ['email', 'nom', 'prenom', 'telephone']
    ordering_fields = ['date_joined', 'email']
    ordering = ['-date_joined']
    
    def get_queryset(self):
        # Vérifier que l'utilisateur est admin
        if self.request.user.role != 'admin':
            return User.objects.none()
        return User.objects.all()
    
    @action(detail=True, methods=['post'], url_path='toggle-active')
    def toggle_active(self, request, pk=None):
        """Active/désactive un utilisateur"""
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        
        serializer = self.get_serializer(user)
        return Response({
            'message': f'Utilisateur {"activé" if user.is_active else "désactivé"}',
            'data': serializer.data
        })
    
    @action(detail=True, methods=['delete'], url_path='delete-user')
    def delete_user(self, request, pk=None):
        """Supprime un utilisateur"""
        user = self.get_object()
        
        if user.role == 'admin':
            return Response(
                {'error': 'Impossible de supprimer un administrateur'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        email = user.email
        user.delete()
        
        return Response({
            'message': f'Utilisateur {email} supprimé avec succès'
        })


class AdminPropertyViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour consulter toutes les propriétés (admin)"""
    
    queryset = Property.objects.all()
    serializer_class = AdminPropertySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['statut', 'type', 'owner']
    search_fields = ['titre', 'adresse']
    
    def get_queryset(self):
        if self.request.user.role != 'admin':
            return Property.objects.none()
        return Property.objects.all().select_related('owner').prefetch_related('medias')
    
    @action(detail=True, methods=['delete'])
    def delete_property(self, request, pk=None):
        """Supprime une propriété"""
        property_obj = self.get_object()
        titre = property_obj.titre
        property_obj.delete()
        
        return Response({
            'message': f'Propriété "{titre}" supprimée avec succès'
        })


class AdminDocumentViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour consulter tous les documents (admin)"""
    
    queryset = Document.objects.all()
    serializer_class = AdminDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'status', 'owner']
    search_fields = ['title', 'tenant', 'property']
    
    def get_queryset(self):
        if self.request.user.role != 'admin':
            return Document.objects.none()
        return Document.objects.all().select_related('owner')


class AdminTenantViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour consulter tous les locataires (admin)"""
    
    queryset = Tenant.objects.all()
    serializer_class = AdminTenantSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'owner']
    search_fields = ['full_name', 'email', 'phone']
    
    def get_queryset(self):
        if self.request.user.role != 'admin':
            return Tenant.objects.none()
        return Tenant.objects.all().select_related('owner', 'linked_property')


class AdminPrestataireViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour consulter tous les prestataires (admin)"""
    
    queryset = Prestataire.objects.all()
    serializer_class = AdminPrestataireSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['disponibilite', 'owner']
    search_fields = ['nom', 'contact', 'email', 'zone']
    
    def get_queryset(self):
        if self.request.user.role != 'admin':
            return Prestataire.objects.none()
        return Prestataire.objects.all().select_related('owner')