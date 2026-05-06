from django.urls import path
from . import views

urlpatterns = [
    # Customer creates/reads review for a specific booking
    path('bookings/<int:booking_pk>/review/', views.BookingReviewView.as_view(), name='booking-review'),

    # List all reviews for a provider (public)
    path('providers/<int:provider_pk>/reviews/', views.ProviderReviewListView.as_view(), name='provider-reviews'),

    # Customer sees their own reviews
    path('reviews/mine/', views.MyReviewsView.as_view(), name='my-reviews'),
]
