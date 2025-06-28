from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_user, name='register_user'),
    path('login/', views.login_user, name='login_user'),
    path('profile/', views.UserProfileViewSet.as_view({'put': 'update_profile', 'get': 'profile'}), name='user-profile'),
    path('request-password-change/', views.request_password_change, name='request_password_change'),
    path('confirm-password-change/', views.confirm_password_change, name='confirm_password_change'),
    path('public-request-password-reset/', views.public_request_password_reset, name='public_request_password_reset'),
]