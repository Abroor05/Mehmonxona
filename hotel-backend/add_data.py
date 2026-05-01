"""
Loyiha uchun to'liq test ma'lumotlari qo'shish skripti.
Ishga tushirish: python add_data.py
"""
import os, sys, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hotel_project.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

import uuid
from decimal import Decimal
from datetime import date, time, timedelta
from apps.users.models import User
from apps.rooms.models import Room
from apps.bookings.models import Booking
from apps.payments.models import Payment
from apps.staff.models import StaffProfile, Schedule

# ─── 1. MIJOZLAR ─────────────────────────────────────────────────────────────
print('\n=== 1. MIJOZLAR qoshilmoqda ===')
customers_data = [
    dict(username='jasur_karimov',      email='jasur.karimov@gmail.com',      first_name='Jasur',    last_name='Karimov',    phone='+998901234567', role='customer'),
    dict(username='malika_yusupova',    email='malika.yusupova@gmail.com',    first_name='Malika',   last_name='Yusupova',   phone='+998902345678', role='customer'),
    dict(username='bobur_toshev',       email='bobur.toshev@gmail.com',       first_name='Bobur',    last_name='Toshev',     phone='+998903456789', role='customer'),
    dict(username='dilnoza_rahimova',   email='dilnoza.r@gmail.com',          first_name='Dilnoza',  last_name='Rahimova',   phone='+998904567890', role='customer'),
    dict(username='sardor_nazarov',     email='sardor.n@gmail.com',           first_name='Sardor',   last_name='Nazarov',    phone='+998905678901', role='customer'),
    dict(username='feruza_mirzaeva',    email='feruza.m@gmail.com',           first_name='Feruza',   last_name='Mirzaeva',   phone='+998906789012', role='customer'),
    dict(username='ulugbek_sotvoldiev', email='ulugbek.s@gmail.com',          first_name='Ulugbek',  last_name='Sotvoldiev', phone='+998907890123', role='customer'),
    dict(username='zulfiya_ergasheva',  email='zulfiya.e@gmail.com',          first_name='Zulfiya',  last_name='Ergasheva',  phone='+998908901234', role='customer'),
    dict(username='hamid_razzaqov',     email='hamid.r@gmail.com',            first_name='Hamid',    last_name='Razzaqov',   phone='+998909012345', role='customer'),
    dict(username='iroda_sobirov',      email='iroda.s@gmail.com',            first_name='Iroda',    last_name='Sobirov',    phone='+998900123456', role='customer'),
]
new_customers = []
for d in customers_data:
    u, created = User.objects.get_or_create(username=d['username'], defaults=d)
    if created:
        u.set_password('Customer123!')
        u.save()
        print(f'  + {u.username} ({u.get_full_name()})')
    else:
        print(f'  - {u.username} (mavjud)')
    new_customers.append(u)

# ─── 2. XODIMLAR ─────────────────────────────────────────────────────────────
print('\n=== 2. XODIMLAR qoshilmoqda ===')
staff_data = [
    dict(username='gulnora_hasanova', email='gulnora.h@hotel.uz', first_name='Gulnora', last_name='Hasanova', phone='+998911111111', role='receptionist', hourly_rate=Decimal('30000')),
    dict(username='kamol_tursunov',   email='kamol.t@hotel.uz',   first_name='Kamol',   last_name='Tursunov', phone='+998912222222', role='housekeeper',  hourly_rate=Decimal('25000')),
    dict(username='nargiza_sobirov',  email='nargiza.s@hotel.uz', first_name='Nargiza', last_name='Sobirov',  phone='+998913333333', role='accountant',   hourly_rate=Decimal('35000')),
    dict(username='sherzod_qodirov',  email='sherzod.q@hotel.uz', first_name='Sherzod', last_name='Qodirov',  phone='+998914444444', role='housekeeper',  hourly_rate=Decimal('25000')),
    dict(username='lola_toshmatova',  email='lola.t@hotel.uz',    first_name='Lola',    last_name='Toshmatova',phone='+998915555555', role='receptionist', hourly_rate=Decimal('30000')),
]
for d in staff_data:
    hourly = d.pop('hourly_rate')
    u, created = User.objects.get_or_create(username=d['username'], defaults=d)
    if created:
        u.set_password('Staff1234!')
        u.save()
        StaffProfile.objects.get_or_create(
            user=u,
            defaults={'hourly_rate': hourly, 'hire_date': date(2024, 1, 15), 'is_active': True}
        )
        print(f'  + {u.username} ({u.role})')
    else:
        print(f'  - {u.username} (mavjud)')

# ─── 3. BRONLAR ──────────────────────────────────────────────────────────────
print('\n=== 3. BRONLAR qoshilmoqda ===')
today = date.today()
all_rooms = list(Room.objects.filter(status='available').order_by('floor', 'room_number'))
all_customers = list(User.objects.filter(role='customer').order_by('username'))
staff_user = User.objects.filter(role__in=['admin', 'manager', 'receptionist']).first()

if len(all_rooms) < 15:
    print('  OGOHLANTIRISH: Yetarli bosh xona yoq!')
