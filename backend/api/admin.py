from django.contrib import admin
from .models import UserProfile, MangoCategory, Cart, CartItem, Order, OrderItem, Payment, OrderFeedback

# Register your models here.

class OrderFeedbackInline(admin.TabularInline):
    model = OrderFeedback
    extra = 0
    readonly_fields = ['created_at', 'updated_at']
    can_delete = False

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['mango', 'quantity', 'price']
    can_delete = False

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'total_amount', 'status', 'order_date', 'has_feedback']
    list_filter = ['status', 'order_date', 'payment_method']
    search_fields = ['user__username', 'user__email', 'id']
    readonly_fields = ['order_date']
    inlines = [OrderItemInline, OrderFeedbackInline]
    
    def has_feedback(self, obj):
        return hasattr(obj, 'feedback')
    has_feedback.boolean = True
    has_feedback.short_description = 'Feedback'

@admin.register(OrderFeedback)
class OrderFeedbackAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'rating', 'created_at', 'updated_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['order__id', 'order__user__username', 'comment']
    readonly_fields = ['created_at', 'updated_at']

admin.site.register(UserProfile)
admin.site.register(MangoCategory)
admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(OrderItem)
admin.site.register(Payment)
