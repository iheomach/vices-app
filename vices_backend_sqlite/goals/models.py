from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from users.models import User

class Goal(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='goals')
    title = models.CharField(max_length=100)
    description = models.TextField()
    substance_type = models.CharField(
        max_length=20,
        choices=[
            ('cannabis', 'Cannabis'),
            ('alcohol', 'Alcohol'),
            ('wellness', 'Wellness'),
            ('both', 'Both'),
            ('none', 'None')
        ]
    )
    duration = models.CharField(max_length=20)
    progress = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('active', 'Active'),
            ('paused', 'Paused'),
            ('completed', 'Completed'),
            ('abandoned', 'Abandoned')
        ],
        default='active'
    )
    benefits = models.JSONField(default=list)
    challenge = models.CharField(max_length=100)
    start_date = models.DateField(auto_now_add=True)
    
    # ADD THESE MISSING FIELDS:
    target_value = models.FloatField(default=100)
    target_unit = models.CharField(max_length=20, default='%')
    current_value = models.FloatField(default=0)
    end_date = models.DateField(null=True, blank=True)
    
    last_updated = models.DateTimeField(auto_now=True)

class AIInsight(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_insights')
    type = models.CharField(
        max_length=20,
        choices=[
            ('pattern', 'Pattern'),
            ('health', 'Health'),
            ('achievement', 'Achievement'),
            ('optimization', 'Optimization'),
            ('trend', 'Trend')
        ]
    )
    title = models.CharField(max_length=100)
    message = models.TextField()
    severity = models.CharField(
        max_length=20,
        choices=[
            ('info', 'Info'),
            ('warning', 'Warning'),
            ('success', 'Success'),
            ('tip', 'Tip')
        ]
    )
    actionable = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True)