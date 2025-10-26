from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from rest_framework.authtoken.models import Token
from .models import Document, Property, PropertyMedia, VisitRequest, Tenant, Location, Contract, Payment
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
    owner_name = serializers.SerializerMethodField()

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
            'owner',
            'owner_name',
            'medias',
            'primary_media'
        ]
        read_only_fields = ['id', 'date_ajout', 'owner', 'owner_name']

    def get_owner_name(self, obj):
        """Retourne le nom du propriétaire"""
        if obj.owner:
            return f"{obj.owner.prenom} {obj.owner.nom}"
        return None
    
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


# ==============================================
# SERIALIZERS POUR VISIT REQUEST
# ==============================================

class VisitRequestSerializer(serializers.ModelSerializer):
    """Serializer pour les demandes de visite"""

    tenant_name = serializers.SerializerMethodField()
    property_title = serializers.SerializerMethodField()
    property_address = serializers.SerializerMethodField()
    owner_id = serializers.SerializerMethodField()

    class Meta:
        model = VisitRequest
        fields = [
            'id',
            'tenant',
            'tenant_name',
            'property',
            'property_title',
            'property_address',
            'owner_id',
            'requested_date',
            'message',
            'status',
            'proposed_date',
            'owner_message',
            'read_by_owner',
            'read_by_tenant',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'tenant']

    def get_tenant_name(self, obj):
        """Retourne le nom complet du locataire"""
        return obj.tenant.get_full_name()

    def get_property_title(self, obj):
        """Retourne le titre de la propriété"""
        return obj.property.titre

    def get_property_address(self, obj):
        """Retourne l'adresse de la propriété"""
        return obj.property.adresse

    def get_owner_id(self, obj):
        """Retourne l'ID du propriétaire de la propriété"""
        return obj.property.owner.id if obj.property.owner else None

    def create(self, validated_data):
        """Crée une nouvelle demande de visite avec le locataire actuel"""
        request = self.context.get('request')
        validated_data['tenant'] = request.user
        return super().create(validated_data)


class VisitRequestUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour la mise à jour des demandes de visite par le propriétaire"""

    class Meta:
        model = VisitRequest
        fields = ['status', 'proposed_date', 'owner_message']

    def validate(self, attrs):
        """Valide que proposed_date est fourni si status est 'proposed'"""
        status = attrs.get('status', self.instance.status if self.instance else None)
        proposed_date = attrs.get('proposed_date')

        if status == 'proposed' and not proposed_date:
            raise serializers.ValidationError({
                'proposed_date': 'Une date proposée est requise lorsque le statut est "proposed".'
            })

        return attrs


# ==============================================
# SERIALIZERS POUR TENANT (LOCATAIRE)
# ==============================================

class TenantSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Tenant"""

    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    property_title = serializers.CharField(source='linked_property.titre', read_only=True)

    class Meta:
        model = Tenant
        fields = [
            'id',
            'user',
            'user_email',
            'user_name',
            'full_name',
            'phone',
            'email',
            'id_number',
            'linked_property',
            'property_title',
            'lease_start_date',
            'lease_end_date',
            'monthly_rent',
            'security_deposit',
            'payment_method',
            'status',
            'signed_contract',
            'id_document',
            'additional_notes',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_user_name(self, obj):
        """Retourne le nom complet de l'utilisateur"""
        if obj.user:
            return f"{obj.user.prenom} {obj.user.nom}"
        return None


class TenantCreateFromVisitSerializer(serializers.ModelSerializer):
    """Serializer spécial pour créer un locataire à partir d'une visite acceptée"""

    visit_request_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Tenant
        fields = [
            'visit_request_id',
            'user',
            'full_name',
            'phone',
            'email',
            'id_number',
            'linked_property',
            'lease_start_date',
            'lease_end_date',
            'monthly_rent',
            'security_deposit',
            'payment_method',
            'status',
            'signed_contract',
            'id_document',
            'additional_notes'
        ]

    def validate(self, attrs):
        """Valide les données du locataire"""
        visit_request_id = attrs.pop('visit_request_id', None)

        # Si un visit_request_id est fourni, récupérer les informations
        if visit_request_id:
            try:
                from .models import VisitRequest
                visit_request = VisitRequest.objects.get(id=visit_request_id, status='accepted')

                # Pré-remplir automatiquement avec les infos du User
                if visit_request.tenant:
                    attrs['user'] = visit_request.tenant
                    if not attrs.get('full_name'):
                        attrs['full_name'] = f"{visit_request.tenant.prenom} {visit_request.tenant.nom}"
                    if not attrs.get('email'):
                        attrs['email'] = visit_request.tenant.email
                    if not attrs.get('phone'):
                        attrs['phone'] = visit_request.tenant.telephone

                # Pré-remplir la propriété
                if visit_request.property and not attrs.get('linked_property'):
                    attrs['linked_property'] = visit_request.property

            except VisitRequest.DoesNotExist:
                raise serializers.ValidationError({
                    'visit_request_id': 'Demande de visite non trouvée ou pas encore acceptée'
                })

        return attrs


# ==============================================
# SERIALIZERS POUR LOCATION
# ==============================================

class LocationSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Location"""

    # Informations du locataire
    tenant_name = serializers.CharField(source='tenant.full_name', read_only=True)
    tenant_email = serializers.EmailField(source='tenant.email', read_only=True)
    tenant_phone = serializers.CharField(source='tenant.phone', read_only=True)

    # Informations de la propriété
    property_title = serializers.CharField(source='property.titre', read_only=True)
    property_address = serializers.CharField(source='property.adresse', read_only=True)
    property_type = serializers.CharField(source='property.type', read_only=True)

    # Informations du propriétaire
    owner_name = serializers.SerializerMethodField()
    owner_email = serializers.EmailField(source='owner.email', read_only=True)

    class Meta:
        model = Location
        fields = [
            'id',
            'tenant',
            'tenant_name',
            'tenant_email',
            'tenant_phone',
            'property',
            'property_title',
            'property_address',
            'property_type',
            'owner',
            'owner_name',
            'owner_email',
            'lease_start_date',
            'lease_end_date',
            'monthly_rent',
            'security_deposit',
            'payment_method',
            'status',
            'signed_contract',
            'additional_notes',
            'created_at',
            'updated_at',
            'terminated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_owner_name(self, obj):
        """Retourne le nom complet du propriétaire"""
        if obj.owner:
            return f"{obj.owner.prenom} {obj.owner.nom}"
        return None


class LocationCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer une nouvelle location"""

    visit_request_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Location
        fields = [
            'visit_request_id',
            'tenant',
            'property',
            'owner',
            'lease_start_date',
            'lease_end_date',
            'monthly_rent',
            'security_deposit',
            'payment_method',
            'status',
            'signed_contract',
            'additional_notes'
        ]

    def validate(self, attrs):
        """Valide les données de la location"""
        visit_request_id = attrs.pop('visit_request_id', None)

        # Si un visit_request_id est fourni, récupérer les informations
        if visit_request_id:
            try:
                from .models import VisitRequest
                visit_request = VisitRequest.objects.get(id=visit_request_id, status='accepted')

                # Pré-remplir avec les infos de la visite
                if visit_request.tenant and not attrs.get('tenant'):
                    # Vérifier si le Tenant existe pour cet utilisateur
                    from .models import Tenant
                    tenant, created = Tenant.objects.get_or_create(
                        user=visit_request.tenant,
                        defaults={
                            'full_name': f"{visit_request.tenant.prenom} {visit_request.tenant.nom}",
                            'email': visit_request.tenant.email,
                            'phone': visit_request.tenant.telephone,
                            'status': 'active'
                        }
                    )
                    attrs['tenant'] = tenant

                # Pré-remplir la propriété
                if visit_request.property and not attrs.get('property'):
                    attrs['property'] = visit_request.property

                # Pré-remplir le propriétaire
                if visit_request.property.owner and not attrs.get('owner'):
                    attrs['owner'] = visit_request.property.owner

            except VisitRequest.DoesNotExist:
                raise serializers.ValidationError({
                    'visit_request_id': 'Demande de visite non trouvée ou pas encore acceptée'
                })

        # Vérifier que le propriétaire correspond bien à la propriété
        if attrs.get('property') and attrs.get('owner'):
            if attrs['property'].owner != attrs['owner']:
                raise serializers.ValidationError({
                    'owner': 'Le propriétaire ne correspond pas à la propriété sélectionnée'
                })

        # Vérifier qu'il n'existe pas déjà une location active pour cette combinaison
        from .models import Location
        existing_location = Location.objects.filter(
            tenant=attrs.get('tenant'),
            property=attrs.get('property'),
            status='active'
        ).first()

        if existing_location:
            raise serializers.ValidationError({
                'property': f'Une location active existe déjà pour ce locataire sur cette propriété'
            })

        return attrs


# ============================================
# SERIALIZERS POUR LES CONTRATS
# ============================================

class ContractSerializer(serializers.ModelSerializer):
    """Serializer pour les contrats"""

    # Informations en lecture seule
    tenant_name = serializers.CharField(source='tenant.user.get_full_name', read_only=True)
    tenant_email = serializers.EmailField(source='tenant.user.email', read_only=True)
    tenant_phone = serializers.CharField(source='tenant.telephone', read_only=True)
    property_title = serializers.CharField(source='property.titre', read_only=True)
    property_address = serializers.CharField(source='property.adresse', read_only=True)
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)

    class Meta:
        model = Contract
        fields = [
            'id',
            'owner',
            'tenant',
            'property',
            'location',
            'contract_type',
            'start_date',
            'end_date',
            'contract_purpose',
            'amount',
            'security_deposit',
            'payment_method',
            'payment_frequency',
            'specific_rules',
            'insurance',
            'contract_pdf',
            'additional_notes',
            'status',
            'created_at',
            'updated_at',
            'signed_at',
            # Champs en lecture seule
            'tenant_name',
            'tenant_email',
            'tenant_phone',
            'property_title',
            'property_address',
            'owner_name',
        ]
        read_only_fields = ['created_at', 'updated_at', 'signed_at']

    def validate(self, attrs):
        """Validation des données du contrat"""
        # Vérifier que le locataire appartient bien au propriétaire
        tenant = attrs.get('tenant')
        owner = attrs.get('owner')

        # Vérifier que la propriété appartient au propriétaire
        property_obj = attrs.get('property')
        if property_obj and owner and property_obj.owner != owner:
            raise serializers.ValidationError({
                'property': 'Cette propriété ne vous appartient pas'
            })

        return attrs


class ContractCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création de contrats"""

    class Meta:
        model = Contract
        fields = [
            'tenant',
            'property',
            'location',
            'contract_type',
            'start_date',
            'end_date',
            'contract_purpose',
            'amount',
            'security_deposit',
            'payment_method',
            'payment_frequency',
            'specific_rules',
            'insurance',
            'contract_pdf',
            'additional_notes',
            'status',
        ]

    def validate(self, attrs):
        """Validation des données lors de la création"""
        # Vérifier que la date de fin est après la date de début
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')

        if end_date and start_date and end_date <= start_date:
            raise serializers.ValidationError({
                'end_date': 'La date de fin doit être postérieure à la date de début'
            })

        return attrs


# ============================================
# SERIALIZERS POUR LES PAIEMENTS
# ============================================

class PaymentSerializer(serializers.ModelSerializer):
    """Serializer pour les paiements"""

    # Informations en lecture seule
    tenant_name = serializers.CharField(source='tenant.full_name', read_only=True)
    tenant_phone = serializers.CharField(source='tenant.phone', read_only=True)
    tenant_email = serializers.EmailField(source='tenant.email', read_only=True)
    property_title = serializers.CharField(source='property.titre', read_only=True)
    property_address = serializers.CharField(source='property.adresse', read_only=True)
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    owner_email = serializers.EmailField(source='owner.email', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id',
            'tenant',
            'tenant_name',
            'tenant_phone',
            'tenant_email',
            'property',
            'property_title',
            'property_address',
            'owner',
            'owner_name',
            'owner_email',
            'location',
            'amount',
            'payment_month',
            'payment_method',
            'status',
            'auto_payment_enabled',
            'transaction_reference',
            'notes',
            'receipt_pdf',
            'payment_date',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['payment_date', 'created_at', 'updated_at']


class PaymentCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création de paiements"""

    class Meta:
        model = Payment
        fields = [
            'tenant',
            'property',
            'location',
            'amount',
            'payment_month',
            'payment_method',
            'status',
            'auto_payment_enabled',
            'transaction_reference',
            'notes',
        ]

    def validate(self, attrs):
        """Validation des données lors de la création"""
        # Vérifier que le montant est positif
        amount = attrs.get('amount')
        if amount and amount <= 0:
            raise serializers.ValidationError({
                'amount': 'Le montant doit être supérieur à 0'
            })

        return attrs
