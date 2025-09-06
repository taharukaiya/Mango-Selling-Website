from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import MangoCategory, CartItem, Order, Payment
from .serializers import MangoCategorySerializer, CartItemSerializer, OrderSerializer, PaymentSerializer

class MangoCategoryViewSet(viewsets.ModelViewSet):
    queryset = MangoCategory.objects.all()
    serializer_class = MangoCategorySerializer

class CartItemViewSet(viewsets.ModelViewSet):
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer

