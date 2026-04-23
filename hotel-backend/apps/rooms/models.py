from django.db import models


class Room(models.Model):
    class RoomType(models.TextChoices):
        STANDARD = 'standard', 'Standard'
        DELUXE   = 'deluxe',   'Deluxe'
        VIP      = 'vip',      'VIP'

    class Status(models.TextChoices):
        AVAILABLE   = 'available',   'Available'
        BOOKED      = 'booked',      'Booked'
        CLEANING    = 'cleaning',    'Cleaning'
        MAINTENANCE = 'maintenance', 'Maintenance'

    room_number     = models.CharField(max_length=10, unique=True)
    room_type       = models.CharField(max_length=20, choices=RoomType.choices, default=RoomType.STANDARD)
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    capacity        = models.PositiveSmallIntegerField(default=2)
    status          = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE)
    description     = models.TextField(blank=True)
    floor           = models.PositiveSmallIntegerField(default=1)
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'rooms'
        ordering = ['room_number']

    def __str__(self):
        return f'Room {self.room_number} ({self.room_type}) - {self.status}'

    @property
    def is_available(self):
        return self.status == self.Status.AVAILABLE


class RoomStatusLog(models.Model):
    room       = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='status_logs')
    old_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    reason     = models.CharField(max_length=255, blank=True)
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'room_status_logs'
        ordering = ['-changed_at']
