from rest_framework import serializers
from .models import Category, Service, ProviderProfile, ProviderService, ProviderKYCDocument
from apps.users.serializers import UserSerializer


class CategorySerializer(serializers.ModelSerializer):
    service_count = serializers.IntegerField(source='services.count', read_only=True)

    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'icon', 'description', 'service_count')


class ServiceSerializer(serializers.ModelSerializer):
    category_name    = serializers.CharField(source='category.name', read_only=True)
    category_icon    = serializers.CharField(source='category.icon', read_only=True)
    duration_display = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = (
            'id', 'name', 'slug', 'description', 'base_price',
            'duration_minutes', 'duration_display', 'image',
            'category', 'category_name', 'category_icon',
        )

    def get_duration_display(self, obj):
        h, m = divmod(obj.duration_minutes, 60)
        if h and m:
            return f'{h}h {m}m'
        return f'{h}h' if h else f'{m}m'


class ProviderServiceSerializer(serializers.ModelSerializer):
    """Read serializer for a provider's offered service including their custom price."""
    id               = serializers.IntegerField(source='service.id',           read_only=True)
    name             = serializers.CharField(source='service.name',            read_only=True)
    slug             = serializers.CharField(source='service.slug',            read_only=True)
    category_name    = serializers.CharField(source='service.category.name',   read_only=True)
    category_icon    = serializers.CharField(source='service.category.icon',   read_only=True)
    base_price       = serializers.DecimalField(source='service.base_price',   max_digits=8, decimal_places=2, read_only=True)
    duration_minutes = serializers.IntegerField(source='service.duration_minutes', read_only=True)
    duration_display = serializers.SerializerMethodField()
    # provider-specific price (null → fall back to base_price on frontend)
    custom_price     = serializers.DecimalField(max_digits=8, decimal_places=2, allow_null=True)

    class Meta:
        model  = ProviderService
        fields = (
            'id', 'name', 'slug', 'category_name', 'category_icon',
            'base_price', 'custom_price', 'duration_minutes', 'duration_display',
        )

    def get_duration_display(self, obj):
        h, m = divmod(obj.service.duration_minutes, 60)
        if h and m:
            return f'{h}h {m}m'
        return f'{h}h' if h else f'{m}m'


class ProviderListSerializer(serializers.ModelSerializer):
    full_name  = serializers.CharField(source='user.full_name', read_only=True)
    avatar     = serializers.ImageField(source='user.avatar',   read_only=True)
    services   = ProviderServiceSerializer(source='provider_services', many=True, read_only=True)
    kyc_status = serializers.SerializerMethodField()

    class Meta:
        model = ProviderProfile
        fields = (
            'id', 'full_name', 'avatar', 'bio', 'experience_years',
            'hourly_rate', 'city', 'is_available', 'is_verified',
            'avg_rating', 'total_reviews', 'total_jobs', 'services',
            'kyc_status',
        )

    def get_kyc_status(self, obj):
        kyc = getattr(obj, 'kyc', None)
        return kyc.kyc_status if kyc else 'not_submitted'


class ProviderDetailSerializer(ProviderListSerializer):
    user = UserSerializer(read_only=True)

    class Meta(ProviderListSerializer.Meta):
        fields = ProviderListSerializer.Meta.fields + ('user', 'latitude', 'longitude', 'created_at')


class ProviderUpdateSerializer(serializers.ModelSerializer):
    # Accepts: [{"id": 1, "custom_price": "500.00"}, ...]
    services = serializers.ListField(
        child=serializers.DictField(), required=False, write_only=True,
    )

    class Meta:
        model  = ProviderProfile
        fields = ('bio', 'experience_years', 'hourly_rate', 'city', 'latitude', 'longitude', 'is_available', 'services')

    def update(self, instance, validated_data):
        services_data = validated_data.pop('services', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if services_data is not None:
            ProviderService.objects.filter(provider=instance).delete()
            for item in services_data:
                svc_id = item.get('id')
                if not svc_id:
                    continue
                price = item.get('custom_price')
                ProviderService.objects.create(
                    provider=instance,
                    service_id=svc_id,
                    custom_price=price if price not in (None, '', '0') else None,
                )
        return instance


class KYCDocumentSerializer(serializers.ModelSerializer):
    kyc_status_display   = serializers.CharField(source='get_kyc_status_display', read_only=True)
    govt_id_type_display = serializers.CharField(source='get_govt_id_type_display', read_only=True)

    class Meta:
        model  = ProviderKYCDocument
        fields = (
            'id', 'govt_id_type', 'govt_id_type_display',
            'govt_id_number', 'id_front', 'id_back', 'selfie',
            'kyc_status', 'kyc_status_display',
            'rejection_reason', 'submitted_at', 'reviewed_at',
        )
        read_only_fields = ('kyc_status', 'rejection_reason', 'submitted_at', 'reviewed_at')


class AdminKYCSerializer(serializers.ModelSerializer):
    provider_name  = serializers.CharField(source='provider.user.full_name', read_only=True)
    provider_phone = serializers.CharField(source='provider.user.phone',     read_only=True)
    provider_id    = serializers.IntegerField(source='provider.id',          read_only=True)
    kyc_status_display   = serializers.CharField(source='get_kyc_status_display', read_only=True)
    govt_id_type_display = serializers.CharField(source='get_govt_id_type_display', read_only=True)

    class Meta:
        model  = ProviderKYCDocument
        fields = (
            'id', 'provider_id', 'provider_name', 'provider_phone',
            'govt_id_type', 'govt_id_type_display', 'govt_id_number',
            'id_front', 'id_back', 'selfie',
            'kyc_status', 'kyc_status_display',
            'rejection_reason', 'submitted_at', 'reviewed_at',
        )
        read_only_fields = (
            'provider_id', 'provider_name', 'provider_phone',
            'govt_id_type', 'govt_id_number', 'id_front', 'id_back', 'selfie',
            'submitted_at',
        )
