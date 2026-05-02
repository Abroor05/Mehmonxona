from django.urls import path
from .views import (
    RoomListCreateView, RoomDetailView,
    RoomStatusUpdateView, AvailableRoomsView, RoomStatusLogView,
    RoomImageUploadView, RoomImageDeleteView, RoomImageSetPrimaryView,
)

urlpatterns = [
    path('',                                        RoomListCreateView.as_view(),    name='room_list'),
    path('available/',                              AvailableRoomsView.as_view(),    name='room_available'),
    path('<int:pk>/',                               RoomDetailView.as_view(),        name='room_detail'),
    path('<int:pk>/status/',                        RoomStatusUpdateView.as_view(),  name='room_status'),
    path('<int:pk>/logs/',                          RoomStatusLogView.as_view(),     name='room_logs'),
    path('<int:pk>/images/',                        RoomImageUploadView.as_view(),   name='room_images'),
    path('<int:pk>/images/<int:image_id>/',         RoomImageDeleteView.as_view(),   name='room_image_delete'),
    path('<int:pk>/images/<int:image_id>/primary/', RoomImageSetPrimaryView.as_view(), name='room_image_primary'),
]
