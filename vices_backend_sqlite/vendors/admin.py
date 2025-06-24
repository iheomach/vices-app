# vendors/admin.py
from django.contrib import admin
from .models import VendorCategory, Vendor, Product, Review


@admin.register(VendorCategory)
class VendorCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
    list_filter = ['name']


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'city', 'rating', 'is_verified', 'is_featured', 'is_active']
    list_filter = ['category', 'city', 'is_verified', 'is_featured', 'is_active', 'province']
    search_fields = ['name', 'address', 'phone', 'email']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'category', 'description')
        }),
        ('Contact Information', {
            'fields': ('phone', 'email', 'website')
        }),
        ('Location', {
            'fields': ('address', 'city', 'province', 'postal_code', 'latitude', 'longitude')
        }),
        ('Business Hours', {
            'fields': ('hours_monday', 'hours_tuesday', 'hours_wednesday', 'hours_thursday', 
                      'hours_friday', 'hours_saturday', 'hours_sunday'),
            'classes': ('collapse',)
        }),
        ('Ratings & Reviews', {
            'fields': ('rating', 'review_count', 'google_rating', 'google_review_count')
        }),
        ('Google Integration', {
            'fields': ('google_place_id', 'last_synced'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_active', 'is_featured', 'is_verified')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'vendor', 'product_type', 'regular_price', 'current_price', 'in_stock']
    list_filter = ['product_type', 'in_stock', 'vendor__category']
    search_fields = ['name', 'brand', 'vendor__name', 'sku']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('vendor', 'name', 'product_type', 'description', 'brand')
        }),
        ('Pricing', {
            'fields': ('regular_price', 'current_price')
        }),
        ('Product Details', {
            'fields': ('size', 'thc_content', 'cbd_content', 'alcohol_content')
        }),
        ('Inventory', {
            'fields': ('in_stock', 'stock_quantity', 'sku')
        }),
        ('Media', {
            'fields': ('image_url',)
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


# Deal admin moved to deals app


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['vendor', 'rating', 'reviewer_name', 'is_verified', 'is_approved', 'created_at']
    list_filter = ['rating', 'is_verified', 'is_approved', 'vendor__category']
    search_fields = ['title', 'content', 'vendor__name', 'reviewer_name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Review Information', {
            'fields': ('vendor', 'rating', 'title', 'content', 'reviewer_name')
        }),
        ('Moderation', {
            'fields': ('is_verified', 'is_approved')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


# Custom admin site configuration
admin.site.site_header = "Vices App Administration"
admin.site.site_title = "Vices Admin"
admin.site.index_title = "Welcome to Vices Administration"