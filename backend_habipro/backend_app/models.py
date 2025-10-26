from django.db import models
from django.core.validators import FileExtensionValidator, MinValueValidator
from django.db.models import Q
from django.utils.text import slugify
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
import uuid
import os


def document_upload_path(instance, filename):
    """Génère le chemin d'upload pour les documents"""
    category_folder = instance.category
    return f'documents/{category_folder}/{filename}'


def property_media_path(instance, filename):
    """Génère un chemin de fichier court et unique pour les médias"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4().hex[:8]}.{ext}"
    return os.path.join('properties', str(instance.property.id), filename)


# ==============================================
# MODÈLE USER PERSONNALISÉ
# ==============================================

class UserManager(BaseUserManager):
    """Manager personnalisé pour le modèle User"""
    
    def create_user(self, email, password=None, **extra_fields):
        """Crée et sauvegarde un utilisateur"""
        if not email:
            raise ValueError('L\'adresse email est obligatoire')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Crée et sauvegarde un superutilisateur"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'proprietaire')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Le superutilisateur doit avoir is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Le superutilisateur doit avoir is_superuser=True')
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Modèle utilisateur personnalisé avec rôles"""
    
    ROLE_CHOICES = [
        ('proprietaire', 'Propriétaire'),
        ('locataire', 'Locataire'),
    ]
    
    # Informations de base
    email = models.EmailField(unique=True, verbose_name='Email')
    nom = models.CharField(max_length=100, verbose_name='Nom')
    prenom = models.CharField(max_length=100, verbose_name='Prénom')
    telephone = models.CharField(max_length=20, verbose_name='Téléphone')
    
    # Rôle
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='locataire',
        verbose_name='Rôle'
    )
    
    # Permissions
    is_active = models.BooleanField(default=True, verbose_name='Actif')
    is_staff = models.BooleanField(default=False, verbose_name='Staff')
    is_superuser = models.BooleanField(default=False, verbose_name='Superutilisateur')
    
    # Dates
    date_joined = models.DateTimeField(default=timezone.now, verbose_name='Date d\'inscription')
    last_login = models.DateTimeField(null=True, blank=True, verbose_name='Dernière connexion')
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nom', 'prenom']
    
    class Meta:
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
        db_table = 'users'
    
    def __str__(self):
        return f"{self.prenom} {self.nom} ({self.email})"
    
    def get_full_name(self):
        """Retourne le nom complet de l'utilisateur"""
        return f"{self.prenom} {self.nom}"
    
    def get_short_name(self):
        """Retourne le prénom de l'utilisateur"""
        return self.prenom


# ==============================================
# MODÈLES EXISTANTS (Document, Property, etc.)
# ==============================================

class Document(models.Model):
    """Modèle pour stocker les documents et contrats"""
    
    CATEGORY_CHOICES = [
        ('contracts', 'Contrats de bail'),
        ('inventory', 'États des lieux'),
        ('receipts', 'Quittances'),
        ('insurance', 'Assurances'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Actif'),
        ('completed', 'Terminé'),
        ('issued', 'Émis'),
        ('valid', 'Valide'),
        ('signed', 'Signé'),
    ]
    
    # Informations principales
    title = models.CharField(max_length=255, verbose_name="Titre du document")
    category = models.CharField(
        max_length=50, 
        choices=CATEGORY_CHOICES,
        verbose_name="Catégorie"
    )
    type = models.CharField(max_length=100, verbose_name="Type de document")
    description = models.TextField(blank=True, verbose_name="Description")
    content = models.TextField(blank=True, verbose_name="Contenu/Extrait")
    
    # Fichier
    file = models.FileField(
        upload_to=document_upload_path,
        validators=[FileExtensionValidator(allowed_extensions=['pdf'])],
        verbose_name="Fichier PDF"
    )
    
    # Métadonnées du fichier
    size = models.CharField(max_length=20, blank=True, verbose_name="Taille du fichier")
    pages = models.IntegerField(default=1, verbose_name="Nombre de pages")
    
    # Informations liées
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='documents',
        verbose_name="Propriétaire",
        null=True,
        blank=True,
        limit_choices_to={'role': 'proprietaire'}
    )
    tenant = models.CharField(max_length=255, verbose_name="Locataire")
    property = models.CharField(max_length=255, verbose_name="Propriété")

    # Statut
    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default='active',
        verbose_name="Statut"
    )
    
    # Dates
    date = models.DateField(verbose_name="Date du document")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Date de modification")
    
    class Meta:
        db_table = 'documents'
        ordering = ['-date', '-created_at']
        verbose_name = "Document"
        verbose_name_plural = "Documents"
    
    def __str__(self):
        return self.title
    
    def delete(self, *args, **kwargs):
        """Supprime le fichier physique lors de la suppression du document"""
        if self.file:
            if os.path.isfile(self.file.path):
                os.remove(self.file.path)
        super().delete(*args, **kwargs)
    
    def get_file_size(self):
        """Retourne la taille du fichier formatée"""
        if self.file:
            size_bytes = self.file.size
            if size_bytes < 1024:
                return f"{size_bytes} B"
            elif size_bytes < 1024 * 1024:
                return f"{size_bytes / 1024:.1f} KB"
            else:
                return f"{size_bytes / (1024 * 1024):.1f} MB"
        return "0 B"
    
    def save(self, *args, **kwargs):
        """Override save pour calculer automatiquement la taille"""
        if self.file and not self.size:
            self.size = self.get_file_size()
        super().save(*args, **kwargs)


