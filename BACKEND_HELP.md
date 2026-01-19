# 🎯 **Complete Backend Explanation - Mango Mart E-commerce**

## **1. What is Backend & Why Do We Need It?**

Think of a website like a restaurant:

- **Frontend (React)** = The dining area where customers see the menu and place orders
- **Backend (Django)** = The kitchen where orders are prepared, recipes are stored, and everything is managed

**Your backend does 4 main jobs:**

1. **Stores all data** (users, mangoes, orders) in a database
2. **Processes requests** from the frontend (like "add to cart", "place order")
3. **Keeps data secure** (passwords, user info)
4. **Provides APIs** (endpoints) that frontend can call to get/send data

---

## **2. Django Framework - The Foundation**

**What is Django?**

- Django is a Python framework (pre-built toolbox) for building web backends
- It follows **MVT pattern**: Model-View-Template (similar to MVC)

**Why Django?**

- ✅ Built-in admin panel (manage data without coding)
- ✅ Automatic database handling (no raw SQL needed)
- ✅ Security features (password encryption, SQL injection protection)
- ✅ REST API support (communicate with React frontend)

---

## **3. Database Models - Your Data Structure**

Located in: `backend/api/models.py`

Models define what data you store. Each model = one database table.

### **📊 Your 8 Database Tables:**

**1. UserProfile** (Extended user information)

```python
- user → Links to Django's built-in User
- image_url → Profile picture
- phone_number → Contact info
- billing_address, shipping_address → For orders
```

**2. MangoCategory** (Mango products)

```python
- name → "Fazli", "Langra", "Himsagar"
- description → Details about the mango
- price → Per kg price
- stock_quantity → How many kg available
- image → Mango photo
```

