from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from django.utils import timezone
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from django.shortcuts import get_object_or_404
from .models import Booking, BookingStatusLog
from .serializers import (
    BookingCreateSerializer, BookingListSerializer,
    BookingDetailSerializer, BookingStatusUpdateSerializer,
)


class IsCustomer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'customer'


class IsProvider(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'provider'


class BookingCreateView(generics.CreateAPIView):
    """Customer creates a booking."""
    serializer_class = BookingCreateSerializer
    permission_classes = (permissions.IsAuthenticated, IsCustomer)

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


class CustomerBookingListView(generics.ListAPIView):
    """Customer sees their own bookings."""
    serializer_class = BookingListSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        qs = Booking.objects.filter(customer=self.request.user).select_related(
            'service__category', 'provider__user'
        )
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


class ProviderBookingListView(generics.ListAPIView):
    """Provider sees bookings assigned to them."""
    serializer_class = BookingListSerializer
    permission_classes = (permissions.IsAuthenticated, IsProvider)

    def get_queryset(self):
        qs = Booking.objects.filter(
            provider__user=self.request.user
        ).select_related('service__category', 'provider__user')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


class BookingDetailView(generics.RetrieveAPIView):
    """Detail view — accessible by the booking's customer or provider."""
    serializer_class = BookingDetailSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        return Booking.objects.filter(
            customer=user
        ) | Booking.objects.filter(provider__user=user)


class BookingStatusUpdateView(APIView):
    """Update booking status with transition validation."""
    permission_classes = (permissions.IsAuthenticated,)

    def get_booking(self, pk, user):
        booking = get_object_or_404(Booking, pk=pk)
        # Customer can only cancel; provider can do everything else
        if user.role == 'customer' and booking.customer != user:
            return None
        if user.role == 'provider' and booking.provider.user != user:
            return None
        return booking

    def patch(self, request, pk):
        booking = self.get_booking(pk, request.user)
        if not booking:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Customers can only cancel
        if request.user.role == 'customer' and request.data.get('status') != Booking.CANCELLED:
            return Response(
                {'detail': 'Customers can only cancel bookings.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = BookingStatusUpdateSerializer(
            data=request.data, context={'booking': booking}
        )
        serializer.is_valid(raise_exception=True)

        old_status = booking.status
        new_status = serializer.validated_data['status']

        # Update timestamps
        now = timezone.now()
        if new_status == Booking.CONFIRMED:
            booking.confirmed_at = now
        elif new_status == Booking.COMPLETED:
            booking.completed_at = now
            # Update provider stats
            provider = booking.provider
            provider.total_jobs += 1
            provider.save(update_fields=['total_jobs'])
        elif new_status == Booking.CANCELLED:
            booking.cancelled_at = now
            booking.cancel_reason = serializer.validated_data.get('cancel_reason', '')

        booking.status = new_status
        booking.save()

        # Write audit log
        BookingStatusLog.objects.create(
            booking=booking,
            from_status=old_status,
            to_status=new_status,
            changed_by=request.user,
            note=serializer.validated_data.get('note', ''),
        )

        return Response(BookingDetailSerializer(booking).data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def provider_earnings(request):
    if request.user.role != 'provider':
        return Response({'detail': 'Provider only.'}, status=403)

    completed = Booking.objects.filter(
        provider__user=request.user, status=Booking.COMPLETED
    )
    now = timezone.now()
    this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    last_month_start = (this_month_start.replace(day=1) - timezone.timedelta(days=1)).replace(day=1)

    total_earned  = completed.aggregate(t=Sum('total_price'))['t'] or 0
    this_month    = completed.filter(completed_at__gte=this_month_start).aggregate(t=Sum('total_price'))['t'] or 0
    last_month_amt = completed.filter(
        completed_at__gte=last_month_start, completed_at__lt=this_month_start
    ).aggregate(t=Sum('total_price'))['t'] or 0

    monthly = (
        completed
        .annotate(month=TruncMonth('completed_at'))
        .values('month')
        .annotate(amount=Sum('total_price'), jobs=Count('id'))
        .order_by('-month')[:6]
    )
    monthly_data = [
        {
            'month': m['month'].strftime('%b %Y'),
            'amount': float(m['amount'] or 0),
            'jobs':   m['jobs'],
        }
        for m in monthly
    ]

    recent = BookingListSerializer(
        completed.select_related('service__category', 'provider__user').order_by('-completed_at')[:10],
        many=True,
    ).data

    return Response({
        'total_earned':  float(total_earned),
        'this_month':    float(this_month),
        'last_month':    float(last_month_amt),
        'total_jobs':    completed.count(),
        'monthly':       monthly_data,
        'recent':        recent,
    })


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def propose_negotiation(request, pk):
    """Customer proposes a custom price on a pending booking."""
    booking = get_object_or_404(Booking, pk=pk, customer=request.user)
    if booking.status != Booking.PENDING:
        return Response({'detail': 'Can only negotiate pending bookings.'}, status=400)

    proposed = request.data.get('proposed_price')
    if not proposed:
        return Response({'detail': 'proposed_price is required.'}, status=400)

    booking.proposed_price     = proposed
    booking.negotiation_note   = request.data.get('negotiation_note', '')
    booking.negotiation_status = Booking.NEG_PROPOSED
    booking.save(update_fields=['proposed_price', 'negotiation_note', 'negotiation_status'])
    return Response(BookingDetailSerializer(booking).data)


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def respond_negotiation(request, pk):
    """Provider accepts or declines a customer's price proposal."""
    booking = get_object_or_404(Booking, pk=pk, provider__user=request.user)
    if booking.negotiation_status != Booking.NEG_PROPOSED:
        return Response({'detail': 'No pending negotiation on this booking.'}, status=400)

    action = request.data.get('action')
    if action == 'accept':
        old_status             = booking.status
        booking.negotiation_status = Booking.NEG_ACCEPTED
        booking.total_price    = booking.proposed_price
        booking.status         = Booking.CONFIRMED
        booking.confirmed_at   = timezone.now()
        booking.save()
        BookingStatusLog.objects.create(
            booking=booking, from_status=old_status, to_status=Booking.CONFIRMED,
            changed_by=request.user,
            note=f'Accepted negotiated price ₹{booking.proposed_price}',
        )
    elif action == 'decline':
        booking.negotiation_status = Booking.NEG_DECLINED
        booking.save(update_fields=['negotiation_status'])
    else:
        return Response({'detail': 'action must be "accept" or "decline".'}, status=400)

    return Response(BookingDetailSerializer(booking).data)


class BookingCancelView(APIView):
    """Shortcut — customer cancels their own booking."""
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        booking = get_object_or_404(Booking, pk=pk, customer=request.user)
        if not booking.can_transition_to(Booking.CANCELLED):
            return Response(
                {'detail': f'Cannot cancel a booking with status "{booking.status}".'},
                status=status.HTTP_400_BAD_REQUEST
            )
        old_status = booking.status
        booking.status = Booking.CANCELLED
        booking.cancelled_at = timezone.now()
        booking.cancel_reason = request.data.get('reason', '')
        booking.save()

        BookingStatusLog.objects.create(
            booking=booking,
            from_status=old_status,
            to_status=Booking.CANCELLED,
            changed_by=request.user,
            note='Cancelled by customer',
        )
        return Response({'detail': 'Booking cancelled successfully.'})
