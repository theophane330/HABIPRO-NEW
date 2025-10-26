from rest_framework import viewsets, status, filters, generics, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.authtoken.models import Token
from django.db import models
from django.db.models import Q, Count, Sum
from django.http import FileResponse, HttpResponse
from django.contrib.auth import get_user_model
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from mimetypes import guess_type  

from .models import Document, Property, PropertyMedia, VisitRequest, Tenant, Location, Contract, Payment
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
    PaymentCreateSerializer,
)

import io
from datetime import datetime

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
            return Contract.objects.filter(owner=user)
        elif user.role == 'locataire':
            # Le locataire voit ses contrats
            tenant = Tenant.objects.filter(user=user).first()
            if tenant:
                return Contract.objects.filter(tenant=tenant)

        return Contract.objects.none()

    def perform_create(self, serializer):
        """Affecter automatiquement le propriétaire lors de la création"""
        serializer.save(owner=self.request.user)

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
        """Retourne la liste des documents liés à ce contrat (URL absolute + mime)"""
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
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_serializer_class(self):
        """Retourne le serializer approprié selon l'action"""
        if self.action == 'create':
            return PaymentCreateSerializer
        return PaymentSerializer

    def get_queryset(self):
        """Filtre les paiements selon l'utilisateur"""
        user = self.request.user

        if user.role == 'proprietaire':
            # Le propriétaire voit les paiements reçus
            return Payment.objects.filter(owner=user)
        elif user.role == 'locataire':
            # Le locataire voit ses paiements
            tenant = Tenant.objects.filter(user=user).first()
            if tenant:
                return Payment.objects.filter(tenant=tenant)

        return Payment.objects.none()

    def perform_create(self, serializer):
        """Affecter automatiquement le propriétaire lors de la création"""
        from rest_framework.exceptions import ValidationError

        user = self.request.user
        print(f"[DEBUG] Données reçues: {self.request.data}")
        print(f"[DEBUG] User: {user.email}, Role: {user.role}")

        # Récupérer les données du paiement
        tenant = serializer.validated_data.get('tenant')
        property_obj = serializer.validated_data.get('property')
        location = serializer.validated_data.get('location')
        payment_month = serializer.validated_data.get('payment_month')

        print(f"[DEBUG] Tenant: {tenant}, Property: {property_obj}, Location: {location}")

        # Vérifier s'il existe déjà un paiement pour ce locataire, cette propriété et ce mois
        existing_payment = Payment.objects.filter(
            tenant=tenant,
            property=property_obj,
            payment_month=payment_month,
            status='completed'
        ).first()

        if existing_payment:
            raise ValidationError({
                'payment_month': f'Un paiement pour le mois de {payment_month} a déjà été effectué pour cette propriété.'
            })

        # Déterminer le propriétaire
        if user.role == 'proprietaire':
            owner = user
        elif user.role == 'locataire':
            # Si c'est un locataire qui paie, récupérer le propriétaire de la propriété
            owner = property_obj.owner if property_obj else None
        else:
            owner = None

        # Générer une référence de transaction unique
        import uuid
        transaction_ref = f"PAY-{uuid.uuid4().hex[:8].upper()}"

        serializer.save(
            owner=owner,
            transaction_reference=transaction_ref
        )

    @action(detail=False, methods=['get'], url_path='payment-status')
    def payment_status(self, request):
        """
        Calcule l'état des paiements pour le locataire connecté
        en fonction de la date de création du contrat
        """
        from datetime import datetime, timedelta
        from calendar import monthrange

        user = request.user

        # Vérifier que l'utilisateur est un locataire
        if user.role != 'locataire':
            return Response({
                'error': 'Cet endpoint est réservé aux locataires'
            }, status=400)

        # Récupérer le tenant associé
        tenant = Tenant.objects.filter(user=user).first()
        if not tenant:
            return Response({
                'error': 'Aucun profil locataire trouvé'
            }, status=404)

        # Récupérer les contrats actifs du locataire
        contracts = Contract.objects.filter(tenant=tenant, status='active')

        if not contracts.exists():
            return Response({
                'error': 'Aucun contrat actif trouvé',
                'payment_history': [],
                'total_paid': 0,
                'total_due': 0
            })

        # Pour chaque contrat, générer l'historique des paiements attendus
        all_payment_data = []
        total_paid = 0
        total_due = 0

        # Mapper les mois en français
        MONTHS_FR = {
            1: 'Janvier', 2: 'Février', 3: 'Mars', 4: 'Avril',
            5: 'Mai', 6: 'Juin', 7: 'Juillet', 8: 'Août',
            9: 'Septembre', 10: 'Octobre', 11: 'Novembre', 12: 'Décembre'
        }

        for contract in contracts:
            # Date de début du contrat
            start_date = contract.start_date
            # Date actuelle
            current_date = datetime.now().date()

            # Générer tous les mois depuis le début du contrat jusqu'à maintenant
            month_date = start_date

            while month_date <= current_date:
                # Format du mois: "Novembre 2025"
                month_str = f"{MONTHS_FR[month_date.month]} {month_date.year}"
                
                # 🔥 LOG DE DÉBOGAGE
                print(f"[DEBUG] Génération du mois: {month_str}")
            
                # Vérifier si un paiement existe pour ce mois
                payment = Payment.objects.filter(
                    tenant=tenant,
                    property=contract.property,
                    payment_month=month_str,
                    status='completed'
                ).first()
                
                # 🔥 LOG DE DÉBOGAGE
                if payment:
                    print(f"  ✅ Paiement trouvé: {payment.amount} FCFA")
                else:
                    print(f"  ❌ Aucun paiement trouvé")
            
                if payment:
                    # Paiement effectué
                    payment_data = {
                        'month': month_str,
                        'amount': float(payment.amount),
                        'date': payment.payment_date.strftime('%d/%m/%Y'),
                        'method': payment.payment_method,
                        'status': 'paid',
                        'property': contract.property.titre,
                        'transaction_ref': payment.transaction_reference
                    }
                    total_paid += float(payment.amount)
                else:
                    # Paiement non effectué
                    payment_data = {
                        'month': month_str,
                        'amount': float(contract.amount),
                        'date': None,
                        'method': None,
                        'status': 'unpaid',
                        'property': contract.property.titre,
                        'transaction_ref': None
                    }
                    total_due += float(contract.amount)
            
                all_payment_data.append(payment_data)
            
                # Passer au mois suivant
                if month_date.month == 12:
                    month_date = month_date.replace(year=month_date.year + 1, month=1, day=1)
                else:
                    month_date = month_date.replace(month=month_date.month + 1, day=1)
            

        # Trier par date (du plus récent au plus ancien)
        # Convertir le mois en format de tri
        def parse_month_key(payment_data):
            month_year = payment_data['month']  # Format: "Novembre 2025"
            parts = month_year.split()
            month_name = parts[0]
            year = int(parts[1])

            # Trouver le numéro du mois
            month_num = next((k for k, v in MONTHS_FR.items() if v == month_name), 1)

            # Retourner une clé de tri (année, mois)
            return (year, month_num)

        all_payment_data.sort(key=parse_month_key, reverse=True)

        # 🔥 LOGS DE DÉBOGAGE
        print(f"\n{'='*60}")
        print(f"[DEBUG] Nombre de paiements générés: {len(all_payment_data)}")
        print(f"[DEBUG] Premiers paiements:")
        for p in all_payment_data[:5]:  # Afficher les 5 premiers
            print(f"  - {p['month']}: {p['amount']} FCFA ({p['status']})")
        print(f"{'='*60}\n")

        # Calculer les statistiques
        paid_count = len([p for p in all_payment_data if p['status'] == 'paid'])
        unpaid_count = len([p for p in all_payment_data if p['status'] == 'unpaid'])

        # Déterminer le statut global
        if unpaid_count == 0:
            global_status = 'À jour'
            status_color = 'green'
        elif unpaid_count <= 1:
            global_status = 'Attention'
            status_color = 'orange'
        else:
            global_status = 'En retard'
            status_color = 'red'

        # Calculer la date du prochain paiement
        next_payment_date = None
        days_until_due = None
        if contracts.exists():
            contract = contracts.first()
            # Le prochain paiement est le mois suivant
            current = datetime.now().date()
            if current.month == 12:
                next_month = current.replace(year=current.year + 1, month=1, day=1)
            else:
                next_month = current.replace(month=current.month + 1, day=1)
            next_payment_date = next_month.strftime('%d/%m/%Y')
            days_until_due = (next_month - current).days

        return Response({
            'payment_history': all_payment_data,
            'total_paid': total_paid,
            'total_due': total_due,
            'paid_count': paid_count,
            'unpaid_count': unpaid_count,
            'global_status': global_status,
            'status_color': status_color,
            'next_payment_date': next_payment_date,
            'days_until_due': days_until_due,
            'contract_info': {
                'property': contracts.first().property.titre if contracts.exists() else None,
                'address': contracts.first().property.adresse if contracts.exists() else None,
                'rent_amount': float(contracts.first().amount) if contracts.exists() else 0
            }
        })

    @action(detail=False, methods=['get'], url_path='statistics')
    def statistics(self, request):
        """Retourne les statistiques des paiements"""
        user = request.user
        queryset = self.get_queryset()

        # Statistiques de base
        stats = {
            'total': queryset.count(),
            'total_amount': queryset.aggregate(Sum('amount'))['amount__sum'] or 0,
            'by_status': {},
            'by_method': {},
            'completed_count': queryset.filter(status='completed').count(),
            'pending_count': queryset.filter(status='pending').count(),
        }

        # Par statut
        for stat in queryset.values('status').annotate(count=Count('id'), total=Sum('amount')):
            stats['by_status'][stat['status']] = {
                'count': stat['count'],
                'total': float(stat['total'] or 0)
            }

        # Par méthode de paiement
        for stat in queryset.values('payment_method').annotate(count=Count('id'), total=Sum('amount')):
            stats['by_method'][stat['payment_method']] = {
                'count': stat['count'],
                'total': float(stat['total'] or 0)
            }

        return Response(stats)

    @action(detail=True, methods=['get'], url_path='receipt')
    def receipt(self, request, pk=None):
        """Génère et retourne le reçu de paiement"""
        payment = self.get_object()

        if payment.receipt_pdf:
            # Si un reçu existe déjà, le retourner
            response = FileResponse(
                payment.receipt_pdf.open('rb'),
                content_type='application/pdf'
            )
            response['Content-Disposition'] = f'attachment; filename="recu_{payment.id}.pdf"'
            return response
        else:
            # TODO: Générer automatiquement un reçu PDF
            return Response({
                'message': 'Reçu non disponible pour ce paiement'
            }, status=status.HTTP_404_NOT_FOUND)
