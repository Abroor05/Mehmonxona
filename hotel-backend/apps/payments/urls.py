from django.urls import path
from .views import PaymentListCreateView, PaymentDetailView, RefundView, InvoiceView

urlpatterns = [
    path('',                          PaymentListCreateView.as_view(), name='payment_list'),
    path('invoice/<int:booking_id>/', InvoiceView.as_view(),           name='invoice'),
    path('<int:pk>/',                 PaymentDetailView.as_view(),     name='payment_detail'),
    path('<int:pk>/refund/',          RefundView.as_view(),            name='payment_refund'),
]
