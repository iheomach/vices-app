from django.contrib import admin
from .models import Goal, AIInsight

@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'title', 'user', 'substance_type', 'status', 'progress', 'current_value', 'target_value', 'target_unit', 'start_date', 'end_date'
    )
    list_filter = ('substance_type', 'status', 'start_date')
    search_fields = ('title', 'description', 'user__email')
    date_hierarchy = 'start_date'
    readonly_fields = ('id', 'last_updated', 'start_date')
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'user', 'title', 'description', 'substance_type')
        }),
        ('Progress', {
            'fields': ('status', 'progress', 'duration', 'current_value', 'target_value', 'target_unit')
        }),
        ('Goal Details', {
            'fields': ('benefits', 'challenge')
        }),
        ('Dates', {
            'fields': ('start_date', 'end_date', 'last_updated'),
            'classes': ('collapse',)
        }),
    )

@admin.register(AIInsight)
class AIInsightAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'user', 'type', 'severity', 'actionable', 'created_at', 'expires_at')
    list_filter = ('type', 'severity', 'actionable')
    search_fields = ('title', 'message', 'user__email')
    date_hierarchy = 'created_at'
    readonly_fields = ('id', 'created_at')
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'user', 'title', 'message')
        }),
        ('Classification', {
            'fields': ('type', 'severity', 'actionable')
        }),
        ('Timing', {
            'fields': ('created_at', 'expires_at'),
            'classes': ('collapse',)
        }),
    )