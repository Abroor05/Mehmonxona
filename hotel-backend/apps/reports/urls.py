from django.urls import path
from .views import (
    DashboardStatsView, RevenueReportView,
    OccupancyReportView, GuestStatsView, BookingHistoryView,
)

urlpatterns = [
    path('dashboard/',  DashboardStatsView.as_view(),  name='dashboard_stats'),
    path('revenue/',    RevenueReportView.as_view(),    name='revenue_report'),
    path('occupancy/',  OccupancyReportView.as_view(),  name='occupancy_report'),
    path('guests/',     GuestStatsView.as_view(),       name='guest_stats'),
    path('bookings/',   BookingHistoryView.as_view(),   name='booking_history'),
]
