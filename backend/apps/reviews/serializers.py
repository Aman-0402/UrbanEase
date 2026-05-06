from rest_framework import serializers
from .models import Review
from apps.bookings.models import Booking


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Review
        fields = ('rating', 'comment')

    def validate(self, data):
        booking = self.context['booking']
        user    = self.context['request'].user

        if booking.status != Booking.COMPLETED:
            raise serializers.ValidationError(
                'You can only review a completed booking.'
            )
        if booking.customer != user:
            raise serializers.ValidationError(
                'You can only review your own bookings.'
            )
        if hasattr(booking, 'review'):
            raise serializers.ValidationError(
                'This booking has already been reviewed.'
            )
        return data

    def create(self, validated_data):
        booking = self.context['booking']
        return Review.objects.create(
            booking=booking,
            reviewer=self.context['request'].user,
            provider=booking.provider,
            **validated_data,
        )


class ReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(source='reviewer.full_name', read_only=True)
    service_name  = serializers.CharField(source='booking.service.name', read_only=True)

    class Meta:
        model  = Review
        fields = (
            'id', 'rating', 'comment',
            'reviewer_name', 'service_name',
            'created_at',
        )
