from django.urls import path
from .views import (
    RoomListCreateView, RoomDetailView,
    RoomStatusUpdateView, AvailableRoomsView, RoomStatusLogView,
)

urlpatterns = [
    path('',                 RoomListCreateView.as_view(),   name='room_list'),
    path('available/',       AvailableRoomsView.as_view(),   name='room_available'),
    path('<int:pk>/',        RoomDetailView.as_view(),       name='room_detail'),
    path('<int:pk>/status/', RoomStatusUpdateView.as_view(), name='room_status'),
    path('<int:pk>/logs/',   RoomStatusLogView.as_view(),    name='room_logs'),
]
