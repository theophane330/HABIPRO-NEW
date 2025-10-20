from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from rest_framework.authtoken.models import Token
from .models import Document, Property, PropertyMedia
from PyPDF2 import PdfReader
import io

User = get_user_model()


# ==============================================
# SERIALIZERS D'AUTHENTIFICATION
# ==============================================

class UserSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle User"""
    
    class Meta:
        model = User
        fields = ['id', 'email', 'nom', 'prenom', 'telephone', 'role', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer pour l'inscription"""
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=6,
        style={'input_type': 'password'}
    )
    confirm_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = ['email', 'nom', 'prenom', 'telephone', 'role', 'password', 'confirm_password']
    
    def validate(self, attrs):
        """Valide que les mots de passe correspondent"""
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                'password': 'Les mots de passe ne correspondent pas'
            })
        return attrs
    
    def validate_email(self, value):
        """Valide que l'email n'est pas déjà utilisé"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Cet email est déjà utilisé')
        return value
    
    def validate_role(self, value):
        """Valide que le rôle est valide"""
        if value not in ['proprietaire', 'locataire']:
            raise serializers.ValidationError('Rôle invalide')
        return value
    
    def create(self, validated_data):
        """Crée un nouvel utilisateur"""
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer pour la connexion"""
    
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """Valide les identifiants de connexion"""
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(
                request=self.context.get('request'),
                username=email,
                password=password
            )
            
            if not user:
                raise serializers.ValidationError(
                    'Email ou mot de passe incorrect',
                    code='authorization'
                )
            
            if not user.is_active:
                raise serializers.ValidationError(
                    'Ce compte est désactivé',
                    code='authorization'
                )
        else:
            raise serializers.ValidationError(
                'Email et mot de passe requis',
                code='authorization'
            )
        
        attrs['user'] = user
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer pour changer le mot de passe"""
    
    old_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        min_length=6,
        style={'input_type': 'password'}
    )
    confirm_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """Valide les mots de passe"""
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                'new_password': 'Les mots de passe ne correspondent pas'
            })
        return attrs
    
    def validate_old_password(self, value):
        """Valide l'ancien mot de passe"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Mot de passe incorrect')
        return value


# ==============================================
# SERIALIZERS POUR PROPERTY MEDIA
# ==============================================

class PropertyMediaSerializer(serializers.ModelSerializer):
    """Serializer pour les médias de propriété"""
    
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = PropertyMedia
        fields = [
            'id',
            'file',
            'file_url',
            'media_type',
            'is_primary',
            'order',
            'uploaded_at'
        ]
        read_only_fields = ['media_type', 'uploaded_at']
    
    def get_file_url(self, obj):
        """Retourne l'URL complète du fichier"""
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None


# ==============================================
# SERIALIZERS POUR PROPERTY
# ==============================================

class PropertySerializer(serializers.ModelSerializer):
    """Serializer complet pour Property avec médias"""
    
    medias = PropertyMediaSerializer(many=True, read_only=True)
    primary_media = serializers.SerializerMethodField()
    
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
            'medias',
            'primary_media'
        ]
        read_only_fields = ['id', 'date_ajout']
    
    def get_primary_media(self, obj):
        """Retourne le média principal ou le premier média disponible"""
        primary = obj.medias.filter(is_primary=True).first()
        if not primary:
            primary = obj.medias.first()
        
        if primary:
            request = self.context.get('request')
            return {
                'id': primary.id,
                'url': request.build_absolute_uri(primary.file.url) if request else None,
                'media_type': primary.media_type
            }
        return None
    
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


# ==============================================
# SERIALIZERS POUR DOCUMENT
# ==============================================

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
            validated_data['size'] = self._format_file_size(file.size)
            
            try:
                pdf_file = io.BytesIO(file.read())
                pdf_reader = PdfReader(pdf_file)
                validated_data['pages'] = len(pdf_reader.pages)
                file.seek(0)
            except Exception as e:
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