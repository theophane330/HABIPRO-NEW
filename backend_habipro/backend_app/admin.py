from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model
from .models import Document, Property, PropertyMedia

User = get_user_model()


# ===================================
# ADMIN POUR LE MODÈLE USER
# ===================================

# ✅ IMPORTANT: Désinscrire le User par défaut s'il existe déjà
if admin.site.is_registered(User):
    admin.site.unregister(User)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Administration personnalisée pour le modèle User"""
    
    list_display = ['email', 'prenom', 'nom', 'role', 'is_active', 'is_staff', 'date_joined']
    list_filter = ['role', 'is_active', 'is_staff', 'date_joined']
    search_fields = ['email', 'nom', 'prenom', 'telephone']
    ordering = ['-date_joined']
    
    fieldsets = (
        ('Informations de connexion', {
            'fields': ('email', 'password')
        }),
        ('Informations personnelles', {
            'fields': ('nom', 'prenom', 'telephone', 'role')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Dates importantes', {
            'fields': ('last_login', 'date_joined')
        }),
    )
    
    add_fieldsets = (
        ('Créer un utilisateur', {
            'classes': ('wide',),
            'fields': ('email', 'nom', 'prenom', 'telephone', 'role', 'password1', 'password2', 'is_staff', 'is_active')
        }),
    )
    
    readonly_fields = ['date_joined', 'last_login']


# ===================================
# ADMIN POUR LES DOCUMENTS
# ===================================

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    """Configuration de l'interface admin pour les documents"""
    
    list_display = [
        'title',
        'category',
        'type',
        'tenant',
        'property',
        'status',
        'date',
        'size',
        'pages',
        'created_at'
    ]
    
    list_filter = [
        'category',
        'status',
        'date',
        'created_at'
    ]
    
    search_fields = [
        'title',
        'description',
        'tenant',
        'property',
        'content'
    ]
    
    readonly_fields = [
        'created_at',
        'updated_at',
        'size',
        'pages'
    ]
    
    fieldsets = (
        ('Informations principales', {
            'fields': (
                'title',
                'category',
                'type',
                'description',
                'status'
            )
        }),
        ('Fichier', {
            'fields': (
                'file',
                'size',
                'pages'
            )
        }),
        ('Informations liées', {
            'fields': (
                'tenant',
                'property',
                'date'
            )
        }),
        ('Contenu', {
            'fields': ('content',),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': (
                'created_at',
                'updated_at'
            ),
            'classes': ('collapse',)
        }),
    )
    
    date_hierarchy = 'date'
    ordering = ['-date', '-created_at']
    list_per_page = 25
    
    def get_queryset(self, request):
        """Optimise les requêtes"""
        qs = super().get_queryset(request)
        return qs.select_related()
    
    actions = ['mark_as_active', 'mark_as_completed', 'mark_as_signed']
    
    def mark_as_active(self, request, queryset):
        """Marque les documents sélectionnés comme actifs"""
        updated = queryset.update(status='active')
        self.message_user(
            request,
            f'{updated} document(s) marqué(s) comme actif(s).'
        )
    mark_as_active.short_description = "Marquer comme actif"
    
    def mark_as_completed(self, request, queryset):
        """Marque les documents sélectionnés comme terminés"""
        updated = queryset.update(status='completed')
        self.message_user(
            request,
            f'{updated} document(s) marqué(s) comme terminé(s).'
        )
    mark_as_completed.short_description = "Marquer comme terminé"
    
    def mark_as_signed(self, request, queryset):
        """Marque les documents sélectionnés comme signés"""
        updated = queryset.update(status='signed')
        self.message_user(
            request,
            f'{updated} document(s) marqué(s) comme signé(s).'
        )
    mark_as_signed.short_description = "Marquer comme signé"


# ===================================
# ADMIN POUR LES PROPRIÉTÉS
# ===================================

