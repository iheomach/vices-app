from django.db import models

# Create your models here.
class Product(models.Model):
    # Core product info
    name = models.CharField(max_length=200)
    category = models.CharField(choices=[('cannabis', 'Cannabis'), ('alcohol', 'Alcohol')])
    product_type = models.CharField(max_length=50)  # flower, edible, wine, beer
    
    # Pricing (scraped data)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    
    # Cannabis-specific (scraped)
    thc_content = models.FloatField(null=True, blank=True)
    cbd_content = models.FloatField(null=True, blank=True)
    strain_type = models.CharField(max_length=20, null=True)  # indica, sativa, hybrid
    
    # Scraping metadata
    source_url = models.URLField()  # Original product page
    last_scraped = models.DateTimeField(auto_now=True)
    is_verified = models.BooleanField(default=False)  # Verified by vendor
    scrape_status = models.CharField(max_length=20, default='active')
    
    # Business features
    is_promoted = models.BooleanField(default=False)  # Paid promotion
    vendor_priority = models.IntegerField(default=0)  # Higher = more visible
    business_verified = models.BooleanField(default=False)  # Official business account