class Property(models.Model):
    STATUS_CHOICES = [
        ('disponible', 'Disponible'),
        ('occupé', 'Occupé'),
        ('loué', 'Loué'),
        ('en_vente', 'En vente'),
        ('vacant', 'Vacant'),
    ]

    TYPE_CHOICES = [
        ('Appartement', 'Appartement'),
        ('Maison', 'Maison'),
        ('Villa', 'Villa'),
        ('Studio', 'Studio'),
        ('Terrain', 'Terrain'),
        ('Duplex', 'Duplex'),
        ('Penthouse', 'Penthouse'),
        ('Loft', 'Loft'),
    ]

    OFFER_TYPE_CHOICES = [
        ('Location', 'Location'),
        ('Vente', 'Vente'),
    ]

    CURRENCY_CHOICES = [
        ('FCFA', 'FCFA'),
        ('EUR', 'EUR'),
        ('USD', 'USD'),
    ]

    LEASE_DURATION_CHOICES = [
        ('6 mois', '6 mois'),
        ('12 mois', '12 mois'),
        ('24 mois', '24 mois'),
        ('Indéterminée', 'Indéterminée'),
    ]

    # Propriétaire
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='properties',
        verbose_name="Propriétaire",
        null=True,
        blank=True
    )

    # Informations de base
    titre = models.CharField(max_length=200, verbose_name="Titre")
    adresse = models.CharField(max_length=300, verbose_name="Adresse")
    location = models.CharField(max_length=200, blank=True, verbose_name="Ville/Zone")

    # GPS
    gps_lat = models.CharField(max_length=20, blank=True, null=True, verbose_name="Latitude GPS")
    gps_lng = models.CharField(max_length=20, blank=True, null=True, verbose_name="Longitude GPS")

    # Type et statut
    type = models.CharField(max_length=50, choices=TYPE_CHOICES, verbose_name="Type")
    statut = models.CharField(max_length=20, choices=STATUS_CHOICES, default='disponible', verbose_name="Statut")
    offer_type = models.CharField(max_length=20, choices=OFFER_TYPE_CHOICES, default='Location', verbose_name="Type d'offre")

    # Caractéristiques
    superficie = models.CharField(max_length=50, verbose_name="Superficie")
    chambres = models.IntegerField(validators=[MinValueValidator(0)], verbose_name="Chambres")
    salles_de_bain = models.IntegerField(validators=[MinValueValidator(0)], verbose_name="Salles de bain")

    # Équipements
    has_parking = models.BooleanField(default=False, verbose_name="Parking disponible")
    has_garden = models.BooleanField(default=False, verbose_name="Jardin disponible")
    has_balcony = models.BooleanField(default=False, verbose_name="Balcon disponible")
    has_terrace = models.BooleanField(default=False, verbose_name="Terrasse disponible")

    # Prix et conditions
    prix = models.IntegerField(validators=[MinValueValidator(0)], verbose_name="Prix/Loyer mensuel")
    currency = models.CharField(max_length=10, choices=CURRENCY_CHOICES, default='FCFA', verbose_name="Devise")
    lease_duration = models.CharField(max_length=20, choices=LEASE_DURATION_CHOICES, blank=True, null=True, verbose_name="Durée du bail")

    # Description
    description = models.TextField(blank=True, verbose_name="Description")

    # Disponibilité
    immediate_availability = models.BooleanField(default=True, verbose_name="Disponibilité immédiate")

    # Locataire
    locataire = models.CharField(max_length=200, null=True, blank=True, verbose_name="Locataire")

    # Dates
    date_ajout = models.DateField(auto_now_add=True, verbose_name="Date d'ajout")
    
    class Meta:
        verbose_name = "Propriété"
        verbose_name_plural = "Propriétés"
        ordering = ['-date_ajout']
    
    def __str__(self):
        return self.titre


