from rest_framework import serializers
from django.utils import timezone
from .models import Booking, BookingStatusLog
from apps.services.serializers import ServiceSerializer, ProviderListSerializer


class BookingStatusLogSerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.full_name', read_only=True, default='')

    class Meta:
        model = BookingStatusLog
        fields = ('id', 'from_status', 'to_status', 'changed_by_name', 'note', 'created_at')


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = (
            'provider', 'service', 'scheduled_date', 'scheduled_time',
            'address', 'city', 'pincode', 'notes',
        )

    def validate(self, data):
        provider = data['provider']
        service  = data['service']

        # Provider must offer this service
        if not provider.services.filter(pk=service.pk).exists():
            raise serializers.ValidationError('This provider does not offer the selected service.')

        # Cannot book in the past
        from datetime import datetime, date
        if data['scheduled_date'] < date.today():
            raise serializers.ValidationError('Scheduled date cannot be in the past.')

        # Provider must be available
        if not provider.is_available:
            raise serializers.ValidationError('This provider is currently unavailable.')

        return data

    def create(self, validated_data):
        request = self.context['request']
        service = validated_data['service']
        booking = Booking.objects.create(
            customer=request.user,
            total_price=service.base_price,
            **validated_data,
        )
        return booking


class BookingListSerializer(serializers.ModelSerializer):
    service_name     = serializers.CharField(source='service.name', read_only=True)
    service_icon     = serializers.CharField(source='service.category.icon', read_only=True)
    service_id       = serializers.IntegerField(source='service.id', read_only=True)
    provider_name    = serializers.SerializerMethodField()
    provider_id      = serializers.IntegerField(source='provider.id', read_only=True)
    customer_name    = serializers.SerializerMethodField()
    status_display   = serializers.CharField(source='get_status_display', read_only=True)
    scheduled_time   = serializers.TimeField(format='%H:%M')

    class Meta:
        model = Booking
        fields = (
            'id', 'service_name', 'service_icon', 'service_id',
            'provider_name', 'provider_id', 'customer_name',
            'status', 'status_display', 'scheduled_date', 'scheduled_time',
            'total_price', 'address', 'city', 'pincode', 'created_at',
        )

    def get_provider_name(self, obj):
        return obj.provider.user.full_name or obj.provider.user.phone

    def get_customer_name(self, obj):
        return obj.customer.full_name or obj.customer.phone


class BookingDetailSerializer(serializers.ModelSerializer):
    service        = ServiceSerializer(read_only=True)
    provider       = ProviderListSerializer(read_only=True)
    logs           = BookingStatusLogSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    scheduled_time = serializers.TimeField(format='%I:%M %p')
    can_cancel     = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = (
            'id', 'service', 'provider', 'status', 'status_display',
            'scheduled_date', 'scheduled_time', 'address', 'city', 'pincode',
            'notes', 'total_price', 'can_cancel',
            'created_at', 'confirmed_at', 'completed_at', 'cancelled_at',
            'cancel_reason', 'logs',
        )

    def get_can_cancel(self, obj):
        return obj.can_transition_to(Booking.CANCELLED)


class BookingStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Booking.STATUS_CHOICES)
    note   = serializers.CharField(required=False, allow_blank=True, default='')
    cancel_reason = serializers.CharField(required=False, allow_blank=True, default='')

    def validate(self, data):
        booking = self.context['booking']
        new_status = data['status']
        if not booking.can_transition_to(new_status):
            raise serializers.ValidationError(
                f'Cannot move from "{booking.status}" to "{new_status}".'
            )
        return data
