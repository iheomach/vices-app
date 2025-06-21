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
    
    @property
    def formatted_hours(self):
        hours = {
            'Monday': self.hours_monday,
            'Tuesday': self.hours_tuesday,
            'Wednesday': self.hours_wednesday,
            'Thursday': self.hours_thursday,
            'Friday': self.hours_friday,
            'Saturday': self.hours_saturday,
            'Sunday': self.hours_sunday,
        }
        return '\n'.join(f"{day}: {time}" for day, time in hours.items() if time)


class Review(models.Model):
    """
    User reviews for vendors
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='reviews')
    
    # Review Content
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    title = models.CharField(max_length=200, blank=True)
    content = models.TextField()
    
    # Reviewer Info (anonymous for now)
    reviewer_name = models.CharField(max_length=100, default="Anonymous")
    
    # Metadata
    is_verified = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reviews'
        indexes = [
            models.Index(fields=['vendor', 'is_approved']),
            models.Index(fields=['rating', 'created_at']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.rating}★ - {self.vendor.name} by {self.reviewer_name}"


class Product(models.Model):
    """
    Products sold by vendors
    """
    PRODUCT_TYPES = [
        ('cannabis_flower', 'Cannabis Flower'),
        ('cannabis_edible', 'Cannabis Edible'),
        ('cannabis_concentrate', 'Cannabis Concentrate'),
        ('cannabis_topical', 'Cannabis Topical'),
        ('alcohol_beer', 'Beer'),
        ('alcohol_wine', 'Wine'),
        ('alcohol_spirits', 'Spirits'),
        ('alcohol_other', 'Other Alcohol'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='products')
    
    # Basic Info
    name = models.CharField(max_length=200)
    product_type = models.CharField(max_length=50, choices=PRODUCT_TYPES)
    description = models.TextField(blank=True)
    brand = models.CharField(max_length=100, blank=True)
    
    # Pricing
    regular_price = models.DecimalField(max_digits=10, decimal_places=2)
    current_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Product Details
    size = models.CharField(max_length=50, blank=True)  # "1g", "750ml", etc.
    thc_content = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # For cannabis
    cbd_content = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # For cannabis
    alcohol_content = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # For alcohol
    
    # Stock
    in_stock = models.BooleanField(default=True)
    stock_quantity = models.IntegerField(null=True, blank=True)
    
    # Metadata
    sku = models.CharField(max_length=100, blank=True)
    image_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'products'
        indexes = [
            models.Index(fields=['vendor', 'product_type']),
            models.Index(fields=['product_type', 'in_stock']),
        ]
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} - {self.vendor.name}"
    
    @property
    def is_on_sale(self):
        return self.current_price and self.current_price < self.regular_price
    
    @property
    def discount_percentage(self):
        if self.is_on_sale:
            return round(((self.regular_price - self.current_price) / self.regular_price) * 100, 1)
        return 0


# Deal model moved to deals app
