from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.VendorViewSet, basename='vendor')
router.register(r'categories', views.VendorCategoryViewSet, basename='vendor-category')

urlpatterns = [
    path('', include(router.urls)),
    path('search/', views.VendorSearchView.as_view(), name='vendor-search'),
    path('nearby/', views.NearbyVendorsView.as_view(), name='nearby-vendors'),
]