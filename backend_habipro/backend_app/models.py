from django.db import models
from django.core.validators import FileExtensionValidator,MinValueValidator
from django.db.models import Q
from django.utils.text import slugify
import uuid
import os


def document_upload_path(instance, filename):
    """Génère le chemin d'upload pour les documents"""
    category_folder = instance.category
    return f'documents/{category_folder}/{filename}'

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



def property_image_path(instance, filename):
    """Génère un chemin de fichier court et unique"""
    ext = filename.split('.')[-1]
    # Créer un nom court avec UUID
    filename = f"{uuid.uuid4().hex[:8]}.{ext}"
    return os.path.join('properties', filename)

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
    image = models.FileField(
        upload_to=property_image_path, 
        null=True, 
        blank=True, 
        verbose_name="Image/Vidéo",
        max_length=200  # Augmenter la limite
    )
    
    class Meta:
        verbose_name = "Propriété"
        verbose_name_plural = "Propriétés"
        ordering = ['-date_ajout']
    
    def __str__(self):
        return self.titre