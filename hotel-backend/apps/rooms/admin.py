from django.contrib import admin
from .models import Room, RoomStatusLog


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display  = ['room_number', 'room_type', 'price_per_night', 'capacity', 'status', 'floor']
    list_filter   = ['room_type', 'status', 'floor']
    search_fields = ['room_number']
    ordering      = ['room_number']
    list_editable = ['status', 'price_per_night']

    fieldsets = (
        ('Asosiy',    {'fields': ('room_number', 'room_type', 'floor', 'capacity')}),
        ('Narx',      {'fields': ('price_per_night',)}),
        ('Holat',     {'fields': ('status', 'description')}),
    )


@admin.register(RoomStatusLog)
class RoomStatusLogAdmin(admin.ModelAdmin):
    list_display  = ['room', 'old_status', 'new_status', 'changed_by', 'reason', 'changed_at']
    list_filter   = ['new_status', 'old_status']
    readonly_fields = ['changed_at']
    ordering      = ['-changed_at']
