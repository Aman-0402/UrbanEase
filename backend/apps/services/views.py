import math
from django.utils import timezone
from rest_framework import generics, filters, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Service, ProviderProfile, ProviderKYCDocument
from .serializers import (
    CategorySerializer, ServiceSerializer,
    ProviderListSerializer, ProviderDetailSerializer, ProviderUpdateSerializer,
    KYCDocumentSerializer,
)
from .filters import ProviderFilter


def _haversine_km(lat1, lon1, lat2, lon2):
    R = 6371
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    a = (math.sin(math.radians(lat2 - lat1) / 2) ** 2
         + math.cos(phi1) * math.cos(phi2)
         * math.sin(math.radians(lon2 - lon1) / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = (permissions.AllowAny,)


class ServiceListView(generics.ListAPIView):
    queryset = Service.objects.filter(is_active=True).select_related('category')
    serializer_class = ServiceSerializer
    permission_classes = (permissions.AllowAny,)
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_fields = ('category__slug', 'category')
    search_fields = ('name', 'description', 'category__name')
    ordering_fields = ('base_price', 'name')


class ServiceDetailView(generics.RetrieveAPIView):
    queryset = Service.objects.filter(is_active=True).select_related('category')
    serializer_class = ServiceSerializer
    permission_classes = (permissions.AllowAny,)
    lookup_field = 'slug'


class ProviderListView(generics.ListAPIView):
    queryset = (ProviderProfile.objects
                .select_related('user')
                .prefetch_related('services'))
    serializer_class = ProviderListSerializer
    permission_classes = (permissions.AllowAny,)
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_class = ProviderFilter
    search_fields = ('user__full_name', 'city', 'services__name')
    ordering_fields = ('avg_rating', 'hourly_rate', 'total_jobs')
    ordering = ('-avg_rating',)

    def list(self, request, *args, **kwargs):
        qs = self.filter_queryset(self.get_queryset())

        # Check for geo params before pagination so distance-sort works across the full result set
        try:
            user_lat = float(request.query_params['lat'])
            user_lng = float(request.query_params['lng'])
            geo = True
        except (KeyError, ValueError, TypeError):
            geo = False

        # If distance sort requested, compute distances and sort before pagination
        if geo and request.query_params.get('ordering') == 'distance':
            profiles = list(qs)
            def dist_key(p):
                if p.latitude and p.longitude:
                    return _haversine_km(user_lat, user_lng, float(p.latitude), float(p.longitude))
                return float('inf')
            profiles.sort(key=dist_key)
            page = self.paginate_queryset(profiles)
            items = page if page is not None else profiles
        else:
            page = self.paginate_queryset(qs)
            items = page if page is not None else list(qs)

        data = list(self.get_serializer(items, many=True).data)

        if geo:
            for item, profile in zip(data, items):
                if profile.latitude and profile.longitude:
                    item['distance_km'] = round(
                        _haversine_km(user_lat, user_lng, float(profile.latitude), float(profile.longitude)), 1
                    )
                else:
                    item['distance_km'] = None

        if page is not None:
            return self.get_paginated_response(data)
        return Response(data)


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


class MyKYCView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def _get_profile(self, request):
        profile, _ = ProviderProfile.objects.get_or_create(user=request.user)
        return profile

    def get(self, request):
        profile = self._get_profile(request)
        kyc, _ = ProviderKYCDocument.objects.get_or_create(provider=profile)
        return Response(KYCDocumentSerializer(kyc).data)

    def put(self, request):
        profile = self._get_profile(request)
        kyc, _ = ProviderKYCDocument.objects.get_or_create(provider=profile)

        if kyc.kyc_status == ProviderKYCDocument.VERIFIED:
            return Response({'detail': 'KYC already verified. Contact support to update.'}, status=400)

        serializer = KYCDocumentSerializer(kyc, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        kyc = serializer.save(
            kyc_status=ProviderKYCDocument.PENDING_REVIEW,
            submitted_at=timezone.now(),
            rejection_reason='',
        )
        return Response(KYCDocumentSerializer(kyc).data, status=status.HTTP_200_OK)
