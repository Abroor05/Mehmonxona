"""
Reporting views — aggregated statistics for the dashboard and management.
"""

from django.db.models import Sum, Count, Q
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.bookings.models import Booking
from apps.payments.models import Payment
from apps.rooms.models import Room
from apps.users.models import User
from apps.users.permissions import IsAdminOrManager


class DashboardStatsView(APIView):
    """
    GET /api/v1/reports/dashboard/
    Quick stats for the main dashboard card widgets.
    All authenticated staff can view (customers excluded).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()

        total_rooms     = Room.objects.count()
        occupied_rooms  = Room.objects.filter(status=Room.Status.BOOKED).count()
        today_checkins  = Booking.objects.filter(check_in=today,
                                                  status=Booking.Status.CONFIRMED).count()
        today_checkouts = Booking.objects.filter(check_out=today,
                                                  status=Booking.Status.CHECKED_IN).count()
        today_revenue   = Payment.objects.filter(
            processed_at__date=today,
            status=Payment.Status.COMPLETED
        ).aggregate(total=Sum('amount'))['total'] or 0

        pending_services = 0  # extend when service orders are added

        return Response({
            'total_rooms':       total_rooms,
            'occupied_rooms':    occupied_rooms,
            'available_rooms':   total_rooms - occupied_rooms,
            'occupancy_rate':    round(occupied_rooms / total_rooms * 100, 1) if total_rooms else 0,
            'today_check_ins':   today_checkins,
            'today_check_outs':  today_checkouts,
            'today_revenue':     float(today_revenue),
            'pending_services':  pending_services,
        })


class RevenueReportView(APIView):
    """
    GET /api/v1/reports/revenue/?period=monthly&year=2024
    period: daily | monthly
    """
    permission_classes = [IsAdminOrManager]

    def get(self, request):
        period = request.query_params.get('period', 'monthly')
        year   = int(request.query_params.get('year', timezone.now().year))

        qs = Payment.objects.filter(
            status=Payment.Status.COMPLETED,
            processed_at__year=year,
        )

        if period == 'daily':
            data = (
                qs.extra(select={'day': 'DATE(processed_at)'})
                  .values('day')
                  .annotate(revenue=Sum('amount'))
                  .order_by('day')
            )
            result = [{'date': str(r['day']), 'revenue': float(r['revenue'])} for r in data]
        else:
            data = (
                qs.extra(select={'month': 'MONTH(processed_at)'})
                  .values('month')
                  .annotate(revenue=Sum('amount'))
                  .order_by('month')
            )
            result = [{'month': r['month'], 'revenue': float(r['revenue'])} for r in data]

        total = qs.aggregate(total=Sum('amount'))['total'] or 0
        return Response({
            'year':   year,
            'period': period,
            'total':  float(total),
            'data':   result,
        })


class OccupancyReportView(APIView):
    """
    GET /api/v1/reports/occupancy/
    Room occupancy breakdown by status and type.
    """
    permission_classes = [IsAdminOrManager]

    def get(self, request):
        rooms     = Room.objects.all()
        total     = rooms.count()
        by_status = list(rooms.values('status').annotate(count=Count('id')))
        by_type   = rooms.values('room_type').annotate(
            total=Count('id'),
            occupied=Count('id', filter=Q(status=Room.Status.BOOKED))
        )

        return Response({
            'total_rooms': total,
            'by_status':   by_status,
            'by_type': [
                {
                    'type':     r['room_type'],
                    'total':    r['total'],
                    'occupied': r['occupied'],
                    'rate':     round(r['occupied'] / r['total'] * 100, 1) if r['total'] else 0,
                }
                for r in by_type
            ],
        })


class GuestStatsView(APIView):
    """
    GET /api/v1/reports/guests/
    Customer and booking statistics.
    """
    permission_classes = [IsAdminOrManager]

    def get(self, request):
        total_customers = User.objects.filter(role='customer').count()
        total_bookings  = Booking.objects.count()
        by_status       = list(Booking.objects.values('status').annotate(count=Count('id')))

        return Response({
            'total_customers': total_customers,
            'total_bookings':  total_bookings,
            'by_status':       by_status,
        })


class BookingHistoryView(APIView):
    """
    GET /api/v1/reports/bookings/?date_from=2024-01-01&date_to=2024-12-31
    """
    permission_classes = [IsAdminOrManager]

    def get(self, request):
        from apps.bookings.serializers import BookingSerializer

        qs = Booking.objects.select_related('room', 'customer')
        if date_from := request.query_params.get('date_from'):
            qs = qs.filter(check_in__gte=date_from)
        if date_to := request.query_params.get('date_to'):
            qs = qs.filter(check_out__lte=date_to)

        total_revenue = Payment.objects.filter(
            booking__in=qs,
            status=Payment.Status.COMPLETED
        ).aggregate(total=Sum('amount'))['total'] or 0

        return Response({
            'count':         qs.count(),
            'total_revenue': float(total_revenue),
            'bookings':      BookingSerializer(qs[:100], many=True).data,
        })
