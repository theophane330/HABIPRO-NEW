from rest_framework import viewsets, status, filters, generics, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.authtoken.models import Token
from django.db.models import Q, Count
from django.http import FileResponse, HttpResponse
from django.contrib.auth import get_user_model
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend

from .models import Document, Property, PropertyMedia
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
    
    def get_queryset(self):
        queryset = super().get_queryset()
        statut = self.request.query_params.get('statut', None)
        
        if statut and statut != 'all':
            queryset = queryset.filter(statut=statut)
        
        return queryset
    
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