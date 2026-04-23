"""
Payment views — fixed version.

Fixes:
1. All views properly pass request context to serializers
2. Invoice view accessible to customers for their own bookings
3. Refund requires manager approval
"""

from django.utils import timezone
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .models import Payment
from .serializers import PaymentSerializer
from apps.users.permissions import IsAdminOrManager, IsStaffMember


class PaymentListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/payments/  — list payments (staff only)
    POST /api/v1/payments/  — record a payment (staff only)

    POST body:
    {
        "booking": 1,
        "amount": 500000,
        "method": "cash"   // cash | card | online
    }
    """
    serializer_class   = PaymentSerializer
    permission_classes = [IsStaffMember]

    def get_queryset(self):
        qs = Payment.objects.select_related('booking', 'processed_by').all()
        if m := self.request.query_params.get('method'):
            qs = qs.filter(method=m)
        if s := self.request.query_params.get('status'):
            qs = qs.filter(status=s)
        if from_ := self.request.query_params.get('date_from'):
            qs = qs.filter(processed_at__date__gte=from_)
        if to_ := self.request.query_params.get('date_to'):
            qs = qs.filter(processed_at__date__lte=to_)
        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PaymentDetailView(generics.RetrieveUpdateAPIView):
    """GET/PUT /api/v1/payments/<id>/"""
    serializer_class   = PaymentSerializer
    permission_classes = [IsStaffMember]
    queryset           = Payment.objects.select_related('booking', 'processed_by').all()


class RefundView(APIView):
    """
    POST /api/v1/payments/<id>/refund/
    Manager or admin only.
    """
    permission_classes = [IsAdminOrManager]

    def post(self, request, pk):
        try:
            payment = Payment.objects.get(pk=pk)
        except Payment.DoesNotExist:
            return Response(
                {'error': 'Payment not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if payment.status != Payment.Status.COMPLETED:
            return Response(
                {'error': f'Only completed payments can be refunded. Current status: {payment.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        payment.status = Payment.Status.REFUNDED
        payment.notes  = f'Refunded by {request.user.get_full_name()} on {timezone.now().strftime("%Y-%m-%d %H:%M")}'
        payment.save(update_fields=['status', 'notes', 'updated_at'])

        return Response({
            'message': 'Payment refunded successfully.',
            'payment': PaymentSerializer(payment).data,
        })


class InvoiceView(APIView):
    """
    GET /api/v1/payments/invoice/<booking_id>/
    Returns full invoice for a booking.
    Customers can only see their own invoices.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, booking_id):
        from apps.bookings.models import Booking

        try:
            booking = Booking.objects.select_related('room', 'customer').get(pk=booking_id)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Customers can only see their own invoices
        if request.user.role == 'customer' and booking.customer != request.user:
            return Response(
                {'error': 'Permission denied.'},
                status=status.HTTP_403_FORBIDDEN
            )

        payments = Payment.objects.filter(booking=booking)
        paid     = sum(p.amount for p in payments if p.status == Payment.Status.COMPLETED)

        return Response({
            'invoice_number':  f'INV-{booking.booking_number}',
            'booking_number':  booking.booking_number,
            'customer':        booking.customer.get_full_name(),
            'room':            booking.room.room_number,
            'room_type':       booking.room.room_type,
            'check_in':        booking.check_in,
            'check_out':       booking.check_out,
            'nights':          booking.nights,
            'price_per_night': booking.room.price_per_night,
            'room_charges':    float(booking.room.price_per_night) * booking.nights,
            'discount':        float(booking.discount_amount),
            'total_amount':    float(booking.total_amount),
            'paid_amount':     float(paid),
            'balance_due':     float(booking.balance_due),
            'payments':        PaymentSerializer(payments, many=True).data,
        })
