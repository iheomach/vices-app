from django.contrib import admin
from .models import JournalEntry

@admin.register(JournalEntry)
class JournalEntryAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'substance', 'mood', 'sleep_quality')
    list_filter = ('substance', 'date', 'user')
    search_fields = ('user__email', 'notes', 'effects')
    date_hierarchy = 'date'
    readonly_fields = ('timestamp',)
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'date', 'substance', 'amount')
        }),
        ('Wellness Metrics', {
            'fields': ('mood', 'sleep_quality')
        }),
        ('Details', {
            'fields': ('effects', 'notes', 'tags')
        }),
        ('System Fields', {
            'fields': ('timestamp',),
            'classes': ('collapse',)
        }),
    )