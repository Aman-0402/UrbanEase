from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import Avg


class Review(models.Model):
    booking  = models.OneToOneField(
        'bookings.Booking',
        on_delete=models.CASCADE,
        related_name='review',
    )
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews_given',
    )
    provider = models.ForeignKey(
        'services.ProviderProfile',
        on_delete=models.CASCADE,
        related_name='reviews',
    )
    rating   = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )
    comment  = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Review by {self.reviewer} for booking #{self.booking_id} — {self.rating}/5'

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self._update_provider_stats()

    def delete(self, *args, **kwargs):
        provider = self.provider
        super().delete(*args, **kwargs)
        self._update_provider_stats(provider=provider)

    def _update_provider_stats(self, provider=None):
        provider = provider or self.provider
        agg = Review.objects.filter(provider=provider).aggregate(
            avg=Avg('rating'), count=models.Count('id')
        )
        provider.avg_rating   = agg['avg'] or 0
        provider.total_reviews = agg['count']
        provider.save(update_fields=['avg_rating', 'total_reviews'])