class PropertyMedia(models.Model):
    """Modèle pour stocker plusieurs images/vidéos par propriété"""
    
    MEDIA_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Vidéo'),
    ]
    
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='medias',
        verbose_name="Propriété"
    )
    file = models.FileField(
        upload_to=property_media_path,
        verbose_name="Fichier",
        max_length=200
    )
    media_type = models.CharField(
        max_length=10,
        choices=MEDIA_TYPE_CHOICES,
        verbose_name="Type de média"
    )
    is_primary = models.BooleanField(
        default=False,
        verbose_name="Média principal"
    )
    order = models.IntegerField(
        default=0,
        verbose_name="Ordre d'affichage"
    )
    uploaded_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date d'ajout"
    )
    
    class Meta:
        verbose_name = "Média de propriété"
        verbose_name_plural = "Médias de propriété"
        ordering = ['order', '-uploaded_at']
    
    def __str__(self):
        return f"{self.media_type} - {self.property.titre}"
    
    def delete(self, *args, **kwargs):
        """Supprime le fichier physique lors de la suppression"""
        if self.file:
            if os.path.isfile(self.file.path):
                os.remove(self.file.path)
        super().delete(*args, **kwargs)
    
    def save(self, *args, **kwargs):
        """Détecte automatiquement le type de média"""
        if self.file:
            ext = self.file.name.split('.')[-1].lower()
            if ext in ['mp4', 'webm', 'avi', 'mov']:
                self.media_type = 'video'
            else:
                self.media_type = 'image'
        
        # Si c'est le premier média ou marqué comme principal, désactiver les autres
        if self.is_primary:
            PropertyMedia.objects.filter(
                property=self.property,
                is_primary=True
            ).exclude(id=self.id).update(is_primary=False)
        
        super().save(*args, **kwargs)

# ==============================================
# MODÈLE TENANT (LOCATAIRE)
# ==============================================

