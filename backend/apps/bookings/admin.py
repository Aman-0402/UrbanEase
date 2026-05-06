from django.contrib import admin
from .models import Booking, BookingStatusLog


class BookingStatusLogInline(admin.TabularInline):
    model = BookingStatusLog
    extra = 0
    readonly_fields = ('from_status', 'to_status', 'changed_by', 'note', 'created_at')
    can_delete = False


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display  = ('id', 'customer', 'service', 'provider', 'status', 'scheduled_date', 'total_price', 'created_at')
    list_filter   = ('status', 'scheduled_date', 'city')
    search_fields = ('customer__phone', 'customer__full_name', 'service__name', 'provider__user__full_name')
    readonly_fields = ('created_at', 'updated_at', 'confirmed_at', 'completed_at', 'cancelled_at')
    inlines = [BookingStatusLogInline]
    ordering = ('-created_at',)


@admin.register(BookingStatusLog)
class BookingStatusLogAdmin(admin.ModelAdmin):
    list_display = ('booking', 'from_status', 'to_status', 'changed_by', 'created_at')
    readonly_fields = ('created_at',)
