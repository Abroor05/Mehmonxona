from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display  = ['transaction_number', 'booking', 'amount',
                     'method', 'status', 'processed_by', 'processed_at']
    list_filter   = ['method', 'status', 'processed_at']
    search_fields = ['transaction_number', 'booking__booking_number']
    ordering      = ['-processed_at']
    readonly_fields = ['transaction_number', 'processed_at', 'updated_at']

    fieldsets = (
        ('To\'lov',    {'fields': ('transaction_number', 'booking', 'amount', 'method')}),
        ('Holat',      {'fields': ('status', 'notes')}),
        ('Xodim',      {'fields': ('processed_by', 'processed_at', 'updated_at')}),
    )
