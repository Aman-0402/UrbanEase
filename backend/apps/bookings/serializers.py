from rest_framework import serializers
from django.utils import timezone
from .models import Booking, BookingItem, BookingStatusLog
from apps.services.models import ProviderService
from apps.services.serializers import ServiceSerializer, ProviderListSerializer


class BookingStatusLogSerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.full_name', read_only=True, default='')

    class Meta:
        model = BookingStatusLog
        fields = ('id', 'from_status', 'to_status', 'changed_by_name', 'note', 'created_at')


class BookingItemSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name',          read_only=True)
    service_icon = serializers.CharField(source='service.category.icon', read_only=True)

    class Meta:
        model  = BookingItem
        fields = ('id', 'service_name', 'service_icon', 'unit_price')


class BookingCreateSerializer(serializers.ModelSerializer):
    # Accepts a list of service IDs: [1, 2, 3]
    services = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, min_length=1,
    )
    proposed_price   = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    negotiation_note = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model  = Booking
        fields = (
            'provider', 'services', 'scheduled_date', 'scheduled_time',
            'address', 'city', 'pincode', 'notes',
            'proposed_price', 'negotiation_note',
        )

    def validate(self, data):
        from datetime import date
        provider      = data['provider']
        service_ids   = data['services']

        if not provider.is_available:
            raise serializers.ValidationError('This provider is currently unavailable.')

        if data['scheduled_date'] < date.today():
            raise serializers.ValidationError('Scheduled date cannot be in the past.')

        # Verify every requested service is offered by this provider
        offered_ids = set(provider.provider_services.values_list('service_id', flat=True))
        bad = [sid for sid in service_ids if sid not in offered_ids]
        if bad:
            raise serializers.ValidationError(
                f'Provider does not offer service(s) with id: {bad}.'
            )

        return data

    def create(self, validated_data):
        service_ids      = validated_data.pop('services')
        proposed_price   = validated_data.pop('proposed_price', None)
        negotiation_note = validated_data.pop('negotiation_note', '')
        request          = self.context['request']
        provider         = validated_data['provider']

        # Resolve effective price per service
        ps_map = {
            ps.service_id: (ps.custom_price if ps.custom_price is not None else ps.service.base_price)
            for ps in provider.provider_services.select_related('service').filter(service_id__in=service_ids)
        }
        total = sum(ps_map[sid] for sid in service_ids)

        neg_status = Booking.NEG_PROPOSED if proposed_price else Booking.NEG_NONE

        booking = Booking.objects.create(
            customer=request.user,
            total_price=total,
            proposed_price=proposed_price,
            negotiation_status=neg_status,
            negotiation_note=negotiation_note,
            **validated_data,
        )
        BookingItem.objects.bulk_create([
            BookingItem(booking=booking, service_id=sid, unit_price=ps_map[sid])
            for sid in service_ids
        ])
        return booking


class BookingListSerializer(serializers.ModelSerializer):
    # For legacy single-service bookings: fall back to Booking.service
    # For new multi-service bookings: derive from items
    service_name   = serializers.SerializerMethodField()
    service_icon   = serializers.SerializerMethodField()
    service_id     = serializers.SerializerMethodField()
    items          = BookingItemSerializer(many=True, read_only=True)
    provider_name  = serializers.SerializerMethodField()
    provider_id    = serializers.IntegerField(source='provider.id', read_only=True)
    customer_name  = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    scheduled_time = serializers.TimeField(format='%H:%M')

    class Meta:
        model = Booking
        fields = (
            'id', 'service_name', 'service_icon', 'service_id', 'items',
            'provider_name', 'provider_id', 'customer_name',
            'status', 'status_display', 'scheduled_date', 'scheduled_time',
            'total_price', 'proposed_price', 'negotiation_status', 'negotiation_note',
            'address', 'city', 'pincode', 'created_at',
        )

    def get_service_name(self, obj):
        if obj.service_id:
            return obj.service.name
        first = obj.items.first()
        if not first:
            return '—'
        rest = obj.items.count() - 1
        return first.service.name + (f' +{rest} more' if rest else '')

    def get_service_icon(self, obj):
        if obj.service_id:
            return obj.service.category.icon
        first = obj.items.select_related('service__category').first()
        return first.service.category.icon if first else 'wrench'

    def get_service_id(self, obj):
        if obj.service_id:
            return obj.service_id
        first = obj.items.first()
        return first.service_id if first else None

    def get_provider_name(self, obj):
        return obj.provider.user.full_name or obj.provider.user.phone

    def get_customer_name(self, obj):
        return obj.customer.full_name or obj.customer.phone


class BookingDetailSerializer(serializers.ModelSerializer):
    service        = ServiceSerializer(read_only=True)
    items          = BookingItemSerializer(many=True, read_only=True)
    provider       = ProviderListSerializer(read_only=True)
    logs           = BookingStatusLogSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    scheduled_time = serializers.TimeField(format='%I:%M %p')
    can_cancel     = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = (
            'id', 'service', 'items', 'provider', 'status', 'status_display',
            'scheduled_date', 'scheduled_time', 'address', 'city', 'pincode',
            'notes', 'total_price', 'proposed_price', 'negotiation_status', 'negotiation_note',
            'can_cancel', 'created_at', 'confirmed_at', 'completed_at', 'cancelled_at',
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
