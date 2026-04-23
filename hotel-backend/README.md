# Hotel Management System — Django Backend

## Loyiha tuzilmasi

```
hotel-backend/
├── manage.py
├── requirements.txt
├── .env.example
├── hotel_project/
│   ├── settings.py      ← MySQL, JWT, CORS sozlamalari
│   ├── urls.py          ← Barcha URL yo'llari
│   └── wsgi.py
└── apps/
    ├── users/           ← JWT auth, 6 ta rol
    ├── rooms/           ← Xonalar CRUD + status log
    ├── bookings/        ← Bron, check-in, check-out
    ├── payments/        ← To'lovlar, invoice, refund
    ├── staff/           ← Xodimlar, jadval, maosh
    └── reports/         ← Dashboard, daromad, bandlik
```

---

## Ishga tushirish

### 1. Virtual environment
```bash
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Linux/Mac
```

### 2. Paketlarni o'rnatish
```bash
pip install -r requirements.txt
```

### 3. MySQL da database yaratish
```sql
CREATE DATABASE hotel_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. .env faylini sozlash
```bash
copy .env.example .env
```
`.env` faylini oching va to'ldiring:
```
SECRET_KEY=django-insecure-your-secret-key
DEBUG=True
DB_NAME=hotel_db
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306
```

### 5. Migratsiyalar
```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Superuser yaratish
```bash
python manage.py createsuperuser
```

### 7. Serverni ishga tushirish
```bash
python manage.py runserver
```

API manzili: `http://localhost:8000/api/v1/`

---

## API Endpointlar

### Auth
| Method | URL | Tavsif |
|--------|-----|--------|
| POST | `/api/v1/auth/register/` | Ro'yxatdan o'tish |
| POST | `/api/v1/auth/login/` | Kirish → JWT token |
| POST | `/api/v1/auth/logout/` | Chiqish |
| POST | `/api/v1/auth/token/refresh/` | Token yangilash |
| GET/PUT | `/api/v1/auth/profile/` | O'z profili |
| POST | `/api/v1/auth/change-password/` | Parol o'zgartirish |
| GET/POST | `/api/v1/auth/users/` | Admin: foydalanuvchilar |

### Xonalar
| Method | URL | Tavsif |
|--------|-----|--------|
| GET/POST | `/api/v1/rooms/` | Ro'yxat / yaratish |
| GET | `/api/v1/rooms/available/?check_in=&check_out=` | Bo'sh xonalar |
| GET/PUT/DELETE | `/api/v1/rooms/<id>/` | Xona detail |
| PATCH | `/api/v1/rooms/<id>/status/` | Holat o'zgartirish |
| GET | `/api/v1/rooms/<id>/logs/` | Holat tarixi |

### Bronlar
| Method | URL | Tavsif |
|--------|-----|--------|
| GET/POST | `/api/v1/bookings/` | Ro'yxat / yaratish |
| POST | `/api/v1/bookings/check-in/` | Check-in |
| POST | `/api/v1/bookings/check-out/` | Check-out |
| POST | `/api/v1/bookings/<id>/cancel/` | Bekor qilish |

### To'lovlar
| Method | URL | Tavsif |
|--------|-----|--------|
| GET/POST | `/api/v1/payments/` | Ro'yxat / to'lov qo'shish |
| GET | `/api/v1/payments/invoice/<booking_id>/` | Invoice |
| POST | `/api/v1/payments/<id>/refund/` | Qaytarish |

### Xodimlar
| Method | URL | Tavsif |
|--------|-----|--------|
| GET/POST | `/api/v1/staff/` | Ro'yxat / qo'shish |
| GET/PUT/DELETE | `/api/v1/staff/<id>/` | Detail |
| GET/POST | `/api/v1/staff/<id>/schedule/` | Ish jadvali |
| GET | `/api/v1/staff/<id>/salary/?year=&month=` | Oylik maosh |

### Hisobotlar
| Method | URL | Tavsif |
|--------|-----|--------|
| GET | `/api/v1/reports/dashboard/` | Dashboard statistika |
| GET | `/api/v1/reports/revenue/?period=monthly&year=2024` | Daromad |
| GET | `/api/v1/reports/occupancy/` | Xonalar bandligi |
| GET | `/api/v1/reports/guests/` | Mijozlar statistikasi |
| GET | `/api/v1/reports/bookings/` | Bron tarixi |

---

## Postman misollari

### Login
```json
POST http://localhost:8000/api/v1/auth/login/
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### Xona yaratish
```json
POST http://localhost:8000/api/v1/rooms/
Authorization: Bearer <access_token>

{
  "room_number": "101",
  "room_type": "standard",
  "price_per_night": 350000,
  "capacity": 2,
  "floor": 1
}
```

### Bron yaratish
```json
POST http://localhost:8000/api/v1/bookings/
Authorization: Bearer <access_token>

{
  "room": 1,
  "check_in": "2024-05-10",
  "check_out": "2024-05-13",
  "guests_count": 2
}
```

### Check-in
```json
POST http://localhost:8000/api/v1/bookings/check-in/
Authorization: Bearer <access_token>

{
  "booking_number": "BK-A1B2C3D4"
}
```

### To'lov qo'shish
```json
POST http://localhost:8000/api/v1/payments/
Authorization: Bearer <access_token>

{
  "booking": 1,
  "amount": 1050000,
  "method": "card"
}
```

### Check-out
```json
POST http://localhost:8000/api/v1/bookings/check-out/
Authorization: Bearer <access_token>

{
  "booking_id": 1
}
```

---

## Rollar va ruxsatlar

| Rol | Ruxsatlar |
|-----|-----------|
| admin | To'liq kirish |
| manager | Xonalar, bronlar, to'lovlar, xodimlar, hisobotlar |
| receptionist | Bronlar, check-in/out |
| housekeeper | Xonalar (o'qish + holat o'zgartirish) |
| accountant | To'lovlar, hisobotlar |
| customer | Faqat o'z bronlari va profili |
