from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import StaffProfile, Schedule
from .serializers import StaffProfileSerializer, ScheduleSerializer
from apps.users.permissions import IsAdminOrManager


class StaffListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/v1/staff/"""
    serializer_class   = StaffProfileSerializer
    permission_classes = [IsAdminOrManager]
    queryset           = StaffProfile.objects.select_related('user').filter(is_active=True)


class StaffDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/DELETE /api/v1/staff/<id>/"""
    serializer_class   = StaffProfileSerializer
    permission_classes = [IsAdminOrManager]
    queryset           = StaffProfile.objects.all()

    def destroy(self, request, *args, **kwargs):
        staff = self.get_object()
        staff.is_active = False
        staff.save()
        return Response({'message': 'Staff member archived.'})


class ScheduleListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/v1/staff/<staff_id>/schedule/"""
    serializer_class   = ScheduleSerializer
    permission_classes = [IsAdminOrManager]

    def get_queryset(self):
        qs = Schedule.objects.filter(staff_id=self.kwargs['staff_id'])
        if month := self.request.query_params.get('month'):
            year, m = month.split('-')
            qs = qs.filter(date__year=year, date__month=m)
        return qs

    def perform_create(self, serializer):
        serializer.save(staff_id=self.kwargs['staff_id'])


class MonthlySalaryView(APIView):
    """GET /api/v1/staff/<staff_id>/salary/?year=2024&month=5"""
    permission_classes = [IsAdminOrManager]

    def get(self, request, staff_id):
        year  = request.query_params.get('year')
        month = request.query_params.get('month')
        if not year or not month:
            return Response({'error': 'year and month are required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            staff = StaffProfile.objects.get(pk=staff_id)
        except StaffProfile.DoesNotExist:
            return Response({'error': 'Staff not found.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            'staff':        staff.user.get_full_name(),
            'year':         year,
            'month':        month,
            'hourly_rate':  float(staff.hourly_rate),
            'total_salary': staff.monthly_salary(year, month),
        })
