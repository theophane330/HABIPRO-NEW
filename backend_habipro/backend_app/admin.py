from django.contrib import admin
from .models import Document,Propriete

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    """
    Configuration de l'interface admin pour les documents
    """
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
    
    actions = ['mark_as_active', 'mark_as_completed']
    
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

@admin.register(Propriete)
class ProprieteAdmin(admin.ModelAdmin):
    """Configuration de l'interface admin pour les propriétés"""
    
    list_display = [
        'title',
        'type',
        'address',
        'price',
        'status',
        'tenant',
        'bedrooms',
        'bathrooms',
        'size',
        'proprietaire',
        'created_at'
    ]
    
    list_filter = [
        'status',
        'type',
        'created_at',
        'proprietaire'
    ]
    
    search_fields = [
        'title',
        'address',
        'tenant',
        'description'
    ]
    
    ordering = ['-created_at']
    
    date_hierarchy = 'created_at'
    
    readonly_fields = [
        'created_at',
        'updated_at',
        'image_preview',
        'video_preview'
    ]
    
    fieldsets = (
        ('Informations générales', {
            'fields': (
                'proprietaire',
                'title',
                'type',
                'address',
                'icon'
            )
        }),
        ('Détails financiers', {
            'fields': (
                'price',
                'status',
                'tenant'
            )
        }),
        ('Caractéristiques', {
            'fields': (
                'bedrooms',
                'bathrooms',
                'size'
            )
        }),
        ('Médias', {
            'fields': (
                'image',
                'image_preview',
                'video',
                'video_preview'
            )
        }),
        ('Description', {
            'fields': ('description',),
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
    
    list_per_page = 25
    
    actions = [
        'mark_as_disponible',
        'mark_as_loue',
        'mark_as_en_vente'
    ]
    
    def get_queryset(self, request):
        """Filtrer les propriétés selon les permissions"""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(proprietaire=request.user)
    
    def save_model(self, request, obj, form, change):
        """Assigner automatiquement le propriétaire lors de la création"""
        if not change:
            obj.proprietaire = request.user
        super().save_model(request, obj, form, change)
    
    def image_preview(self, obj):
        """Affiche un aperçu de l'image"""
        if obj.image:
            return f'<img src="{obj.image.url}" width="200" />'
        return "Aucune image"
    image_preview.short_description = "Aperçu de l'image"
    image_preview.allow_tags = True
    
    def video_preview(self, obj):
        """Affiche un aperçu de la vidéo"""
        if obj.video:
            return f'''
                <video width="320" height="240" controls>
                    <source src="{obj.video.url}" type="video/mp4">
                    Votre navigateur ne supporte pas la balise vidéo.
                </video>
            '''
        return "Aucune vidéo"
    video_preview.short_description = "Aperçu de la vidéo"
    video_preview.allow_tags = True
    
    def mark_as_disponible(self, request, queryset):
        """Marque les propriétés comme disponibles"""
        updated = queryset.update(status='disponible', tenant=None)
        self.message_user(
            request,
            f'{updated} propriété(s) marquée(s) comme disponible(s).'
        )
    mark_as_disponible.short_description = "Marquer comme disponible"
    
    def mark_as_loue(self, request, queryset):
        """Marque les propriétés comme louées"""
        updated = queryset.update(status='loue')
        self.message_user(
            request,
            f'{updated} propriété(s) marquée(s) comme louée(s).'
        )
    mark_as_loue.short_description = "Marquer comme loué"
    
    def mark_as_en_vente(self, request, queryset):
        """Marque les propriétés comme en vente"""
        updated = queryset.update(status='en_vente', tenant=None)
        self.message_user(
            request,
            f'{updated} propriété(s) marquée(s) comme en vente.'
        )
    mark_as_en_vente.short_description = "Marquer comme en vente"