else:
    bookings_plan = [
        # (customer_idx, room_idx, check_in_delta, check_out_delta, guests, status, notes)
        (0,  0,  -4,  -1, 2, 'checked_out', 'Erta keldi'),
        (1,  1,  -2,   3, 1, 'checked_in',  'Biznes safar'),
        (2,  2,  -1,   4, 3, 'checked_in',  'Oilaviy dam olish'),
        (3,  3,   1,   5, 2, 'confirmed',   'Toylarga keladi'),
        (4,  4,   2,   6, 2, 'confirmed',   ''),
        (5,  5,   3,   8, 4, 'confirmed',   'VIP mehmon'),
        (6,  6,   5,   9, 1, 'pending',     'Kechqurun keladi'),
        (7,  7,   6,  10, 2, 'pending',     ''),
        (8,  8,  -6,  -2, 2, 'checked_out', ''),
        (9,  9,  -3,   2, 2, 'checked_in',  'Uzoq muddatli'),
        (0, 10,  -8,  -4, 1, 'checked_out', 'Qayta keldi'),
        (1, 11,   8,  12, 2, 'pending',     'Oldindan bron'),
    ]

    created_bookings = []
    for ci, ri, ci_d, co_d, guests, status, notes in bookings_plan:
        if ci >= len(all_customers) or ri >= len(all_rooms):
            continue
        customer = all_customers[ci]
        room     = all_rooms[ri]
        check_in  = today + timedelta(days=ci_d)
        check_out = today + timedelta(days=co_d)

        exists = Booking.objects.filter(customer=customer, room=room, check_in=check_in).exists()
        if exists:
            b = Booking.objects.get(customer=customer, room=room, check_in=check_in)
            print(f'  - {b.booking_number} (mavjud)')
            created_bookings.append(b)
            continue

        nights = max((check_out - check_in).days, 1)
        total  = room.price_per_night * nights

        b = Booking(
            customer=customer,
            room=room,
            check_in=check_in,
            check_out=check_out,
            guests_count=guests,
            status=status,
            notes=notes,
            total_amount=total,
            discount_amount=Decimal('0'),
            created_by=staff_user,
        )
        b.save()

        # Xona statusini yangilash
        if status == 'checked_in':
            room.status = 'booked'
            room.save(update_fields=['status'])

        created_bookings.append(b)
        print(f'  + {b.booking_number} | {customer.get_full_name()} | Xona {room.room_number} | {status}')

# ─── 4. TO'LOVLAR ────────────────────────────────────────────────────────────
print('\n=== 4. TOLOVLAR qoshilmoqda ===')
methods = ['cash', 'card', 'online', 'cash', 'card', 'online']
payable = [b for b in Booking.objects.all() if b.status in ('checked_in', 'checked_out')]

pay_count = 0
for i, b in enumerate(payable[:8]):
    if Payment.objects.filter(booking=b).exists():
        print(f'  - {b.booking_number} uchun tolov mavjud')
        continue
    p = Payment(
        booking=b,
        amount=b.total_amount,
        method=methods[i % len(methods)],
        status='completed',
        processed_by=staff_user,
        notes='Tolov qabul qilindi',
    )
    p.save()
    pay_count += 1
    print(f'  + {p.transaction_number} | {b.booking_number} | {p.amount} som | {p.method}')

# ─── 5. JADVALLAR ────────────────────────────────────────────────────────────
print('\n=== 5. JADVALLAR qoshilmoqda ===')
profiles = list(StaffProfile.objects.all()[:5])
schedule_times = [
    (time(8,  0), time(17, 0)),
    (time(9,  0), time(18, 0)),
    (time(14, 0), time(22, 0)),
    (time(7,  0), time(15, 0)),
    (time(10, 0), time(19, 0)),
]
sched_count = 0
for i, profile in enumerate(profiles):
    for j in range(7):
        work_date = today - timedelta(days=j + 1)
        if not Schedule.objects.filter(staff=profile, date=work_date).exists():
            st, et = schedule_times[(i + j) % len(schedule_times)]
            s = Schedule(staff=profile, date=work_date, start_time=st, end_time=et)
            s.save()
            sched_count += 1
print(f'  + {sched_count} ta yangi jadval qoshildi')

# ─── YAKUNIY HOLAT ────────────────────────────────────────────────────────────
print('\n=== YAKUNIY HOLAT ===')
print(f'Xonalar:          {Room.objects.count()} ta')
print(f'  - Bosh:         {Room.objects.filter(status="available").count()} ta')
print(f'  - Band:         {Room.objects.filter(status="booked").count()} ta')
print(f'  - Tozalanmoqda: {Room.objects.filter(status="cleaning").count()} ta')
print(f'Foydalanuvchilar: {User.objects.count()} ta')
print(f'  - Mijozlar:     {User.objects.filter(role="customer").count()} ta')
print(f'  - Xodimlar:     {User.objects.exclude(role="customer").count()} ta')
print(f'Bronlar:          {Booking.objects.count()} ta')
print(f'  - Kirgan:       {Booking.objects.filter(status="checked_in").count()} ta')
print(f'  - Tasdiqlangan: {Booking.objects.filter(status="confirmed").count()} ta')
print(f'  - Kutilmoqda:   {Booking.objects.filter(status="pending").count()} ta')
print(f'  - Chiqqan:      {Booking.objects.filter(status="checked_out").count()} ta')
print(f'Tolovlar:         {Payment.objects.count()} ta')
print(f'Staff profilelar: {StaffProfile.objects.count()} ta')
print(f'Jadvallar:        {Schedule.objects.count()} ta')
print('\nMuvaffaqiyatli yakunlandi!')
