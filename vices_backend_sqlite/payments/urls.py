# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('create-payment-intent/', views.create_payment_intent, name='create_payment_intent'),
    path('stripe-webhook/', views.stripe_webhook, name='stripe_webhook'),
]