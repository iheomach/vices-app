from django.contrib import admin
from .models import Goal, AIInsight

@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'type', 'status', 'progress', 'start_date')
    list_filter = ('type', 'status', 'start_date')
    search_fields = ('title', 'description', 'user__email')
    date_hierarchy = 'start_date'
    readonly_fields = ('last_updated',)
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'title', 'description', 'type')
        }),
        ('Progress', {
            'fields': ('status', 'progress', 'duration')
        }),
        ('Goal Details', {
            'fields': ('benefits', 'challenge')
        }),
        ('Dates', {
            'fields': ('start_date', 'last_updated'),
            'classes': ('collapse',)
        }),
    )

@admin.register(AIInsight)
class AIInsightAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'type', 'severity', 'created_at')
    list_filter = ('type', 'severity', 'actionable')
    search_fields = ('title', 'message', 'user__email')
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at',)
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'title', 'message')
        }),
        ('Classification', {
            'fields': ('type', 'severity', 'actionable')
        }),
        ('Timing', {
            'fields': ('created_at', 'expires_at'),
            'classes': ('collapse',)
        }),
    )