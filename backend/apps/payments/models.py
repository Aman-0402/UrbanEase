from django.db import models
from django.conf import settings


class Payment(models.Model):
    PENDING   = 'pending'
    CAPTURED  = 'captured'
    FAILED    = 'failed'
    REFUNDED  = 'refunded'

    STATUS_CHOICES = [
        (PENDING,  'Pending'),
        (CAPTURED, 'Captured'),
        (FAILED,   'Failed'),
        (REFUNDED, 'Refunded'),
    ]

    booking              = models.OneToOneField(
        'bookings.Booking',
        on_delete=models.CASCADE,
        related_name='payment',
    )
    user                 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payments',
    )
    # Razorpay identifiers
    razorpay_order_id    = models.CharField(max_length=100, unique=True)
    razorpay_payment_id  = models.CharField(max_length=100, blank=True)
    razorpay_signature   = models.CharField(max_length=300, blank=True)

    amount               = models.DecimalField(max_digits=10, decimal_places=2)
    currency             = models.CharField(max_length=5, default='INR')
    status               = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)

    created_at           = models.DateTimeField(auto_now_add=True)
    updated_at           = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Payment #{self.pk} | Booking #{self.booking_id} | {self.status}'
