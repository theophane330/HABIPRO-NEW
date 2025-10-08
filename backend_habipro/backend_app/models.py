from django.db import models
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator,MinValueValidator
from django.utils import timezone
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


class Proprietaire(models.Model):
    """Modèle pour les propriétaires"""
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    telephone = models.CharField(max_length=20)
    adresse = models.TextField(blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'proprietaires'
        verbose_name = 'Propriétaire'
        verbose_name_plural = 'Propriétaires'
    
    def __str__(self):
        return f"{self.prenom} {self.nom}"


class Propriete(models.Model):
    """Modèle principal pour les propriétés immobilières"""
    
    TYPE_CHOICES = [
        ('villa', 'Villa'),
        ('appartement', 'Appartement'),
        ('studio', 'Studio'),
        ('duplex', 'Duplex'),
        ('maison', 'Maison'),
        ('bureau', 'Bureau'),
        ('commerce', 'Commerce'),
    ]
    
    STATUS_CHOICES = [
        ('disponible', 'Disponible'),
        ('loué', 'Loué'),
        ('en_vente', 'En vente'),
        ('maintenance', 'En maintenance'),
    ]
    
    # Informations de base
    titre = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    type_propriete = models.CharField(max_length=20, choices=TYPE_CHOICES)
    statut = models.CharField(max_length=20, choices=STATUS_CHOICES, default='disponible')
    
    # Localisation
    adresse = models.CharField(max_length=300)
    quartier = models.CharField(max_length=100)
    ville = models.CharField(max_length=100, default='Abidjan')
    commune = models.CharField(max_length=100, blank=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    
    # Caractéristiques
    surface = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])  # en m²
    nombre_chambres = models.PositiveIntegerField(default=0)
    nombre_salles_bain = models.PositiveIntegerField(default=0)
    nombre_salons = models.PositiveIntegerField(default=0)
    nombre_cuisines = models.PositiveIntegerField(default=1)
    etage = models.IntegerField(null=True, blank=True)
    nombre_etages = models.PositiveIntegerField(default=1)
    
    # Équipements
    meuble = models.BooleanField(default=False)
    climatisation = models.BooleanField(default=False)
    parking = models.BooleanField(default=False)
    nombre_parkings = models.PositiveIntegerField(default=0)
    jardin = models.BooleanField(default=False)
    piscine = models.BooleanField(default=False)
    ascenseur = models.BooleanField(default=False)
    balcon = models.BooleanField(default=False)
    terrasse = models.BooleanField(default=False)
    gardien = models.BooleanField(default=False)
    
    # Financier
    prix_mensuel = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    prix_vente = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)])
    caution = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    frais_agence = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    charges_mensuelles = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Relations
    proprietaire = models.ForeignKey(Proprietaire, on_delete=models.CASCADE, related_name='proprietes', null=True, blank=True)
    locataire_actuel = models.CharField(max_length=200, blank=True, null=True)
    
    # Dates
    date_ajout = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    date_disponibilite = models.DateField(null=True, blank=True)
    annee_construction = models.PositiveIntegerField(null=True, blank=True)
    
    # Métadonnées
    actif = models.BooleanField(default=True)
    mis_en_avant = models.BooleanField(default=False)
    nombre_vues = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'proprietes'
        verbose_name = 'Propriété'
        verbose_name_plural = 'Propriétés'
        ordering = ['-date_ajout']
        indexes = [
            models.Index(fields=['statut', 'type_propriete']),
            models.Index(fields=['quartier', 'ville']),
            models.Index(fields=['-date_ajout']),
        ]
    
    def __str__(self):
        return f"{self.titre} - {self.adresse}"
    
    @property
    def est_nouveau(self):
        """Propriété ajoutée il y a moins de 7 jours"""
        return (timezone.now() - self.date_ajout).days < 7
    
    @property
    def surface_formatted(self):
        return f"{self.surface}m²"


class MediaPropriete(models.Model):
    """Modèle pour les images et vidéos des propriétés"""
    
    TYPE_MEDIA_CHOICES = [
        ('image', 'Image'),
        ('video', 'Vidéo'),
    ]
    
    propriete = models.ForeignKey(Propriete, on_delete=models.CASCADE, related_name='medias')
    type_media = models.CharField(max_length=10, choices=TYPE_MEDIA_CHOICES, default='image')
    fichier = models.FileField(upload_to='proprietes/%Y/%m/')
    miniature = models.ImageField(upload_to='proprietes/thumbs/%Y/%m/', blank=True, null=True)
    titre = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    ordre = models.PositiveIntegerField(default=0)
    est_principale = models.BooleanField(default=False)
    date_ajout = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'media_proprietes'
        verbose_name = 'Média de propriété'
        verbose_name_plural = 'Médias de propriétés'
        ordering = ['ordre', '-est_principale', '-date_ajout']
    
    def __str__(self):
        return f"{self.type_media} - {self.propriete.titre}"
    
    def save(self, *args, **kwargs):
        # Si c'est la principale, retirer le flag des autres
        if self.est_principale:
            MediaPropriete.objects.filter(
                propriete=self.propriete,
                est_principale=True
            ).exclude(pk=self.pk).update(est_principale=False)
        super().save(*args, **kwargs)


class HistoriquePropriete(models.Model):
    """Historique des modifications de propriété"""
    
    propriete = models.ForeignKey(Propriete, on_delete=models.CASCADE, related_name='historique')
    action = models.CharField(max_length=50)
    ancien_statut = models.CharField(max_length=20, blank=True)
    nouveau_statut = models.CharField(max_length=20, blank=True)
    ancien_prix = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    nouveau_prix = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    details = models.JSONField(blank=True, null=True)
    date_action = models.DateTimeField(auto_now_add=True)
    utilisateur = models.CharField(max_length=100, blank=True)
    
    class Meta:
        db_table = 'historique_proprietes'
        verbose_name = 'Historique de propriété'
        verbose_name_plural = 'Historiques de propriétés'
        ordering = ['-date_action']
    
    def __str__(self):
        return f"{self.propriete.titre} - {self.action} - {self.date_action}"