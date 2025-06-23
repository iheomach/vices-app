from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'goals', views.GoalViewSet, basename='goal')
router.register(r'insights', views.AIInsightViewSet, basename='insight')

urlpatterns = [
    
    # Custom goal actions
    path('goals/<str:pk>/update_progress/', 
         views.GoalViewSet.as_view({'post': 'update_progress'}), 
         name='goal-update-progress'),
    path('goals/<str:pk>/complete/', 
         views.GoalViewSet.as_view({'post': 'complete'}), 
         name='goal-complete'),
    path('goals/<str:pk>/pause/', 
         views.GoalViewSet.as_view({'post': 'pause'}), 
         name='goal-pause'),
    path('goals/<str:pk>/resume/', 
         views.GoalViewSet.as_view({'post': 'resume'}), 
         name='goal-resume'),
    
    # Goal filtering endpoints
    path('goals/active/', 
         views.GoalViewSet.as_view({'get': 'active'}), 
         name='active-goals'),
    path('goals/completed/', 
         views.GoalViewSet.as_view({'get': 'completed'}), 
         name='completed-goals'),
    
    # Insight filtering endpoints
    path('insights/active/', 
         views.AIInsightViewSet.as_view({'get': 'active'}), 
         name='active-insights'),
    path('insights/by-goal/<str:goal_id>/', 
         views.AIInsightViewSet.as_view({'get': 'by_goal'}), 
         name='insights-by-goal'),
    path('', include(router.urls)),
]
