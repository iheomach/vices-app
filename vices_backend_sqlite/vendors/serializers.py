# vendors/serializers.py
from rest_framework import serializers
from .models import Vendor, VendorCategory, Product, Review
from deals.models import Deal


class VendorCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorCategory
        fields = ['name', 'description', 'icon']


class VendorSerializer(serializers.ModelSerializer):
    category = VendorCategorySerializer(read_only=True)
    distance = serializers.SerializerMethodField()
    
    class Meta:
        model = Vendor
        fields = [
            'id', 'name', 'category', 'description', 'phone', 'email', 'website',
            'address', 'city', 'province', 'postal_code', 'latitude', 'longitude',
            'hours_monday', 'hours_tuesday', 'hours_wednesday', 'hours_thursday',
            'hours_friday', 'hours_saturday', 'hours_sunday',
            'rating', 'review_count', 'google_place_id', 'google_rating',
            'google_review_count', 'is_featured', 'is_verified', 'distance'
        ]
    
    def get_distance(self, obj):
        # Distance will be calculated and added in the view
        return getattr(obj, 'distance', '')


class ProductSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    is_on_sale = serializers.BooleanField(read_only=True)
    discount_percentage = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'vendor_name', 'name', 'product_type', 'description', 'brand',
            'regular_price', 'current_price', 'size', 'thc_content', 'cbd_content',
            'alcohol_content', 'in_stock', 'stock_quantity', 'sku', 'image_url',
            'is_on_sale', 'discount_percentage'
        ]


class DealSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    is_valid = serializers.BooleanField(read_only=True)
    discount_display = serializers.CharField(read_only=True)
    
    class Meta:
        model = Deal
        fields = [
            'id', 'vendor_name', 'product_name', 'title', 'description', 'deal_type',
            'discount_value', 'original_price', 'sale_price', 'start_date', 'end_date',
            'is_active', 'minimum_purchase', 'max_uses', 'current_uses',
            'is_valid', 'discount_display'
        ]


class ReviewSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    
    class Meta:
        model = Review
        fields = [
            'id', 'vendor_name', 'rating', 'title', 'content', 'reviewer_name',
            'is_verified', 'created_at'
        ]