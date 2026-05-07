from django.urls import path
from . import views

urlpatterns = [
    path('admin-api/stats/',                      views.platform_stats,              name='admin-stats'),
    path('admin-api/users/',                      views.AdminUserListView.as_view(),  name='admin-users'),
    path('admin-api/users/<int:pk>/toggle/',      views.toggle_user_active,          name='admin-user-toggle'),
    path('admin-api/bookings/',                   views.AdminBookingListView.as_view(),  name='admin-bookings'),
    path('admin-api/providers/',                  views.AdminProviderListView.as_view(), name='admin-providers'),
    path('admin-api/providers/<int:pk>/verify/',  views.toggle_provider_verified,    name='admin-provider-verify'),
    path('admin-api/kyc/',                        views.AdminKYCListView.as_view(),   name='admin-kyc-list'),
    path('admin-api/kyc/<int:pk>/review/',        views.admin_kyc_review,            name='admin-kyc-review'),
]
