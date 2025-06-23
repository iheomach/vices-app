from rest_framework import serializers
from .models import Goal, AIInsight

class GoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goal
        fields = [
            'id', 'user', 'title', 'description', 'type', 'duration',
            'progress', 'status', 'benefits', 'challenge', 'start_date',
            'last_updated'
        ]
        read_only_fields = ['id', 'user', 'start_date', 'last_updated']

class AIInsightSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIInsight
        fields = [
            'id', 'user', 'type', 'title', 'message', 'severity',
            'actionable', 'created_at', 'expires_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']
