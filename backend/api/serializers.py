from rest_framework import serializers
from .models import MangoCategory, CartItem, Order, Payment

class MangoCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MangoCategory
        fields = '__all__'

class CartItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
