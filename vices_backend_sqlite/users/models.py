from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator

class User(AbstractUser):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    phone = models.CharField(validators=[phone_regex], max_length=17, blank=True)
    
    # Location preferences
    city = models.CharField(max_length=100, blank=True)
    province = models.CharField(max_length=50, blank=True)
    postal_code = models.CharField(max_length=10, blank=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    
    # Preferences
    receive_deal_notifications = models.BooleanField(default=True)
    
    # Consumption preferences
    preferred_categories = models.JSONField(default=list, blank=True, help_text="e.g., ['cannabis', 'wine', 'beer', 'spirits']")
    tolerance_level = models.CharField(max_length=20, blank=True, help_text="Overall tolerance level")
    favorite_effects = models.JSONField(default=list, blank=True, help_text="e.g., ['relaxation', 'creativity', 'social']")
    consumption_goals = models.JSONField(default=list, blank=True, help_text="e.g., ['sleep', 'pain_relief', 'celebration']")

    # Account info
    is_verified = models.BooleanField(default=False)
    date_of_birth = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name', 'phone']
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['latitude', 'longitude']),
        ]
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
