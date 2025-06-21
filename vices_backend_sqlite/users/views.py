from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.contrib.auth.hashers import make_password
from django.db import transaction
from django.views.decorators.csrf import csrf_exempt
import json

User = get_user_model()

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    
    @action(detail=False, methods=['get'])
    def profile(self, request):
        # Return current user's profile
        if request.user.is_authenticated:
            return Response({
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
            })
        return Response({'error': 'Not authenticated'}, status=401)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    try:
        data = json.loads(request.body) if isinstance(request.body, bytes) else request.data
        
        # Validate required fields
        required_fields = ['firstName', 'lastName', 'email', 'phone', 'password', 'location']
        for field in required_fields:
            if not data.get(field):
                return Response({'error': f'{field} is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user already exists
        if User.objects.filter(email=data['email']).exists():
            return Response({'error': 'User with this email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create user
        with transaction.atomic():
            user = User.objects.create(
                username=data['email'],  # Use email as username
                email=data['email'],
                first_name=data['firstName'],
                last_name=data['lastName'],
                phone=data['phone'],
                password=make_password(data['password']),
            )
            
        return Response({
            'message': 'User created successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    try:
        data = json.loads(request.body) if isinstance(request.body, bytes) else request.data
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Authenticate user
        user = User.objects.filter(email=data['email']).first()
        if user and user.check_password(data['password']):
            return Response({
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                }
            }, status=status.HTTP_200_OK)
        
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)