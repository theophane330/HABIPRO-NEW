from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from rest_framework.authtoken.models import Token
from .models import Document, Property, PropertyMedia, VisitRequest, Tenant, Location, Contract, Payment ,JuridicalChatMessage,JuridicalDocument ,Prestataire ,MaintenanceRequest
from django.utils import timezone
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
    """Serializer pour afficher les paiements"""

    tenant_name = serializers.CharField(source='tenant.full_name', read_only=True)
    tenant_phone = serializers.CharField(source='tenant.phone', read_only=True)
    property_title = serializers.CharField(source='contract.property.titre', read_only=True)
    property_address = serializers.CharField(source='contract.property.adresse', read_only=True)
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id',
            'tenant',
            'tenant_name',
            'tenant_phone',
            'contract',
            'property_title',
            'property_address',
            'owner',
            'owner_name',
            'amount',
            'payment_month',
            'payment_method',
            'status',
            'transaction_reference',
            'notes',
            'owner_notified',
            'payment_date',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'owner', 'transaction_reference']


class TenantPaymentCreateSerializer(serializers.ModelSerializer):
    """Serializer pour que le locataire crée un paiement"""

    class Meta:
        model = Payment
        fields = [
            'contract',
            'amount',
            'payment_month',
            'payment_method',
            'notes',
        ]

    def validate(self, attrs):
        """Validation"""
        # Vérifier que le contrat appartient bien au locataire
        request = self.context.get('request')
        contract = attrs.get('contract')
        
        if not contract:
            raise serializers.ValidationError({
                'contract': 'Le contrat est requis'
            })

        # Vérifier que le locataire a bien un profil Tenant
        tenant = Tenant.objects.filter(user=request.user).first()
        if not tenant:
            raise serializers.ValidationError({
                'error': 'Aucun profil locataire trouvé'
            })

        # Vérifier que le contrat appartient au locataire
        if contract.tenant != tenant:
            raise serializers.ValidationError({
                'contract': 'Ce contrat ne vous appartient pas'
            })

        # Vérifier qu'un paiement n'existe pas déjà pour ce mois
        payment_month = attrs.get('payment_month')
        existing = Payment.objects.filter(
            contract=contract,
            payment_month=payment_month,
            status='completed'
        ).exists()

        if existing:
            raise serializers.ValidationError({
                'payment_month': f'Un paiement pour {payment_month} existe déjà'
            })

        return attrs

    def create(self, validated_data):
        """Créer le paiement"""
        request = self.context.get('request')
        tenant = Tenant.objects.get(user=request.user)
        contract = validated_data['contract']

        # Créer le paiement
        payment = Payment.objects.create(
            tenant=tenant,
            contract=contract,
            owner=contract.owner,
            amount=validated_data['amount'],
            payment_month=validated_data['payment_month'],
            payment_method=validated_data['payment_method'],
            notes=validated_data.get('notes', ''),
            status='pending',  # En attente de confirmation
            payment_date=timezone.now()
        )

        return payment
class JuridicalDocumentSerializer(serializers.ModelSerializer):
    """Serializer pour les documents juridiques"""
    
    modified = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = JuridicalDocument
        fields = [
            'id', 'name', 'file', 'file_url', 'file_type', 'file_size',
            'status', 'uploaded_at', 'modified', 'is_processed'
        ]
        read_only_fields = ['id', 'uploaded_at', 'is_processed']
    
    def get_modified(self, obj):
        return obj.get_modified_time()
    
    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None


class JuridicalChatMessageSerializer(serializers.ModelSerializer):
    """Serializer pour les messages de chat"""
    
    timestamp_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = JuridicalChatMessage
        fields = ['id', 'document', 'message_type', 'content', 'timestamp', 'timestamp_formatted']
        read_only_fields = ['id', 'timestamp']
    
    def get_timestamp_formatted(self, obj):
        return obj.timestamp.strftime('%H:%M')


class AskQuestionSerializer(serializers.Serializer):
    """Serializer pour les questions à l'IA"""
    
    document_id = serializers.IntegerField()
    question = serializers.CharField()
    max_tokens = serializers.IntegerField(default=1024)
    model_name = serializers.CharField(default="models/gemini-2.5-flash")

# Dans votre fichier serializers.py
# Ajoutez cet import en haut du fichier
from decimal import Decimal

# Puis remplacez les trois serializers Prestataire par ceci :

# ==============================================
# SERIALIZERS POUR PRESTATAIRE
# ==============================================

