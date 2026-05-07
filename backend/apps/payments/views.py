from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from apps.bookings.models import Booking
from .models import Payment
from .serializers import PaymentSerializer

# Test card numbers for the mock
CARD_DECLINE  = '4000000000000002'   # always fails
CARD_SUCCESS  = '*'                  # everything else succeeds


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_order(request):
    """Create a mock payment order for a booking."""
    booking_id = request.data.get('booking_id')
    if not booking_id:
        return Response({'detail': 'booking_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

    booking = get_object_or_404(Booking, pk=booking_id, customer=request.user)

    if hasattr(booking, 'payment') and booking.payment.status == Payment.CAPTURED:
        return Response({'detail': 'This booking is already paid.'}, status=status.HTTP_400_BAD_REQUEST)

    # Reuse or create pending payment record
    payment, _ = Payment.objects.get_or_create(
        booking=booking,
        defaults={
            'user':               request.user,
            'razorpay_order_id':  f'mock_order_{booking.id}',
            'amount':             booking.total_price,
            'status':             Payment.PENDING,
        },
    )

    if booking.service_id:
        svc_name = booking.service.name
    else:
        first = booking.items.select_related('service').first()
        svc_name = first.service.name if first else 'Service'

    return Response({
        'order_id':   payment.razorpay_order_id,
        'amount':     float(booking.total_price),
        'currency':   'INR',
        'booking_id': booking.id,
        'service':    svc_name,
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def verify_payment(request):
    """
    Simulate payment processing.
    Card 4000000000000002 always declines; all others succeed.
    """
    order_id    = request.data.get('order_id')
    card_number = request.data.get('card_number', '').replace(' ', '')

    if not order_id:
        return Response({'detail': 'order_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

    payment = get_object_or_404(
        Payment, razorpay_order_id=order_id, user=request.user
    )

    # Simulate decline
    if card_number == CARD_DECLINE:
        payment.status = Payment.FAILED
        payment.save(update_fields=['status'])
        return Response(
            {'detail': 'Your card was declined. Use a different card.'},
            status=status.HTTP_402_PAYMENT_REQUIRED,
        )

    # Simulate success
    import uuid
    payment.razorpay_payment_id = f'mock_pay_{uuid.uuid4().hex[:12]}'
    payment.status              = Payment.CAPTURED
    payment.save()

    return Response(PaymentSerializer(payment).data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def payment_status(request, booking_id):
    booking = get_object_or_404(Booking, pk=booking_id, customer=request.user)
    if not hasattr(booking, 'payment'):
        return Response({'status': None, 'paid': False})
    return Response({
        'status': booking.payment.status,
        'paid':   booking.payment.status == Payment.CAPTURED,
        'amount': booking.payment.amount,
    })
