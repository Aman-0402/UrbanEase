from django.db import models
from django.conf import settings
from apps.services.models import Service, ProviderProfile, ProviderService


class Booking(models.Model):

    # ── Negotiation choices ──────────────────────────────────────────
    NEG_NONE     = 'none'
    NEG_PROPOSED = 'customer_proposed'
    NEG_ACCEPTED = 'accepted'
    NEG_DECLINED = 'declined'
    NEGOTIATION_CHOICES = [
        (NEG_NONE,     'None'),
        (NEG_PROPOSED, 'Customer Proposed'),
        (NEG_ACCEPTED, 'Accepted'),
        (NEG_DECLINED, 'Declined'),
    ]

    # ── Status choices ───────────────────────────────────────────────
    PENDING     = 'pending'
    CONFIRMED   = 'confirmed'
    IN_PROGRESS = 'in_progress'
    COMPLETED   = 'completed'
    CANCELLED   = 'cancelled'

    STATUS_CHOICES = [
        (PENDING,     'Pending'),
        (CONFIRMED,   'Confirmed'),
        (IN_PROGRESS, 'In Progress'),
        (COMPLETED,   'Completed'),
        (CANCELLED,   'Cancelled'),
    ]

    # ── Valid transitions: current → allowed next states ─────────────
    VALID_TRANSITIONS = {
        PENDING:     [CONFIRMED, CANCELLED],
        CONFIRMED:   [IN_PROGRESS, CANCELLED],
        IN_PROGRESS: [COMPLETED],
        COMPLETED:   [],
        CANCELLED:   [],
    }

    # ── Fields ───────────────────────────────────────────────────────
    customer       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    provider       = models.ForeignKey(ProviderProfile, on_delete=models.CASCADE, related_name='bookings')
    # Nullable — new multi-service bookings use BookingItem instead
    service        = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')

    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)

    scheduled_date = models.DateField()
    scheduled_time = models.TimeField()

    address        = models.TextField()
    city           = models.CharField(max_length=100)
    pincode        = models.CharField(max_length=10)

    notes          = models.TextField(blank=True)

    total_price        = models.DecimalField(max_digits=10, decimal_places=2)
    proposed_price     = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    negotiation_status = models.CharField(max_length=20, choices=NEGOTIATION_CHOICES, default=NEG_NONE)
    negotiation_note   = models.TextField(blank=True)

    # Timestamps
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)
    confirmed_at   = models.DateTimeField(null=True, blank=True)
    completed_at   = models.DateTimeField(null=True, blank=True)
    cancelled_at   = models.DateTimeField(null=True, blank=True)
    cancel_reason  = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        svc = self.service.name if self.service_id else 'multi-service'
        return f'#{self.pk} | {self.customer} → {svc} | {self.status}'

    def can_transition_to(self, new_status):
        return new_status in self.VALID_TRANSITIONS.get(self.status, [])


class BookingItem(models.Model):
    """One row per service in a multi-service booking."""
    booking    = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='items')
    service    = models.ForeignKey(Service, on_delete=models.PROTECT)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        unique_together = ('booking', 'service')

    def __str__(self):
        return f'Booking #{self.booking_id} — {self.service.name}'


class BookingStatusLog(models.Model):
    """Audit trail — every status change is recorded here."""
    booking    = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='logs')
    from_status = models.CharField(max_length=20)
    to_status   = models.CharField(max_length=20)
    changed_by  = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    note        = models.TextField(blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'Booking #{self.booking_id}: {self.from_status} → {self.to_status}'