class Tenant(models.Model):
    """Modèle pour gérer les locataires"""

    STATUS_CHOICES = [
        ('À jour', 'À jour'),
        ('En retard', 'En retard'),
        ('active', 'Actif'),
        ('inactive', 'Inactif'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('Mobile Money', 'Mobile Money'),
        ('Virement bancaire', 'Virement bancaire'),
        ('Espèces', 'Espèces'),
        ('Chèque', 'Chèque'),
        ('Orange Money', 'Orange Money'),
        ('MTN Money', 'MTN Money'),
    ]

    # Propriétaire qui a créé le locataire
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='owned_tenants',
        verbose_name="Propriétaire",
        limit_choices_to={'role': 'proprietaire'}
    )

    # Lien avec l'utilisateur (compte locataire)
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tenant_profile',
        verbose_name="Compte utilisateur",
        limit_choices_to={'role': 'locataire'}
    )

    # Informations personnelles
    full_name = models.CharField(max_length=200, verbose_name="Nom complet")
    phone = models.CharField(max_length=20, verbose_name="Téléphone")
    email = models.EmailField(verbose_name="Email")
    id_number = models.CharField(max_length=50, blank=True, default='', verbose_name="Numéro d'identification")

    # Propriété liée
    linked_property = models.ForeignKey(
        Property,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tenants',
        verbose_name="Propriété liée"
    )

    # Dates de bail
    lease_start_date = models.DateField(verbose_name="Date de début du bail")
    lease_end_date = models.DateField(null=True, blank=True, verbose_name="Date de fin du bail")

    # Informations financières
    monthly_rent = models.IntegerField(validators=[MinValueValidator(0)], verbose_name="Loyer mensuel")
    security_deposit = models.CharField(max_length=50, verbose_name="Caution")
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES, verbose_name="Méthode de paiement")

    # Statut
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', verbose_name="Statut")

    # Documents
    signed_contract = models.FileField(
        upload_to='tenants/contracts/',
        null=True,
        blank=True,
        verbose_name="Contrat signé"
    )
    id_document = models.FileField(
        upload_to='tenants/ids/',
        null=True,
        blank=True,
        verbose_name="Document d'identité"
    )

    # Notes
    additional_notes = models.TextField(blank=True, verbose_name="Notes additionnelles")

    # Dates
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Date de modification")

    class Meta:
        verbose_name = "Locataire"
        verbose_name_plural = "Locataires"
        ordering = ['-created_at']
        db_table = 'tenants'

    def __str__(self):
        return self.full_name

    def get_initials(self):
        """Retourne les initiales du locataire"""
        names = self.full_name.split()
        if len(names) >= 2:
            return f"{names[0][0]}{names[-1][0]}".upper()
        return self.full_name[0].upper() if self.full_name else "?"


# ==============================================
# MODÈLE LOCATION (BAIL/RELATION LOCATAIRE-PROPRIÉTÉ)
# ==============================================

class Location(models.Model):
    """Modèle pour gérer les locations - lie un locataire à une propriété et son propriétaire"""

    STATUS_CHOICES = [
        ('active', 'Actif'),
        ('terminated', 'Résilié'),
        ('expired', 'Expiré'),
        ('pending', 'En attente'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('Mobile Money', 'Mobile Money'),
        ('Virement bancaire', 'Virement bancaire'),
        ('Espèces', 'Espèces'),
        ('Chèque', 'Chèque'),
        ('Orange Money', 'Orange Money'),
        ('MTN Money', 'MTN Money'),
    ]

    # Relations principales
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='locations',
        verbose_name="Locataire"
    )
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='locations',
        verbose_name="Propriété"
    )
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='owned_locations',
        verbose_name="Propriétaire",
        limit_choices_to={'role': 'proprietaire'}
    )

    # Informations du bail
    lease_start_date = models.DateField(verbose_name="Date de début du bail")
    lease_end_date = models.DateField(null=True, blank=True, verbose_name="Date de fin du bail")

    # Informations financières
    monthly_rent = models.IntegerField(validators=[MinValueValidator(0)], verbose_name="Loyer mensuel")
    security_deposit = models.CharField(max_length=50, verbose_name="Caution")
    payment_method = models.CharField(
        max_length=50,
        choices=PAYMENT_METHOD_CHOICES,
        verbose_name="Méthode de paiement"
    )

    # Statut
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        verbose_name="Statut"
    )

    # Documents
    signed_contract = models.FileField(
        upload_to='locations/contracts/',
        null=True,
        blank=True,
        verbose_name="Contrat signé"
    )

    # Notes
    additional_notes = models.TextField(blank=True, verbose_name="Notes additionnelles")

    # Dates de suivi
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Date de modification")
    terminated_at = models.DateTimeField(null=True, blank=True, verbose_name="Date de résiliation")

    class Meta:
        verbose_name = "Location"
        verbose_name_plural = "Locations"
        ordering = ['-created_at']
        db_table = 'locations'
        # Un locataire ne peut avoir qu'une seule location active par propriété
        unique_together = [['tenant', 'property', 'status']]

    def __str__(self):
        return f"{self.tenant.full_name} - {self.property.titre}"

    def save(self, *args, **kwargs):
        """Mettre à jour le statut de la propriété lors de la sauvegarde"""
        is_new = self.pk is None
        super().save(*args, **kwargs)

        # Si c'est une nouvelle location active, mettre la propriété en "loué"
        if is_new and self.status == 'active':
            self.property.statut = 'loué'
            self.property.save()

        # Si la location est terminée/expirée, vérifier s'il faut libérer la propriété
        if self.status in ['terminated', 'expired']:
            # Vérifier s'il existe d'autres locations actives pour cette propriété
            active_locations = Location.objects.filter(
                property=self.property,
                status='active'
            ).exclude(id=self.id).exists()

            if not active_locations:
                self.property.statut = 'disponible'
                self.property.save()


