from rest_framework import serializers
from .models import MangoCategory, Cart, CartItem, Order, OrderItem, Payment, UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['image_url', 'phone_number', 'additional_phone', 'billing_address', 'shipping_address']

class MangoCategorySerializer(serializers.ModelSerializer):
    image = serializers.ImageField(use_url=True)
    class Meta:
        model = MangoCategory
        fields = '__all__'

class CartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cart
        fields = '__all__'

class CartItemSerializer(serializers.ModelSerializer):
    mango_category = MangoCategorySerializer(source='mango', read_only=True)
    
    class Meta:
        model = CartItem
        fields = ['id', 'mango_category', 'quantity']

class OrderItemSerializer(serializers.ModelSerializer):
    mango_category = serializers.CharField(source='mango.name', read_only=True)
    mango_name = serializers.CharField(source='mango.name', read_only=True)
    mango_image = serializers.ImageField(source='mango.image', read_only=True, use_url=True)
    description = serializers.CharField(source='mango.description', read_only=True)
    subtotal = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = ['id', 'mango_category', 'mango_name', 'mango_image', 'description', 'quantity', 'price', 'subtotal']
    
    def get_subtotal(self, obj):
        return obj.quantity * obj.price

class OrderSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'user', 'user_name', 'user_email', 'total_amount', 'order_date', 'status', 
                 'billing_address', 'shipping_address', 'phone_number', 'additional_phone', 'payment_method']

class OrderWithItemsSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    items = OrderItemSerializer(source='orderitem_set', many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'user', 'user_name', 'user_email', 'total_amount', 'order_date', 'status', 
                 'billing_address', 'shipping_address', 'phone_number', 'additional_phone', 'payment_method', 'items']

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
