from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    additional_phone = models.CharField(max_length=20, blank=True, null=True)
    billing_address = models.TextField(blank=True, null=True)
    shipping_address = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"

class MangoCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.IntegerField()
    image = models.ImageField(upload_to='mango_images/')

    def __str__(self):
        return self.name


class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE)
    mango = models.ForeignKey(MangoCategory, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)


class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    order_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default="Pending")
    billing_address = models.TextField(blank=True, null=True)
    shipping_address = models.TextField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    additional_phone = models.CharField(max_length=20, blank=True, null=True)
    payment_method = models.CharField(max_length=50, default="Cash on Delivery")

    def __str__(self):
        return f"Order #{self.id} - {self.user.username}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    mango = models.ForeignKey(MangoCategory, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)


class Payment(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE)
    payment_method = models.CharField(max_length=50)
    payment_status = models.CharField(max_length=20, default="Pending")
    payment_date = models.DateTimeField(auto_now_add=True)
