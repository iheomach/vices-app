from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for viewsets
router = DefaultRouter()
router.register(r'profiles', views.UserProfileViewSet, basename='users')

urlpatterns = [
    # Include viewset routes
    path('', include(router.urls)),
    
    # Add your custom register endpoint
    path('register/', views.register_user, name='register_user'),
]