from rest_framework import serializers
from .models import Category, Service, ProviderProfile
from apps.users.serializers import UserSerializer


class CategorySerializer(serializers.ModelSerializer):
    service_count = serializers.IntegerField(source='services.count', read_only=True)

    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'icon', 'description', 'service_count')


class ServiceSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_icon = serializers.CharField(source='category.icon', read_only=True)
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


class ProviderListSerializer(serializers.ModelSerializer):
    full_name    = serializers.CharField(source='user.full_name', read_only=True)
    avatar       = serializers.ImageField(source='user.avatar', read_only=True)
    services     = ServiceSerializer(many=True, read_only=True)

    class Meta:
        model = ProviderProfile
        fields = (
            'id', 'full_name', 'avatar', 'bio', 'experience_years',
            'hourly_rate', 'city', 'is_available', 'is_verified',
            'avg_rating', 'total_reviews', 'total_jobs', 'services',
        )


class ProviderDetailSerializer(ProviderListSerializer):
    user = UserSerializer(read_only=True)

    class Meta(ProviderListSerializer.Meta):
        fields = ProviderListSerializer.Meta.fields + ('user', 'latitude', 'longitude', 'created_at')


class ProviderUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderProfile
        fields = (
            'bio', 'experience_years', 'hourly_rate',
            'city', 'latitude', 'longitude', 'is_available', 'services',
        )