**3. Cart** (User's shopping cart)

```python
- user → Which user owns this cart
```

**4. CartItem** (Items in cart)

```python
- cart → Which cart does this belong to
- mango → Which mango product
- quantity → How many kg
```

**5. Order** (Customer orders)

```python
- user → Who placed the order
- total_amount → Total price
- order_date → When ordered
- status → "Pending", "Delivered"
- addresses, phones → Delivery info
- payment_method → Cash on delivery, etc.
```

**6. OrderItem** (Products in an order)

```python
- order → Which order
- mango → Which mango
- quantity → How many kg
- price → Price at time of order
```

**7. Payment** (Payment records)

```python
- order → Which order
- payment_status → "Pending", "Completed"
- payment_date → When paid
```

**8. OrderFeedback** (Customer reviews for delivered orders)

```python
- order → One-to-one relationship with Order
- rating → Star rating (1-5)
- comment → Optional text feedback
- created_at → When feedback was submitted
- updated_at → When feedback was last modified
```

---

## **4. API Endpoints - How Frontend Talks to Backend**

Located in: `backend/api/views.py` and `backend/api/urls.py`

### **🔐 Authentication APIs:**

#### **1. Register User** - `/api/register/`

- **Method:** POST
- **What it does:** Creates new user account
- **Input:** username, password, email
- **Output:** Authentication token
- **Code flow:** Check if username exists → Create user → Generate token → Return success

#### **2. Login** - `/api/login/`

- **Method:** POST
- **What it does:** Logs in existing user
- **Input:** email/username + password
- **Output:** Authentication token
- **Code flow:** Verify credentials → Generate token → Return token

#### **3. User Profile** - `/api/profile/`

- **GET:** Retrieves user info (username, email, profile data)
- **PUT/PATCH:** Updates profile (phone, addresses)

---

### **👤 User APIs (Require Login):**

#### **4. Get Mangoes** - `/api/mangoes/`

- **Method:** GET
- **What it does:** Shows all available mangoes
- **Output:** List of all mango products with images, prices

#### **5. Add to Cart** - `/api/add-to-cart/`

- **Method:** POST
- **Input:** mango_id, quantity
- **Code flow:**
  1. Check if mango exists
  2. Get/create user's cart
  3. If mango already in cart → increase quantity
  4. Else → add new cart item
  5. Return success

#### **6. Get Cart Items** - `/api/cart/`

- **Method:** GET
- **Output:** All items in user's cart with details

#### **7. Update Cart Item** - `/api/cart-item/{id}/`

- **Method:** PUT/PATCH
- **Input:** new quantity
- **Validates:** quantity > 0 and ≤ stock

#### **8. Delete Cart Item** - `/api/cart-item/{id}/delete/`

- **Method:** DELETE
- **Removes** item from cart

#### **9. Create Order** - `/api/create-order/`

- **Method:** POST
- **Input:** phone, addresses, payment_method
- **Code flow:**
  1. Get all cart items
  2. Calculate total amount
  3. Create Order record
  4. Create OrderItem for each cart item
  5. Clear cart
  6. Return order confirmation

#### **10. Get User Orders** - `/api/user-orders-with-items/`

- **Method:** GET
- **Output:** All orders with full details (items, prices, dates, feedback)

#### **11. Submit Order Feedback** - `/api/order/{order_id}/feedback/`

- **Method:** POST/PUT
- **What it does:** Submit or update feedback for a delivered order
- **Input:** rating (1-5), comment (optional)
- **Validation:** Order must be delivered and belong to user
- **Code flow:**
  1. Verify order belongs to logged-in user
  2. Check order status is "delivered"
  3. Validate rating (1-5)
  4. Create or update feedback
  5. Return success with feedback data

#### **12. Get Order Feedback** - `/api/order/{order_id}/get-feedback/`

- **Method:** GET
- **What it does:** Retrieve feedback for a specific order
- **Output:** Feedback with rating, comment, timestamps
- **Access:** User can see own feedback, admin can see all

---

### **🔒 Admin APIs (Only Admin Can Access):**

#### **13. Manage Mangoes** - `/api/mangoes/`

- **POST:** Add new mango product
- **PUT:** Update existing mango
- **DELETE:** Remove mango

#### **14. View All Orders** - `/api/admin-orders-details/`

- **Method:** GET
- **Output:** All customer orders with full details including feedback

---

## **5. How a Typical User Journey Works**

Let me explain the complete flow when a customer uses your website:

### **Step 1: Registration**

```
User clicks Register
→ Frontend sends {username, email, password} to /api/register/
→ Backend creates User in database
→ Returns token
→ Frontend saves token in browser
```

### **Step 2: Browse Mangoes**

```
User visits home page
→ Frontend calls GET /api/mangoes/
→ Backend queries MangoCategory table
→ Returns all mangoes
→ Frontend displays mango cards
```

### **Step 3: Add to Cart**

```
User clicks "Add to Cart" on Fazli mango (2kg)
→ Frontend sends {mango_id: 1, quantity: 2} to /api/add-to-cart/
→ Backend checks: Does user have a Cart? No → Create one
→ Add CartItem(cart=user's cart, mango=Fazli, quantity=2)
→ Return success
```

### **Step 4: View Cart**

```
User clicks cart icon
→ Frontend calls GET /api/cart/
→ Backend finds all CartItems for user's cart
→ Returns: [{mango: Fazli, price: 200, quantity: 2}]
→ Frontend displays cart with total = 400tk
```

### **Step 5: Checkout**

```
User fills address form
→ Frontend sends order data to /api/create-order/
→ Backend:
  1. Gets cart items (Fazli 2kg)
  2. Calculates total = 2 × 200 = 400tk
  3. Creates Order(user, total=400, address, phone, status="Pending")
  4. Creates OrderItem(order, mango=Fazli, quantity=2, price=200)
  5. Deletes cart items
→ Returns order confirmation
→ Frontend shows "Order placed successfully!"
```

### **Step 6: View Orders**

```
User goes to Orders page
→ Frontend calls GET /api/user-orders-with-items/
→ Backend queries Orders with related OrderItems and Feedback
→ Returns complete order history
→ Frontend displays order cards
```

### **Step 7: Submit Feedback (for delivered orders)**

```
User clicks "Leave Feedback" on delivered order
→ Modal opens with star rating and comment box
→ User selects 5 stars and writes "Excellent mangoes!"
→ Frontend sends POST /api/order/10/feedback/
   Body: {rating: 5, comment: "Excellent mangoes!"}
→ Backend:
  1. Verifies order #10 belongs to this user
  2. Checks order status is "delivered"
  3. Creates OrderFeedback(order=10, rating=5, comment="Excellent mangoes!")
→ Returns success
→ Frontend shows feedback on order card
→ Admin can see feedback in admin panel
```

---

## **6. Security & Authentication**

### **Token-Based Authentication:**

- When user logs in, backend generates a **unique token** (like a digital key)
- Frontend stores this token
- For every request (cart, orders, profile), frontend sends: `Authorization: Token abc123xyz`
- Backend checks: "Is this token valid? Which user owns it?"
- If valid → Process request
- If invalid → Return error "Unauthorized"

### **Password Security:**

- Passwords are **hashed** (encrypted) before storing
- Even admins can't see actual passwords
- Django uses **PBKDF2** algorithm

### **Permissions:**

- `AllowAny` → Anyone can access (e.g., view mangoes, register)
- `IsAuthenticated` → Must be logged in (e.g., add to cart, checkout)
- `IsAdminUser` → Only admins (e.g., manage products, view all orders)

---

## **7. Key Technologies Used**

1. **Django 5.2** - Main framework
2. **Django REST Framework** - Builds APIs
3. **PostgreSQL** - Database (stores all data)
4. **Token Authentication** - Secures endpoints
5. **CORS Headers** - Allows frontend (different port) to access backend
6. **Pillow** - Handles image uploads

---

## **8. Important Backend Files**

| File             | Purpose                                       |
| ---------------- | --------------------------------------------- |
| `models.py`      | Database structure (8 tables)                 |
| `views.py`       | Business logic (what happens when API called) |
| `serializers.py` | Converts database objects ↔ JSON              |
| `urls.py`        | Maps URLs to views                            |
| `settings.py`    | Configuration (database, apps, security)      |
| `admin.py`       | Admin panel customization                     |
| `manage.py`      | Command-line utility for Django               |

---

## **9. Project Structure**

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
│   ├── tests.py          # Unit tests
│   └── migrations/       # Database changes history
├── media/                 # User uploaded files (mango images)
│   └── mango_images/     # Specific folder for mango photos
└── venv/                 # Virtual environment (isolated dependencies)
```

---

## **10. How to Run the Backend**

### **Step 1: Navigate to backend folder**

```powershell
cd backend
```

### **Step 2: Activate virtual environment**

```powershell
.\venv\Scripts\Activate.ps1
```

### **Step 3: Install dependencies**

```powershell
pip install psycopg2-binary django djangorestframework django-cors-headers pillow
```

### **Step 4: Run database migrations**

```powershell
python manage.py migrate
```

### **Step 5: Create admin user**

```powershell
python manage.py createsuperuser
```

### **Step 6: Start backend server**

```powershell
python manage.py runserver
```

Backend will run on `http://localhost:8000`

---

## **11. Useful Django Commands**

```powershell
# Start development server
python manage.py runserver

# Create database migrations
python manage.py makemigrations

# Apply database changes
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Open Django Python shell
python manage.py shell

# Access database shell
python manage.py dbshell

# Show all users
python manage.py shell -c "from django.contrib.auth.models import User; print(User.objects.all().values('username', 'email'))"

# Show all orders
python manage.py shell -c "from api.models import Order; print(Order.objects.all().values('id', 'user__username', 'total_amount', 'status'))"

# Show all feedback
python manage.py shell -c "from api.models import OrderFeedback; print(OrderFeedback.objects.all().values('order__id', 'rating', 'comment'))"

# Clear all orders and users (keep superusers)
python manage.py shell -c "from django.contrib.auth.models import User; from api.models import Order, CartItem; Order.objects.all().delete(); CartItem.objects.all().delete(); User.objects.filter(is_superuser=False).delete()"
```

---

## **12. Admin Panel**

Access at: `http://localhost:8000/admin`

**Features:**

- Manage users, mangoes, orders, payments, feedback
- View all database records
- See customer feedback inline with orders
- Add/edit/delete data without coding
- User-friendly interface

---

## **13. API Testing with Browser/Postman**

### **Example: Register User**

```
POST http://localhost:8000/api/register/
Body: {
  "username": "john",
  "email": "john@example.com",
  "password": "secure123"
}
Response: {
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "username": "john",
  "email": "john@example.com"
}
```

### **Example: Get Mangoes**

```
GET http://localhost:8000/api/mangoes/
Response: [
  {
    "id": 1,
    "name": "Fazli",
    "description": "Sweet and juicy",
    "price": "200.00",
    "stock_quantity": 100,
    "image": "http://localhost:8000/media/mango_images/fazli.jpg"
  }
]
```

### **Example: Add to Cart**

```
POST http://localhost:8000/api/add-to-cart/
Headers: Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
Body: {
  "mango_id": 1,
  "quantity": 2
}
Response: {
  "message": "Item added to cart successfully",
  "cart_item_id": 5,
  "quantity": 2
}
```

---

## **14. Questions Your Teacher Might Ask**

### **Q: Why use Django instead of Node.js?**

**A:** Django provides built-in admin panel, ORM (no raw SQL needed), and better security out-of-the-box. Python is easier to learn and great for rapid development.

### **Q: How do you handle multiple users adding same product simultaneously?**

**A:** Database transactions ensure data consistency. Django handles this automatically with transaction management and row-level locking.

### **Q: What if user refreshes page after adding to cart?**

**A:** Cart is stored in database (not browser), so it persists. Token authentication maintains session across page refreshes.

### **Q: How is this different from storing data in frontend?**

**A:** Frontend storage (localStorage) can be manipulated by users and is limited to one browser. Backend database is secure, centralized, and accessible from any device.

### **Q: Can you scale this to 1000 users?**

**A:** Yes! Can add Redis for caching, load balancers for distributing traffic, database indexing for faster queries, and CDN for serving media files.

### **Q: How do you prevent SQL injection attacks?**

**A:** Django's ORM automatically escapes user input. We never write raw SQL queries, so SQL injection is prevented by default.

### **Q: What happens if someone steals the authentication token?**

**A:** Token can be invalidated by deleting it from database. In production, we'd use HTTPS (encrypted connection) and add token expiration.

### **Q: How does the frontend know if user is admin?**

**A:** The `/api/profile/` endpoint returns `is_staff` and `is_superuser` flags. Frontend uses these to show/hide admin features.

---

## **15. Database Relationships Explained**

### **One-to-One Relationship:**

- `User ↔ Cart` - Each user has exactly one cart
- `User ↔ UserProfile` - Each user has one profile
- `Order ↔ Payment` - Each order has one payment record
- `Order ↔ OrderFeedback` - Each order can have one feedback

### **One-to-Many Relationship:**

- `User → Orders` - One user can have many orders
- `Order → OrderItems` - One order contains many items
- `Cart → CartItems` - One cart contains many items

### **Many-to-One Relationship:**

- `OrderItems → MangoCategory` - Many order items can reference same mango
- `CartItems → MangoCategory` - Many cart items can reference same mango

**Visual Example:**

```
User "John"
  ├── Cart
  │     ├── CartItem 1 (Fazli, 2kg)
  │     └── CartItem 2 (Langra, 3kg)
  ├── Order #1 (Delivered)
  │     ├── OrderItem (Fazli, 2kg, ₹200)
  │     ├── OrderItem (Himsagar, 1kg, ₹150)
  │     └── OrderFeedback (5 stars, "Excellent quality!")
  └── Order #2 (Pending)
        └── OrderItem (Langra, 5kg, ₹180)
```

---

## **16. Serializers - Data Conversion**

Located in: `backend/api/serializers.py`

**What are Serializers?**

- Convert complex data types (like Django models) to JSON
- Validate incoming data from frontend
- Convert JSON back to Python objects

**Example:**

**Database Object:**

```python
mango = MangoCategory(name="Fazli", price=200, stock=100)
```

**After Serialization (JSON for Frontend):**

```json
{
  "id": 1,
  "name": "Fazli",
  "price": "200.00",
  "stock_quantity": 100,
  "image": "http://localhost:8000/media/mango_images/fazli.jpg"
}
```

---

## **17. CORS - Cross-Origin Resource Sharing**

**The Problem:**

- Frontend runs on `http://localhost:5173` (Vite)
- Backend runs on `http://localhost:8000` (Django)
- By default, browsers block requests between different origins (security)

**The Solution:**

- Installed `django-cors-headers` package
- Added `CORS_ALLOW_ALL_ORIGINS = True` in settings
- Now frontend can freely communicate with backend

**In Production:** Set specific allowed origins instead of allowing all.

---

## **18. Media Files Handling**

**Configuration in settings.py:**

```python
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
```

**How it works:**

1. Admin uploads mango image through admin panel
2. Django saves it to `backend/media/mango_images/`
3. Image is accessible at `http://localhost:8000/media/mango_images/fazli.jpg`
4. Frontend displays image using this URL

---

## **19. Key Takeaways for Presentation**

🎯 **The Elevator Pitch:**

"The backend is the brain of our Mango Mart website. It stores all data securely in PostgreSQL database with 8 models, provides 14+ REST APIs for the frontend to communicate, handles user authentication with tokens, and manages the entire business logic from user registration to order processing and customer feedback. Built with Django framework for rapid development, security, and scalability."

### **Key Points to Emphasize:**

1. **Separation of Concerns:** Frontend handles UI, Backend handles data and logic
2. **RESTful API:** Frontend and backend communicate via standardized HTTP requests
3. **Security First:** Passwords hashed, token authentication, permission-based access
4. **Scalable Architecture:** Can handle growing users and data
5. **Database-Driven:** All data persists in PostgreSQL
6. **Admin Friendly:** Built-in admin panel for managing data

---

## **20. Demo Flow for Presentation**

**Live Demonstration Steps:**

1. **Show Admin Panel**

   - Visit `http://localhost:8000/admin`
   - Log in with superuser credentials
   - Show MangoCategory, Orders, Users tables
   - Add a new mango product

2. **Test API with Browser**

   - Visit `http://localhost:8000/api/mangoes/`
   - Show JSON response with all mangoes

3. **Explain Code Flow**

   - Open `models.py` - Show database structure
   - Open `views.py` - Show `add_to_cart` function
   - Open `urls.py` - Show how URLs map to views

4. **Show Database in Shell**

   ```powershell
   python manage.py shell
   from api.models import Order
   Order.objects.all()
   ```

5. **Complete User Journey**
   - Open frontend website
   - Register new user
   - Browse mangoes
   - Add to cart
   - Checkout
   - Check backend to show order created
   - View in admin panel

---

## **21. Future Enhancements**

Potential improvements to discuss:

1. **Payment Gateway Integration:** Stripe, Razorpay, bKash
2. **Email Notifications:** Send order confirmations
3. **Stock Management:** Auto-decrease stock after order
4. **Order Tracking:** Real-time status updates
5. **Analytics Dashboard:** Sales reports, popular products, feedback analytics
6. **Product Reviews:** Let users rate individual mangoes (separate from order feedback)
7. **Discount Coupons:** Promotional codes
8. **Search & Filter:** Advanced product search
9. **Wishlist Feature:** Save favorite products
10. **API Rate Limiting:** Prevent abuse

---

## **Resources**

- Django Documentation: https://docs.djangoproject.com/
- Django REST Framework: https://www.django-rest-framework.org/
- PostgreSQL: https://www.postgresql.org/docs/

---

**Created for:** Mango Mart E-commerce Project
**Date:** January 2026
**Tech Stack:** Django 5.2 + PostgreSQL + Django REST Framework
