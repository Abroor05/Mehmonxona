from rest_framework import serializers
from .models import Room, RoomStatusLog


class RoomSerializer(serializers.ModelSerializer):
    is_available = serializers.ReadOnlyField()

    class Meta:
        model  = Room
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class RoomStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Room.Status.choices)
    reason = serializers.CharField(max_length=255, required=False, allow_blank=True)


class RoomStatusLogSerializer(serializers.ModelSerializer):
    class Meta:
        model  = RoomStatusLog
        fields = '__all__'
