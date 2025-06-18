from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.DealViewSet, basename='deal')
router.register(r'categories', views.DealCategoryViewSet, basename='deal-category')

urlpatterns = [
    path('', include(router.urls)),
    path('featured/', views.FeaturedDealsView.as_view(), name='featured-deals'),
    path('by-vendor/<uuid:vendor_id>/', views.VendorDealsView.as_view(), name='vendor-deals'),
    path('interact/', views.DealInteractionView.as_view(), name='deal-interaction'),
]
