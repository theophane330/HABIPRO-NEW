from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny  # Ajout de AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Q, Sum, Count
from django.http import FileResponse
from django.utils import timezone
from datetime import datetime

from .models import Document, Propriete
from .serializers import (
    DocumentSerializer, 
    DocumentListSerializer,
    DocumentUploadSerializer,
    ProprieteSerializer
)


class DocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les documents
    """
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    permission_classes = [AllowAny]  # ✅ Changé pour permettre l'accès sans authentification
    
    def get_serializer_class(self):
        """Retourne le serializer approprié selon l'action"""
        if self.action == 'list':
            return DocumentListSerializer
        elif self.action == 'upload_multiple':
            return DocumentUploadSerializer
        return DocumentSerializer
    
    def get_queryset(self):
        """
        Filtre les documents selon les paramètres de requête
        """
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


class ProprieteViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les propriétés immobilières
    """
    queryset = Propriete.objects.all()
    serializer_class = ProprieteSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['titre', 'adresse', 'type_propriete', 'locataire']
    ordering_fields = ['date_ajout', 'prix', 'titre']
    ordering = ['-date_ajout']
    
    def get_queryset(self):
        """
        Retourner toutes les propriétés (pas de filtre par utilisateur en mode dev)
        """
        queryset = Propriete.objects.all()
        
        # Filtrer par statut si spécifié
        statut = self.request.query_params.get('statut', None)
        if statut and statut != 'all':
            queryset = queryset.filter(statut=statut)
        
        # Recherche par terme
        search_term = self.request.query_params.get('search', None)
        if search_term:
            queryset = queryset.filter(
                Q(titre__icontains=search_term) |
                Q(adresse__icontains=search_term) |
                Q(type_propriete__icontains=search_term) |
                Q(locataire__icontains=search_term)
            )
        
        return queryset
    
    def perform_create(self, serializer):
        """
        Assigner automatiquement le propriétaire si authentifié
        """
        if self.request.user.is_authenticated:
            serializer.save(proprietaire=self.request.user)
        else:
            # En mode dev, créer avec un utilisateur par défaut si nécessaire
            from django.contrib.auth.models import User
            default_user = User.objects.first()
            if default_user:
                serializer.save(proprietaire=default_user)
            else:
                raise ValueError("Aucun utilisateur disponible dans la base de données")
    
    def create(self, request, *args, **kwargs):
        """
        Créer une nouvelle propriété
        ✅ Plus besoin de transformer manuellement les données - le serializer s'en charge
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def update(self, request, *args, **kwargs):
        """
        Mettre à jour une propriété
        ✅ Plus besoin de transformer manuellement les données - le serializer s'en charge
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistiques(self, request):
        """
        Obtenir les statistiques des propriétés
        """
        proprietes = self.get_queryset()
        
        total_proprietes = proprietes.count()
        proprietes_louees = proprietes.filter(statut='loué').count()
        proprietes_disponibles = proprietes.filter(statut='disponible').count()
        proprietes_en_vente = proprietes.filter(statut='en_vente').count()
        
        # Calculer les revenus mensuels (somme des prix des propriétés louées)
        revenus_mensuels = proprietes.filter(statut='loué').aggregate(
            total=Sum('prix')
        )['total'] or 0
        
        return Response({
            'total_proprietes': total_proprietes,
            'proprietes_louees': proprietes_louees,
            'proprietes_disponibles': proprietes_disponibles,
            'proprietes_en_vente': proprietes_en_vente,
            'revenus_mensuels': float(revenus_mensuels)
        })
    
    @action(detail=False, methods=['get'])
    def export(self, request):
        """
        Exporter les données des propriétés
        """
        proprietes = self.get_queryset()
        serializer = self.get_serializer(proprietes, many=True)
        return Response({
            'data': serializer.data,
            'total': proprietes.count(),
            'date_export': timezone.now()
        })
    
    @action(detail=True, methods=['post'])
    def changer_statut(self, request, pk=None):
        """
        Changer le statut d'une propriété
        """
        propriete = self.get_object()
        nouveau_statut = request.data.get('statut')
        
        if nouveau_statut not in dict(Propriete.STATUT_CHOICES):
            return Response(
                {'erreur': 'Statut invalide'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        propriete.statut = nouveau_statut
        
        # Si le statut change à "disponible", retirer le locataire
        if nouveau_statut == 'disponible':
            propriete.locataire = None
        
        propriete.save()
        serializer = self.get_serializer(propriete)
        return Response(serializer.data)