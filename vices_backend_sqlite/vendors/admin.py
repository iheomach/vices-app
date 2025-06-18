from django.contrib import admin
from .models import Vendor, VendorCategory

@admin.register(VendorCategory)
class VendorCategoryAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']

@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'city', 'province', 'rating', 'is_active']
    list_filter = ['category', 'is_active', 'is_featured', 'province']
    search_fields = ['name', 'city', 'description']