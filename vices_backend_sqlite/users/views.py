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
from rest_framework.authtoken.models import Token  # ✅ ADD THIS IMPORT
from .models import PasswordResetCode
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
import random
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
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
            })
        return Response({'error': 'Not authenticated'}, status=401)

    @action(detail=False, methods=['put'], url_path='profile')
    def update_profile(self, request):
        # Update current user's first and last name
        if not request.user.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=401)
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        if not first_name and not last_name:
            return Response({'error': 'No data to update'}, status=400)
        if first_name:
            request.user.first_name = first_name
        if last_name:
            request.user.last_name = last_name
        request.user.save()
        return Response({
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
        })

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
            
            # ✅ CREATE TOKEN FOR NEW USER
            token, created = Token.objects.get_or_create(user=user)
            
        return Response({
            'message': 'User created successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name
            },
            'token': token.key  # ✅ RETURN REAL TOKEN
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    try:
        # Parse data from request
        data = json.loads(request.body) if isinstance(request.body, bytes) else request.data
        print(f"Login attempt data: {data}")  # Debug print
        
        email = data.get('email')
        password = data.get('password')
        
        # Validate required fields
        if not email or not password:
            return Response(
                {'error': 'Email and password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Authenticate user
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            print(f"No user found with email: {email}")  # Debug print
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not user.check_password(password):
            print(f"Invalid password for user: {email}")  # Debug print
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # ✅ CREATE OR GET TOKEN FOR USER
        token, created = Token.objects.get_or_create(user=user)
        
        # Login successful
        print(f"Successful login for user: {email}")  # Debug print
        return Response({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'username': user.username
            },
            'token': token.key  # ✅ RETURN REAL TOKEN
        }, status=status.HTTP_200_OK)
        
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {str(e)}")  # Debug print
        return Response(
            {'error': 'Invalid JSON data'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        print(f"Login error: {str(e)}")  # Debug print
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@csrf_exempt
@api_view(['POST'])
def request_password_change(request):
    user = request.user
    if not user.is_authenticated:
        return Response({'error': 'Not authenticated'}, status=401)
    # Invalidate old codes
    PasswordResetCode.objects.filter(user=user, is_used=False).update(is_used=True)
    code = str(random.randint(100000, 999999))
    PasswordResetCode.objects.create(user=user, code=code)
    send_mail(
        'Your Password Change Code',
        f'Your code is: {code}',
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )
    return Response({'message': 'Verification code sent to your email.'})

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def confirm_password_change(request):
    code = request.data.get('code')
    new_password = request.data.get('new_password')
    email = request.data.get('email')

    if email:
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Invalid email or code.'}, status=400)
    else:
        user = request.user
        if not user.is_authenticated:
            return Response({'error': 'Not authenticated.'}, status=401)

    try:
        reset_code = PasswordResetCode.objects.get(user=user, code=code, is_used=False)
    except PasswordResetCode.DoesNotExist:
        return Response({'error': 'Invalid or expired code.'}, status=400)
    if reset_code.is_expired():
        reset_code.is_used = True
        reset_code.save()
        return Response({'error': 'Code expired.'}, status=400)
    user.set_password(new_password)
    user.save()
    reset_code.is_used = True
    reset_code.save()
    return Response({'message': 'Password changed successfully.'})

@api_view(['POST'])
@permission_classes([AllowAny])
def public_request_password_reset(request):
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email is required.'}, status=400)
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # For security, don't reveal if user exists
        return Response({'message': 'If this email exists, a code has been sent.'})
    # Invalidate old codes
    PasswordResetCode.objects.filter(user=user, is_used=False).update(is_used=True)
    code = str(random.randint(100000, 999999))
    PasswordResetCode.objects.create(user=user, code=code)
    send_mail(
        'Your Password Reset Code',
        f'Your code is: {code}',
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )
    return Response({'message': 'If this email exists, a code has been sent.'})