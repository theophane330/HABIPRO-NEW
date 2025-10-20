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
        ('loué', 'Loué'),
        ('en_vente', 'En vente'),
    ]
    
    TYPE_CHOICES = [
        ('Villa', 'Villa'),
        ('Studio', 'Studio'),
        ('Appartement', 'Appartement'),
        ('Duplex', 'Duplex'),
    ]
    
    titre = models.CharField(max_length=200, verbose_name="Titre")
    adresse = models.CharField(max_length=300, verbose_name="Adresse")
    prix = models.IntegerField(validators=[MinValueValidator(0)], verbose_name="Prix")
    type = models.CharField(max_length=50, choices=TYPE_CHOICES, verbose_name="Type")
    statut = models.CharField(max_length=20, choices=STATUS_CHOICES, default='disponible', verbose_name="Statut")
    locataire = models.CharField(max_length=200, null=True, blank=True, verbose_name="Locataire")
    chambres = models.IntegerField(validators=[MinValueValidator(0)], verbose_name="Chambres")
    salles_de_bain = models.IntegerField(validators=[MinValueValidator(0)], verbose_name="Salles de bain")
    superficie = models.CharField(max_length=50, verbose_name="Superficie")
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