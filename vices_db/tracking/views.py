from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Avg, Sum, Count, Q
from datetime import datetime, timedelta
from .models import JournalEntry, Stats, ConsumptionStats
from .serializers import JournalEntrySerializer, StatsSerializer, ConsumptionStatsSerializer

class JournalEntryViewSet(viewsets.ModelViewSet):
    serializer_class = JournalEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        CRITICAL: Always filter by the authenticated user
        """
        if not self.request.user.is_authenticated:
            return JournalEntry.objects.none()
            
        # Start with user's entries ONLY
        queryset = JournalEntry.objects.filter(user=self.request.user)
        
        # Add optional filters
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        substance = self.request.query_params.get('substance', None)

        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        if substance:
            queryset = queryset.filter(substance=substance)

        return queryset.order_by('-date', '-timestamp')

    def list(self, request, *args, **kwargs):
        """
        Override list to add debugging and ensure proper user filtering
        """
        print(f"🔍 JournalEntry List - User: {request.user}")
        print(f"🔍 User ID: {request.user.id}")
        
        queryset = self.get_queryset()
        print(f"🔍 Queryset count: {queryset.count()}")
        print(f"🔍 Queryset SQL: {queryset.query}")
        
        # Get all entries for debugging
        all_entries = list(queryset.values('id', 'user__email', 'date', 'substance', 'mood'))
        print(f"🔍 All entries: {all_entries}")
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        """
        Ensure new entries are always tied to the authenticated user
        """
        print(f"💾 Creating journal entry for user: {self.request.user}")
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        """
        Override create to add debugging
        """
        print(f"📝 Creating new journal entry")
        print(f"📝 Request data: {request.data}")
        print(f"📝 User: {request.user}")
        
        response = super().create(request, *args, **kwargs)
        print(f"✅ Created entry: {response.data}")
        return response

    @action(detail=False, methods=['get'])
    def by_user(self, request):
        """
        Explicit endpoint to get all entries for current user
        """
        entries = JournalEntry.objects.filter(user=request.user).order_by('-date', '-timestamp')
        serializer = self.get_serializer(entries, many=True)
        
        return Response({
            'count': entries.count(),
            'user_id': request.user.id,
            'user_email': request.user.email,
            'results': serializer.data
        })

    @action(detail=False, methods=['get'])
    def debug_all(self, request):
        """
        Debug endpoint to see ALL entries in database (remove in production)
        """
        if not request.user.is_superuser:
            return Response({'error': 'Unauthorized'}, status=403)
            
        all_entries = JournalEntry.objects.all().values(
            'id', 'user__email', 'user__id', 'date', 'substance', 'mood'
        )
        
        return Response({
            'total_entries': len(all_entries),
            'current_user': request.user.email,
            'current_user_id': request.user.id,
            'all_entries': list(all_entries)
        })

    @action(detail=False, methods=['get'])
    def mood_trends(self, request):
        timeframe = int(request.query_params.get('timeframe', '30'))
        start_date = timezone.now().date() - timedelta(days=timeframe)
        entries = self.get_queryset().filter(date__gte=start_date)
        
        mood_data = entries.aggregate(
            avg_mood=Avg('mood'),
            avg_sleep_quality=Avg('sleep_quality')
        )
        
        mood_by_substance = entries.values('substance').annotate(
            avg_mood=Avg('mood'),
            count=Count('id')
        )

        return Response({
            'overall_mood': mood_data['avg_mood'],
            'sleep_quality': mood_data['avg_sleep_quality'],
            'mood_by_substance': mood_by_substance
        })

    @action(detail=False, methods=['get'])
    def get_insights(self, request):
        timeframe = int(request.query_params.get('timeframe', '30'))
        start_date = timezone.now().date() - timedelta(days=timeframe)
        entries = self.get_queryset().filter(date__gte=start_date)

        # Calculate various insights
        insights = {
            'total_entries': entries.count(),
            'substance_breakdown': entries.values('substance').annotate(count=Count('id')),
            'avg_mood': entries.aggregate(Avg('mood'))['mood__avg'],
            'avg_sleep_quality': entries.aggregate(Avg('sleep_quality'))['sleep_quality__avg'],
            'common_tags': entries.values('tags').annotate(count=Count('id')).order_by('-count')[:5]
        }

        return Response(insights)

class StatsViewSet(viewsets.ModelViewSet):
    serializer_class = StatsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Stats.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def retrieve_stats(self, request):
        stats = self.get_queryset().first()
        if not stats:
            stats = Stats.objects.create(user=request.user)
        return Response(self.serializer_class(stats).data)

class ConsumptionStatsViewSet(viewsets.ModelViewSet):
    serializer_class = ConsumptionStatsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = ConsumptionStats.objects.filter(user=self.request.user)
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        vice_type = self.request.query_params.get('vice_type', None)

        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        if vice_type:
            queryset = queryset.filter(vice_type=vice_type)

        return queryset.order_by('-date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def consumption_analysis(self, request):
        timeframe = int(request.query_params.get('timeframe', '30'))
        start_date = timezone.now().date() - timedelta(days=timeframe)
        stats = self.get_queryset().filter(date__gte=start_date)
        
        analysis = {
            'total_spending': stats.aggregate(Sum('spending'))['spending__sum'] or 0,
            'consumption_by_type': stats.values('vice_type').annotate(
                total_quantity=Sum('quantity'),
                total_spending=Sum('spending'),
                count=Count('id'),
                avg_mood_impact=Avg('mood_after') - Avg('mood_before')
            ),
            'time_of_day_breakdown': stats.values('time_of_day').annotate(
                count=Count('id'),
                avg_spending=Avg('spending')
            ),
            'location_analysis': stats.values('location').annotate(
                count=Count('id'),
                avg_spending=Avg('spending')
            ).order_by('-count')[:5]
        }
        return Response(analysis)