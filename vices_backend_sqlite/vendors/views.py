# vendors/views.py - Optimized version with caching and rate limiting
import requests
import json
import math
import hashlib
import time
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.conf import settings
from django.utils.decorators import method_decorator
from django.views import View
from django.db.models import Q
from django.core.cache import cache
from django.views.decorators.cache import cache_page
from geopy.distance import geodesic
from geopy.geocoders import Nominatim
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Vendor, VendorCategory, Product, Review
from deals.models import Deal
from .serializers import VendorSerializer, VendorCategorySerializer

import logging
logger = logging.getLogger(__name__)

class VendorViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing Vendors
    """
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'address', 'city']
    ordering_fields = ['name', 'rating', 'created_at']
    
    @action(detail=True, methods=['get'])
    def products(self, request, pk=None):
        vendor = self.get_object()
        products = Product.objects.filter(vendor=vendor)
        from .serializers import ProductSerializer
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def deals(self, request, pk=None):
        vendor = self.get_object()
        deals = Deal.objects.filter(vendor=vendor, is_active=True)
        from .serializers import DealSerializer
        serializer = DealSerializer(deals, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def reviews(self, request, pk=None):
        vendor = self.get_object()
        reviews = Review.objects.filter(vendor=vendor, is_approved=True)
        from .serializers import ReviewSerializer
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        category = request.query_params.get('category', None)
        if category is None:
            return Response({'error': 'Category parameter is required'}, status=400)
        
        vendors = Vendor.objects.filter(category__name=category)
        serializer = self.get_serializer(vendors, many=True)
        return Response(serializer.data)

class VendorCategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing Vendor Categories
    """
    queryset = VendorCategory.objects.all()
    serializer_class = VendorCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class VendorSearchView(View):
    """
    Search for vendors using Outscraper API with caching and rate limiting
    """
    
    # Rate limiting settings
    RATE_LIMIT_KEY = "outscraper_requests"
    MAX_REQUESTS_PER_MINUTE = 10
    CACHE_TIMEOUT = 300  # 5 minutes
    
    def get(self, request):
        """
        GET /api/vendors/search/?lat=51.0447&lng=-114.0719&radius=5000&category=both
        """
        try:
            # Get query parameters
            lat = float(request.GET.get('lat', 0))
            lng = float(request.GET.get('lng', 0))
            radius = int(request.GET.get('radius', 5000))  # meters
            category = request.GET.get('category', 'both')  # cannabis, alcohol, both
            
            if not lat or not lng:
                return JsonResponse({'error': 'Latitude and longitude required'}, status=400)
            
            # Check rate limiting
            if not self._check_rate_limit():
                logger.warning("Rate limit exceeded for Outscraper API")
                return self._get_cached_or_fallback_data(lat, lng, radius, category)
            
            # Generate cache key
            cache_key = self._generate_cache_key(lat, lng, radius, category)
            
            # Try to get from cache first
            cached_data = cache.get(cache_key)
            if cached_data:
                logger.info(f"Returning cached data for {cache_key}")
                return JsonResponse(cached_data, safe=False)
            
            # Convert radius from meters to kilometers for search
            radius_km = radius / 1000
            
            # Get vendors from multiple sources
            vendors_data = []
            
            # 1. Get existing vendors from database first (always available)
            db_vendors = self._get_database_vendors(lat, lng, radius_km, category)
            vendors_data.extend(db_vendors)
            
            # 2. Only call external APIs if we don't have enough local data
            if len(vendors_data) < 5:  # Only call API if we need more data
                # Get Cannabis Dispensaries
                if category in ['cannabis', 'both']:
                    cannabis_vendors = self._get_cannabis_dispensaries(lat, lng, radius_km)
                    vendors_data.extend(cannabis_vendors)
                
                # Get Liquor Stores
                if category in ['alcohol', 'both']:
                    alcohol_vendors = self._get_liquor_stores(lat, lng, radius_km)
                    vendors_data.extend(alcohol_vendors)
            
            # 3. Remove duplicates and sort by distance
            unique_vendors = self._deduplicate_vendors(vendors_data)
            sorted_vendors = self._sort_by_distance(unique_vendors, lat, lng)
            
            # 4. Add calculated distance display and limit results
            final_vendors = []
            for vendor in sorted_vendors[:50]:  # Limit to 50 results
                distance_km = vendor.get('distance_km', 0)
                if distance_km < 1:
                    vendor['distance'] = f"{int(distance_km * 1000)}m"
                else:
                    vendor['distance'] = f"{distance_km:.1f}km"
                final_vendors.append(vendor)
            
            # Cache the results
            cache.set(cache_key, final_vendors, self.CACHE_TIMEOUT)
            logger.info(f"Cached results for {cache_key}")
            
            return JsonResponse(final_vendors, safe=False)
            
        except ValueError as e:
            logger.error(f"Invalid coordinates: {str(e)}")
            return JsonResponse({'error': 'Invalid coordinates'}, status=400)
        except Exception as e:
            logger.error(f"Vendor search error: {str(e)}")
            return JsonResponse({'error': 'Search failed'}, status=500)
    
    def _check_rate_limit(self):
        """Check if we're within rate limits"""
        current_minute = int(time.time() / 60)
        rate_key = f"{self.RATE_LIMIT_KEY}:{current_minute}"
        
        current_count = cache.get(rate_key, 0)
        if current_count >= self.MAX_REQUESTS_PER_MINUTE:
            return False
        
        # Increment counter
        cache.set(rate_key, current_count + 1, 60)  # Expire after 1 minute
        return True
    
    def _generate_cache_key(self, lat, lng, radius, category):
        """Generate a cache key for the request"""
        # Round coordinates to reduce cache key variations
        lat_rounded = round(lat, 3)
        lng_rounded = round(lng, 3)
        radius_rounded = round(radius / 1000, 1)  # Convert to km and round
        
        key_string = f"vendors:{lat_rounded}:{lng_rounded}:{radius_rounded}:{category}"
        return hashlib.md5(key_string.encode()).hexdigest()
    
    def _get_cached_or_fallback_data(self, lat, lng, radius_km, category):
        """Get cached data or fallback to database/sample data"""
        # Try to find any cached data for nearby locations
        cache_key = self._generate_cache_key(lat, lng, radius_km * 1000, category)
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return JsonResponse(cached_data, safe=False)
        
        # Fallback to database vendors
        db_vendors = self._get_database_vendors(lat, lng, radius_km, category)
        
        if db_vendors:
            return JsonResponse(db_vendors, safe=False)
        
        # Final fallback to sample data
        sample_vendors = []
        if category in ['cannabis', 'both']:
            sample_vendors.extend(self._get_sample_cannabis_vendors(lat, lng))
        if category in ['alcohol', 'both']:
            sample_vendors.extend(self._get_sample_alcohol_vendors(lat, lng))
        
        return JsonResponse(sample_vendors, safe=False)
    
    def _get_cannabis_dispensaries(self, lat, lng, radius_km):
        """
        Get cannabis dispensaries using Outscraper API with optimization
        """
        try:
            if not hasattr(settings, 'OUTSCRAPER_API_KEY') or not settings.OUTSCRAPER_API_KEY:
                logger.warning("Outscraper API key not configured, using fallback data")
                return self._get_sample_cannabis_vendors(lat, lng)
            
            # Outscraper Google Maps API
            url = "https://api.outscraper.com/maps/search-v3"
            headers = {
                'X-API-KEY': settings.OUTSCRAPER_API_KEY,
                'Content-Type': 'application/json'
            }
            
            # Use only ONE optimized query instead of multiple
            query = f"cannabis dispensary near {lat},{lng}"
            
            params = {
                'query': query,
                'limit': 15,  # Reduced from 20
                'language': 'en',
                'region': 'CA',  # Canada
                'coordinates': f"{lat},{lng}",
                'radius': int(radius_km * 1000)  # Convert back to meters for API
            }
            
            try:
                response = requests.get(url, params=params, headers=headers, timeout=10)  # Reduced timeout
                
                if response.status_code == 200:
                    data = response.json()
                    vendors = self._parse_outscraper_results(data, 'cannabis')
                    logger.info(f"Successfully fetched {len(vendors)} cannabis vendors from Outscraper")
                    return vendors
                elif response.status_code == 202:
                    logger.info("Outscraper request queued (202), using fallback data")
                    return self._get_sample_cannabis_vendors(lat, lng)
                elif response.status_code == 429:
                    logger.warning("Outscraper rate limit reached")
                    return self._get_sample_cannabis_vendors(lat, lng)
                else:
                    logger.warning(f"Outscraper API error: {response.status_code}")
                    return self._get_sample_cannabis_vendors(lat, lng)
                    
            except requests.RequestException as e:
                logger.error(f"Request error for cannabis dispensaries: {str(e)}")
                return self._get_sample_cannabis_vendors(lat, lng)
            
        except Exception as e:
            logger.error(f"Cannabis dispensary search error: {str(e)}")
            return self._get_sample_cannabis_vendors(lat, lng)
    
    def _get_liquor_stores(self, lat, lng, radius_km):
        """
        Get liquor stores using Outscraper API with optimization
        """
        try:
            if not hasattr(settings, 'OUTSCRAPER_API_KEY') or not settings.OUTSCRAPER_API_KEY:
                logger.warning("Outscraper API key not configured, using fallback data")
                return self._get_sample_alcohol_vendors(lat, lng)
            
            url = "https://api.outscraper.com/maps/search-v3"
            headers = {
                'X-API-KEY': settings.OUTSCRAPER_API_KEY,
                'Content-Type': 'application/json'
            }
            
            # Use only ONE optimized query instead of multiple
            query = f"liquor store near {lat},{lng}"
            
            params = {
                'query': query,
                'limit': 15,  # Reduced from 20
                'language': 'en',
                'region': 'CA',  # Canada
                'coordinates': f"{lat},{lng}",
                'radius': int(radius_km * 1000)  # Convert back to meters for API
            }
            
            try:
                response = requests.get(url, params=params, headers=headers, timeout=10)  # Reduced timeout
                
                if response.status_code == 200:
                    data = response.json()
                    vendors = self._parse_outscraper_results(data, 'alcohol')
                    logger.info(f"Successfully fetched {len(vendors)} alcohol vendors from Outscraper")
                    return vendors
                elif response.status_code == 202:
                    logger.info("Outscraper request queued (202), using fallback data")
                    return self._get_sample_alcohol_vendors(lat, lng)
                elif response.status_code == 429:
                    logger.warning("Outscraper rate limit reached")
                    return self._get_sample_alcohol_vendors(lat, lng)
                else:
                    logger.warning(f"Outscraper API error: {response.status_code}")
                    return self._get_sample_alcohol_vendors(lat, lng)
                    
            except requests.RequestException as e:
                logger.error(f"Request error for liquor stores: {str(e)}")
                return self._get_sample_alcohol_vendors(lat, lng)
            
        except Exception as e:
            logger.error(f"Liquor store search error: {str(e)}")
            return self._get_sample_alcohol_vendors(lat, lng)
    
    def _parse_outscraper_results(self, data, vendor_type):
        """
        Parse Outscraper API results into vendor format
        """
        vendors = []
        
        try:
            # Outscraper returns data in different formats, handle both
            results = data.get('data', []) if isinstance(data, dict) else data
            
            for result in results:
                # Handle nested structure
                places = result if isinstance(result, list) else [result]
                
                for place in places:
                    if not isinstance(place, dict):
                        continue
                        
                    # Extract coordinates
                    latitude = place.get('latitude') or place.get('lat')
                    longitude = place.get('longitude') or place.get('lng')
                    
                    if not latitude or not longitude:
                        continue
                    
                    # Extract phone number
                    phone = place.get('phone') or place.get('phone_number', '')
                    if phone and not phone.startswith('+'):
                        # Format Canadian phone numbers
                        phone = phone.replace('(', '').replace(')', '').replace('-', '').replace(' ', '')
                        if len(phone) == 10:
                            phone = f"+1{phone}"
                    
                    # Extract rating
                    rating = place.get('rating') or place.get('stars', 0)
                    try:
                        rating = float(rating) if rating else 0
                    except (ValueError, TypeError):
                        rating = 0
                    
                    # Extract review count
                    reviews_count = place.get('reviews_count') or place.get('reviews', 0)
                    try:
                        reviews_count = int(reviews_count) if reviews_count else 0
                    except (ValueError, TypeError):
                        reviews_count = 0
                    
                    # Extract hours
                    hours = place.get('hours') or place.get('working_hours', {})
                    hours_text = ''
                    if isinstance(hours, dict):
                        # Convert hours dict to text
                        current_day = list(hours.keys())[0] if hours else 'Monday'
                        hours_text = hours.get(current_day, '')
                    elif isinstance(hours, str):
                        hours_text = hours
                    
                    # Create vendor object
                    vendor = {
                        'id': place.get('place_id') or f"outscraper_{place.get('name', '').replace(' ', '_').lower()}_{latitude}_{longitude}",
                        'name': place.get('name', '').strip(),
                        'full_address': place.get('full_address') or place.get('address', ''),
                        'phone': phone,
                        'rating': rating,
                        'working_hours_old_format': hours_text,
                        'latitude': float(latitude),
                        'longitude': float(longitude),
                        'category': 'Cannabis' if vendor_type == 'cannabis' else 'Alcohol',
                        'verified': False,
                        'source': 'outscraper',
                        'website': place.get('website', ''),
                        'google_id': place.get('place_id', ''),
                        'place_id': place.get('place_id', ''),
                        'reviews': reviews_count,
                        'photo': place.get('photo') or place.get('image', ''),
                        'working_hours': hours if isinstance(hours, dict) else None
                    }
                    
                    # Only add if name exists and coordinates are valid
                    if vendor['name'] and -90 <= vendor['latitude'] <= 90 and -180 <= vendor['longitude'] <= 180:
                        vendors.append(vendor)
            
        except Exception as e:
            logger.error(f"Error parsing Outscraper results: {str(e)}")
        
        return vendors
    
    def _get_database_vendors(self, lat, lng, radius_km, category):
        """
        Get verified vendors from database
        """
        try:
            # Filter by category if specified
            queryset = Vendor.objects.filter(is_active=True)
            if category == 'cannabis':
                queryset = queryset.filter(category__name='cannabis')
            elif category == 'alcohol':
                queryset = queryset.filter(category__name='alcohol')
            
            # Filter by distance (approximate using lat/lng bounds)
            lat_delta = radius_km / 111.0  # Rough conversion km to degrees
            lng_delta = radius_km / (111.0 * abs(math.cos(math.radians(lat))))
            
            vendors = queryset.filter(
                latitude__range=[lat - lat_delta, lat + lat_delta],
                longitude__range=[lng - lng_delta, lng + lng_delta]
            )
            
            vendor_list = []
            for vendor in vendors:
                # Calculate exact distance
                distance = self._calculate_distance_km(
                    (lat, lng), 
                    (float(vendor.latitude), float(vendor.longitude))
                )
                
                if distance <= radius_km:
                    vendor_data = {
                        'id': str(vendor.id),
                        'name': vendor.name,
                        'full_address': vendor.address,
                        'phone': vendor.phone,
                        'rating': float(vendor.rating) if vendor.rating else 0,
                        'working_hours_old_format': vendor.hours_monday,  # Simplified
                        'latitude': float(vendor.latitude),
                        'longitude': float(vendor.longitude),
                        'category': vendor.category.get_name_display(),
                        'verified': vendor.is_verified,
                        'source': 'database',
                        'website': vendor.website,
                        'google_id': vendor.google_place_id,
                        'place_id': vendor.google_place_id,
                        'reviews': vendor.review_count,
                        'photo': '',  # Add photo field to model if needed
                        'working_hours': {
                            'Monday': vendor.hours_monday,
                            'Tuesday': vendor.hours_tuesday,
                            'Wednesday': vendor.hours_wednesday,
                            'Thursday': vendor.hours_thursday,
                            'Friday': vendor.hours_friday,
                            'Saturday': vendor.hours_saturday,
                            'Sunday': vendor.hours_sunday,
                        }
                    }
                    vendor_list.append(vendor_data)
            
            return vendor_list
            
        except Exception as e:
            logger.error(f"Database vendor error: {str(e)}")
            return []
    
    def _get_sample_cannabis_vendors(self, lat, lng):
        """
        Sample cannabis vendors for development/fallback
        """
        return [
            {
                'id': 'sample_cannabis_1',
                'name': 'Green Valley Cannabis Co.',
                'full_address': '123 Cannabis St, Calgary, AB T2G 1A6',
                'phone': '+14035550123',
                'rating': 4.5,
                'working_hours_old_format': 'Open until 10:00 PM',
                'latitude': lat + 0.01,
                'longitude': lng + 0.01,
                'category': 'Cannabis',
                'verified': False,
                'source': 'sample',
                'website': 'https://greenvalley.ca',
                'google_id': 'sample_cannabis_1',
                'place_id': 'sample_cannabis_1',
                'reviews': 150,
                'photo': '',
                'working_hours': {
                    'Monday': '9:00 AM - 10:00 PM',
                    'Tuesday': '9:00 AM - 10:00 PM',
                    'Wednesday': '9:00 AM - 10:00 PM',
                    'Thursday': '9:00 AM - 10:00 PM',
                    'Friday': '9:00 AM - 11:00 PM',
                    'Saturday': '9:00 AM - 11:00 PM',
                    'Sunday': '10:00 AM - 9:00 PM',
                }
            },
            {
                'id': 'sample_cannabis_2',
                'name': 'Mountain High Cannabis',
                'full_address': '456 Hemp Ave, Calgary, AB T2S 0B2',
                'phone': '+14035550456',
                'rating': 4.2,
                'working_hours_old_format': 'Open until 11:00 PM',
                'latitude': lat - 0.02,
                'longitude': lng + 0.015,
                'category': 'Cannabis',
                'verified': True,
                'source': 'sample',
                'website': 'https://mountainhigh.ca',
                'google_id': 'sample_cannabis_2',
                'place_id': 'sample_cannabis_2',
                'reviews': 200,
                'photo': '',
                'working_hours': {
                    'Monday': '8:00 AM - 11:00 PM',
                    'Tuesday': '8:00 AM - 11:00 PM',
                    'Wednesday': '8:00 AM - 11:00 PM',
                    'Thursday': '8:00 AM - 11:00 PM',
                    'Friday': '8:00 AM - 12:00 AM',
                    'Saturday': '8:00 AM - 12:00 AM',
                    'Sunday': '10:00 AM - 10:00 PM',
                }
            }
        ]
    
    def _get_sample_alcohol_vendors(self, lat, lng):
        """
        Sample alcohol vendors for development/fallback
        """
        return [
            {
                'id': 'sample_alcohol_1',
                'name': 'Calgary Liquor Depot',
                'full_address': '789 Booze Blvd, Calgary, AB T2P 1H7',
                'phone': '+14035550789',
                'rating': 4.3,
                'working_hours_old_format': 'Open until 12:00 AM',
                'latitude': lat + 0.005,
                'longitude': lng - 0.008,
                'category': 'Alcohol',
                'verified': False,
                'source': 'sample',
                'website': 'https://calgaryliquor.ca',
                'google_id': 'sample_alcohol_1',
                'place_id': 'sample_alcohol_1',
                'reviews': 180,
                'photo': '',
                'working_hours': {
                    'Monday': '10:00 AM - 12:00 AM',
                    'Tuesday': '10:00 AM - 12:00 AM',
                    'Wednesday': '10:00 AM - 12:00 AM',
                    'Thursday': '10:00 AM - 12:00 AM',
                    'Friday': '10:00 AM - 2:00 AM',
                    'Saturday': '10:00 AM - 2:00 AM',
                    'Sunday': '11:00 AM - 11:00 PM',
                }
            },
            {
                'id': 'sample_alcohol_2',
                'name': 'Premium Wine & Spirits',
                'full_address': '321 Vine Street, Calgary, AB T2R 0X8',
                'phone': '+14035550321',
                'rating': 4.6,
                'working_hours_old_format': 'Open until 11:00 PM',
                'latitude': lat - 0.008,
                'longitude': lng + 0.012,
                'category': 'Alcohol',
                'verified': True,
                'source': 'sample',
                'website': 'https://premiumwine.ca',
                'google_id': 'sample_alcohol_2',
                'place_id': 'sample_alcohol_2',
                'reviews': 95,
                'photo': '',
                'working_hours': {
                    'Monday': '9:00 AM - 11:00 PM',
                    'Tuesday': '9:00 AM - 11:00 PM',
                    'Wednesday': '9:00 AM - 11:00 PM',
                    'Thursday': '9:00 AM - 11:00 PM',
                    'Friday': '9:00 AM - 1:00 AM',
                    'Saturday': '9:00 AM - 1:00 AM',
                    'Sunday': '10:00 AM - 10:00 PM',
                }
            }
        ]
    
    def _calculate_distance_km(self, coord1, coord2):
        """
        Calculate distance between two coordinates in kilometers
        """
        return geodesic(coord1, coord2).kilometers
    
    def _deduplicate_vendors(self, vendors):
        """
        Remove duplicate vendors based on name and coordinates similarity
        """
        unique_vendors = []
        seen = set()
        
        for vendor in vendors:
            # Create identifier based on name and coordinates (rounded to avoid slight differences)
            name = vendor['name'].lower().strip()
            lat_rounded = round(vendor['latitude'], 4)
            lng_rounded = round(vendor['longitude'], 4)
            identifier = f"{name}_{lat_rounded}_{lng_rounded}"
            
            if identifier not in seen:
                seen.add(identifier)
                unique_vendors.append(vendor)
        
        return unique_vendors
    
    def _sort_by_distance(self, vendors, lat, lng):
        """
        Sort vendors by distance from user location
        """
        for vendor in vendors:
            distance = self._calculate_distance_km(
                (lat, lng),
                (vendor['latitude'], vendor['longitude'])
            )
            vendor['distance_km'] = distance
        
        return sorted(vendors, key=lambda x: x.get('distance_km', 999))


