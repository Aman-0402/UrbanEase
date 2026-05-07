from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from apps.bookings.models import Booking
from apps.services.models import ProviderProfile
from .models import Review
from .serializers import ReviewCreateSerializer, ReviewSerializer


class BookingReviewView(APIView):
    """Customer creates a review for a completed booking."""
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, booking_pk):
        booking = get_object_or_404(Booking, pk=booking_pk, customer=request.user)
        serializer = ReviewCreateSerializer(
            data=request.data,
            context={'request': request, 'booking': booking},
        )
        serializer.is_valid(raise_exception=True)
        review = serializer.save()
        return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)

    def get(self, request, booking_pk):
        booking = get_object_or_404(Booking, pk=booking_pk)
        if booking.customer != request.user and (
            not hasattr(booking.provider, 'user') or booking.provider.user != request.user
        ):
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        review = get_object_or_404(Review, booking=booking)
        return Response(ReviewSerializer(review).data)


class ProviderReviewListView(generics.ListAPIView):
    """Public list of reviews for a provider."""
    serializer_class = ReviewSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        provider = get_object_or_404(ProviderProfile, pk=self.kwargs['provider_pk'])
        return Review.objects.filter(provider=provider).select_related(
            'reviewer', 'booking__service'
        ).prefetch_related('booking__items__service')


class MyReviewsView(generics.ListAPIView):
    """Customer sees all reviews they have written."""
    serializer_class = ReviewSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Review.objects.filter(reviewer=self.request.user).select_related(
            'booking__service', 'provider__user'
        ).prefetch_related('booking__items__service')