# ==============================================
# MODÈLE PAYMENT (PAIEMENT)
# ==============================================

class Payment(models.Model):
    """Modèle pour gérer les paiements de loyer"""

    STATUS_CHOICES = [
        ('paid', 'Payé'),
        ('unpaid', 'Non payé'),
        ('À jour', 'À jour'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('Orange Money', 'Orange Money'),
        ('MTN Money', 'MTN Money'),
        ('Mobile Money', 'Mobile Money'),
        ('Carte bancaire', 'Carte bancaire'),
        ('Virement bancaire', 'Virement bancaire'),
        ('Espèces', 'Espèces'),
        ('Chèque', 'Chèque'),
    ]

    # Relations
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='payments',
        verbose_name="Locataire"
    )
    linked_property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='payments',
        verbose_name="Propriété"
    )

    # Détails du paiement
    month = models.CharField(max_length=50, verbose_name="Mois")
    amount = models.IntegerField(validators=[MinValueValidator(0)], verbose_name="Montant")
    payment_date = models.DateField(verbose_name="Date de paiement")

    # Méthode et statut
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES, verbose_name="Méthode de paiement")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unpaid', verbose_name="Statut")

    # Prochaine échéance
    next_payment_date = models.DateField(null=True, blank=True, verbose_name="Date du prochain paiement")

    # Dates
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Date de modification")

    class Meta:
        verbose_name = "Paiement"
        verbose_name_plural = "Paiements"
        ordering = ['-payment_date']
        db_table = 'payments'

    def __str__(self):
        return f"Paiement {self.month} - {self.tenant.full_name}"

    @property
    def days_until_due(self):
        """Calcule les jours restants jusqu'à la prochaine échéance"""
        if self.next_payment_date:
            delta = self.next_payment_date - timezone.now().date()
            return delta.days
        return None


# ==============================================
# MODÈLE MAINTENANCE REQUEST
# ==============================================

class MaintenanceRequest(models.Model):
    """Modèle pour gérer les demandes de maintenance"""

    TYPE_CHOICES = [
        ('Plomberie', 'Plomberie'),
        ('Électricité', 'Électricité'),
        ('Climatisation', 'Climatisation'),
        ('Serrure', 'Serrure'),
        ('Peinture', 'Peinture'),
        ('Autre', 'Autre'),
    ]

    LOCATION_CHOICES = [
        ('Cuisine', 'Cuisine'),
        ('Salle de bain', 'Salle de bain'),
        ('Chambre', 'Chambre'),
        ('Salon', 'Salon'),
        ('Balcon', 'Balcon'),
        ('Entrée', 'Entrée'),
        ('Autre', 'Autre'),
    ]

    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('in_progress', 'En cours'),
        ('resolved', 'Résolu'),
        ('rejected', 'Rejeté'),
    ]

    PRIORITY_CHOICES = [
        ('normal', 'Normal'),
        ('high', 'Élevé'),
        ('urgent', 'Urgent'),
    ]

    # Identification
    request_id = models.CharField(max_length=20, unique=True, verbose_name="ID de la demande")

    # Relations
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='maintenance_requests',
        verbose_name="Locataire"
    )
    linked_property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='maintenance_requests',
        verbose_name="Propriété"
    )

    # Détails
    request_type = models.CharField(max_length=50, choices=TYPE_CHOICES, verbose_name="Type de problème")
    location = models.CharField(max_length=50, choices=LOCATION_CHOICES, verbose_name="Emplacement")
    description = models.TextField(verbose_name="Description")

    # Statut et priorité
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Statut")
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='normal', verbose_name="Priorité")

    # Prestataire
    provider = models.CharField(max_length=200, null=True, blank=True, verbose_name="Prestataire")

    # Dates
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Date de modification")

    class Meta:
        verbose_name = "Demande de maintenance"
        verbose_name_plural = "Demandes de maintenance"
        ordering = ['-created_at']
        db_table = 'maintenance_requests'

    def __str__(self):
        return f"{self.request_id} - {self.request_type}"

    def save(self, *args, **kwargs):
        """Génère automatiquement un ID de demande"""
        if not self.request_id:
            last_request = MaintenanceRequest.objects.order_by('-id').first()
            if last_request:
                last_id = int(last_request.request_id.split('-')[1])
                self.request_id = f"MT-{str(last_id + 1).zfill(3)}"
            else:
                self.request_id = "MT-001"
        super().save(*args, **kwargs)


