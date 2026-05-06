from django.urls import path
from . import views

urlpatterns = [
    # Categories
    path('categories/',              views.CategoryListView.as_view(),      name='category-list'),

    # Services
    path('services/',                views.ServiceListView.as_view(),       name='service-list'),
    path('services/<slug:slug>/',    views.ServiceDetailView.as_view(),     name='service-detail'),

    # Providers
    path('providers/',               views.ProviderListView.as_view(),      name='provider-list'),
    path('providers/<int:pk>/',      views.ProviderDetailView.as_view(),    name='provider-detail'),
    path('providers/me/',            views.MyProviderProfileView.as_view(), name='provider-me'),
]
