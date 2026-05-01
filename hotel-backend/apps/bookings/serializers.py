"""
Booking serializers — fixed version.

Fixes:
1. customer and created_by are now properly set in create(), not required in request body
2. Validation logic cleaned up
3. Added nested room/customer info for GET responses
"""

from rest_framework import serializers
from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    """
    Full booking serializer.
    - customer and created_by are auto-set from request.user
    - nights and balance_due are computed properties
    """
    nights      = serializers.ReadOnlyField()
    balance_due = serializers.ReadOnlyField()

    # Nested read-only info for GET responses
    room_number    = serializers.CharField(source='room.room_number', read_only=True)
    room_type      = serializers.CharField(source='room.room_type', read_only=True)
    customer_name  = serializers.SerializerMethodField()

    class Meta:
        model  = Booking
        fields = '__all__'
        read_only_fields = [
            'id', 'booking_number', 'total_amount',
            'actual_check_in', 'actual_check_out',
            'created_at', 'updated_at',
            # FIX: customer and created_by must be read_only
            # They are set automatically in create()
            'customer', 'created_by',
            'room_number', 'room_type', 'customer_name',
        ]

    def get_customer_name(self, obj):
        return obj.customer.get_full_name() if obj.customer else None

    def validate(self, attrs):
        check_in  = attrs.get('check_in')
        check_out = attrs.get('check_out')
        room      = attrs.get('room')

        # Date validation
        if check_in and check_out:
            if check_in >= check_out:
                raise serializers.ValidationError({
                    'check_out': 'Chiqish sanasi kirish sanasidan keyin bo\'lishi kerak.'
                })

        # Double-booking prevention
        if room and check_in and check_out:
            qs = Booking.objects.filter(
                room=room,
                status__in=[Booking.Status.CONFIRMED, Booking.Status.CHECKED_IN],
                check_in__lt=check_out,
                check_out__gt=check_in,
            )
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError({
                    'room': 'Bu xona tanlangan sanalar uchun allaqachon band.'
                })
        return attrs

    def create(self, validated_data):
        # FIX: Set customer and created_by from request context
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['customer']   = request.user
            validated_data['created_by'] = request.user
        validated_data['status'] = Booking.Status.CONFIRMED
        return super().create(validated_data)
