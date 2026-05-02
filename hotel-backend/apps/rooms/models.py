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
    # Xona ichidagi qulayliklar (vergul bilan ajratilgan)
    amenities       = models.TextField(blank=True, help_text="Vergul bilan ajrating: WiFi, TV, Konditsioner")
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

    def get_amenities_list(self):
        if not self.amenities:
            return []
        return [a.strip() for a in self.amenities.split(',') if a.strip()]


class RoomImage(models.Model):
    """Xona rasmlari — har bir xona uchun bir nechta rasm"""
    room       = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='images')
    image      = models.ImageField(upload_to='rooms/%Y/%m/', verbose_name='Rasm')
    caption    = models.CharField(max_length=100, blank=True, verbose_name='Tavsif')
    is_primary = models.BooleanField(default=False, verbose_name='Asosiy rasm')
    order      = models.PositiveSmallIntegerField(default=0, verbose_name='Tartib')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'room_images'
        ordering = ['order', 'uploaded_at']

    def __str__(self):
        return f'Xona {self.room.room_number} — rasm {self.id}'

    def save(self, *args, **kwargs):
        # Agar is_primary=True bo'lsa, boshqa rasmlarni primary emas qilish
        if self.is_primary:
            RoomImage.objects.filter(room=self.room, is_primary=True).exclude(pk=self.pk).update(is_primary=False)
        super().save(*args, **kwargs)


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
