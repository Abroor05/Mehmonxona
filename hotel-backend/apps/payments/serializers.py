"""
Payment serializers — fixed version.

Fixes:
1. processed_by is now auto-set from request.user (not required in body)
2. status is auto-set to COMPLETED on create
3. Added booking_number for easier identification
"""

from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    booking_number    = serializers.CharField(source='booking.booking_number', read_only=True)
    processed_by_name = serializers.SerializerMethodField()

    class Meta:
        model  = Payment
        fields = '__all__'
        read_only_fields = [
            'id', 'transaction_number',
            # FIX: processed_by is auto-set from request.user
            'processed_by',
            'processed_at', 'updated_at',
            'booking_number', 'processed_by_name',
        ]

    def get_processed_by_name(self, obj):
        return obj.processed_by.get_full_name() if obj.processed_by else None

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError('Amount must be greater than 0.')
        return value

    def create(self, validated_data):
        # FIX: Auto-set processed_by and status
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['processed_by'] = request.user
        validated_data['status'] = Payment.Status.COMPLETED
        return super().create(validated_data)
