from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'search-locations', views.SearchLocationViewSet, basename='search-location')

urlpatterns = [
    path('', include(router.urls)),
    path('autocomplete/', views.LocationAutocompleteView.as_view(), name='location-autocomplete'),
    path('reverse-geocode/', views.ReverseGeocodeView.as_view(), name='reverse-geocode'),
]