from django.contrib import admin
from .models import UserProfile, MangoCategory, Cart, CartItem, Order, OrderItem, Payment, CategoryFeedback

# Register your models here.

class CategoryFeedbackInline(admin.TabularInline):
    model = CategoryFeedback
    extra = 0
    readonly_fields = ['created_at', 'updated_at', 'user', 'mango_category']
    can_delete = False

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['mango', 'quantity', 'price']
    can_delete = False

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'total_amount', 'status', 'order_date']
    list_filter = ['status', 'order_date', 'payment_method']
    search_fields = ['user__username', 'user__email', 'id']
    readonly_fields = ['order_date']
    inlines = [OrderItemInline]

@admin.register(CategoryFeedback)
class CategoryFeedbackAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'mango_category', 'rating', 'created_at', 'updated_at']
    list_filter = ['rating', 'created_at', 'mango_category']
    search_fields = ['user__username', 'mango_category__name', 'comment']
    readonly_fields = ['created_at', 'updated_at']

admin.site.register(UserProfile)
admin.site.register(MangoCategory)
admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(OrderItem)
admin.site.register(Payment)
