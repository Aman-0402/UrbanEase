from django.db import models
from django.conf import settings


class Notification(models.Model):
    BOOKING_CREATED   = 'booking_created'
    BOOKING_CONFIRMED = 'booking_confirmed'
    BOOKING_STARTED   = 'booking_started'
    BOOKING_COMPLETED = 'booking_completed'
    BOOKING_CANCELLED = 'booking_cancelled'
    REVIEW_RECEIVED   = 'review_received'

    TYPE_CHOICES = [
        (BOOKING_CREATED,   'Booking Created'),
        (BOOKING_CONFIRMED, 'Booking Confirmed'),
        (BOOKING_STARTED,   'Job Started'),
        (BOOKING_COMPLETED, 'Job Completed'),
        (BOOKING_CANCELLED, 'Booking Cancelled'),
        (REVIEW_RECEIVED,   'Review Received'),
    ]

    recipient  = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
    )
    notif_type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    title      = models.CharField(max_length=200)
    body       = models.TextField()
    is_read    = models.BooleanField(default=False)
    booking    = models.ForeignKey(
        'bookings.Booking',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='notifications',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'[{self.notif_type}] → {self.recipient} | {self.title}'
