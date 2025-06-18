from django.db import models

class SearchLocation(models.Model):
    """Store popular search locations for autocomplete"""
    name = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    province = models.CharField(max_length=50)
    latitude = models.DecimalField(max_digits=10, decimal_places=8)
    longitude = models.DecimalField(max_digits=11, decimal_places=8)
    search_count = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'search_locations'
        indexes = [
            models.Index(fields=['city', 'province']),
            models.Index(fields=['search_count']),
        ]
        unique_together = ['name', 'city', 'province']
    
    def __str__(self):
        return f"{self.name}, {self.city}, {self.province}"


class UserSearch(models.Model):
    """Track user searches for analytics"""
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, null=True, blank=True)
    search_term = models.CharField(max_length=200, blank=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=8)
    longitude = models.DecimalField(max_digits=11, decimal_places=8)
    radius_km = models.IntegerField(default=25)
    results_count = models.IntegerField(default=0)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'user_searches'
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['latitude', 'longitude']),
            models.Index(fields=['timestamp']),
        ]
    
    def __str__(self):
        return f"Search by {self.user} at {self.timestamp}"