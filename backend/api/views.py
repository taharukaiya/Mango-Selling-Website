from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.authtoken.views import ObtainAuthToken

from .models import MangoCategory, Cart, CartItem, Order, OrderItem, Payment, UserProfile, CategoryFeedback
from .serializers import MangoCategorySerializer, CartItemSerializer, OrderSerializer, OrderWithItemsSerializer, PaymentSerializer, UserProfileSerializer, CategoryFeedbackSerializer

class MangoCategoryViewSet(viewsets.ModelViewSet):
    queryset = MangoCategory.objects.all()
    serializer_class = MangoCategorySerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [AllowAny()]

class CartItemViewSet(viewsets.ModelViewSet):
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CartItem.objects.filter(cart__user=self.request.user)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'update', 'partial_update']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

# User Registration API
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    if not username or not password:
        return Response({'error': 'Username and password required.'}, status=400)
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists.'}, status=400)
    user = User.objects.create_user(username=username, password=password, email=email)
    token, created = Token.objects.get_or_create(user=user)
    return Response({'token': token.key, 'username': user.username, 'email': user.email})

# User Login API (returns token)

from django.contrib.auth import authenticate

class CustomAuthToken(ObtainAuthToken):
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        username = request.data.get('username')
        password = request.data.get('password')
        user = None
        if email:
            try:
                user_obj = User.objects.get(email=email)
                username = user_obj.username
                user = authenticate(request, username=username, password=password)
            except User.DoesNotExist:
                return Response({'error': 'Invalid email or password.'}, status=400)
        elif username:
            user = authenticate(request, username=username, password=password)
        else:
            return Response({'error': 'Email or username required.'}, status=400)
        if user is not None:
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'username': user.username, 'email': user.email})
        else:
            return Response({'error': 'Invalid credentials.'}, status=400)

# User profile endpoint
@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user
    
    if request.method == 'GET':
        # Get or create user profile (eita onek koshte thik korsi, kew kichu koirona r)
        profile, created = UserProfile.objects.get_or_create(user=user)
        profile_data = UserProfileSerializer(profile).data
        
        return Response({
            'username': user.username,
            'email': user.email,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'profile': profile_data
        })
    
    elif request.method in ['PUT', 'PATCH']:
        # Update user profile
        profile, created = UserProfile.objects.get_or_create(user=user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Profile updated successfully',
                'profile': serializer.data
            })
        return Response(serializer.errors, status=400)

# Add to cart endpoint
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    mango_id = request.data.get('mango_id')
    quantity = request.data.get('quantity', 1)
    
    if not mango_id:
        return Response({'error': 'Mango ID is required'}, status=400)
    
    try:
        mango = MangoCategory.objects.get(id=mango_id)
    except MangoCategory.DoesNotExist:
        return Response({'error': 'Mango not found'}, status=404)
    
    # Get or create cart for user
    cart, created = Cart.objects.get_or_create(user=request.user)
    
    # Check if item already exists in cart
    cart_item, created = CartItem.objects.get_or_create(
        cart=cart,
        mango=mango,
        defaults={'quantity': quantity}
    )
    
    if not created:
        # If item exists, update quantity
        cart_item.quantity += int(quantity)
        cart_item.save()
    
    return Response({
        'message': 'Item added to cart successfully',
        'cart_item_id': cart_item.id,
        'quantity': cart_item.quantity
    })

# Get cart items endpoint
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart_items(request):
    try:
        cart = Cart.objects.get(user=request.user)
        cart_items = CartItem.objects.filter(cart=cart).select_related('mango')
        serializer = CartItemSerializer(cart_items, many=True)
        return Response(serializer.data)
    except Cart.DoesNotExist:
        return Response([])

