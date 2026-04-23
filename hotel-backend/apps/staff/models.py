from django.db import models
from django.db.models import Sum


class StaffProfile(models.Model):
    user        = models.OneToOneField('users.User', on_delete=models.CASCADE,
                                       related_name='staff_profile')
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    hire_date   = models.DateField(null=True, blank=True)
    is_active   = models.BooleanField(default=True)
    notes       = models.TextField(blank=True)

    class Meta:
        db_table = 'staff_profiles'

    def __str__(self):
        return f'Staff: {self.user.get_full_name()}'

    def monthly_salary(self, year, month):
        total_hours = self.schedules.filter(
            date__year=year, date__month=month
        ).aggregate(total=Sum('hours_worked'))['total'] or 0
        return float(total_hours) * float(self.hourly_rate)


class Schedule(models.Model):
    staff        = models.ForeignKey(StaffProfile, on_delete=models.CASCADE, related_name='schedules')
    date         = models.DateField()
    start_time   = models.TimeField()
    end_time     = models.TimeField()
    hours_worked = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    notes        = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table        = 'schedules'
        unique_together = ['staff', 'date']
        ordering        = ['date']

    def __str__(self):
        return f'{self.staff.user.get_full_name()} — {self.date}'

    def save(self, *args, **kwargs):
        from datetime import datetime, date as d
        start = datetime.combine(d.today(), self.start_time)
        end   = datetime.combine(d.today(), self.end_time)
        self.hours_worked = round((end - start).seconds / 3600, 2)
        super().save(*args, **kwargs)
