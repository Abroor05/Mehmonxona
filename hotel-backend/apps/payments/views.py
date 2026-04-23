from django.utils import timezone
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Payment
from .serializers import PaymentSerializer
from apps.users.permissions import IsAdminOrManager, IsStaffMember


class PaymentListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/v1/payments/"""
    serializer_class   = PaymentSerializer
    permission_classes = [IsStaffMember]

    def get_queryset(self):
        qs = Payment.objects.select_related('booking', 'processed_by')
        if m := self.request.query_params.get('method'):
            qs = qs.filter(method=m)
        if s := self.request.query_params.get('status'):
            qs = qs.filter(status=s)
        return qs


class PaymentDetailView(generics.RetrieveUpdateAPIView):
    """GET/PUT /api/v1/payments/<id>/"""
    serializer_class   = PaymentSerializer
    permission_classes = [IsStaffMember]
    queryset           = Payment.objects.all()


class RefundView(APIView):
    """POST /api/v1/payments/<id>/refund/"""
    permission_classes = [IsAdminOrManager]

    def post(self, request, pk):
        try:
            payment = Payment.objects.get(pk=pk)
        except Payment.DoesNotExist:
            return Response({'error': 'Payment not found.'}, status=status.HTTP_404_NOT_FOUND)

        if payment.status != Payment.Status.COMPLETED:
            return Response({'error': 'Only completed payments can be refunded.'},
                            status=status.HTTP_400_BAD_REQUEST)

        payment.status = Payment.Status.REFUNDED
        payment.notes  = f'Refunded by {request.user.get_full_name()} on {timezone.now()}'
        payment.save(update_fields=['status', 'notes', 'updated_at'])
        return Response(PaymentSerializer(payment).data)


class InvoiceView(APIView):
    """GET /api/v1/payments/invoice/<booking_id>/"""
    permission_classes = [IsStaffMember]

    def get(self, request, booking_id):
        from apps.bookings.models import Booking
        try:
            booking = Booking.objects.get(pk=booking_id)
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found.'}, status=status.HTTP_404_NOT_FOUND)

        payments = Payment.objects.filter(booking=booking)
        paid     = sum(p.amount for p in payments if p.status == Payment.Status.COMPLETED)

        return Response({
            'booking_number': booking.booking_number,
            'customer':       booking.customer.get_full_name(),
            'room':           booking.room.room_number,
            'check_in':       booking.check_in,
            'check_out':      booking.check_out,
            'nights':         booking.nights,
            'total_amount':   booking.total_amount,
            'paid_amount':    paid,
            'balance_due':    booking.balance_due,
            'payments':       PaymentSerializer(payments, many=True).data,
        })
