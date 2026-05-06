import django_filters
from .models import ProviderProfile


class ProviderFilter(django_filters.FilterSet):
    city          = django_filters.CharFilter(lookup_expr='icontains')
    service       = django_filters.NumberFilter(field_name='services__id')
    min_rating    = django_filters.NumberFilter(field_name='avg_rating', lookup_expr='gte')
    max_rate      = django_filters.NumberFilter(field_name='hourly_rate', lookup_expr='lte')
    is_available  = django_filters.BooleanFilter()

    class Meta:
        model = ProviderProfile
        fields = ('city', 'service', 'min_rating', 'max_rate', 'is_available')
