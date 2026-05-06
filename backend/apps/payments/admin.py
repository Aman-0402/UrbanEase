from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display  = ('id', 'booking', 'user', 'amount', 'status', 'razorpay_order_id', 'created_at')
    list_filter   = ('status', 'currency')
    search_fields = ('user__phone', 'razorpay_order_id', 'razorpay_payment_id')
    readonly_fields = ('created_at', 'updated_at', 'razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature')
    ordering = ('-created_at',)
