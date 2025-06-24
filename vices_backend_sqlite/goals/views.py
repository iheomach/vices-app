from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Avg, Count, Q
from datetime import datetime, timedelta
from .models import Goal, AIInsight
from .serializers import GoalSerializer, AIInsightSerializer

class GoalViewSet(viewsets.ModelViewSet):
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Goal.objects.filter(user=self.request.user)
        status = self.request.query_params.get('status', None)
        substance_type = self.request.query_params.get('substance_type', None)
        
        if status:
            queryset = queryset.filter(status=status)
        if substance_type:
            queryset = queryset.filter(substance_type=substance_type)
            
        return queryset.order_by('-start_date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        goal = self.get_object()
        progress = request.data.get('progress', 0)
        
        # Validate progress value
        if not 0 <= progress <= 100:
            return Response(
                {'error': 'Progress must be between 0 and 100'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        goal.progress = progress
        goal.last_updated = timezone.now()
        
        # Auto-complete goal if progress reaches 100%
        if progress == 100:
            goal.status = 'completed'
        
        goal.save()
        return Response(self.serializer_class(goal).data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        goal = self.get_object()
        goal.status = 'completed'
        goal.progress = 100
        goal.last_updated = timezone.now()
        goal.save()
        return Response(self.serializer_class(goal).data)

    @action(detail=True, methods=['post'])
    def pause(self, request, pk=None):
        goal = self.get_object()
        goal.status = 'paused'
        goal.last_updated = timezone.now()
        goal.save()
        return Response(self.serializer_class(goal).data)

    @action(detail=True, methods=['post'])
    def resume(self, request, pk=None):
        goal = self.get_object()
        goal.status = 'active'
        goal.last_updated = timezone.now()
        goal.save()
        return Response(self.serializer_class(goal).data)

    @action(detail=False, methods=['get'])
    def active(self, request):
        goals = self.get_queryset().filter(status__in=['active', 'in_progress'])
        return Response(self.serializer_class(goals, many=True).data)

    @action(detail=False, methods=['get'])
    def completed(self, request):
        goals = self.get_queryset().filter(status='completed')
        return Response(self.serializer_class(goals, many=True).data)

    @action(detail=False, methods=['get'])
    def progress_stats(self, request):
        timeframe = int(request.query_params.get('timeframe', '30'))
        start_date = timezone.now() - timedelta(days=timeframe)
        goals = self.get_queryset().filter(start_date__gte=start_date)

        stats = {
            'total_goals': goals.count(),
            'completed_goals': goals.filter(status='completed').count(),
            'active_goals': goals.filter(status='active').count(),
            'paused_goals': goals.filter(status='paused').count(),
            'abandoned_goals': goals.filter(status='abandoned').count(),
            'average_progress': goals.filter(status='active').aggregate(Avg('progress')),
            'by_type': goals.values('substance_type').annotate(
                count=Count('id'),
                completed=Count('id', filter=Q(status='completed')),
                avg_progress=Avg('progress')
            )
        }
        return Response(stats)
    



class AIInsightViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AIInsightSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AIInsight.objects.filter(
            user=self.request.user,
            expires_at__gt=timezone.now()
        ).order_by('-created_at')

    @action(detail=False, methods=['get'])
    def active_insights(self, request):
        insight_type = request.query_params.get('type')
        queryset = self.get_queryset()
        
        if insight_type:
            queryset = queryset.filter(type=insight_type)
        
        queryset = queryset.filter(actionable=True)
        return Response(self.serializer_class(queryset, many=True).data)

    @action(detail=False, methods=['get'])
    def by_goal(self, request):
        goal_id = request.query_params.get('goal_id')
        if not goal_id:
            return Response(
                {'error': 'goal_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        insights = self.get_queryset().filter(
            Q(related_goal_id=goal_id) | 
            Q(message__icontains=f'goal {goal_id}')
        )
        return Response(self.serializer_class(insights, many=True).data)

    @action(detail=False, methods=['get'])
    def recent_insights(self, request):
        days = int(request.query_params.get('days', '7'))
        start_date = timezone.now() - timedelta(days=days)
        
        insights = self.get_queryset().filter(
            created_at__gte=start_date
        ).order_by('-created_at')
        
        return Response(self.serializer_class(insights, many=True).data)
