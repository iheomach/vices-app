# vices_db/health/views.py
from django.http import JsonResponse
from django.views import View
import os

class HealthCheckView(View):
    def get(self, request):
        return JsonResponse({
            'status': 'healthy',
            'version': '1.0.0',
            'environment': os.getenv('DJANGO_SETTINGS_MODULE', 'unknown')
        })
