from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import Room, RoomImage, RoomStatusLog
from .serializers import (
    RoomSerializer, RoomImageSerializer,
    RoomStatusUpdateSerializer, RoomStatusLogSerializer,
)
from apps.users.permissions import IsAdminOrManager, IsStaffMember


class RoomListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/rooms/        — barcha xonalar ro'yxati
    POST /api/v1/rooms/        — yangi xona (admin/manager)
    Filters: ?status=available&room_type=vip&floor=2&page_size=200
    """
    serializer_class = RoomSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminOrManager()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = Room.objects.prefetch_related('images').all()
        if s := self.request.query_params.get('status'):
            qs = qs.filter(status=s)
        if t := self.request.query_params.get('room_type'):
            qs = qs.filter(room_type=t)
        if f := self.request.query_params.get('floor'):
            qs = qs.filter(floor=f)
        return qs

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class RoomDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/rooms/<id>/  — xona to'liq ma'lumoti (rasmlar bilan)
    PUT    /api/v1/rooms/<id>/  — yangilash (admin/manager)
    DELETE /api/v1/rooms/<id>/  — o'chirish (admin/manager)
    """
    queryset         = Room.objects.prefetch_related('images').all()
    serializer_class = RoomSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        return [IsAdminOrManager()]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


class RoomImageUploadView(APIView):
    """
    POST   /api/v1/rooms/<pk>/images/   — rasm yuklash (admin/manager)
    GET    /api/v1/rooms/<pk>/images/   — rasmlar ro'yxati
    """
    permission_classes = [IsAdminOrManager]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]

    def get(self, request, pk):
        try:
            room = Room.objects.get(pk=pk)
        except Room.DoesNotExist:
            return Response({'error': 'Xona topilmadi.'}, status=status.HTTP_404_NOT_FOUND)

        images = room.images.all()
        serializer = RoomImageSerializer(images, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request, pk):
        try:
            room = Room.objects.get(pk=pk)
        except Room.DoesNotExist:
            return Response({'error': 'Xona topilmadi.'}, status=status.HTTP_404_NOT_FOUND)

        # Bir nechta rasm yuklash
        files   = request.FILES.getlist('images')
        caption = request.data.get('caption', '')

        if not files:
            return Response({'error': 'Kamida bitta rasm yuklang.'}, status=status.HTTP_400_BAD_REQUEST)

        # Maksimal 10 ta rasm
        existing_count = room.images.count()
        if existing_count + len(files) > 10:
            return Response(
                {'error': f'Xona uchun maksimal 10 ta rasm. Hozir {existing_count} ta bor.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        created = []
        for i, file in enumerate(files):
            is_primary = (existing_count == 0 and i == 0)  # Birinchi rasm primary
            img = RoomImage.objects.create(
                room=room,
                image=file,
                caption=caption,
                is_primary=is_primary,
                order=existing_count + i,
            )
            created.append(img)

        serializer = RoomImageSerializer(created, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class RoomImageDeleteView(APIView):
    """DELETE /api/v1/rooms/<pk>/images/<image_id>/"""
    permission_classes = [IsAdminOrManager]

    def delete(self, request, pk, image_id):
        try:
            image = RoomImage.objects.get(pk=image_id, room_id=pk)
        except RoomImage.DoesNotExist:
            return Response({'error': 'Rasm topilmadi.'}, status=status.HTTP_404_NOT_FOUND)

        # Faylni diskdan o'chirish
        if image.image:
            try:
                image.image.delete(save=False)
            except Exception:
                pass
        image.delete()

        # Agar primary rasm o'chirilsa, keyingisini primary qilish
        remaining = RoomImage.objects.filter(room_id=pk).order_by('order')
        if remaining.exists() and not remaining.filter(is_primary=True).exists():
            first = remaining.first()
            first.is_primary = True
            first.save(update_fields=['is_primary'])

        return Response({'message': 'Rasm o\'chirildi.'}, status=status.HTTP_204_NO_CONTENT)


class RoomImageSetPrimaryView(APIView):
    """PATCH /api/v1/rooms/<pk>/images/<image_id>/primary/"""
    permission_classes = [IsAdminOrManager]

    def patch(self, request, pk, image_id):
        try:
            image = RoomImage.objects.get(pk=image_id, room_id=pk)
        except RoomImage.DoesNotExist:
            return Response({'error': 'Rasm topilmadi.'}, status=status.HTTP_404_NOT_FOUND)

        RoomImage.objects.filter(room_id=pk, is_primary=True).update(is_primary=False)
        image.is_primary = True
        image.save(update_fields=['is_primary'])

        return Response({'message': 'Asosiy rasm o\'rnatildi.'})


class RoomStatusUpdateView(APIView):
    """PATCH /api/v1/rooms/<id>/status/"""
    permission_classes = [IsStaffMember]

    def patch(self, request, pk):
        try:
            room = Room.objects.get(pk=pk)
        except Room.DoesNotExist:
            return Response({'error': 'Xona topilmadi.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = RoomStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        old_status = room.status
        new_status = serializer.validated_data['status']

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
            'message': f'Xona holati {old_status} dan {new_status} ga o\'zgartirildi.',
            'room': RoomSerializer(room, context={'request': request}).data,
        })


class AvailableRoomsView(generics.ListAPIView):
    """GET /api/v1/rooms/available/?check_in=&check_out="""
    serializer_class   = RoomSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    def get_queryset(self):
        check_in  = self.request.query_params.get('check_in')
        check_out = self.request.query_params.get('check_out')

        qs = Room.objects.prefetch_related('images').filter(status=Room.Status.AVAILABLE)

        if check_in and check_out:
            from apps.bookings.models import Booking
            booked_ids = Booking.objects.filter(
                status__in=[Booking.Status.CONFIRMED, Booking.Status.CHECKED_IN],
                check_in__lt=check_out,
                check_out__gt=check_in,
            ).values_list('room_id', flat=True)
            qs = qs.exclude(id__in=booked_ids)

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
