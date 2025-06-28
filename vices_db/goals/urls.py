from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.GoalViewSet, basename='goal')
router.register(r'insights', views.AIInsightViewSet, basename='insight')

urlpatterns = [
    path('', include(router.urls)),
]