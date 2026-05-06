from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display  = ('id', 'reviewer', 'provider', 'rating', 'booking', 'created_at')
    list_filter   = ('rating',)
    search_fields = ('reviewer__phone', 'reviewer__full_name', 'provider__user__full_name')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)
