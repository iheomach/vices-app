from django.contrib import admin
from .models import SearchLocation, UserSearch

@admin.register(SearchLocation)
class SearchLocationAdmin(admin.ModelAdmin):
    list_display = ['city', 'province', 'search_count']
    list_filter = ['province']
    search_fields = ['city', 'province']

@admin.register(UserSearch)
class UserSearchAdmin(admin.ModelAdmin):
    list_display = ['user', 'latitude', 'longitude', 'timestamp']
    list_filter = ['timestamp']
    search_fields = ['user__username']