# 🔧 Complete Backend Deep Dive - Django Mango E-commerce

## 📋 Table of Contents

1. [Backend Architecture Overview](#backend-architecture-overview)
2. [Project Structure Breakdown](#project-structure-breakdown)
3. [Database Models Explained](#database-models-explained)
4. [API Views and Logic](#api-views-and-logic)
5. [Serializers and Data Conversion](#serializers-and-data-conversion)
6. [URL Routing System](#url-routing-system)
7. [Image Handling System](#image-handling-system)
8. [Database Operations](#database-operations)
9. [Authentication System](#authentication-system)
10. [Admin Interface](#admin-interface)
11. [Settings Configuration](#settings-configuration)
12. [Database Management](#database-management)

---

## 🏗️ Backend Architecture Overview

### **What is Django Backend?**

Your Django backend is like the **brain and memory** of your mango website:

- **Brain (Views)**: Processes requests, makes decisions
- **Memory (Database)**: Stores all data (users, mangoes, orders)
- **Communication (APIs)**: Talks to the React frontend
- **Security (Authentication)**: Protects user data and admin functions

### **Request-Response Flow**

```
Frontend Request → URL Router → View Function → Database Query → Serializer → JSON Response → Frontend
```

**Real Example:**

```
User clicks "Add to Cart" → /api/add-to-cart/ → add_to_cart() view → Create CartItem in DB → Return success JSON
```

---

## 📁 Project Structure Breakdown

```
backend/
├── manage.py              # Django's control center
├── core/                  # Main project settings
│   ├── __init__.py       # Makes this a Python package
│   ├── settings.py       # All configuration (database, apps, security)
│   ├── urls.py           # Main URL routing
│   ├── wsgi.py           # Web server interface (production)
│   └── asgi.py           # Async server interface (advanced)
├── api/                   # Your main application
│   ├── __init__.py       # Makes this a Python package
│   ├── models.py         # Database structure (tables and relationships)
│   ├── views.py          # Business logic (what happens when API called)
│   ├── serializers.py    # Data conversion (DB ↔ JSON)
│   ├── urls.py           # API endpoint definitions
│   ├── admin.py          # Admin panel configuration
│   ├── apps.py           # App configuration
│   ├── tests.py          # Unit tests (currently empty)
│   └── migrations/       # Database changes history
├── media/                 # User uploaded files (mango images)
│   └── mango_images/     # Specific folder for mango photos
└── venv/                 # Virtual environment (isolated dependencies)
```

### **File Purposes Explained:**

#### **manage.py** - The Command Center

```python
# This file lets you control Django from command line:
python manage.py runserver      # Start development server
python manage.py makemigrations # Create database changes
python manage.py migrate        # Apply database changes
python manage.py createsuperuser # Create admin user
python manage.py shell          # Open Django Python shell
python manage.py collectstatic  # Collect static files for production
```

---

## 🗄️ Database Models Explained

Your `models.py` defines the database structure. Each model = one database table.

### **1. User (Built-in Django Model)**

```python
# Django provides this automatically
User {
    id: AutoField (Primary Key)
    username: CharField (unique)
    email: EmailField
    password: CharField (hashed)
    is_staff: Boolean (can access admin)
    is_superuser: Boolean (has all permissions)
    date_joined: DateTime
}
```

### **2. UserProfile Model**

```python
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)  # Links to User
    image_url = models.URLField(max_length=500, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    additional_phone = models.CharField(max_length=20, blank=True, null=True)
    billing_address = models.TextField(blank=True, null=True)
    shipping_address = models.TextField(blank=True, null=True)
```

**Relationship:** OneToOne (Each User has exactly one UserProfile)

**Database Table:**

```sql
CREATE TABLE api_userprofile (
    id INTEGER PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES auth_user(id),
    image_url VARCHAR(500),
    phone_number VARCHAR(20),
    additional_phone VARCHAR(20),
    billing_address TEXT,
    shipping_address TEXT
);
```

### **3. MangoCategory Model**

```python
class MangoCategory(models.Model):
    name = models.CharField(max_length=100)                      # Mango name
    description = models.TextField(blank=True)                   # Description
    price = models.DecimalField(max_digits=10, decimal_places=2) # Price per kg
    stock_quantity = models.IntegerField()                       # Available quantity
    image = models.ImageField(upload_to='mango_images/')         # Mango photo
```

**Field Types Explained:**

- `CharField`: Text with maximum length
- `TextField`: Unlimited text
- `DecimalField`: Precise decimal numbers (perfect for money)
- `IntegerField`: Whole numbers
- `ImageField`: File upload for images

**Database Table:**

```sql
CREATE TABLE api_mangocategory (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER NOT NULL,
    image VARCHAR(100) NOT NULL  -- File path to image
);
```

### **4. Cart and CartItem Models**

```python
class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)  # One cart per user

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE)     # Which cart
    mango = models.ForeignKey(MangoCategory, on_delete=models.CASCADE)  # Which mango
    quantity = models.IntegerField(default=1)                    # How many kg
```

**Relationships:**

- User → Cart (OneToOne): Each user has one cart
- Cart → CartItem (OneToMany): One cart can have many items
- MangoCategory → CartItem (OneToMany): One mango can be in many carts

### **5. Order and OrderItem Models**

```python
class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    order_date = models.DateTimeField(auto_now_add=True)  # Automatically set when created
    status = models.CharField(max_length=20, default="Pending")
    billing_address = models.TextField(blank=True, null=True)
    shipping_address = models.TextField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    additional_phone = models.CharField(max_length=20, blank=True, null=True)
    payment_method = models.CharField(max_length=50, default="Cash on Delivery")

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    mango = models.ForeignKey(MangoCategory, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Price at time of order
```

**Why separate Order and OrderItem?**

- One Order can contain multiple different mangoes
- Each OrderItem represents one type of mango in that order
- We store the price at time of purchase (in case prices change later)

### **6. Payment Model**

```python
class Payment(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE)
    payment_method = models.CharField(max_length=50)
    payment_status = models.CharField(max_length=20, default="Pending")
    payment_date = models.DateTimeField(auto_now_add=True)
```

**Relationship:** OneToOne (Each Order has exactly one Payment record)

---

## 🔍 API Views and Logic

Your `views.py` contains all the business logic. Each view function handles a specific API endpoint.

### **ViewSets vs Function-Based Views**

#### **ViewSets (Automatic CRUD)**

```python
class MangoCategoryViewSet(viewsets.ModelViewSet):
    queryset = MangoCategory.objects.all()
    serializer_class = MangoCategorySerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]  # Only admin can modify
        return [AllowAny()]         # Anyone can view
```

**What this creates automatically:**

```
GET /api/mango-categories/          # List all mangoes
POST /api/mango-categories/         # Create new mango (admin only)
GET /api/mango-categories/1/        # Get specific mango
PUT /api/mango-categories/1/        # Update entire mango (admin only)
PATCH /api/mango-categories/1/      # Partial update (admin only)
DELETE /api/mango-categories/1/     # Delete mango (admin only)
```

#### **Function-Based Views (Custom Logic)**

**User Registration:**

```python
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    # Extract data from request
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')

    # Validate data
    if not username or not password:
        return Response({'error': 'Username and password required.'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists.'}, status=400)

    # Create new user
    user = User.objects.create_user(username=username, password=password, email=email)

    # Create authentication token
    token, created = Token.objects.get_or_create(user=user)

    # Return success response
    return Response({
        'token': token.key,
        'username': user.username,
        'email': user.email
    })
```

**Add to Cart Logic:**

```python
@api_view(['POST'])
@permission_classes([IsAuthenticated])  # Must be logged in
def add_to_cart(request):
    mango_id = request.data.get('mango_id')
    quantity = request.data.get('quantity', 1)

    # Validate input
    if not mango_id:
        return Response({'error': 'Mango ID is required'}, status=400)

    # Check if mango exists
    try:
        mango = MangoCategory.objects.get(id=mango_id)
    except MangoCategory.DoesNotExist:
        return Response({'error': 'Mango not found'}, status=404)

    # Get or create user's cart
    cart, created = Cart.objects.get_or_create(user=request.user)

    # Get or create cart item
    cart_item, created = CartItem.objects.get_or_create(
        cart=cart,
        mango=mango,
        defaults={'quantity': quantity}  # If creating new, use this quantity
    )

    if not created:
        # If item already exists, add to existing quantity
        cart_item.quantity += int(quantity)
        cart_item.save()

    return Response({
        'message': 'Item added to cart successfully',
        'cart_item_id': cart_item.id,
        'quantity': cart_item.quantity
    })
```

**Order Creation Logic:**

```python
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    try:
        # Get user's cart
        cart = Cart.objects.get(user=request.user)
        cart_items = CartItem.objects.filter(cart=cart)

        if not cart_items.exists():
            return Response({'error': 'Cart is empty'}, status=400)

        # Calculate total amount
        total_amount = sum(item.mango.price * item.quantity for item in cart_items)

        # Extract order data from request
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
        if not order_data['phone_number'] or not order_data['billing_address']:
            return Response({'error': 'Phone and address required'}, status=400)

        # Create the order
        order = Order.objects.create(**order_data)

        # Create order items from cart items
        for cart_item in cart_items:
            OrderItem.objects.create(
                order=order,
                mango=cart_item.mango,
                quantity=cart_item.quantity,
                price=cart_item.mango.price  # Store current price
            )

        # Clear the cart (order is placed)
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
```

---

## 🔄 Serializers and Data Conversion

Serializers convert between Django models (database objects) and JSON data (for API responses).

### **Basic Serializer**

```python
class MangoCategorySerializer(serializers.ModelSerializer):
    image = serializers.ImageField(use_url=True)  # Include full URL for image

    class Meta:
        model = MangoCategory
        fields = '__all__'  # Include all model fields
```

**What this does:**

```python
# Database object:
mango = MangoCategory(
    id=1,
    name="Himsagar",
    description="Sweet and juicy",
    price=350.00,
    stock_quantity=50,
    image="mango_images/himsagar.jpg"
)

# Serialized to JSON:
{
    "id": 1,
    "name": "Himsagar",
    "description": "Sweet and juicy",
    "price": "350.00",
    "stock_quantity": 50,
    "image": "http://127.0.0.1:8000/media/mango_images/himsagar.jpg"
}
```

### **Complex Serializer with Relationships**

```python
class CartItemSerializer(serializers.ModelSerializer):
    mango_category = MangoCategorySerializer(source='mango', read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'mango_category', 'quantity']
```

**What this produces:**

```json
{
  "id": 1,
  "mango_category": {
    "id": 1,
    "name": "Himsagar",
    "description": "Sweet and juicy",
    "price": "350.00",
    "stock_quantity": 50,
    "image": "http://127.0.0.1:8000/media/mango_images/himsagar.jpg"
  },
  "quantity": 3
}
```

### **Serializer with Custom Methods**

```python
class OrderItemSerializer(serializers.ModelSerializer):
    mango_category = serializers.CharField(source='mango.name', read_only=True)
    mango_image = serializers.ImageField(source='mango.image', read_only=True, use_url=True)
    subtotal = serializers.SerializerMethodField()  # Custom calculated field

    class Meta:
        model = OrderItem
        fields = ['id', 'mango_category', 'mango_image', 'quantity', 'price', 'subtotal']

    def get_subtotal(self, obj):
        return obj.quantity * obj.price  # Calculate subtotal
```

---

## 🌐 URL Routing System

### **Main URLs (`core/urls.py`)**

```python
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),          # Admin panel at /admin/
    path('api/', include('api.urls')),        # All API endpoints at /api/
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

### **API URLs (`api/urls.py`)**

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Automatic URL routing for ViewSets
router = DefaultRouter()
router.register(r'mango-categories', views.MangoCategoryViewSet)
router.register(r'cart-items', views.CartItemViewSet)
router.register(r'orders', views.OrderViewSet)
router.register(r'payments', views.PaymentViewSet)

urlpatterns = [
    path('', include(router.urls)),                    # Include ViewSet URLs
    path('register/', views.register_user),            # Custom registration
    path('login/', views.CustomAuthToken.as_view()),   # Custom login
    path('profile/', views.user_profile),              # User profile
    path('add-to-cart/', views.add_to_cart),           # Add to cart
    path('cart/', views.get_cart_items),               # Get cart items
    path('place-order/', views.create_order),          # Place order
    path('user-orders/', views.get_user_orders),       # User's orders
    path('user-orders-with-items/', views.get_user_orders_with_items), # Detailed orders
    path('cart-item/<int:item_id>/', views.update_cart_item), # Update cart item
    path('cart-item/<int:item_id>/delete/', views.delete_cart_item), # Delete cart item
]
```

**Complete URL Map:**

```
/admin/                              → Django admin panel
/api/mango-categories/               → List/create mangoes
/api/mango-categories/1/             → Get/update/delete specific mango
/api/register/                       → User registration
/api/login/                          → User login
/api/profile/                        → User profile management
/api/add-to-cart/                    → Add item to cart
/api/cart/                           → Get cart items
/api/place-order/                    → Create new order
/api/user-orders/                    → Get user's orders
/api/user-orders-with-items/         → Get user's orders with details
/api/cart-item/1/                    → Update cart item quantity
/api/cart-item/1/delete/             → Remove item from cart
```

---

## 📸 Image Handling System

### **Image Upload Configuration (settings.py)**

```python
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Media files (user uploads)
MEDIA_URL = '/media/'                              # URL prefix for images
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')      # Physical storage location
```

### **ImageField in Model**

```python
class MangoCategory(models.Model):
    # ... other fields
    image = models.ImageField(upload_to='mango_images/')
```

### **How Image Upload Works:**

1. **Admin uploads image through Django admin:**

   - Image file: `himsagar.jpg`
   - Django saves to: `backend/media/mango_images/himsagar.jpg`
   - Database stores: `mango_images/himsagar.jpg`

2. **Serializer provides full URL:**

   ```python
   image = serializers.ImageField(use_url=True)
   ```

   - Returns: `http://127.0.0.1:8000/media/mango_images/himsagar.jpg`

3. **Frontend receives complete image URL:**

   ```json
   {
     "id": 1,
     "name": "Himsagar",
     "image": "http://127.0.0.1:8000/media/mango_images/himsagar.jpg"
   }
   ```

4. **React displays image:**
   ```jsx
   <img src={mango.image} alt={mango.name} />
   ```

### **Image Storage Structure:**

```
backend/
├── media/                    # MEDIA_ROOT
│   └── mango_images/        # upload_to='mango_images/'
│       ├── himsagar.jpg
│       ├── langra.jpg
│       ├── fazli.jpg
│       └── amrapali.jpg
```

### **URL Serving (Development):**

```python
# In core/urls.py
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

This makes images accessible at:

- `http://127.0.0.1:8000/media/mango_images/himsagar.jpg`

---

## 🗄️ Database Operations

### **How Django Talks to Database**

#### **Create (INSERT)**

```python
# Method 1: Direct creation
mango = MangoCategory.objects.create(
    name="Himsagar",
    description="Sweet and juicy mango",
    price=350.00,
    stock_quantity=50,
    image="path/to/image.jpg"
)

# Method 2: Create and save
mango = MangoCategory(
    name="Himsagar",
    description="Sweet and juicy mango",
    price=350.00,
    stock_quantity=50
)
mango.save()

# Method 3: get_or_create (prevents duplicates)
mango, created = MangoCategory.objects.get_or_create(
    name="Himsagar",
    defaults={
        'description': "Sweet and juicy mango",
        'price': 350.00,
        'stock_quantity': 50
    }
)
```

#### **Read (SELECT)**

```python
# Get all mangoes
all_mangoes = MangoCategory.objects.all()

# Get specific mango
mango = MangoCategory.objects.get(id=1)
# or handle if not found:
try:
    mango = MangoCategory.objects.get(id=1)
except MangoCategory.DoesNotExist:
    mango = None

# Filter mangoes
cheap_mangoes = MangoCategory.objects.filter(price__lt=300)  # price < 300
himsagar_mangoes = MangoCategory.objects.filter(name__contains="Himsagar")

# Complex queries with relationships
orders_with_items = Order.objects.select_related('user').prefetch_related('orderitem_set__mango')
```

#### **Update (UPDATE)**

```python
# Update single object
mango = MangoCategory.objects.get(id=1)
mango.price = 400.00
mango.save()

# Update multiple objects
MangoCategory.objects.filter(stock_quantity=0).update(stock_quantity=10)

# Update or create
mango, created = MangoCategory.objects.update_or_create(
    id=1,
    defaults={'price': 400.00, 'stock_quantity': 20}
)
```

#### **Delete (DELETE)**

```python
# Delete single object
mango = MangoCategory.objects.get(id=1)
mango.delete()

# Delete multiple objects
MangoCategory.objects.filter(stock_quantity=0).delete()

# Delete all (be careful!)
MangoCategory.objects.all().delete()
```

### **QuerySet Methods**

```python
# Chaining methods
expensive_mangoes = MangoCategory.objects.filter(
    price__gt=300
).exclude(
    stock_quantity=0
).order_by(
    '-price'  # Descending order
)[:10]  # Limit to 10

# Aggregation
from django.db.models import Sum, Count, Avg
total_orders = Order.objects.count()
total_revenue = Order.objects.aggregate(Sum('total_amount'))
average_price = MangoCategory.objects.aggregate(Avg('price'))
```

---

## 🔐 Authentication System

### **Token-Based Authentication**

Your project uses Django REST Framework's token authentication:

#### **How It Works:**

1. **User registers/logs in** → Server generates unique token
2. **Token stored** in frontend (localStorage)
3. **Every API request** includes token in header
4. **Server validates token** → Identifies user

#### **Token Generation (Login):**

```python
class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')

        # Find user by email
        try:
            user_obj = User.objects.get(email=email)
            user = authenticate(request, username=user_obj.username, password=password)
        except User.DoesNotExist:
            return Response({'error': 'Invalid email or password.'}, status=400)

        if user is not None:
            # Create or get existing token
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,           # Unique token string
                'username': user.username,
                'email': user.email
            })
        else:
            return Response({'error': 'Invalid credentials.'}, status=400)
```

#### **Token Usage in Requests:**

```javascript
// Frontend includes token in headers
const response = await fetch("http://127.0.0.1:8000/api/cart/", {
  headers: {
    Authorization: `Token ${token}`,
    "Content-Type": "application/json",
  },
});
```

#### **Permission Classes:**

```python
@permission_classes([IsAuthenticated])  # Must be logged in
def add_to_cart(request):
    # request.user automatically available
    cart, created = Cart.objects.get_or_create(user=request.user)

@permission_classes([IsAdminUser])      # Must be admin
def admin_only_view(request):
    # Only staff users can access

@permission_classes([AllowAny])         # Anyone can access
def public_view(request):
    # No authentication required
```

#### **Authentication Flow:**

```
1. User enters email/password → POST /api/login/
2. Backend validates credentials → Returns token
3. Frontend stores token → localStorage.setItem('token', token)
4. Every request includes token → Authorization: Token abc123xyz
5. Backend validates token → Identifies user → Processes request
```

---

## 👨‍💼 Admin Interface

Django provides a powerful admin interface automatically.

### **Admin Configuration (`admin.py`):**

```python
from django.contrib import admin
from .models import UserProfile, MangoCategory, Cart, CartItem, Order, OrderItem, Payment

@admin.register(MangoCategory)
class MangoCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'stock_quantity']  # Columns in list view
    list_filter = ['price']                            # Filter sidebar
    search_fields = ['name', 'description']            # Search functionality
    list_editable = ['price', 'stock_quantity']        # Edit in list view

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'total_amount', 'status', 'order_date']
    list_filter = ['status', 'order_date']
    search_fields = ['user__username', 'user__email']
    date_hierarchy = 'order_date'                      # Date navigation

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'mango', 'quantity', 'price']
    list_filter = ['mango', 'order__status']

# Register other models
admin.site.register(UserProfile)
admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(Payment)
```

### **Admin Features:**

- **CRUD Operations**: Create, read, update, delete any model
- **File Uploads**: Upload mango images directly
- **Relationship Management**: Link orders to users, items to orders
- **Bulk Actions**: Delete multiple records at once
- **Filtering and Search**: Find specific records quickly

### **Accessing Admin:**

1. Create superuser: `python manage.py createsuperuser`
2. Go to: `http://127.0.0.1:8000/admin/`
3. Login with superuser credentials
4. Manage all data through web interface

---

## ⚙️ Settings Configuration

Your `settings.py` file controls everything about Django.

### **Key Settings Explained:**

#### **Database Configuration:**

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',           # Database type
        'NAME': BASE_DIR / 'db.sqlite3',                  # Database file location
    }
}
```

#### **Installed Applications:**

```python
INSTALLED_APPS = [
    'django.contrib.admin',          # Admin interface
    'django.contrib.auth',           # User authentication
    'django.contrib.contenttypes',   # Content type framework
    'django.contrib.sessions',       # Session framework
    'django.contrib.messages',       # Messaging framework
    'django.contrib.staticfiles',    # Static file management
    'rest_framework',                # API framework
    'rest_framework.authtoken',      # Token authentication
    'corsheaders',                   # CORS handling
    'api',                          # Your app
]
```

#### **REST Framework Configuration:**

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
```

#### **CORS Configuration:**

```python
CORS_ALLOW_ALL_ORIGINS = True  # Allow all origins in development

# For production, specify exact origins:
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:3000",
#     "http://127.0.0.1:3000",
#     "https://yourdomain.com",
# ]
```

#### **Media Files Configuration:**

```python
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
```

#### **Static Files Configuration:**

```python
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')  # For production
```

---

## 🗃️ Database Management

### **Migration System**

Django tracks database changes through migrations:

#### **Creating Migrations:**

```bash
python manage.py makemigrations
```

This scans your models.py for changes and creates migration files in `api/migrations/`:

```python
# Example migration file: 0001_initial.py
from django.db import migrations, models

class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='MangoCategory',
            fields=[
                ('id', models.BigAutoField(primary_key=True)),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True)),
                ('price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('stock_quantity', models.IntegerField()),
                ('image', models.ImageField(upload_to='mango_images/')),
            ],
        ),
    ]
```

#### **Applying Migrations:**

```bash
python manage.py migrate
```

This executes the migration SQL against your database.

#### **Migration Commands:**

```bash
python manage.py makemigrations              # Create new migrations
python manage.py migrate                     # Apply migrations
python manage.py migrate api 0001           # Migrate to specific version
python manage.py migrate api zero           # Rollback all migrations
python manage.py showmigrations             # Show migration status
python manage.py sqlmigrate api 0001        # Show SQL for migration
```

### **Database Schema Evolution Example:**

#### **Step 1: Initial Model**

```python
# models.py
class MangoCategory(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
```

#### **Step 2: Add Field**

```python
# models.py - Add description field
class MangoCategory(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)  # New field
```

```bash
python manage.py makemigrations
# Creates: 0002_mangocategory_description.py

python manage.py migrate
# Adds description column to database table
```

#### **Step 3: Modify Field**

```python
# models.py - Change price precision
class MangoCategory(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=12, decimal_places=2)  # Changed
    description = models.TextField(blank=True)
```

```bash
python manage.py makemigrations
# Creates: 0003_alter_mangocategory_price.py

python manage.py migrate
# Modifies price column in database
```

### **Database Commands:**

#### **Django Shell (Interactive Database Access):**

```bash
python manage.py shell
```

```python
# Inside shell
from api.models import MangoCategory, Order, User

# Create mango
mango = MangoCategory.objects.create(
    name="Himsagar",
    description="Premium mango",
    price=350.00,
    stock_quantity=50
)

# Query mangoes
all_mangoes = MangoCategory.objects.all()
print(all_mangoes)

# Complex queries
from django.db.models import Sum
total_revenue = Order.objects.aggregate(Sum('total_amount'))
print(f"Total revenue: {total_revenue['total_amount__sum']}")
```

#### **Database Reset (Nuclear Option):**

```bash
# Delete database file
rm db.sqlite3

# Delete migration files (keep __init__.py)
rm api/migrations/0*.py

# Recreate everything
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### **Database Relationships in Action:**

#### **OneToOne Example (User ↔ UserProfile):**

```python
# Create user with profile
user = User.objects.create_user(username='john', email='john@email.com')
profile = UserProfile.objects.create(
    user=user,
    phone_number='123456789',
    billing_address='123 Street'
)

# Access from either side
print(user.userprofile.phone_number)  # Forward relation
print(profile.user.username)          # Reverse relation
```

#### **ForeignKey Example (Order → User):**

```python
# One user can have many orders
user = User.objects.get(username='john')

order1 = Order.objects.create(user=user, total_amount=500.00)
order2 = Order.objects.create(user=user, total_amount=750.00)

# Access user's orders
user_orders = Order.objects.filter(user=user)
# or
user_orders = user.order_set.all()  # Reverse relation

print(f"User {user.username} has {user_orders.count()} orders")
```

#### **ManyToOne Example (Order → OrderItems):**

```python
# One order can have many items
order = Order.objects.get(id=1)

# Add items to order
OrderItem.objects.create(order=order, mango_id=1, quantity=2, price=350.00)
OrderItem.objects.create(order=order, mango_id=2, quantity=1, price=280.00)

# Get order items
order_items = OrderItem.objects.filter(order=order)
# or
order_items = order.orderitem_set.all()  # Reverse relation

total = sum(item.quantity * item.price for item in order_items)
print(f"Order total: {total}")
```

---

## 🚀 Common Operations and Examples

### **Complete User Journey (Database Perspective):**

#### **1. User Registration:**

```python
# User clicks register in frontend
# POST /api/register/ with {username, email, password}

def register_user(request):
    # Create user record in auth_user table
    user = User.objects.create_user(
        username=request.data['username'],
        email=request.data['email'],
        password=request.data['password']
    )

    # Create authentication token in authtoken_token table
    token = Token.objects.create(user=user)

    # Return token to frontend
    return Response({'token': token.key})
```

#### **2. Browse Mangoes:**

```python
# User visits mango page
# GET /api/mango-categories/

# Database query:
# SELECT * FROM api_mangocategory;

mangoes = MangoCategory.objects.all()
serializer = MangoCategorySerializer(mangoes, many=True)
return Response(serializer.data)
```

#### **3. Add to Cart:**

```python
# User clicks "Add to Cart"
# POST /api/add-to-cart/ with {mango_id: 1, quantity: 2}

# Database operations:
# 1. Find/create cart for user
cart, created = Cart.objects.get_or_create(user=request.user)

# 2. Find/create cart item
cart_item, created = CartItem.objects.get_or_create(
    cart=cart,
    mango_id=mango_id,
    defaults={'quantity': quantity}
)

# 3. Update quantity if exists
if not created:
    cart_item.quantity += quantity
    cart_item.save()
```

#### **4. Place Order:**

```python
# User completes checkout
# POST /api/place-order/ with order details

# Database operations:
# 1. Get cart items
cart_items = CartItem.objects.filter(cart__user=request.user)

# 2. Calculate total
total = sum(item.mango.price * item.quantity for item in cart_items)

# 3. Create order
order = Order.objects.create(
    user=request.user,
    total_amount=total,
    billing_address=request.data['billing_address'],
    # ... other fields
)

# 4. Create order items
for cart_item in cart_items:
    OrderItem.objects.create(
        order=order,
        mango=cart_item.mango,
        quantity=cart_item.quantity,
        price=cart_item.mango.price  # Store current price
    )

# 5. Clear cart
cart_items.delete()
```

### **Admin Operations:**

#### **View All Orders (Admin Panel):**

```python
# Admin visits /admin/api/order/
# Django automatically generates:
# SELECT * FROM api_order ORDER BY order_date DESC;

orders = Order.objects.all().order_by('-order_date')
```

#### **Update Order Status:**

```python
# Admin changes order status
# PATCH /api/orders/1/ with {status: 'Delivered'}

order = Order.objects.get(id=1)
order.status = 'Delivered'
order.save()

# Database query:
# UPDATE api_order SET status='Delivered' WHERE id=1;
```

### **Complex Queries with Relationships:**

#### **Get Orders with Items (Optimized):**

```python
# Without optimization (N+1 problem):
orders = Order.objects.filter(user=user)
for order in orders:
    items = order.orderitem_set.all()  # Additional query for each order!

# With optimization:
orders = Order.objects.filter(user=user).prefetch_related('orderitem_set__mango')
for order in orders:
    items = order.orderitem_set.all()  # No additional queries!
```

#### **Revenue Analytics:**

```python
from django.db.models import Sum, Count, Avg
from django.utils import timezone
from datetime import timedelta

# Total revenue
total_revenue = Order.objects.aggregate(Sum('total_amount'))

# Revenue this month
this_month = timezone.now() - timedelta(days=30)
monthly_revenue = Order.objects.filter(
    order_date__gte=this_month
).aggregate(Sum('total_amount'))

# Most popular mangoes
popular_mangoes = OrderItem.objects.values(
    'mango__name'
).annotate(
    total_quantity=Sum('quantity'),
    total_orders=Count('order')
).order_by('-total_quantity')

# Average order value
avg_order = Order.objects.aggregate(Avg('total_amount'))
```

---

## 🔧 Advanced Database Operations

### **Custom Managers and QuerySets:**

```python
# In models.py
class ActiveMangoManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(stock_quantity__gt=0)

class MangoCategory(models.Model):
    # ... fields ...

    objects = models.Manager()      # Default manager
    active = ActiveMangoManager()   # Custom manager

# Usage:
all_mangoes = MangoCategory.objects.all()        # Includes out of stock
active_mangoes = MangoCategory.active.all()      # Only in stock
```

### **Database Transactions:**

```python
from django.db import transaction

@transaction.atomic  # Ensures all operations succeed or none do
def create_order_atomic(request):
    # If any step fails, everything rolls back
    order = Order.objects.create(...)

    for cart_item in cart_items:
        OrderItem.objects.create(...)

        # Update stock quantity
        mango = cart_item.mango
        mango.stock_quantity -= cart_item.quantity
        mango.save()

    cart_items.delete()
```

### **Raw SQL Queries (When Needed):**

```python
# For complex analytics that ORM can't handle efficiently
from django.db import connection

def get_sales_report():
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT
                m.name,
                SUM(oi.quantity) as total_sold,
                SUM(oi.quantity * oi.price) as total_revenue
            FROM api_mangocategory m
            JOIN api_orderitem oi ON m.id = oi.mango_id
            JOIN api_order o ON oi.order_id = o.id
            WHERE o.order_date >= %s
            GROUP BY m.name
            ORDER BY total_revenue DESC
        """, [timezone.now() - timedelta(days=30)])

        return cursor.fetchall()
```

---

## 🎯 Summary: How Everything Connects

```
Frontend (React) sends request
        ↓
URL Router (urls.py) matches pattern
        ↓
View Function (views.py) receives request
        ↓
Authentication middleware checks token
        ↓
View queries Database using Models (models.py)
        ↓
Serializer (serializers.py) converts data to JSON
        ↓
Response sent back to Frontend
        ↓
Frontend updates UI with new data
```

Your Django backend is a complete, production-ready e-commerce system that handles:

- ✅ User authentication and authorization
- ✅ Product catalog management
- ✅ Shopping cart functionality
- ✅ Order processing and tracking
- ✅ Image uploads and serving
- ✅ Admin interface for management
- ✅ RESTful APIs for frontend integration
- ✅ Database relationships and integrity
- ✅ Security and permissions

Every aspect is designed to be scalable, maintainable, and secure for a real-world e-commerce application.
