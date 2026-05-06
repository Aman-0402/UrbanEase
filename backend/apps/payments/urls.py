from django.urls import path
from . import views

urlpatterns = [
    path('payments/create-order/',           views.create_order,    name='payment-create-order'),
    path('payments/verify/',                 views.verify_payment,  name='payment-verify'),
    path('payments/status/<int:booking_id>/',views.payment_status,  name='payment-status'),
]