class PropertyMediaInline(admin.TabularInline):
    """Inline pour gérer les médias directement depuis la page de propriété"""
    
    model = PropertyMedia
    extra = 1
    fields = ['file', 'media_type', 'is_primary', 'order']
    readonly_fields = ['media_type']
    
    def get_queryset(self, request):
        """Optimise les requêtes et trie les médias"""
        qs = super().get_queryset(request)
        return qs.order_by('order', '-uploaded_at')


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    """Configuration de l'interface admin pour les propriétés"""
    
    list_display = [
        'titre',
        'adresse',
        'prix',
        'type',
        'statut',
        'locataire',
        'chambres',
        'salles_de_bain',
        'superficie',
        'media_count',
        'date_ajout'
    ]
    
    list_filter = [
        'statut',
        'type',
        'date_ajout'
    ]
    
    search_fields = [
        'titre',
        'adresse',
        'locataire'
    ]
    
    list_editable = [
        'statut',
        'prix'
    ]
    
    ordering = ['-date_ajout']
    readonly_fields = ['date_ajout', 'media_count']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('titre', 'adresse', 'type', 'statut')
        }),
        ('Détails financiers', {
            'fields': ('prix', 'locataire')
        }),
        ('Caractéristiques', {
            'fields': ('chambres', 'salles_de_bain', 'superficie')
        }),
        ('Statistiques', {
            'fields': ('media_count', 'date_ajout'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [PropertyMediaInline]
    list_per_page = 20
    
    def get_queryset(self, request):
        """Optimise les requêtes en préchargeant les médias"""
        qs = super().get_queryset(request)
        return qs.prefetch_related('medias')
    
    def media_count(self, obj):
        """Affiche le nombre de médias"""
        return obj.medias.count()
    media_count.short_description = "Nb médias"
    
    actions = ['mark_as_available', 'mark_as_rented']
    
    def mark_as_available(self, request, queryset):
        """Marque les propriétés comme disponibles"""
        updated = queryset.update(statut='disponible', locataire=None)
        self.message_user(
            request,
            f'{updated} propriété(s) marquée(s) comme disponible(s).'
        )
    mark_as_available.short_description = "Marquer comme disponible"
    
    def mark_as_rented(self, request, queryset):
        """Marque les propriétés comme louées"""
        updated = queryset.update(statut='loué')
        self.message_user(
            request,
            f'{updated} propriété(s) marquée(s) comme louée(s).'
        )
    mark_as_rented.short_description = "Marquer comme loué"


# ===================================
# ADMIN POUR LES MÉDIAS DE PROPRIÉTÉS
# ===================================

@admin.register(PropertyMedia)
class PropertyMediaAdmin(admin.ModelAdmin):
    """Configuration de l'interface admin pour les médias"""
    
    list_display = [
        'id',
        'property_title',
        'media_type',
        'is_primary',
        'order',
        'uploaded_at'
    ]
    
    list_filter = [
        'media_type',
        'is_primary',
        'uploaded_at'
    ]
    
    search_fields = [
        'property__titre',
        'property__adresse'
    ]
    
    list_editable = [
        'is_primary',
        'order'
    ]
    
    readonly_fields = [
        'media_type',
        'uploaded_at',
        'preview_image'
    ]
    
    ordering = ['property', 'order', '-uploaded_at']
    
    fieldsets = (
        ('Média', {
            'fields': ('property', 'file', 'media_type', 'preview_image')
        }),
        ('Paramètres', {
            'fields': ('is_primary', 'order')
        }),
        ('Informations', {
            'fields': ('uploaded_at',)
        }),
    )
    
    list_per_page = 30
    
    def get_queryset(self, request):
        """Optimise les requêtes"""
        qs = super().get_queryset(request)
        return qs.select_related('property')
    
    def property_title(self, obj):
        """Affiche le titre de la propriété"""
        return obj.property.titre
    property_title.short_description = "Propriété"
    property_title.admin_order_field = 'property__titre'
    
    def preview_image(self, obj):
        """Affiche un aperçu de l'image"""
        if obj.media_type == 'image' and obj.file:
            from django.utils.html import format_html
            return format_html(
                '<img src="{}" style="max-height: 200px; max-width: 300px;" />',
                obj.file.url
            )
        return "Pas d'aperçu disponible"
    preview_image.short_description = "Aperçu"
    
    actions = ['set_as_primary']
    
    def set_as_primary(self, request, queryset):
        """Définit le premier média sélectionné comme principal"""
        if queryset.count() > 1:
            self.message_user(
                request,
                "Veuillez sélectionner un seul média à la fois.",
                level='warning'
            )
            return
        
        media = queryset.first()
        # Désactiver tous les autres médias principaux de cette propriété
        PropertyMedia.objects.filter(
            property=media.property,
            is_primary=True
        ).update(is_primary=False)
        
        # Activer ce média comme principal
        media.is_primary = True
        media.save()
        
        self.message_user(
            request,
            f'Le média a été défini comme principal pour "{media.property.titre}".'
        )
    set_as_primary.short_description = "Définir comme média principal"


# ===================================
# PERSONNALISATION DU SITE ADMIN
# ===================================

admin.site.site_header = "Administration Gestion Immobilière HabiPro"
admin.site.site_title = "Admin HabiPro"
admin.site.index_title = "Tableau de bord - Gestion Immobilière"