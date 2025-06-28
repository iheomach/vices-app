from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'journal', views.JournalEntryViewSet, basename='journal')
router.register(r'consumption', views.StatsViewSet, basename='consumption')

urlpatterns = [
    # Journal endpoints
    path('journal/', 
         views.JournalEntryViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='journal-list-create'),
         
    # DEBUG: Test user-specific entries
    path('journal/by-user/', 
         views.JournalEntryViewSet.as_view({'get': 'by_user'}), 
         name='journal-by-user'),
         
    # DEBUG: See all entries (admin only)
    path('journal/debug-all/', 
         views.JournalEntryViewSet.as_view({'get': 'debug_all'}), 
         name='journal-debug-all'),
    
    # Stats endpoints
    path('stats/', 
         views.StatsViewSet.as_view({'get': 'retrieve_stats'}), 
         name='consumption-stats'),
    
    # Insights endpoint
    path('insights/', 
         views.JournalEntryViewSet.as_view({'get': 'get_insights'}), 
         name='journal-insights'),
    
    # Journal filtering endpoints
    path('journal/by-date-range/', 
         views.JournalEntryViewSet.as_view({'get': 'by_date_range'}), 
         name='journal-by-date-range'),

     # Include router URLs for basic CRUD operations
    path('', include(router.urls)),
]