# ==============================================
# MODÈLE NOTIFICATION
# ==============================================

class Notification(models.Model):
    """Modèle pour gérer les notifications système"""

    TYPE_CHOICES = [
        ('payment', 'Paiement'),
        ('maintenance', 'Maintenance'),
        ('contract', 'Contrat'),
        ('general', 'Général'),
    ]

    # Destinataire
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name="Utilisateur"
    )

    # Contenu
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES, verbose_name="Type")
    title = models.CharField(max_length=200, verbose_name="Titre")
    message = models.TextField(verbose_name="Message")

    # Statut
    is_read = models.BooleanField(default=False, verbose_name="Lu")

    # Dates
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")

    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ['-created_at']
        db_table = 'notifications'

    def __str__(self):
        return f"{self.title} - {self.user.get_full_name()}"


# ==============================================
# MODÈLE VISIT REQUEST (DEMANDE DE VISITE)
# ==============================================

class VisitRequest(models.Model):
    """Modèle pour gérer les demandes de visite"""

    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('accepted', 'Acceptée'),
        ('rejected', 'Rejetée'),
        ('proposed', 'Nouvelle date proposée'),
    ]

    # Relations
    tenant = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='visit_requests',
        verbose_name="Locataire",
        limit_choices_to={'role': 'locataire'}
    )
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='visit_requests',
        verbose_name="Propriété"
    )

    # Détails de la demande
    requested_date = models.DateTimeField(verbose_name="Date demandée")
    message = models.TextField(blank=True, null=True, verbose_name="Message optionnel")

    # Statut
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name="Statut"
    )

    # Nouvelle date proposée par le propriétaire
    proposed_date = models.DateTimeField(null=True, blank=True, verbose_name="Date proposée")
    owner_message = models.TextField(blank=True, null=True, verbose_name="Message du propriétaire")

    # Statut de lecture
    read_by_owner = models.BooleanField(default=False, verbose_name="Lu par le propriétaire")
    read_by_tenant = models.BooleanField(default=False, verbose_name="Lu par le locataire")

    # Dates
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Date de modification")

    class Meta:
        verbose_name = "Demande de visite"
        verbose_name_plural = "Demandes de visite"
        ordering = ['-created_at']
        db_table = 'visit_requests'

    def __str__(self):
        return f"Visite {self.property.titre} - {self.tenant.get_full_name()} ({self.status})"


# ============================================
# MODÈLE POUR LES CONTRATS
# ============================================

