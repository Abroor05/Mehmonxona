from django.urls import path
from .views import StaffListCreateView, StaffDetailView, ScheduleListCreateView, MonthlySalaryView

urlpatterns = [
    path('',                         StaffListCreateView.as_view(),   name='staff_list'),
    path('<int:pk>/',                StaffDetailView.as_view(),       name='staff_detail'),
    path('<int:staff_id>/schedule/', ScheduleListCreateView.as_view(),name='staff_schedule'),
    path('<int:staff_id>/salary/',   MonthlySalaryView.as_view(),     name='staff_salary'),
]
