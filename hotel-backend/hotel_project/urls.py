from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# Admin panel sarlavhasini o'zgartirish
admin.site.site_header  = "Mehmonxona Boshqaruv Tizimi"
admin.site.site_title   = "Hotel Admin"
admin.site.index_title  = "Boshqaruv Paneli"

urlpatterns = [
    path('admin/', admin.site.urls),

    # DRF browsable API login (brauzerda ishlatish uchun)
    path('api-auth/', include('rest_framework.urls')),

    # API v1
    path('api/v1/auth/',     include('apps.users.urls')),
    path('api/v1/rooms/',    include('apps.rooms.urls')),
    path('api/v1/bookings/', include('apps.bookings.urls')),
    path('api/v1/payments/', include('apps.payments.urls')),
    path('api/v1/staff/',    include('apps.staff.urls')),
    path('api/v1/reports/',  include('apps.reports.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
