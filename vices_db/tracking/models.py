from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import User

class JournalEntry(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='journal_entries')
    date = models.DateField()
    timestamp = models.DateTimeField(auto_now_add=True)
    substance = models.CharField(
        max_length=20,
        choices=[
            ('cannabis', 'Cannabis'),
            ('alcohol', 'Alcohol'),
            ('both', 'Both'),
            ('none', 'None'),
            ('wellness', 'Wellness')
        ]
    )
    amount = models.CharField(max_length=100)
    mood = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    sleep_quality = models.FloatField(
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    effects = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    tags = models.JSONField(default=list)
    sleep = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(24)],
        blank=True, null=True
    )
    class Meta:
        ordering = ['-date']
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['substance']),
        ]

class Stats(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='stats')
    mindful_days = models.IntegerField(default=0)
    sleep_quality = models.FloatField(default=0)
    sleep_improvement = models.FloatField(default=0)
    mood_average = models.FloatField(default=0)
    mood_trend = models.CharField(max_length=20, default='stable')
    last_calculated = models.DateTimeField(auto_now=True)

class ConsumptionStats(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='consumption_stats')
    date = models.DateField()
    vice_type = models.CharField(
        max_length=20,
        choices=[
            ('cannabis', 'Cannabis'),
            ('alcohol', 'Alcohol'),
            ('both', 'Both'),
            ('none', 'None'),
            ('wellness', 'Wellness')
        ]
    )
    quantity = models.FloatField(validators=[MinValueValidator(0)])
    spending = models.FloatField(validators=[MinValueValidator(0)])
    location = models.CharField(max_length=100, blank=True)
    time_of_day = models.CharField(max_length=20, blank=True)
    mood_before = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        blank=True, null=True
    )
    mood_after = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        blank=True, null=True
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ['-date']
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['vice_type']),
        ]