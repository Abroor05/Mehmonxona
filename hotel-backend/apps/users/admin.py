from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display  = ['username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'created_at']
    list_filter   = ['role', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering      = ['-created_at']

    fieldsets = (
        ('Login ma\'lumotlari', {'fields': ('username', 'password')}),
        ('Shaxsiy ma\'lumotlar', {'fields': ('first_name', 'last_name', 'email', 'phone')}),
        ('Rol va ruxsatlar',    {'fields': ('role', 'is_active', 'is_staff', 'is_superuser')}),
        ('Sanalar',             {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    readonly_fields = ['created_at', 'updated_at', 'last_login']

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields':  ('username', 'email', 'first_name', 'last_name',
                        'phone', 'role', 'password1', 'password2'),
        }),
    )
