from django.contrib import admin
from .models import StaffProfile, Schedule


@admin.register(StaffProfile)
class StaffProfileAdmin(admin.ModelAdmin):
    list_display  = ['user', 'hourly_rate', 'hire_date', 'is_active']
    list_filter   = ['is_active', 'user__role']
    search_fields = ['user__first_name', 'user__last_name', 'user__email']
    ordering      = ['user__first_name']


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display  = ['staff', 'date', 'start_time', 'end_time', 'hours_worked']
    list_filter   = ['date']
    search_fields = ['staff__user__first_name', 'staff__user__last_name']
    ordering      = ['-date']
    readonly_fields = ['hours_worked']
