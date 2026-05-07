from django.urls import path
from . import views

urlpatterns = [
    # Customer
    path('bookings/',                    views.BookingCreateView.as_view(),       name='booking-create'),
    path('bookings/my/',                 views.CustomerBookingListView.as_view(),  name='booking-my-list'),
    path('bookings/<int:pk>/',           views.BookingDetailView.as_view(),        name='booking-detail'),
    path('bookings/<int:pk>/status/',    views.BookingStatusUpdateView.as_view(),  name='booking-status'),
    path('bookings/<int:pk>/cancel/',    views.BookingCancelView.as_view(),        name='booking-cancel'),
    path('bookings/<int:pk>/negotiate/', views.propose_negotiation,                name='booking-negotiate'),
    path('bookings/<int:pk>/negotiate-response/', views.respond_negotiation,       name='booking-negotiate-response'),

    # Provider
    path('bookings/provider/',           views.ProviderBookingListView.as_view(),  name='booking-provider-list'),
    path('bookings/provider/earnings/',  views.provider_earnings,                  name='provider-earnings'),
]
