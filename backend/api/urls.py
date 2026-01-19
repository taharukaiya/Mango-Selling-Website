from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MangoCategoryViewSet, CartItemViewSet, OrderViewSet, PaymentViewSet, 
    register_user, CustomAuthToken, user_profile, add_to_cart, get_cart_items, 
    create_order, get_user_orders, get_user_orders_with_items, update_cart_item, 
    delete_cart_item, get_order_details, get_all_orders_with_details,
    submit_category_feedback, get_category_feedback, get_mango_category_feedbacks, get_all_feedbacks
)

router = DefaultRouter()
router.register(r'mangoes', MangoCategoryViewSet)
router.register(r'cart-items', CartItemViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'payments', PaymentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', register_user, name='register'),
    path('login/', CustomAuthToken.as_view(), name='login'),
    path('profile/', user_profile, name='profile'),
    path('add-to-cart/', add_to_cart, name='add_to_cart'),
    path('cart/', get_cart_items, name='get_cart_items'),
    path('cart-item/<int:item_id>/', update_cart_item, name='update_cart_item'),
    path('cart-item/<int:item_id>/delete/', delete_cart_item, name='delete_cart_item'),
    path('create-order/', create_order, name='create_order'),
    path('user-orders/', get_user_orders, name='get_user_orders'),
    path('user-orders-with-items/', get_user_orders_with_items, name='get_user_orders_with_items'),
    path('order-details/<int:order_id>/', get_order_details, name='get_order_details'),
    path('admin-orders-details/', get_all_orders_with_details, name='get_all_orders_with_details'),
    path('order-item/<int:order_item_id>/feedback/', submit_category_feedback, name='submit_category_feedback'),
    path('order-item/<int:order_item_id>/get-feedback/', get_category_feedback, name='get_category_feedback'),
    path('mango/<int:mango_id>/feedbacks/', get_mango_category_feedbacks, name='get_mango_category_feedbacks'),
    path('admin/all-feedbacks/', get_all_feedbacks, name='get_all_feedbacks'),
]
