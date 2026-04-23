from django.contrib import admin
from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display  = ['booking_number', 'customer', 'room', 'check_in',
                     'check_out', 'guests_count', 'status', 'total_amount']
    list_filter   = ['status', 'check_in', 'check_out']
    search_fields = ['booking_number', 'customer__first_name',
                     'customer__last_name', 'room__room_number']
    ordering      = ['-created_at']
    readonly_fields = ['booking_number', 'total_amount', 'actual_check_in',
                       'actual_check_out', 'created_at', 'updated_at']

    fieldsets = (
        ('Bron ma\'lumotlari', {'fields': ('booking_number', 'customer', 'room')}),
        ('Sanalar',            {'fields': ('check_in', 'check_out',
                                           'actual_check_in', 'actual_check_out')}),
        ('Holat va summa',     {'fields': ('status', 'guests_count',
                                           'total_amount', 'discount_amount')}),
        ('Qo\'shimcha',        {'fields': ('notes', 'created_by', 'created_at', 'updated_at')}),
    )
