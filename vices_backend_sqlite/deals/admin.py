from django.contrib import admin
from .models import Deal, DealCategory, UserDealInteraction

@admin.register(DealCategory)
class DealCategoryAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']

@admin.register(Deal)
class DealAdmin(admin.ModelAdmin):
    list_display = ['title', 'vendor', 'category', 'discount_percentage', 'start_date', 'end_date', 'is_active']
    list_filter = ['category', 'is_active', 'is_featured', 'start_date']
    search_fields = ['title', 'description', 'vendor__name']

@admin.register(UserDealInteraction)
class UserDealInteractionAdmin(admin.ModelAdmin):
    list_display = ['user', 'deal', 'interaction_type', 'timestamp']
    list_filter = ['interaction_type', 'timestamp']
    search_fields = ['user__username', 'deal__title']