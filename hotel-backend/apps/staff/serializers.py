from rest_framework import serializers
from .models import StaffProfile, Schedule


class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Schedule
        fields = '__all__'
        read_only_fields = ['id', 'hours_worked']


class StaffProfileSerializer(serializers.ModelSerializer):
    # Frontend normalize() funksiyasi uchun kerakli fieldlar
    full_name  = serializers.SerializerMethodField()
    role       = serializers.CharField(source='user.role',       read_only=True)
    email      = serializers.CharField(source='user.email',      read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name  = serializers.CharField(source='user.last_name',  read_only=True)
    phone      = serializers.CharField(source='user.phone',      read_only=True)
    username   = serializers.CharField(source='user.username',   read_only=True)

    class Meta:
        model  = StaffProfile
        fields = '__all__'
        read_only_fields = ['id']

    def get_full_name(self, obj):
        return obj.user.get_full_name()
