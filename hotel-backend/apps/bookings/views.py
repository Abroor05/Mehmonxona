"""
Booking views — fixed version.

Fixes:
1. BookingListCreateView properly passes request context to serializer
2. CheckInView and CheckOutView handle edge cases
3. Added proper error messages
"""

from django.utils import timezone
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .models import Booking
from .serializers import BookingSerializer
from apps.rooms.models import Room
from apps.users.permissions import IsAdminOrManagerOrReceptionist


class BookingListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/bookings/  — list bookings
    POST /api/v1/bookings/  — create booking

    Customers see only their own bookings.
    Staff see all bookings.
    """
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs   = Booking.objects.select_related('room', 'customer').all()

        # Customers only see their own bookings
        if user.role == 'customer':
            qs = qs.filter(customer=user)

        # Optional filters
        if s := self.request.query_params.get('status'):
            qs = qs.filter(status=s)
        if room_id := self.request.query_params.get('room'):
            qs = qs.filter(room_id=room_id)
        if booking_number := self.request.query_params.get('booking_number'):
            qs = qs.filter(booking_number__iexact=booking_number)

        return qs

    def perform_create(self, serializer):
        # FIX: Pass request context so serializer can set customer
        serializer.save()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/bookings/<id>/
    PUT    /api/v1/bookings/<id>/
    DELETE /api/v1/bookings/<id>/
    """
    serializer_class = BookingSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        return [IsAdminOrManagerOrReceptionist()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'customer':
            return Booking.objects.filter(customer=user)
        return Booking.objects.select_related('room', 'customer').all()


class CheckInView(APIView):
    """
    POST /api/v1/bookings/check-in/
    Body: {"booking_number": "BK-XXXXXXXX"} or {"booking_id": 1}
    """
    permission_classes = [IsAdminOrManagerOrReceptionist]

    def post(self, request):
        booking_number = request.data.get('booking_number')
        booking_id     = request.data.get('booking_id')

        # Find booking
        try:
            if booking_number:
                booking = Booking.objects.select_related('room').get(
                    booking_number=booking_number
                )
            elif booking_id:
                booking = Booking.objects.select_related('room').get(pk=booking_id)
            else:
                return Response(
                    {'error': 'Provide booking_number or booking_id.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Validate status
        if booking.status != Booking.Status.CONFIRMED:
            return Response(
                {'error': f'Cannot check in. Current status: "{booking.status}". Must be "confirmed".'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Perform check-in
        booking.status          = Booking.Status.CHECKED_IN
        booking.actual_check_in = timezone.now()
        booking.save(update_fields=['status', 'actual_check_in', 'updated_at'])

        # Update room status
        room = booking.room
        room.status = Room.Status.BOOKED
        room.save(update_fields=['status', 'updated_at'])

        return Response({
            'message': 'Check-in successful.',
            'booking': BookingSerializer(booking).data,
        })


class CheckOutView(APIView):
    """
    POST /api/v1/bookings/check-out/
    Body: {"booking_id": 1}
    """
    permission_classes = [IsAdminOrManagerOrReceptionist]

    def post(self, request):
        booking_id = request.data.get('booking_id')
        if not booking_id:
            return Response(
                {'error': 'booking_id is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            booking = Booking.objects.select_related('room').get(pk=booking_id)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Validate status
        if booking.status != Booking.Status.CHECKED_IN:
            return Response(
                {'error': f'Cannot check out. Current status: "{booking.status}". Must be "checked_in".'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check outstanding balance
        balance = booking.balance_due
        if balance > 0:
            return Response(
                {'error': f'Outstanding balance: {balance}. Please settle payment first.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Perform check-out
        booking.status           = Booking.Status.CHECKED_OUT
        booking.actual_check_out = timezone.now()
        booking.save(update_fields=['status', 'actual_check_out', 'updated_at'])

        # Free the room
        room = booking.room
        room.status = Room.Status.CLEANING
        room.save(update_fields=['status', 'updated_at'])

        return Response({
            'message': 'Check-out successful.',
            'booking': BookingSerializer(booking).data,
        })


class CancelBookingView(APIView):
    """
    POST /api/v1/bookings/<id>/cancel/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            booking = Booking.objects.select_related('room').get(pk=pk)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Customers can only cancel their own bookings
        if request.user.role == 'customer' and booking.customer != request.user:
            return Response(
                {'error': 'Permission denied.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Cannot cancel active or completed bookings
        if booking.status in (Booking.Status.CHECKED_IN, Booking.Status.CHECKED_OUT):
            return Response(
                {'error': f'Cannot cancel booking with status "{booking.status}".'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if booking.status == Booking.Status.CANCELLED:
            return Response(
                {'error': 'Booking is already cancelled.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Cancel booking
        booking.status = Booking.Status.CANCELLED
        booking.save(update_fields=['status', 'updated_at'])

        # Free the room if it was marked as booked
        if booking.room.status == Room.Status.BOOKED:
            booking.room.status = Room.Status.AVAILABLE
            booking.room.save(update_fields=['status', 'updated_at'])

        return Response({
            'message': 'Booking cancelled successfully.',
            'booking_number': booking.booking_number,
        })
