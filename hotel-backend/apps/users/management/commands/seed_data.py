"""
Management command: python manage.py seed_data

Barcha modellar uchun 5 tadan test ma'lumot qo'shadi:
  - Users (har bir role uchun)
  - Rooms
  - Bookings
  - Payments
  - Staff profiles + Schedules
"""

import random
from datetime import date, time, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Command(BaseCommand):
    help = 'Test ma\'lumotlarini bazaga qo\'shadi (har bir model uchun 5 ta)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING('\n=== Seed data boshlandi ===\n'))

        self._create_users()
        self._create_rooms()
        self._create_bookings()
        self._create_payments()
        self._create_staff_and_schedules()

        self.stdout.write(self.style.SUCCESS('\n=== Seed data muvaffaqiyatli yakunlandi! ===\n'))

    # ------------------------------------------------------------------
    # 1. USERS
    # ------------------------------------------------------------------
    def _create_users(self):
        self.stdout.write('👤 Foydalanuvchilar yaratilmoqda...')

        users_data = [
            dict(username='admin1',        email='admin1@hotel.uz',        first_name='Alisher',  last_name='Karimov',   role='admin',        password='Admin1234!'),
            dict(username='manager1',      email='manager1@hotel.uz',      first_name='Bobur',    last_name='Toshmatov', role='manager',      password='Manager123!'),
            dict(username='receptionist1', email='recept1@hotel.uz',       first_name='Dilnoza',  last_name='Yusupova',  role='receptionist', password='Recept123!'),
            dict(username='housekeeper1',  email='house1@hotel.uz',        first_name='Feruza',   last_name='Nazarova',  role='housekeeper',  password='House1234!'),
            dict(username='accountant1',   email='account1@hotel.uz',      first_name='Gulnora',  last_name='Mirzayeva', role='accountant',   password='Account123!'),
            dict(username='customer1',     email='customer1@example.com',  first_name='Hamid',    last_name='Razzaqov',  role='customer',     password='Customer123!'),
            dict(username='customer2',     email='customer2@example.com',  first_name='Iroda',    last_name='Sobirov',   role='customer',     password='Customer123!'),
            dict(username='customer3',     email='customer3@example.com',  first_name='Jasur',    last_name='Qodirov',   role='customer',     password='Customer123!'),
            dict(username='customer4',     email='customer4@example.com',  first_name='Kamola',   last_name='Ergasheva', role='customer',     password='Customer123!'),
            dict(username='customer5',     email='customer5@example.com',  first_name='Lochinbek',last_name='Umarov',    role='customer',     password='Customer123!'),
        ]

        created = 0
        for data in users_data:
            password = data.pop('password')
            user, is_new = User.objects.get_or_create(
                username=data['username'],
                defaults=data,
            )
            if is_new:
                user.set_password(password)
                if data.get('role') in ('admin', 'manager'):
                    user.is_staff = True
                user.save()
                created += 1
                self.stdout.write(f'  ✓ {user.username} ({user.role})')
            else:
                self.stdout.write(f'  - {user.username} allaqachon mavjud')

        self.stdout.write(self.style.SUCCESS(f'  Jami: {created} yangi foydalanuvchi\n'))

    # ------------------------------------------------------------------
    # 2. ROOMS
    # ------------------------------------------------------------------
    def _create_rooms(self):
        from apps.rooms.models import Room

        self.stdout.write('🏨 Xonalar yaratilmoqda...')

        rooms_data = [
            dict(room_number='101', room_type='standard', price_per_night=Decimal('150000'), capacity=2, floor=1, description='Standart xona, ko\'cha manzarasi'),
            dict(room_number='102', room_type='standard', price_per_night=Decimal('150000'), capacity=2, floor=1, description='Standart xona, hovli manzarasi'),
            dict(room_number='201', room_type='deluxe',   price_per_night=Decimal('280000'), capacity=3, floor=2, description='Deluxe xona, keng balkon'),
            dict(room_number='202', room_type='deluxe',   price_per_night=Decimal('280000'), capacity=3, floor=2, description='Deluxe xona, shahar manzarasi'),
            dict(room_number='301', room_type='vip',      price_per_night=Decimal('500000'), capacity=4, floor=3, description='VIP suite, jacuzzi va terassa'),
            dict(room_number='302', room_type='vip',      price_per_night=Decimal('500000'), capacity=4, floor=3, description='VIP suite, panorama ko\'rinish'),
            dict(room_number='103', room_type='standard', price_per_night=Decimal('150000'), capacity=1, floor=1, description='Bir kishilik standart xona'),
            dict(room_number='203', room_type='deluxe',   price_per_night=Decimal('300000'), capacity=2, floor=2, description='Deluxe twin xona'),
            dict(room_number='104', room_type='standard', price_per_night=Decimal('160000'), capacity=2, floor=1, description='Standart xona, yangilangan'),
            dict(room_number='303', room_type='vip',      price_per_night=Decimal('550000'), capacity=5, floor=3, description='VIP penthouse'),
        ]

        created = 0
        for data in rooms_data:
            room, is_new = Room.objects.get_or_create(
                room_number=data['room_number'],
                defaults=data,
            )
            if is_new:
                created += 1
                self.stdout.write(f'  ✓ Xona {room.room_number} ({room.room_type}) - {room.price_per_night} so\'m/kecha')
            else:
                self.stdout.write(f'  - Xona {room.room_number} allaqachon mavjud')

        self.stdout.write(self.style.SUCCESS(f'  Jami: {created} yangi xona\n'))

    # ------------------------------------------------------------------
    # 3. BOOKINGS
    # ------------------------------------------------------------------
    def _create_bookings(self):
        from apps.rooms.models import Room
        from apps.bookings.models import Booking

        self.stdout.write('📋 Bronlar yaratilmoqda...')

        customers = list(User.objects.filter(role='customer'))
        rooms = list(Room.objects.all())

        if not customers:
            self.stdout.write(self.style.WARNING('  ⚠ Mijozlar topilmadi, avval foydalanuvchilar yarating'))
            return
        if not rooms:
            self.stdout.write(self.style.WARNING('  ⚠ Xonalar topilmadi, avval xonalar yarating'))
            return

        today = date.today()
        bookings_data = [
            dict(
                customer=customers[0],
                room=rooms[0],
                check_in=today - timedelta(days=5),
                check_out=today - timedelta(days=2),
                guests_count=2,
                status='checked_out',
                notes='Erta keldi, muammo yo\'q',
            ),
            dict(
                customer=customers[1],
                room=rooms[2],
                check_in=today - timedelta(days=1),
                check_out=today + timedelta(days=3),
                guests_count=2,
                status='checked_in',
                notes='',
            ),
            dict(
                customer=customers[2],
                room=rooms[4],
                check_in=today + timedelta(days=2),
                check_out=today + timedelta(days=7),
                guests_count=3,
                status='confirmed',
                notes='VIP mehmon, maxsus xizmat kerak',
            ),
            dict(
                customer=customers[3],
                room=rooms[1],
                check_in=today + timedelta(days=10),
                check_out=today + timedelta(days=14),
                guests_count=1,
                status='pending',
                notes='',
            ),
            dict(
                customer=customers[4] if len(customers) > 4 else customers[0],
                room=rooms[3],
                check_in=today - timedelta(days=10),
                check_out=today - timedelta(days=7),
                guests_count=2,
                status='cancelled',
                notes='Mijoz bekor qildi',
            ),
        ]

        created = 0
        for data in bookings_data:
            # Bir xil customer+room+check_in kombinatsiyasi bo'lsa o'tkazib yuborish
            exists = Booking.objects.filter(
                customer=data['customer'],
                room=data['room'],
                check_in=data['check_in'],
            ).exists()
            if exists:
                self.stdout.write(f'  - Bron allaqachon mavjud ({data["customer"].username})')
                continue

            booking = Booking(
                customer=data['customer'],
                room=data['room'],
                check_in=data['check_in'],
                check_out=data['check_out'],
                guests_count=data['guests_count'],
                status=data['status'],
                notes=data['notes'],
                discount_amount=Decimal('0'),
            )
            # total_amount ni qo'lda hisoblash
            nights = (data['check_out'] - data['check_in']).days
            booking.total_amount = data['room'].price_per_night * nights
            booking.save()
            created += 1
            self.stdout.write(
                f'  ✓ {booking.booking_number} — {data["customer"].get_full_name()} '
                f'| Xona {data["room"].room_number} | {data["status"]}'
            )

        self.stdout.write(self.style.SUCCESS(f'  Jami: {created} yangi bron\n'))

    # ------------------------------------------------------------------
    # 4. PAYMENTS
    # ------------------------------------------------------------------
    def _create_payments(self):
        from apps.bookings.models import Booking
        from apps.payments.models import Payment

        self.stdout.write('💳 To\'lovlar yaratilmoqda...')

        staff_user = User.objects.filter(role__in=['admin', 'manager', 'receptionist', 'accountant']).first()
        bookings = list(Booking.objects.filter(status__in=['checked_out', 'checked_in', 'confirmed']))

        if not bookings:
            self.stdout.write(self.style.WARNING('  ⚠ Bronlar topilmadi'))
            return

        methods = ['cash', 'card', 'online']
        created = 0

        for i, booking in enumerate(bookings[:5]):
            # Har bir bron uchun bitta to'lov
            exists = Payment.objects.filter(booking=booking).exists()
            if exists:
                self.stdout.write(f'  - {booking.booking_number} uchun to\'lov allaqachon mavjud')
                continue

            amount = booking.total_amount
            method = methods[i % len(methods)]
            status = 'completed' if booking.status in ('checked_out', 'checked_in') else 'pending'

            payment = Payment(
                booking=booking,
                amount=amount,
                method=method,
                status=status,
                processed_by=staff_user,
                notes=f'Test to\'lov #{i+1}',
            )
            payment.save()
            created += 1
            self.stdout.write(
                f'  ✓ {payment.transaction_number} — {amount} so\'m | {method} | {status}'
            )

        self.stdout.write(self.style.SUCCESS(f'  Jami: {created} yangi to\'lov\n'))

    # ------------------------------------------------------------------
    # 5. STAFF PROFILES + SCHEDULES
    # ------------------------------------------------------------------
    def _create_staff_and_schedules(self):
        from apps.staff.models import StaffProfile, Schedule

        self.stdout.write('👔 Xodimlar profili yaratilmoqda...')

        staff_users = User.objects.filter(
            role__in=['manager', 'receptionist', 'housekeeper', 'accountant']
        )

        created_profiles = 0
        for user in staff_users:
            profile, is_new = StaffProfile.objects.get_or_create(
                user=user,
                defaults={
                    'hourly_rate': Decimal(str(random.choice([25000, 30000, 35000, 40000]))),
                    'hire_date': date(2024, random.randint(1, 12), random.randint(1, 28)),
                    'is_active': True,
                }
            )
            if is_new:
                created_profiles += 1
                self.stdout.write(f'  ✓ {user.get_full_name()} ({user.role}) — {profile.hourly_rate} so\'m/soat')
            else:
                self.stdout.write(f'  - {user.get_full_name()} profili allaqachon mavjud')

        self.stdout.write(self.style.SUCCESS(f'  Jami: {created_profiles} yangi xodim profili\n'))

        # Jadvallar (schedules)
        self.stdout.write('📅 Ish jadvallari yaratilmoqda...')

        profiles = list(StaffProfile.objects.all()[:3])
        today = date.today()
        created_schedules = 0

        schedule_data = [
            dict(start_time=time(8, 0),  end_time=time(17, 0)),
            dict(start_time=time(9, 0),  end_time=time(18, 0)),
            dict(start_time=time(14, 0), end_time=time(22, 0)),
            dict(start_time=time(7, 0),  end_time=time(15, 0)),
            dict(start_time=time(10, 0), end_time=time(19, 0)),
        ]

        for i, profile in enumerate(profiles):
            for j in range(5):
                work_date = today - timedelta(days=j + 1)
                exists = Schedule.objects.filter(staff=profile, date=work_date).exists()
                if exists:
                    continue
                sched = schedule_data[j % len(schedule_data)]
                schedule = Schedule(
                    staff=profile,
                    date=work_date,
                    start_time=sched['start_time'],
                    end_time=sched['end_time'],
                )
                schedule.save()
                created_schedules += 1
                self.stdout.write(
                    f'  ✓ {profile.user.get_full_name()} — {work_date} '
                    f'({sched["start_time"]} - {sched["end_time"]})'
                )

        self.stdout.write(self.style.SUCCESS(f'  Jami: {created_schedules} yangi jadval\n'))