class Contract(models.Model):
    """Modèle pour gérer les contrats de location ou de vente"""

    CONTRACT_TYPE_CHOICES = [
        ('Location', 'Location'),
        ('Vente', 'Vente'),
    ]

    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('active', 'Actif'),
        ('terminated', 'Résilié'),
        ('expired', 'Expiré'),
    ]

    PAYMENT_FREQUENCY_CHOICES = [
        ('Mensuel', 'Mensuel'),
        ('Trimestriel', 'Trimestriel'),
        ('Semestriel', 'Semestriel'),
        ('Annuel', 'Annuel'),
    ]

    # Relations principales
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='contracts',
        verbose_name="Propriétaire",
        limit_choices_to={'role': 'proprietaire'}
    )
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='contracts',
        verbose_name="Locataire"
    )
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='contracts',
        verbose_name="Propriété"
    )
    location = models.OneToOneField(
        Location,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='contract',
        verbose_name="Location associée"
    )

    # Type et durée du contrat
    contract_type = models.CharField(
        max_length=50,
        choices=CONTRACT_TYPE_CHOICES,
        verbose_name="Type de contrat"
    )
    start_date = models.DateField(verbose_name="Date de début")
    end_date = models.DateField(null=True, blank=True, verbose_name="Date de fin")
    contract_purpose = models.TextField(blank=True, verbose_name="Objet du contrat")

    # Conditions financières
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Montant (loyer ou prix)"
    )
    security_deposit = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Dépôt de garantie"
    )
    payment_method = models.CharField(
        max_length=50,
        blank=True,
        verbose_name="Mode de paiement"
    )
    payment_frequency = models.CharField(
        max_length=50,
        choices=PAYMENT_FREQUENCY_CHOICES,
        blank=True,
        verbose_name="Fréquence de paiement"
    )

    # Clauses principales
    specific_rules = models.TextField(blank=True, verbose_name="Règles spécifiques")
    insurance = models.TextField(blank=True, verbose_name="Assurance")

    # Documents
    contract_pdf = models.FileField(
        upload_to='contracts/',
        null=True,
        blank=True,
        verbose_name="Contrat PDF"
    )

    # Notes et statut
    additional_notes = models.TextField(blank=True, verbose_name="Notes complémentaires")
    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default='active',
        verbose_name="Statut"
    )

    # Dates de suivi
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Date de modification")
    signed_at = models.DateTimeField(null=True, blank=True, verbose_name="Date de signature")

    class Meta:
        db_table = 'contracts'
        ordering = ['-created_at']
        verbose_name = "Contrat"
        verbose_name_plural = "Contrats"

    def __str__(self):
        return f"Contrat {self.contract_type} - {self.property.titre} - {self.tenant.user.get_full_name()}"


# ==============================================
# MODÈLE PAYMENT (PAIEMENT)
# ==============================================

class Payment(models.Model):
    """Modèle pour gérer les paiements de loyer"""

    PAYMENT_METHOD_CHOICES = [
        ('orange', 'Orange Money'),
        ('mtn', 'MTN Money'),
        ('moov', 'Moov Money'),
        ('card', 'Carte Bancaire'),
        ('transfer', 'Virement Bancaire'),
        ('cash', 'Espèces'),
        ('cheque', 'Chèque'),
    ]

    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('completed', 'Complété'),
        ('failed', 'Échoué'),
        ('cancelled', 'Annulé'),
    ]

    # Relations principales
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='payments',
        verbose_name="Locataire"
    )
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='payments',
        verbose_name="Propriété"
    )
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='received_payments',
        verbose_name="Propriétaire",
        limit_choices_to={'role': 'proprietaire'}
    )
    location = models.ForeignKey(
        Location,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments',
        verbose_name="Location associée"
    )

    # Informations du paiement
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Montant"
    )
    payment_month = models.CharField(
        max_length=50,
        verbose_name="Mois concerné"
    )
    payment_method = models.CharField(
        max_length=50,
        choices=PAYMENT_METHOD_CHOICES,
        verbose_name="Mode de paiement"
    )
    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default='completed',
        verbose_name="Statut"
    )

    # Paiement automatique
    auto_payment_enabled = models.BooleanField(
        default=False,
        verbose_name="Paiement automatique activé"
    )

    # Informations complémentaires
    transaction_reference = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Référence de transaction"
    )
    notes = models.TextField(
        blank=True,
        verbose_name="Notes"
    )

    # Reçu PDF
    receipt_pdf = models.FileField(
        upload_to='payments/receipts/',
        null=True,
        blank=True,
        verbose_name="Reçu PDF"
    )

    # Dates
    payment_date = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date de paiement"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date de création"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Date de modification"
    )

    class Meta:
        db_table = 'payments'
        ordering = ['-payment_date']
        verbose_name = "Paiement"
        verbose_name_plural = "Paiements"

    def __str__(self):
        return f"Paiement {self.payment_month} - {self.tenant.full_name} - {self.amount} FCFA"
