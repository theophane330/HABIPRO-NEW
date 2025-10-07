from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Q, Count
from django.http import FileResponse, HttpResponse
from .models import Document
from .serializers import (
    DocumentSerializer, 
    DocumentListSerializer,
    DocumentUploadSerializer
)
import io
from datetime import datetime

class DocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les documents
    """
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
        """
        Crée un nouveau document
        """
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
        """
        Met à jour un document
        """
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
        """
        Supprime un document
        """
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {'message': 'Document supprimé avec succès'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['post'], url_path='upload-multiple')
    def upload_multiple(self, request):
        """
        Upload multiple de documents PDF
        """
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
        """
        Télécharge un document
        """
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
        """
        Prévisualise un document (inline)
        """
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
        """
        Retourne les statistiques sur les documents
        """
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