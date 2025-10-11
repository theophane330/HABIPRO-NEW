from rest_framework import serializers
from .models import Document,Property
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
    
from rest_framework import serializers
from .models import Property


class PropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = [
            'id',
            'titre',
            'adresse',
            'prix',
            'type',
            'statut',
            'locataire',
            'chambres',
            'salles_de_bain',
            'superficie',
            'date_ajout',
            'image'
        ]
        read_only_fields = ['id', 'date_ajout']
    
    def validate_prix(self, value):
        if value < 0:
            raise serializers.ValidationError("Le prix ne peut pas être négatif.")
        return value
    
    def validate_chambres(self, value):
        if value < 0:
            raise serializers.ValidationError("Le nombre de chambres ne peut pas être négatif.")
        return value
    
    def validate_salles_de_bain(self, value):
        if value < 0:
            raise serializers.ValidationError("Le nombre de salles de bain ne peut pas être négatif.")
        return value

class PropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = [
            'id',
            'titre',
            'adresse',
            'prix',
            'type',
            'statut',
            'locataire',
            'chambres',
            'salles_de_bain',
            'superficie',
            'date_ajout',
            'image'
        ]
        read_only_fields = ['id', 'date_ajout']
    
    def validate_prix(self, value):
        if value < 0:
            raise serializers.ValidationError("Le prix ne peut pas être négatif.")
        return value
    
    def validate_chambres(self, value):
        if value < 0:
            raise serializers.ValidationError("Le nombre de chambres ne peut pas être négatif.")
        return value
    
    def validate_salles_de_bain(self, value):
        if value < 0:
            raise serializers.ValidationError("Le nombre de salles de bain ne peut pas être négatif.")
        return value