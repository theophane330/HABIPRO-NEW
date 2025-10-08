from rest_framework import serializers
from .models import Document, Propriete
from PyPDF2 import PdfReader
import io

class DocumentSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Document"""
    
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = [
            'id',
            'title',
            'category',
            'type',
            'description',
            'content',
            'file',
            'file_url',
            'size',
            'pages',
            'tenant',
            'property',
            'status',
            'date',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'size', 'pages']
    
    def get_file_url(self, obj):
        """Retourne l'URL complète du fichier"""
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None
    
    def create(self, validated_data):
        """Override create pour extraire les métadonnées du PDF"""
        file = validated_data.get('file')
        
        if file:
            # Calculer la taille du fichier
            validated_data['size'] = self._format_file_size(file.size)
            
            # Extraire le nombre de pages du PDF
            try:
                pdf_file = io.BytesIO(file.read())
                pdf_reader = PdfReader(pdf_file)
                validated_data['pages'] = len(pdf_reader.pages)
                
                # Remettre le curseur au début pour la sauvegarde
                file.seek(0)
            except Exception as e:
                # En cas d'erreur, on garde la valeur par défaut
                validated_data['pages'] = 1
        
        return super().create(validated_data)
    
    def _format_file_size(self, size_bytes):
        """Formate la taille du fichier"""
        if size_bytes < 1024:
            return f"{size_bytes} B"
        elif size_bytes < 1024 * 1024:
            return f"{size_bytes / 1024:.1f} KB"
        else:
            return f"{size_bytes / (1024 * 1024):.1f} MB"


class DocumentListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour la liste des documents"""
    
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = [
            'id',
            'title',
            'category',
            'type',
            'date',
            'size',
            'pages',
            'tenant',
            'property',
            'status',
            'description',
            'file_url'
        ]
    
    def get_file_url(self, obj):
        """Retourne l'URL complète du fichier"""
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None


class DocumentUploadSerializer(serializers.Serializer):
    """Serializer pour l'upload multiple de documents"""
    
    files = serializers.ListField(
        child=serializers.FileField(
            max_length=100000,
            allow_empty_file=False,
            use_url=False
        ),
        write_only=True
    )
    category = serializers.ChoiceField(
        choices=Document.CATEGORY_CHOICES,
        required=True
    )
    tenant = serializers.CharField(max_length=255, required=False)
    property = serializers.CharField(max_length=255, required=False)
    status = serializers.ChoiceField(
        choices=Document.STATUS_CHOICES,
        default='active'
    )
    
    def validate_files(self, files):
        """Valide que tous les fichiers sont des PDF"""
        for file in files:
            if not file.name.lower().endswith('.pdf'):
                raise serializers.ValidationError(
                    f"Le fichier {file.name} n'est pas un PDF. Seuls les fichiers PDF sont acceptés."
                )
        return files


class ProprieteSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Propriete avec support bidirectionnel"""
    
    proprietaire_nom = serializers.CharField(source='proprietaire.username', read_only=True)
    
    # Champs optionnels pour recevoir les données du frontend
    title = serializers.CharField(write_only=True, required=False)
    address = serializers.CharField(write_only=True, required=False)
    price = serializers.DecimalField(max_digits=12, decimal_places=2, write_only=True, required=False)
    type = serializers.CharField(write_only=True, required=False)
    status = serializers.CharField(write_only=True, required=False)
    tenant = serializers.CharField(write_only=True, required=False, allow_null=True, allow_blank=True)
    bedrooms = serializers.IntegerField(write_only=True, required=False)
    bathrooms = serializers.IntegerField(write_only=True, required=False)
    size = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Propriete
        fields = [
            'id',
            'proprietaire',
            'proprietaire_nom',
            'titre',
            'adresse',
            'prix',
            'type_propriete',
            'statut',
            'locataire',
            'nombre_chambres',
            'nombre_salles_bain',
            'superficie',
            'description',
            'image',
            'date_ajout',
            'date_modification',
            # Champs frontend
            'title',
            'address',
            'price',
            'type',
            'status',
            'tenant',
            'bedrooms',
            'bathrooms',
            'size'
        ]
        read_only_fields = ['id', 'date_ajout', 'date_modification', 'proprietaire']
    
    def validate(self, data):
        """
        Transforme les données du frontend vers le format backend
        """
        # Mapper les champs du frontend vers le backend
        field_mapping = {
            'title': 'titre',
            'address': 'adresse',
            'price': 'prix',
            'type': 'type_propriete',
            'status': 'statut',
            'tenant': 'locataire',
            'bedrooms': 'nombre_chambres',
            'bathrooms': 'nombre_salles_bain',
            'size': 'superficie'
        }
        
        # Créer un nouveau dictionnaire avec les bons noms de champs
        transformed_data = {}
        
        # Transformer les champs du frontend
        for frontend_key, backend_key in field_mapping.items():
            if frontend_key in data:
                transformed_data[backend_key] = data[frontend_key]
        
        # Ajouter les autres champs qui sont déjà au bon format
        for key, value in data.items():
            if key not in field_mapping and key not in field_mapping.values():
                transformed_data[key] = value
        
        # ✅ CORRECTION CRITIQUE: Conserver les champs backend s'ils existent déjà
        backend_fields = ['titre', 'adresse', 'prix', 'type_propriete', 'statut', 
                          'locataire', 'nombre_chambres', 'nombre_salles_bain', 
                          'superficie', 'description', 'image']
        
        for field in backend_fields:
            if field in data and field not in transformed_data:
                transformed_data[field] = data[field]
        
        # Valider le statut
        if 'statut' in transformed_data:
            valid_statuts = [choice[0] for choice in Propriete.STATUT_CHOICES]
            if transformed_data['statut'] not in valid_statuts:
                raise serializers.ValidationError({
                    'statut': f"Statut invalide. Choix possibles: {', '.join(valid_statuts)}"
                })
        
        # Valider le type de propriété
        if 'type_propriete' in transformed_data:
            valid_types = [choice[0] for choice in Propriete.TYPE_CHOICES]
            if transformed_data['type_propriete'] not in valid_types:
                raise serializers.ValidationError({
                    'type_propriete': f"Type invalide. Choix possibles: {', '.join(valid_types)}"
                })
        
        # Gérer le locataire vide
        if 'locataire' in transformed_data:
            if transformed_data['locataire'] in [None, '', 'null']:
                transformed_data['locataire'] = None
        
        return transformed_data
    
    def to_representation(self, instance):
        """
        Transforme les données du backend vers le format frontend
        """
        return {
            'id': instance.id,
            'title': instance.titre,
            'address': instance.adresse,
            'price': float(instance.prix),
            'type': instance.type_propriete,
            'status': instance.statut,
            'tenant': instance.locataire,
            'bedrooms': instance.nombre_chambres,
            'bathrooms': instance.nombre_salles_bain,
            'size': instance.superficie,
            'description': instance.description or '',
            'image': instance.image,
            'addedDate': instance.date_ajout,
            'modifiedDate': instance.date_modification
        }