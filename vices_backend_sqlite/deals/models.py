from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
import uuid

class DealCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    class Meta:
        db_table = 'deal_categories'
        verbose_name_plural = 'Deal Categories'
    
    def __str__(self):
        return self.name


class Deal(models.Model):
    DEAL_TYPES = [
        ('percentage', 'Percentage Off'),
        ('fixed_amount', 'Fixed Amount Off'),
        ('bogo', 'Buy One Get One'),
        ('bundle', 'Bundle Deal'),
        ('special', 'Special Offer'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vendor = models.ForeignKey('vendors.Vendor', on_delete=models.CASCADE, related_name='deals')
    category = models.ForeignKey(DealCategory, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Deal Information
    title = models.CharField(max_length=200)
    description = models.TextField()
    deal_type = models.CharField(max_length=20, choices=DEAL_TYPES)
    
    # Product Information
    product_name = models.CharField(max_length=200)
    brand = models.CharField(max_length=100, blank=True)
    product_category = models.CharField(max_length=100, blank=True)  # e.g., "Flower", "Edibles", "Beer", "Wine"
    
    # Pricing
    original_price = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_percentage = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    savings_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Availability
    is_active = models.BooleanField(default=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    quantity_available = models.IntegerField(null=True, blank=True)
    quantity_sold = models.IntegerField(default=0)
    
    # Restrictions
    min_age_required = models.IntegerField(default=19)  # Legal age in Alberta
    max_per_customer = models.IntegerField(null=True, blank=True)
    requires_membership = models.BooleanField(default=False)
    
    # Visibility for freemium model
    is_premium = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'deals'
        indexes = [
            models.Index(fields=['vendor', 'is_active']),
            models.Index(fields=['start_date', 'end_date']),
            models.Index(fields=['is_featured', 'discount_percentage']),
            models.Index(fields=['product_category', 'is_active']),
        ]
        ordering = ['-is_featured', '-discount_percentage', '-created_at']
    
    def save(self, *args, **kwargs):
        # Calculate savings and discount percentage
        if self.original_price and self.sale_price:
            self.savings_amount = self.original_price - self.sale_price
            if self.original_price > 0:
                self.discount_percentage = (self.savings_amount / self.original_price) * 100
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.title} - {self.vendor.name}"
    
    @property
    def is_available(self):
        from django.utils import timezone
        now = timezone.now()
        return (
            self.is_active and 
            self.start_date <= now <= self.end_date and
            (self.quantity_available is None or self.quantity_available > self.quantity_sold)
        )


class UserDealInteraction(models.Model):
    INTERACTION_TYPES = [
        ('view', 'Viewed'),
        ('click', 'Clicked'),
        ('save', 'Saved'),
        ('share', 'Shared'),
        ('redeem', 'Redeemed'),
    ]
    
    user = models.ForeignKey('users.User', on_delete=models.CASCADE)
    deal = models.ForeignKey(Deal, on_delete=models.CASCADE)
    interaction_type = models.CharField(max_length=20, choices=INTERACTION_TYPES)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'user_deal_interactions'
        indexes = [
            models.Index(fields=['user', 'interaction_type']),
            models.Index(fields=['deal', 'interaction_type']),
            models.Index(fields=['timestamp']),
        ]
        unique_together = ['user', 'deal', 'interaction_type']
    
    def __str__(self):
        return f"{self.user.email} {self.interaction_type} {self.deal.title}"
