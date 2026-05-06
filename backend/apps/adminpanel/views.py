from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Sum, Avg
from django.db.models.functions import TruncDate
from apps.users.models import User
from apps.users.serializers import UserSerializer
from apps.services.models import ProviderProfile
from apps.services.serializers import ProviderListSerializer
from apps.bookings.models import Booking
from apps.bookings.serializers import BookingListSerializer
from .permissions import IsAdminUser


# ── Stats ────────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAdminUser])
def platform_stats(request):
    total_users     = User.objects.count()
    total_customers = User.objects.filter(role='customer').count()
    total_providers = User.objects.filter(role='provider').count()
    total_bookings  = Booking.objects.count()
    completed       = Booking.objects.filter(status=Booking.COMPLETED).count()
    pending         = Booking.objects.filter(status=Booking.PENDING).count()
    total_revenue   = Booking.objects.filter(
        status=Booking.COMPLETED
    ).aggregate(total=Sum('total_price'))['total'] or 0

    # Bookings per day — last 7 days
    from django.utils import timezone
    from datetime import timedelta
    since = timezone.now() - timedelta(days=6)
    daily = (
        Booking.objects
        .filter(created_at__gte=since)
        .annotate(day=TruncDate('created_at'))
        .values('day')
        .annotate(count=Count('id'))
        .order_by('day')
    )

    return Response({
        'users':          total_users,
        'customers':      total_customers,
        'providers':      total_providers,
        'bookings':       total_bookings,
        'completed':      completed,
        'pending':        pending,
        'revenue':        float(total_revenue),
        'daily_bookings': list(daily),
    })


# ── Users ────────────────────────────────────────────────────────────────────

class AdminUserListView(generics.ListAPIView):
    serializer_class   = UserSerializer
    permission_classes = (IsAdminUser,)
    filter_backends    = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_fields   = ('role', 'is_active', 'is_staff')
    search_fields      = ('phone', 'full_name', 'email')
    ordering_fields    = ('date_joined', 'full_name')
    ordering           = ('-date_joined',)

    def get_queryset(self):
        return User.objects.all()


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def toggle_user_active(request, pk):
    user = User.objects.filter(pk=pk).first()
    if not user:
        return Response({'detail': 'Not found.'}, status=404)
    if user == request.user:
        return Response({'detail': 'Cannot deactivate yourself.'}, status=400)
    user.is_active = not user.is_active
    user.save(update_fields=['is_active'])
    return Response(UserSerializer(user).data)


# ── Bookings ─────────────────────────────────────────────────────────────────

class AdminBookingListView(generics.ListAPIView):
    serializer_class   = BookingListSerializer
    permission_classes = (IsAdminUser,)
    filter_backends    = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_fields   = ('status', 'city')
    search_fields      = ('customer__phone', 'customer__full_name', 'service__name')
    ordering_fields    = ('created_at', 'scheduled_date', 'total_price')
    ordering           = ('-created_at',)

    def get_queryset(self):
        return Booking.objects.select_related(
            'customer', 'provider__user', 'service__category'
        ).all()


# ── Providers ────────────────────────────────────────────────────────────────

class AdminProviderListView(generics.ListAPIView):
    serializer_class   = ProviderListSerializer
    permission_classes = (IsAdminUser,)
    filter_backends    = (DjangoFilterBackend, filters.SearchFilter)
    filterset_fields   = ('is_verified', 'is_available', 'city')
    search_fields      = ('user__full_name', 'user__phone', 'city')
    ordering           = ('-avg_rating',)

    def get_queryset(self):
        return ProviderProfile.objects.select_related('user').prefetch_related('services').all()


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def toggle_provider_verified(request, pk):
    provider = ProviderProfile.objects.filter(pk=pk).first()
    if not provider:
        return Response({'detail': 'Not found.'}, status=404)
    provider.is_verified = not provider.is_verified
    provider.save(update_fields=['is_verified'])
    return Response(ProviderListSerializer(provider).data)
