from rest_framework import serializers
from .models import JournalEntry, Stats

class JournalEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalEntry
        fields = [
            'id', 'user', 'date', 'timestamp', 'substance', 'amount', 'mood', 'sleep_quality', 'effects', 'notes', 'tags', 'sleep'
        ]
        read_only_fields = ['id', 'user', 'timestamp']

class ConsumptionStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stats
        fields = [
            'id', 'user', 'date', 'vice_type', 'quantity',
            'spending', 'location', 'time_of_day', 'mood_before',
            'mood_after', 'notes', 'created_at'
        ]
        read_only_fields = ['user', 'created_at']
class StatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stats
        fields = [
            'id', 'user', 'mindful_days', 'sleep_quality',
            'sleep_improvement', 'mood_average', 'mood_trend', 'last_calculated'
        ]
        read_only_fields = ['id', 'user', 'last_calculated']


