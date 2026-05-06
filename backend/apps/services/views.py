from rest_framework import generics, filters, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Service, ProviderProfile
from .serializers import (
    CategorySerializer, ServiceSerializer,
    ProviderListSerializer, ProviderDetailSerializer, ProviderUpdateSerializer,
)
from .filters import ProviderFilter


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = (permissions.AllowAny,)


class ServiceListView(generics.ListAPIView):
    queryset = Service.objects.filter(is_active=True).select_related('category')
    serializer_class = ServiceSerializer
    permission_classes = (permissions.AllowAny,)
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_fields = ('category__slug',)
    search_fields = ('name', 'description', 'category__name')
    ordering_fields = ('base_price', 'name')


class ServiceDetailView(generics.RetrieveAPIView):
    queryset = Service.objects.filter(is_active=True).select_related('category')
    serializer_class = ServiceSerializer
    permission_classes = (permissions.AllowAny,)
    lookup_field = 'slug'


class ProviderListView(generics.ListAPIView):
    queryset = (ProviderProfile.objects
                .filter(is_verified=True)
                .select_related('user')
                .prefetch_related('services'))
    serializer_class = ProviderListSerializer
    permission_classes = (permissions.AllowAny,)
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_class = ProviderFilter
    search_fields = ('user__full_name', 'city', 'services__name')
    ordering_fields = ('avg_rating', 'hourly_rate', 'total_jobs')
    ordering = ('-avg_rating',)


class ProviderDetailView(generics.RetrieveAPIView):
    queryset = ProviderProfile.objects.select_related('user').prefetch_related('services')
    serializer_class = ProviderDetailSerializer
    permission_classes = (permissions.AllowAny,)


class MyProviderProfileView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        profile, _ = ProviderProfile.objects.get_or_create(user=request.user)
        return Response(ProviderDetailSerializer(profile).data)

    def patch(self, request):
        profile, _ = ProviderProfile.objects.get_or_create(user=request.user)
        serializer = ProviderUpdateSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(ProviderDetailSerializer(profile).data)
