from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .models import Room, RoomStatusLog
from .serializers import RoomSerializer, RoomStatusUpdateSerializer, RoomStatusLogSerializer
from apps.users.permissions import IsAdminOrManager, IsStaffMember


class RoomListCreateView(generics.ListCreateAPIView):
    """GET /api/v1/rooms/  |  POST /api/v1/rooms/"""
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
        return qs


class RoomDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/DELETE /api/v1/rooms/<id>/"""
    queryset         = Room.objects.all()
    serializer_class = RoomSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        return [IsAdminOrManager()]


class RoomStatusUpdateView(APIView):
    """PATCH /api/v1/rooms/<id>/status/"""
    permission_classes = [IsStaffMember]

    def patch(self, request, pk):
        room = generics.get_object_or_404(Room, pk=pk)
        s = RoomStatusUpdateSerializer(data=request.data)
        s.is_valid(raise_exception=True)

        old_status = room.status
        new_status = s.validated_data['status']

        RoomStatusLog.objects.create(
            room=room, old_status=old_status, new_status=new_status,
            changed_by=request.user, reason=s.validated_data.get('reason', ''),
        )
        room.status = new_status
        room.save(update_fields=['status', 'updated_at'])
        return Response(RoomSerializer(room).data)


class AvailableRoomsView(generics.ListAPIView):
    """GET /api/v1/rooms/available/?check_in=2024-05-01&check_out=2024-05-05"""
    serializer_class   = RoomSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        check_in  = self.request.query_params.get('check_in')
        check_out = self.request.query_params.get('check_out')
        if not check_in or not check_out:
            return Room.objects.filter(status=Room.Status.AVAILABLE)

        from apps.bookings.models import Booking
        booked_ids = Booking.objects.filter(
            status__in=[Booking.Status.CONFIRMED, Booking.Status.CHECKED_IN],
            check_in__lt=check_out,
            check_out__gt=check_in,
        ).values_list('room_id', flat=True)

        return Room.objects.exclude(id__in=booked_ids).filter(status=Room.Status.AVAILABLE)


class RoomStatusLogView(generics.ListAPIView):
    """GET /api/v1/rooms/<id>/logs/"""
    serializer_class   = RoomStatusLogSerializer
    permission_classes = [IsStaffMember]

    def get_queryset(self):
        return RoomStatusLog.objects.filter(room_id=self.kwargs['pk'])