from decimal import Decimal

class PrestataireSerializer(serializers.ModelSerializer):
    """Serializer complet pour afficher un prestataire"""
    
    owner_name = serializers.SerializerMethodField()
    tarif_display = serializers.SerializerMethodField()
    note = serializers.DecimalField(
        max_digits=2,
        decimal_places=1,
        default=Decimal('0.0'),
        min_value=Decimal('0.0'),
        max_value=Decimal('5.0'),
        required=False,
        coerce_to_string=False
    )
    
    class Meta:
        model = Prestataire
        fields = [
            'id',
            'owner',
            'owner_name',
            'nom',
            'contact',
            'telephone',
            'email',
            'specialites',
            'zone',
            'note',
            'nb_avis',
            'tarif_min',
            'tarif_max',
            'tarif_display',
            'disponibilite',
            'experience',
            'certifications',
            'description',
            'services',
            'projets_recents',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']
    
    def get_owner_name(self, obj):
        """Retourne le nom complet du propriétaire"""
        if obj.owner:
            return f"{obj.owner.prenom} {obj.owner.nom}"
        return None
    
    def get_tarif_display(self, obj):
        """Retourne la fourchette de tarifs formatée"""
        return f"{obj.tarif_min:,} - {obj.tarif_max:,}"


class PrestataireListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour la liste des prestataires"""
    
    tarif_display = serializers.SerializerMethodField()
    note = serializers.DecimalField(
        max_digits=2,
        decimal_places=1,
        coerce_to_string=False
    )
    
    class Meta:
        model = Prestataire
        fields = [
            'id',
            'nom',
            'contact',
            'telephone',
            'email',
            'specialites',
            'zone',
            'note',
            'nb_avis',
            'tarif_display',
            'disponibilite',
            'experience',
            'description'
        ]
    
    def get_tarif_display(self, obj):
        """Retourne la fourchette de tarifs formatée"""
        return f"{obj.tarif_min:,} - {obj.tarif_max:,}"


class PrestataireCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer un nouveau prestataire"""
    
    class Meta:
        model = Prestataire
        fields = [
            'nom',
            'contact',
            'telephone',
            'email',
            'specialites',
            'zone',
            'note',
            'nb_avis',
            'tarif_min',
            'tarif_max',
            'disponibilite',
            'experience',
            'certifications',
            'description',
            'services',
            'projets_recents'
        ]
    
    def validate_email(self, value):
        """Valide le format de l'email"""
        from django.core.validators import validate_email as django_validate_email
        try:
            django_validate_email(value)
        except:
            raise serializers.ValidationError("Format d'email invalide.")
        return value
    
    def validate_specialites(self, value):
        """Valide que les spécialités ne sont pas vides"""
        if not value or len(value) == 0:
            raise serializers.ValidationError("Au moins une spécialité doit être fournie.")
        return value
    
    def to_internal_value(self, data):
        """Convertit les données entrantes AVANT la validation"""
        # Convertir note en Decimal si présent
        if 'note' in data:
            try:
                data['note'] = Decimal(str(data['note']))
            except:
                pass
        
        # Convertir les entiers vides
        for field in ['tarif_min', 'tarif_max', 'nb_avis']:
            if field in data and data[field] == '':
                data[field] = 0
        
        return super().to_internal_value(data)
    
    def validate(self, attrs):
        """Validation globale"""
        tarif_min = attrs.get('tarif_min', 0)
        tarif_max = attrs.get('tarif_max', 0)
        
        if tarif_max < tarif_min:
            raise serializers.ValidationError({
                'tarif_max': 'Le tarif maximum doit être supérieur ou égal au tarif minimum.'
            })
        
        # S'assurer que note est un Decimal
        if 'note' not in attrs:
            attrs['note'] = Decimal('0.0')
        elif not isinstance(attrs['note'], Decimal):
            attrs['note'] = Decimal(str(attrs['note']))
        
        return attrs
    
    def create(self, validated_data):
        """Création du prestataire"""
        if 'note' not in validated_data:
            validated_data['note'] = Decimal('0.0')
        elif not isinstance(validated_data['note'], Decimal):
            validated_data['note'] = Decimal(str(validated_data['note']))
        
        return super().create(validated_data)
    
# ==============================================
# SERIALIZERS POUR MAINTENANCE REQUEST
# ==============================================

class MaintenanceRequestSerializer(serializers.ModelSerializer):
    """Serializer complet pour afficher une demande de maintenance"""
    
    # Informations du locataire
    tenant_name = serializers.CharField(source='tenant.full_name', read_only=True)
    tenant_phone = serializers.CharField(source='tenant.phone', read_only=True)
    tenant_email = serializers.EmailField(source='tenant.email', read_only=True)
    
    # Informations de la propriété
    property_title = serializers.CharField(source='linked_property.titre', read_only=True)
    property_address = serializers.CharField(source='linked_property.adresse', read_only=True)
    property_type = serializers.CharField(source='linked_property.type', read_only=True)
    
    # Informations du propriétaire
    owner_name = serializers.SerializerMethodField()
    owner_email = serializers.EmailField(source='linked_property.owner.email', read_only=True)
    
    # Champs formatés
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    request_type_display = serializers.CharField(source='get_request_type_display', read_only=True)
    location_display = serializers.CharField(source='get_location_display', read_only=True)
    
    # Date formatée
    created_at_formatted = serializers.SerializerMethodField()
    time_elapsed = serializers.SerializerMethodField()
    
    class Meta:
        model = MaintenanceRequest
        fields = [
            'id',
            'request_id',
            'tenant',
            'tenant_name',
            'tenant_phone',
            'tenant_email',
            'linked_property',
            'property_title',
            'property_address',
            'property_type',
            'owner_name',
            'owner_email',
            'request_type',
            'request_type_display',
            'location',
            'location_display',
            'description',
            'status',
            'status_display',
            'priority',
            'priority_display',
            'provider',
            'created_at',
            'created_at_formatted',
            'updated_at',
            'time_elapsed'
        ]
        read_only_fields = ['id', 'request_id', 'created_at', 'updated_at']
    
    def get_owner_name(self, obj):
        """Retourne le nom complet du propriétaire"""
        if obj.linked_property and obj.linked_property.owner:
            return f"{obj.linked_property.owner.prenom} {obj.linked_property.owner.nom}"
        return None
    
    def get_created_at_formatted(self, obj):
        """Retourne la date formatée"""
        return obj.created_at.strftime('%d/%m/%Y à %H:%M')
    
    def get_time_elapsed(self, obj):
        """Retourne le temps écoulé depuis la création"""
        from django.utils import timezone
        diff = timezone.now() - obj.created_at
        
        if diff.days == 0:
            hours = diff.seconds // 3600
            if hours == 0:
                minutes = diff.seconds // 60
                return f"Il y a {minutes} min" if minutes > 0 else "À l'instant"
            return f"Il y a {hours}h"
        elif diff.days == 1:
            return "Hier"
        else:
            return f"Il y a {diff.days} jours"


class MaintenanceRequestListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour la liste des demandes"""
    
    tenant_name = serializers.CharField(source='tenant.full_name', read_only=True)
    property_title = serializers.CharField(source='linked_property.titre', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    time_elapsed = serializers.SerializerMethodField()
    
    class Meta:
        model = MaintenanceRequest
        fields = [
            'id',
            'request_id',
            'tenant_name',
            'property_title',
            'request_type',
            'status',
            'status_display',
            'priority',
            'priority_display',
            'provider',
            'created_at',
            'time_elapsed'
        ]
    
    def get_time_elapsed(self, obj):
        """Retourne le temps écoulé depuis la création"""
        from django.utils import timezone
        diff = timezone.now() - obj.created_at
        
        if diff.days == 0:
            hours = diff.seconds // 3600
            if hours == 0:
                minutes = diff.seconds // 60
                return f"Il y a {minutes} min" if minutes > 0 else "À l'instant"
            return f"Il y a {hours}h"
        elif diff.days == 1:
            return "Hier"
        else:
            return f"Il y a {diff.days} jours"


class MaintenanceRequestCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer une nouvelle demande (locataire)"""
    
    class Meta:
        model = MaintenanceRequest
        fields = [
            'linked_property',
            'request_type',
            'location',
            'description',
            'priority'
        ]
    
    def validate_linked_property(self, value):
        """Valide que la propriété existe et est louée par le locataire"""
        request = self.context.get('request')
        
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Utilisateur non authentifié")
        
        # Vérifier que le locataire a bien une location active pour cette propriété
        tenant = Tenant.objects.filter(user=request.user).first()
        
        if not tenant:
            raise serializers.ValidationError("Aucun profil locataire trouvé")
        
        # Vérifier qu'il y a une location active
        has_active_location = Location.objects.filter(
            tenant=tenant,
            property=value,
            status='active'
        ).exists()
        
        if not has_active_location:
            raise serializers.ValidationError(
                "Vous devez avoir une location active pour cette propriété pour créer une demande de maintenance"
            )
        
        return value
    
    def validate_description(self, value):
        """Valide que la description n'est pas vide"""
        if not value or len(value.strip()) < 10:
            raise serializers.ValidationError(
                "La description doit contenir au moins 10 caractères"
            )
        return value.strip()
    
    def validate(self, attrs):
        """Validation globale"""
        # Vérifier qu'il n'y a pas déjà une demande en attente/en cours pour le même problème
        request = self.context.get('request')
        tenant = Tenant.objects.filter(user=request.user).first()
        
        if tenant:
            existing_request = MaintenanceRequest.objects.filter(
                tenant=tenant,
                linked_property=attrs['linked_property'],
                request_type=attrs['request_type'],
                location=attrs['location'],
                status__in=['pending', 'in_progress']
            ).exists()
            
            if existing_request:
                raise serializers.ValidationError({
                    'request_type': 'Une demande similaire est déjà en cours de traitement'
                })
        
        return attrs


class MaintenanceRequestUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour mettre à jour une demande"""
    
    class Meta:
        model = MaintenanceRequest
        fields = [
            'status',
            'priority',
            'provider',
            'description'
        ]
    
    def validate_status(self, value):
        """Valide les transitions de statut"""
        instance = self.instance
        
        if not instance:
            return value
        
        # Règles de transition
        valid_transitions = {
            'pending': ['in_progress', 'rejected'],
            'in_progress': ['resolved', 'rejected'],
            'resolved': [],  # Ne peut plus changer une fois résolu
            'rejected': []   # Ne peut plus changer une fois rejeté
        }
        
        current_status = instance.status
        
        if current_status in ['resolved', 'rejected'] and value != current_status:
            raise serializers.ValidationError(
                f"Une demande {instance.get_status_display()} ne peut plus être modifiée"
            )
        
        if value not in valid_transitions.get(current_status, []) and value != current_status:
            raise serializers.ValidationError(
                f"Transition de statut invalide: {current_status} → {value}"
            )
        
        return value
    
    def validate(self, attrs):
        """Validation selon le rôle de l'utilisateur"""
        request = self.context.get('request')
        instance = self.instance
        
        if not instance:
            return attrs
        
        # Propriétaire peut tout modifier
        if request.user.role == 'proprietaire':
            return attrs
        
        # Locataire ne peut modifier que description et priorité
        if request.user.role == 'locataire':
            allowed_fields = {'description', 'priority'}
            provided_fields = set(attrs.keys())
            
            invalid_fields = provided_fields - allowed_fields
            if invalid_fields:
                raise serializers.ValidationError({
                    'error': f"Vous ne pouvez modifier que: {', '.join(allowed_fields)}"
                })
        
        return attrs


class MaintenanceRequestAssignProviderSerializer(serializers.Serializer):
    """Serializer pour assigner un prestataire"""
    
    provider = serializers.CharField(max_length=200, required=True)
    
    def validate_provider(self, value):
        """Valide que le nom du prestataire n'est pas vide"""
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError(
                "Le nom du prestataire doit contenir au moins 2 caractères"
            )
        return value.strip()


class MaintenanceRequestRejectSerializer(serializers.Serializer):
    """Serializer pour rejeter une demande"""
    
    reason = serializers.CharField(required=True, min_length=10)
    
    def validate_reason(self, value):
        """Valide la raison du rejet"""
        if not value or len(value.strip()) < 10:
            raise serializers.ValidationError(
                "La raison du rejet doit contenir au moins 10 caractères"
            )
        return value.strip()


class MaintenanceRequestStatisticsSerializer(serializers.Serializer):
    """Serializer pour les statistiques"""
    
    total = serializers.IntegerField()
    pending = serializers.IntegerField()
    in_progress = serializers.IntegerField()
    resolved = serializers.IntegerField()
    rejected = serializers.IntegerField()
    urgent = serializers.IntegerField()
    by_type = serializers.DictField()
    by_location = serializers.DictField()
    by_priority = serializers.DictField(required=False)
    average_resolution_time = serializers.CharField(required=False)
    
    class Meta:
        fields = [
            'total',
            'pending',
            'in_progress',
            'resolved',
            'rejected',
            'urgent',
            'by_type',
            'by_location',
            'by_priority',
            'average_resolution_time'
        ]