from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

class VendorCategory(models.Model):
    CATEGORY_CHOICES = [
        ('cannabis', 'Cannabis'),
        ('alcohol', 'Alcohol'),
        ('both', 'Cannabis & Alcohol'),
    ]
    
    name = models.CharField(max_length=50, choices=CATEGORY_CHOICES, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=100, blank=True)  # For emoji or icon class
    
    class Meta:
        db_table = 'vendor_categories'
        verbose_name_plural = 'Vendor Categories'
    
    def __str__(self):
        return self.get_name_display()


class Vendor(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Basic Information
    name = models.CharField(max_length=200)
    category = models.ForeignKey(VendorCategory, on_delete=models.CASCADE, related_name='vendors')
    description = models.TextField(blank=True)
    
    # Contact Information
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    
    # Location
    address = models.TextField()
    city = models.CharField(max_length=100)
    province = models.CharField(max_length=50)
    postal_code = models.CharField(max_length=10)
    latitude = models.DecimalField(max_digits=10, decimal_places=8)
    longitude = models.DecimalField(max_digits=11, decimal_places=8)
    
    # Business Hours (simplified - can be expanded)
    hours_monday = models.CharField(max_length=50, blank=True, default="9:00 AM - 9:00 PM")
    hours_tuesday = models.CharField(max_length=50, blank=True, default="9:00 AM - 9:00 PM")
    hours_wednesday = models.CharField(max_length=50, blank=True, default="9:00 AM - 9:00 PM")
    hours_thursday = models.CharField(max_length=50, blank=True, default="9:00 AM - 9:00 PM")
    hours_friday = models.CharField(max_length=50, blank=True, default="9:00 AM - 10:00 PM")
    hours_saturday = models.CharField(max_length=50, blank=True, default="9:00 AM - 10:00 PM")
    hours_sunday = models.CharField(max_length=50, blank=True, default="10:00 AM - 8:00 PM")
    
    # Ratings and Reviews
    rating = models.DecimalField(
        max_digits=3, 
        decimal_places=2, 
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        default=0
    )
    review_count = models.IntegerField(default=0)
    
    # Google Places API
    google_place_id = models.CharField(max_length=200, blank=True, unique=True)
    google_rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    google_review_count = models.IntegerField(default=0)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_synced = models.DateTimeField(null=True, blank=True)  # For Google Places sync
    
    class Meta:
        db_table = 'vendors'
        indexes = [
            models.Index(fields=['latitude', 'longitude']),
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['is_featured', 'rating']),
            models.Index(fields=['google_place_id']),
        ]
        ordering = ['-is_featured', '-rating', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"
    
    def get_category_display(self):
        return self.category.get_name_display()