# Create order endpoint
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    try:
        cart = Cart.objects.get(user=request.user)
        cart_items = CartItem.objects.filter(cart=cart)
        
        if not cart_items.exists():
            return Response({'error': 'Cart is empty'}, status=400)
        
        # Calculate total amount
        total_amount = sum(item.mango.price * item.quantity for item in cart_items)
        
        # Get order data from request
        order_data = {
            'user': request.user,
            'total_amount': total_amount,
            'phone_number': request.data.get('phone_number'),
            'additional_phone': request.data.get('additional_phone', ''),
            'billing_address': request.data.get('billing_address'),
            'shipping_address': request.data.get('shipping_address'),
            'payment_method': request.data.get('payment_method', 'cash_on_delivery'),
        }
        
        # Validate required fields
        if not order_data['phone_number'] or not order_data['billing_address'] or not order_data['shipping_address']:
            return Response({'error': 'Phone number, billing address, and shipping address are required'}, status=400)
        
        # Create order
        order = Order.objects.create(**order_data)
        
        # Create order items
        for cart_item in cart_items:
            OrderItem.objects.create(
                order=order,
                mango=cart_item.mango,
                quantity=cart_item.quantity,
                price=cart_item.mango.price
            )
        
        # Clear cart
        cart_items.delete()
        
        return Response({
            'message': 'Order created successfully',
            'order_id': order.id,
            'total_amount': str(total_amount)
        })
        
    except Cart.DoesNotExist:
        return Response({'error': 'Cart not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

# Get user orders endpoint
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_orders(request):
    orders = Order.objects.filter(user=request.user).order_by('-order_date')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

# Get user orders with items endpoint
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_orders_with_items(request):
    orders = Order.objects.filter(user=request.user).order_by('-order_date').select_related('user').prefetch_related('orderitem_set__mango')
    serializer = OrderWithItemsSerializer(orders, many=True)
    return Response(serializer.data)

# Update cart item quantity endpoint
@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_cart_item(request, item_id):
    try:
        cart = Cart.objects.get(user=request.user)
        cart_item = CartItem.objects.get(id=item_id, cart=cart)
        
        quantity = request.data.get('quantity')
        if quantity is None:
            return Response({'error': 'Quantity is required'}, status=400)
        
        quantity = int(quantity)
        if quantity <= 0:
            return Response({'error': 'Quantity must be greater than 0'}, status=400)
        
        if quantity > cart_item.mango.stock_quantity:
            return Response({'error': f'Only {cart_item.mango.stock_quantity} kg available in stock'}, status=400)
        
        cart_item.quantity = quantity
        cart_item.save()
        
        serializer = CartItemSerializer(cart_item)
        return Response({
            'message': 'Cart item updated successfully',
            'cart_item': serializer.data
        })
        
    except Cart.DoesNotExist:
        return Response({'error': 'Cart not found'}, status=404)
    except CartItem.DoesNotExist:
        return Response({'error': 'Cart item not found'}, status=404)
    except ValueError:
        return Response({'error': 'Invalid quantity value'}, status=400)

# Delete cart item endpoint
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_cart_item(request, item_id):
    try:
        cart = Cart.objects.get(user=request.user)
        cart_item = CartItem.objects.get(id=item_id, cart=cart)
        cart_item.delete()
        
        return Response({'message': 'Cart item deleted successfully'})
        
    except Cart.DoesNotExist:
        return Response({'error': 'Cart not found'}, status=404)
    except CartItem.DoesNotExist:
        return Response({'error': 'Cart item not found'}, status=404)

# Get order details with items
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_order_details(request, order_id):
    try:
        # For regular users, only allow access to their own orders
        if not request.user.is_staff:
            order = Order.objects.get(id=order_id, user=request.user)
        else:
            # Admin can access any order
            order = Order.objects.get(id=order_id)
        
        serializer = OrderWithItemsSerializer(order)
        return Response(serializer.data)
        
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=404)

# Get all orders (admin only) with detailed information
@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_all_orders_with_details(request):
    orders = Order.objects.all().order_by('-order_date').select_related('user').prefetch_related('orderitem_set__mango')
    serializer = OrderWithItemsSerializer(orders, many=True)
    return Response(serializer.data)


# Submit or update feedback for a specific order item (mango category in an order)
@api_view(['POST', 'PUT'])
@permission_classes([IsAuthenticated])
def submit_category_feedback(request, order_item_id):
    try:
        # Get the order item and ensure it belongs to the user's order
        order_item = OrderItem.objects.select_related('order', 'mango').get(id=order_item_id)
        
        # Ensure the order belongs to the user
        if order_item.order.user != request.user:
            return Response({
                'error': 'You do not have permission to give feedback for this item'
            }, status=403)
        
        # Check if order is delivered
        if order_item.order.status.lower() != 'delivered':
            return Response({
                'error': 'Feedback can only be submitted for delivered orders'
            }, status=400)
        
        # Validate rating first
        rating = request.data.get('rating')
        if not rating or not (1 <= int(rating) <= 5):
            return Response({
                'error': 'Rating must be between 1 and 5'
            }, status=400)
        
        # Check if feedback already exists
        try:
            feedback = CategoryFeedback.objects.get(order_item=order_item, user=request.user)
            created = False
        except CategoryFeedback.DoesNotExist:
            # Create new feedback with rating
            feedback = CategoryFeedback(
                order_item=order_item,
                user=request.user,
                mango_category=order_item.mango,
                rating=rating
            )
            created = True
        
        # Update feedback
        feedback.rating = rating
        feedback.comment = request.data.get('comment', '')
        feedback.save()
        
        serializer = CategoryFeedbackSerializer(feedback)
        
        return Response({
            'message': 'Feedback submitted successfully' if created else 'Feedback updated successfully',
            'feedback': serializer.data
        })
        
    except OrderItem.DoesNotExist:
        return Response({'error': 'Order item not found'}, status=404)
    except ValueError:
        return Response({'error': 'Invalid rating value'}, status=400)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


# Get feedback for a specific order item
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_category_feedback(request, order_item_id):
    try:
        # Get the order item
        order_item = OrderItem.objects.select_related('order').get(id=order_item_id)
        
        # For regular users, only allow access to their own orders
        if not request.user.is_staff and order_item.order.user != request.user:
            return Response({'error': 'Permission denied'}, status=403)
        
        try:
            feedback = CategoryFeedback.objects.get(order_item=order_item)
            serializer = CategoryFeedbackSerializer(feedback)
            return Response(serializer.data)
        except CategoryFeedback.DoesNotExist:
            return Response({'message': 'No feedback submitted yet'}, status=404)
        
    except OrderItem.DoesNotExist:
        return Response({'error': 'Order item not found'}, status=404)


# Get all feedbacks for a specific mango category (for display on category page)
@api_view(['GET'])
@permission_classes([AllowAny])
def get_mango_category_feedbacks(request, mango_id):
    try:
        mango = MangoCategory.objects.get(id=mango_id)
        feedbacks = CategoryFeedback.objects.filter(mango_category=mango).select_related('user').order_by('-created_at')
        serializer = CategoryFeedbackSerializer(feedbacks, many=True)
        
        # Calculate statistics
        if feedbacks:
            ratings = [f.rating for f in feedbacks]
            avg_rating = round(sum(ratings) / len(ratings), 1)
        else:
            avg_rating = 0
        
        return Response({
            'feedbacks': serializer.data,
            'average_rating': avg_rating,
            'total_ratings': feedbacks.count()
        })
        
    except MangoCategory.DoesNotExist:
        return Response({'error': 'Mango category not found'}, status=404)


# Get all feedbacks (admin only)
@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_all_feedbacks(request):
    feedbacks = CategoryFeedback.objects.all().select_related('user', 'mango_category', 'order_item__order').order_by('-created_at')
    serializer = CategoryFeedbackSerializer(feedbacks, many=True)
    return Response(serializer.data)