class NearbyVendorsView(View):
    """
    Get nearby vendors with default settings and caching
    """
    
    def get(self, request):
        """
        GET /api/vendors/nearby/?lat=51.0447&lng=-114.0719&category=both
        """
        try:
            lat = float(request.GET.get('lat', 0))
            lng = float(request.GET.get('lng', 0))
            category = request.GET.get('category', 'both')
            
            if not lat or not lng:
                return JsonResponse({'error': 'Location required'}, status=400)
            
            # Use default 5km radius for nearby search
            radius = 5000  # meters
            
            # Redirect to search view with parameters
            search_view = VendorSearchView()
            
            # Create a new request with the proper parameters
            from django.http import QueryDict
            new_get = QueryDict(mutable=True)
            new_get.update({
                'lat': lat,
                'lng': lng,
                'radius': radius,
                'category': category
            })
            
            # Create a copy of the request with new GET parameters
            new_request = request
            new_request.GET = new_get
            
            return search_view.get(new_request)
            
        except Exception as e:
            logger.error(f"Nearby vendors error: {str(e)}")
            return JsonResponse({'error': 'Failed to get nearby vendors'}, status=500)


def get_city_from_coordinates(lat, lng):
    """
    Get city name from coordinates using reverse geocoding
    """
    try:
        geolocator = Nominatim(user_agent="vices_app")
        location = geolocator.reverse(f"{lat}, {lng}")
        
        if location and location.address:
            # Extract city from address
            address_parts = location.address.split(', ')
            for part in address_parts:
                if any(keyword in part.lower() for keyword in ['calgary', 'edmonton', 'vancouver', 'toronto']):
                    return part
        
        return "Unknown City"
    except:
        return "Unknown City"