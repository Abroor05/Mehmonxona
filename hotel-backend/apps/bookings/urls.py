from django.urls import path
from .views import (
    BookingListCreateView, BookingDetailView,
    CheckInView, CheckOutView, CancelBookingView,
)

urlpatterns = [
    path('',                 BookingListCreateView.as_view(), name='booking_list'),
    path('check-in/',        CheckInView.as_view(),           name='check_in'),
    path('check-out/',       CheckOutView.as_view(),          name='check_out'),
    path('<int:pk>/',        BookingDetailView.as_view(),     name='booking_detail'),
    path('<int:pk>/cancel/', CancelBookingView.as_view(),     name='booking_cancel'),
]
