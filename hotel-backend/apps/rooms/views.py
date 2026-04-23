"""
Room views — fixed version.

Fixes:
1. AvailableRoomsView properly handles missing query params
2. RoomStatusUpdateView logs changes correctly
3. All views return proper status codes
"""

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .models import Room, RoomStatusLog
from .serializers import RoomSerializer, RoomStatusUpdateSerializer, RoomStatusLogSerializer
from apps.users.permissions import IsAdminOrManager, IsStaffMember


class RoomListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/rooms/  — list all rooms
    POST /api/v1/rooms/  — create room (admin/manager only)

    Filters: ?status=available&room_type=vip&floor=2
    """
    serializer_class = RoomSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminOrManager()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = Room.objects.all()
        if s := self.request.query_params.get('status'):
            qs = qs.filter(status=s)
        if t := self.request.query_params.get('room_type'):
            qs = qs.filter(room_type=t)
        if f := self.request.query_params.get('floor'):
            qs = qs.filter(floor=f)
        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class RoomDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/rooms/<id>/
    PUT    /api/v1/rooms/<id>/
    DELETE /api/v1/rooms/<id>/
    """
    queryset         = Room.objects.all()
    serializer_class = RoomSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        return [IsAdminOrManager()]


class RoomStatusUpdateView(APIView):
    """
    PATCH /api/v1/rooms/<id>/status/
    Body: {"status": "cleaning", "reason": "Guest checked out"}
    """
    permission_classes = [IsStaffMember]

    def patch(self, request, pk):
        try:
            room = Room.objects.get(pk=pk)
        except Room.DoesNotExist:
            return Response(
                {'error': 'Room not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = RoomStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        old_status = room.status
        new_status = serializer.validated_data['status']

        # Log the status change
        RoomStatusLog.objects.create(
            room=room,
            old_status=old_status,
            new_status=new_status,
            changed_by=request.user,
            reason=serializer.validated_data.get('reason', ''),
        )

        room.status = new_status
        room.save(update_fields=['status', 'updated_at'])

        return Response({
            'message': f'Room status changed from {old_status} to {new_status}.',
            'room': RoomSerializer(room).data,
        })


class AvailableRoomsView(generics.ListAPIView):
    """
    GET /api/v1/rooms/available/
    Query params: check_in, check_out, room_type (optional), capacity (optional)

    Example: /api/v1/rooms/available/?check_in=2024-05-01&check_out=2024-05-05
    """
    serializer_class   = RoomSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        check_in  = self.request.query_params.get('check_in')
        check_out = self.request.query_params.get('check_out')

        # Start with all available rooms
        qs = Room.objects.filter(status=Room.Status.AVAILABLE)

        # If dates provided, exclude rooms with overlapping bookings
        if check_in and check_out:
            from apps.bookings.models import Booking
            booked_ids = Booking.objects.filter(
                status__in=[Booking.Status.CONFIRMED, Booking.Status.CHECKED_IN],
                check_in__lt=check_out,
                check_out__gt=check_in,
            ).values_list('room_id', flat=True)
            qs = qs.exclude(id__in=booked_ids)

        # Optional filters
        if t := self.request.query_params.get('room_type'):
            qs = qs.filter(room_type=t)
        if cap := self.request.query_params.get('capacity'):
            qs = qs.filter(capacity__gte=cap)

        return qs


class RoomStatusLogView(generics.ListAPIView):
    """GET /api/v1/rooms/<id>/logs/"""
    serializer_class   = RoomStatusLogSerializer
    permission_classes = [IsStaffMember]

    def get_queryset(self):
        return RoomStatusLog.objects.filter(
            room_id=self.kwargs['pk']
        ).select_related('changed_by')
