from django.contrib import admin
from .models import Document

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