import uuid
from django.db import models


class Payment(models.Model):
    class Method(models.TextChoices):
        CASH   = 'cash',   'Cash'
        CARD   = 'card',   'Card'
        ONLINE = 'online', 'Online'

    class Status(models.TextChoices):
        PENDING   = 'pending',   'Pending'
        COMPLETED = 'completed', 'Completed'
        FAILED    = 'failed',    'Failed'
        REFUNDED  = 'refunded',  'Refunded'

    transaction_number = models.CharField(max_length=30, unique=True, editable=False)
    booking            = models.ForeignKey('bookings.Booking', on_delete=models.PROTECT,
                                           related_name='payments')
    amount             = models.DecimalField(max_digits=12, decimal_places=2)
    method             = models.CharField(max_length=10, choices=Method.choices)
    status             = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    processed_by       = models.ForeignKey('users.User', on_delete=models.SET_NULL,
                                           null=True, related_name='processed_payments')
    notes              = models.TextField(blank=True)
    processed_at       = models.DateTimeField(auto_now_add=True)
    updated_at         = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'payments'
        ordering = ['-processed_at']

    def __str__(self):
        return f'{self.transaction_number} — {self.amount} ({self.status})'

    def save(self, *args, **kwargs):
        if not self.transaction_number:
            self.transaction_number = f'TXN-{uuid.uuid4().hex[:8].upper()}'
        super().save(*args, **kwargs)
