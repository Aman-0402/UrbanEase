from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.bookings.models import Booking, BookingStatusLog
from apps.reviews.models import Review
from .models import Notification


def _create(recipient, notif_type, title, body, booking=None):
    Notification.objects.create(
        recipient=recipient,
        notif_type=notif_type,
        title=title,
        body=body,
        booking=booking,
    )


def _service_name(booking):
    if booking.service_id:
        return booking.service.name
    first = booking.items.select_related('service').first()
    if not first:
        return 'Service'
    rest = booking.items.count() - 1
    return first.service.name + (f' +{rest} more' if rest else '')


@receiver(post_save, sender=Booking)
def notify_booking_created(sender, instance, created, **kwargs):
    if not created:
        return
    provider_user = instance.provider.user
    service_name  = _service_name(instance)
    customer_name = instance.customer.full_name or instance.customer.phone

    # Tell the provider they got a new booking
    _create(
        recipient=provider_user,
        notif_type=Notification.BOOKING_CREATED,
        title='New Booking Request',
        body=f'{customer_name} booked "{service_name}" on {instance.scheduled_date}.',
        booking=instance,
    )
    # Confirm receipt to the customer
    _create(
        recipient=instance.customer,
        notif_type=Notification.BOOKING_CREATED,
        title='Booking Placed',
        body=f'Your booking for "{service_name}" has been placed. Waiting for provider confirmation.',
        booking=instance,
    )


@receiver(post_save, sender=BookingStatusLog)
def notify_status_change(sender, instance, created, **kwargs):
    if not created:
        return

    booking       = instance.booking
    new_status    = instance.to_status
    service_name  = _service_name(booking)
    provider_name = booking.provider.user.full_name or booking.provider.user.phone
    customer      = booking.customer
    provider_user = booking.provider.user

    if new_status == Booking.CONFIRMED:
        _create(customer, Notification.BOOKING_CONFIRMED,
                'Booking Confirmed!',
                f'Your booking for "{service_name}" has been confirmed by {provider_name}.',
                booking)

    elif new_status == Booking.IN_PROGRESS:
        _create(customer, Notification.BOOKING_STARTED,
                'Service Started',
                f'{provider_name} has started your "{service_name}" service.',
                booking)

    elif new_status == Booking.COMPLETED:
        _create(customer, Notification.BOOKING_COMPLETED,
                'Service Completed',
                f'Your "{service_name}" service is complete. Leave a review!',
                booking)

    elif new_status == Booking.CANCELLED:
        # Notify whoever didn't cancel
        changed_by = instance.changed_by
        if changed_by == customer:
            _create(provider_user, Notification.BOOKING_CANCELLED,
                    'Booking Cancelled',
                    f'The customer cancelled their "{service_name}" booking on {booking.scheduled_date}.',
                    booking)
        else:
            _create(customer, Notification.BOOKING_CANCELLED,
                    'Booking Cancelled',
                    f'Your "{service_name}" booking was cancelled by the provider.',
                    booking)


@receiver(post_save, sender=Review)
def notify_review_received(sender, instance, created, **kwargs):
    if not created:
        return
    reviewer_name = instance.reviewer.full_name or instance.reviewer.phone
    service_name  = _service_name(instance.booking)
    _create(
        recipient=instance.provider.user,
        notif_type=Notification.REVIEW_RECEIVED,
        title='New Review',
        body=f'{reviewer_name} left a {instance.rating}-star review for "{service_name}".',
        booking=instance.booking,
    )
