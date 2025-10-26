from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model
from .models import (
    Document, Property, PropertyMedia,
    Tenant, Location, Contract, Payment, MaintenanceRequest, Notification, VisitRequest
)

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
        'owner',
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
        ('Propriétaire', {
            'fields': ('owner',)
        }),
        ('Informations générales', {
            'fields': ('titre', 'adresse', 'location', 'type', 'statut', 'offer_type')
        }),
        ('GPS', {
            'fields': ('gps_lat', 'gps_lng'),
            'classes': ('collapse',)
        }),
        ('Détails financiers', {
            'fields': ('prix', 'currency', 'lease_duration', 'locataire')
        }),
        ('Caractéristiques', {
            'fields': ('chambres', 'salles_de_bain', 'superficie', 'description')
        }),
        ('Équipements', {
            'fields': ('has_parking', 'has_garden', 'has_balcony', 'has_terrace', 'immediate_availability')
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

    def save_model(self, request, obj, form, change):
        """Définit automatiquement le propriétaire si non spécifié"""
        if not change and not obj.owner:  # Nouveau modèle sans propriétaire
            obj.owner = request.user
        super().save_model(request, obj, form, change)


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
# ADMIN POUR LES LOCATAIRES
# ===================================

@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    """Configuration de l'interface admin pour les locataires"""

    list_display = [
        'full_name',
        'owner',
        'phone',
        'email',
        'linked_property',
        'monthly_rent',
        'status',
        'lease_start_date',
        'lease_end_date',
        'created_at'
    ]

    list_filter = [
        'owner',
        'status',
        'payment_method',
        'lease_start_date',
        'created_at'
    ]

    search_fields = [
        'full_name',
        'phone',
        'email',
        'id_number',
        'owner__username',
        'owner__email'
    ]

    list_editable = ['status']

    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Propriétaire', {
            'fields': ('owner', 'user')
        }),
        ('Informations personnelles', {
            'fields': ('full_name', 'phone', 'email', 'id_number')
        }),
        ('Propriété', {
            'fields': ('linked_property',)
        }),
        ('Informations de bail', {
            'fields': ('lease_start_date', 'lease_end_date', 'monthly_rent', 'security_deposit', 'payment_method')
        }),
        ('Statut', {
            'fields': ('status',)
        }),
        ('Documents', {
            'fields': ('signed_contract', 'id_document')
        }),
        ('Notes', {
            'fields': ('additional_notes',)
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    date_hierarchy = 'lease_start_date'
    ordering = ['-created_at']
    list_per_page = 25

    actions = ['mark_as_active', 'mark_as_paid']

    def mark_as_active(self, request, queryset):
        """Marque les locataires comme actifs"""
        updated = queryset.update(status='active')
        self.message_user(request, f'{updated} locataire(s) marqué(s) comme actif(s).')
    mark_as_active.short_description = "Marquer comme actif"

    def mark_as_paid(self, request, queryset):
        """Marque les locataires comme à jour"""
        updated = queryset.update(status='À jour')
        self.message_user(request, f'{updated} locataire(s) marqué(s) comme à jour.')
    mark_as_paid.short_description = "Marquer comme à jour"


# ===================================
# ADMIN POUR LES LOCATIONS
# ===================================

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    """Configuration de l'interface admin pour les locations"""

    list_display = [
        'id',
        'tenant',
        'property',
        'owner',
        'monthly_rent',
        'status',
        'lease_start_date',
        'lease_end_date',
        'created_at'
    ]

    list_filter = [
        'status',
        'payment_method',
        'lease_start_date',
        'created_at'
    ]

    search_fields = [
        'tenant__full_name',
        'property__titre',
        'owner__email',
        'owner__nom',
        'owner__prenom'
    ]

    list_editable = ['status']

    readonly_fields = ['created_at', 'updated_at', 'terminated_at']

    fieldsets = (
        ('Relations', {
            'fields': ('tenant', 'property', 'owner')
        }),
        ('Informations de bail', {
            'fields': ('lease_start_date', 'lease_end_date', 'monthly_rent', 'security_deposit', 'payment_method')
        }),
        ('Statut', {
            'fields': ('status', 'terminated_at')
        }),
        ('Documents', {
            'fields': ('signed_contract',)
        }),
        ('Notes', {
            'fields': ('additional_notes',)
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    date_hierarchy = 'lease_start_date'
    ordering = ['-created_at']
    list_per_page = 25

    def get_queryset(self, request):
        """Optimise les requêtes"""
        qs = super().get_queryset(request)
        return qs.select_related('tenant', 'property', 'owner')

    actions = ['mark_as_active', 'mark_as_terminated']

    def mark_as_active(self, request, queryset):
        """Marque les locations comme actives"""
        updated = queryset.update(status='active')
        self.message_user(request, f'{updated} location(s) marquée(s) comme active(s).')
    mark_as_active.short_description = "Marquer comme actif"

    def mark_as_terminated(self, request, queryset):
        """Marque les locations comme résiliées"""
        from django.utils import timezone
        updated = queryset.update(status='terminated', terminated_at=timezone.now())
        self.message_user(request, f'{updated} location(s) résiliée(s).')
    mark_as_terminated.short_description = "Résilier"


# ===================================
# ADMIN POUR LES CONTRATS
# ===================================

@admin.register(Contract)
class ContractAdmin(admin.ModelAdmin):
    """Configuration de l'interface admin pour les contrats"""

    list_display = [
        'owner',
        'tenant',
        'property',
        'contract_type',
        'start_date',
        'end_date',
        'amount',
        'status',
        'created_at'
    ]

    list_filter = [
        'contract_type',
        'status',
        'payment_frequency',
        'start_date',
        'created_at'
    ]

    search_fields = [
        'tenant__user__nom',
        'tenant__user__prenom',
        'property__titre',
        'contract_purpose'
    ]

    readonly_fields = ['created_at', 'updated_at', 'signed_at']

    fieldsets = (
        ('Parties', {
            'fields': ('owner', 'tenant', 'property', 'location')
        }),
        ('Type de contrat', {
            'fields': ('contract_type', 'contract_purpose')
        }),
        ('Dates', {
            'fields': ('start_date', 'end_date')
        }),
        ('Conditions financières', {
            'fields': ('amount', 'security_deposit', 'payment_method', 'payment_frequency')
        }),
        ('Clauses', {
            'fields': ('specific_rules', 'insurance')
        }),
        ('Documents', {
            'fields': ('contract_pdf',)
        }),
        ('Notes et statut', {
            'fields': ('additional_notes', 'status')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at', 'signed_at'),
            'classes': ('collapse',)
        }),
    )

    date_hierarchy = 'start_date'
    ordering = ['-created_at']
    list_per_page = 25


# ===================================
# ADMIN POUR LES PAIEMENTS
# ===================================

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """Configuration de l'interface admin pour les paiements"""

    list_display = [
        'id',
        'tenant',
        'property',
        'payment_month',
        'amount',
        'payment_method',
        'status',
        'payment_date',
        'created_at'
    ]

    list_filter = [
        'status',
        'payment_method',
        'payment_date',
        'created_at'
    ]

    search_fields = [
        'tenant__full_name',
        'property__titre',
        'payment_month',
        'transaction_reference'
    ]

    list_editable = ['status']

    readonly_fields = ['payment_date', 'created_at', 'updated_at', 'transaction_reference']

    fieldsets = (
        ('Relations', {
            'fields': ('tenant', 'property', 'owner', 'location')
        }),
        ('Détails du paiement', {
            'fields': ('payment_month', 'amount', 'payment_method', 'payment_date')
        }),
        ('Statut et transaction', {
            'fields': ('status', 'transaction_reference', 'auto_payment_enabled')
        }),
        ('Documents et notes', {
            'fields': ('receipt_pdf', 'notes')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    date_hierarchy = 'payment_date'
    ordering = ['-payment_date']
    list_per_page = 25

    actions = ['mark_as_paid', 'mark_as_unpaid']

    def mark_as_paid(self, request, queryset):
        """Marque les paiements comme payés"""
        updated = queryset.update(status='paid')
        self.message_user(request, f'{updated} paiement(s) marqué(s) comme payé(s).')
    mark_as_paid.short_description = "Marquer comme payé"

    def mark_as_unpaid(self, request, queryset):
        """Marque les paiements comme non payés"""
        updated = queryset.update(status='unpaid')
        self.message_user(request, f'{updated} paiement(s) marqué(s) comme non payé(s).')
    mark_as_unpaid.short_description = "Marquer comme non payé"


# ===================================
# ADMIN POUR LES DEMANDES DE MAINTENANCE
# ===================================

@admin.register(MaintenanceRequest)
class MaintenanceRequestAdmin(admin.ModelAdmin):
    """Configuration de l'interface admin pour les demandes de maintenance"""

    list_display = [
        'request_id',
        'tenant',
        'linked_property',
        'request_type',
        'location',
        'status',
        'priority',
        'provider',
        'created_at'
    ]

    list_filter = [
        'status',
        'priority',
        'request_type',
        'location',
        'created_at'
    ]

    search_fields = [
        'request_id',
        'tenant__full_name',
        'property__titre',
        'description',
        'provider'
    ]

    list_editable = ['status', 'priority']

    readonly_fields = ['request_id', 'created_at', 'updated_at']

    fieldsets = (
        ('Identification', {
            'fields': ('request_id',)
        }),
        ('Relations', {
            'fields': ('tenant', 'linked_property')
        }),
        ('Détails', {
            'fields': ('request_type', 'location', 'description')
        }),
        ('Statut et priorité', {
            'fields': ('status', 'priority')
        }),
        ('Prestataire', {
            'fields': ('provider',)
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    list_per_page = 25

    actions = ['mark_as_resolved', 'mark_as_in_progress', 'mark_as_pending']

    def mark_as_resolved(self, request, queryset):
        """Marque les demandes comme résolues"""
        updated = queryset.update(status='resolved')
        self.message_user(request, f'{updated} demande(s) marquée(s) comme résolu(es).')
    mark_as_resolved.short_description = "Marquer comme résolu"

    def mark_as_in_progress(self, request, queryset):
        """Marque les demandes comme en cours"""
        updated = queryset.update(status='in_progress')
        self.message_user(request, f'{updated} demande(s) marquée(s) comme en cours.')
    mark_as_in_progress.short_description = "Marquer comme en cours"

    def mark_as_pending(self, request, queryset):
        """Marque les demandes comme en attente"""
        updated = queryset.update(status='pending')
        self.message_user(request, f'{updated} demande(s) marquée(s) comme en attente.')
    mark_as_pending.short_description = "Marquer comme en attente"


# ===================================
# ADMIN POUR LES NOTIFICATIONS
# ===================================

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """Configuration de l'interface admin pour les notifications"""

    list_display = [
        'user',
        'notification_type',
        'title',
        'is_read',
        'created_at'
    ]

    list_filter = [
        'notification_type',
        'is_read',
        'created_at'
    ]

    search_fields = [
        'user__email',
        'user__nom',
        'user__prenom',
        'title',
        'message'
    ]

    list_editable = ['is_read']

    readonly_fields = ['created_at']

    fieldsets = (
        ('Destinataire', {
            'fields': ('user',)
        }),
        ('Contenu', {
            'fields': ('notification_type', 'title', 'message')
        }),
        ('Statut', {
            'fields': ('is_read',)
        }),
        ('Date', {
            'fields': ('created_at',)
        }),
    )

    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    list_per_page = 30

    actions = ['mark_as_read', 'mark_as_unread']

    def mark_as_read(self, request, queryset):
        """Marque les notifications comme lues"""
        updated = queryset.update(is_read=True)
        self.message_user(request, f'{updated} notification(s) marquée(s) comme lue(s).')
    mark_as_read.short_description = "Marquer comme lu"

    def mark_as_unread(self, request, queryset):
        """Marque les notifications comme non lues"""
        updated = queryset.update(is_read=False)
        self.message_user(request, f'{updated} notification(s) marquée(s) comme non lue(s).')
    mark_as_unread.short_description = "Marquer comme non lu"


# ===================================
# ADMIN POUR LES DEMANDES DE VISITE
# ===================================

@admin.register(VisitRequest)
class VisitRequestAdmin(admin.ModelAdmin):
    """Configuration de l'interface admin pour les demandes de visite"""

    list_display = [
        'id',
        'tenant',
        'property',
        'requested_date',
        'status',
        'proposed_date',
        'created_at'
    ]

    list_filter = [
        'status',
        'requested_date',
        'created_at'
    ]

    search_fields = [
        'tenant__email',
        'tenant__nom',
        'tenant__prenom',
        'property__titre',
        'property__adresse',
        'message'
    ]

    list_editable = ['status']

    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Relations', {
            'fields': ('tenant', 'property')
        }),
        ('Demande du locataire', {
            'fields': ('requested_date', 'message')
        }),
        ('Réponse du propriétaire', {
            'fields': ('status', 'proposed_date', 'owner_message')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    date_hierarchy = 'requested_date'
    ordering = ['-created_at']
    list_per_page = 25

    actions = ['accept_visits', 'reject_visits', 'mark_as_pending']

    def accept_visits(self, request, queryset):
        """Accepte les demandes de visite sélectionnées"""
        updated = queryset.update(status='accepted')
        self.message_user(request, f'{updated} demande(s) de visite acceptée(s).')
    accept_visits.short_description = "Accepter les visites"

    def reject_visits(self, request, queryset):
        """Rejette les demandes de visite sélectionnées"""
        updated = queryset.update(status='rejected')
        self.message_user(request, f'{updated} demande(s) de visite rejetée(s).')
    reject_visits.short_description = "Rejeter les visites"

    def mark_as_pending(self, request, queryset):
        """Marque les demandes comme en attente"""
        updated = queryset.update(status='pending')
        self.message_user(request, f'{updated} demande(s) marquée(s) comme en attente.')
    mark_as_pending.short_description = "Marquer comme en attente"


# ===================================
# PERSONNALISATION DU SITE ADMIN
# ===================================

admin.site.site_header = "Administration Gestion Immobilière HabiPro"
admin.site.site_title = "Admin HabiPro"
admin.site.index_title = "Tableau de bord - Gestion Immobilière"