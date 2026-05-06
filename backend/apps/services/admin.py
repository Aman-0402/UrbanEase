from django.contrib import admin
from .models import Category, Service, ProviderProfile


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display  = ('icon', 'name', 'slug', 'is_active', 'order')
    list_editable = ('is_active', 'order')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display  = ('name', 'category', 'base_price', 'duration_minutes', 'is_active')
    list_filter   = ('category', 'is_active')
    list_editable = ('is_active',)
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'category__name')


@admin.register(ProviderProfile)
class ProviderProfileAdmin(admin.ModelAdmin):
    list_display  = ('__str__', 'city', 'avg_rating', 'total_jobs', 'is_available', 'is_verified')
    list_filter   = ('is_verified', 'is_available', 'city')
    list_editable = ('is_verified', 'is_available')
    search_fields = ('user__phone', 'user__full_name', 'city')
    filter_horizontal = ('services',)
