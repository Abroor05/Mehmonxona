export enum RoomType {
  STANDARD = 'STANDARD',
  LUX = 'LUX',
  VIP = 'VIP',
}

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',       // Bo'sh
  OCCUPIED = 'OCCUPIED',         // Band
  CLEANING = 'CLEANING',         // Tozalanmoqda
  MAINTENANCE = 'MAINTENANCE',   // Ta'mirda
}

export enum BookingStatus {
  PENDING = 'PENDING',           // Kutilmoqda
  CONFIRMED = 'CONFIRMED',       // Tasdiqlangan
  CHECKED_IN = 'CHECKED_IN',     // Kirgan
  CHECKED_OUT = 'CHECKED_OUT',   // Chiqqan
  CANCELLED = 'CANCELLED',       // Bekor qilingan
}

export enum PaymentMethod {
  CASH = 'CASH',                 // Naqd
  CARD = 'CARD',                 // Karta
  ONLINE = 'ONLINE',             // Onlayn
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum StaffRole {
  ADMIN = 'ADMIN',               // Administrator
  MANAGER = 'MANAGER',           // Menejer
  RECEPTIONIST = 'RECEPTIONIST', // Resepsionist
  HOUSEKEEPER = 'HOUSEKEEPER',   // Tozalovchi
  ACCOUNTANT = 'ACCOUNTANT',     // Hisobchi
}

export enum ServiceType {
  ROOM_CLEANING = 'ROOM_CLEANING',       // Xona tozalash
  LAUNDRY = 'LAUNDRY',                   // Kir yuvish
  TRANSPORT = 'TRANSPORT',               // Transport
  SPA = 'SPA',                           // SPA
  GYM = 'GYM',                           // Sport zali
  CONFERENCE_HALL = 'CONFERENCE_HALL',   // Konferensiya zali
}

export enum ServiceOrderStatus {
  PENDING = 'PENDING',           // Kutilmoqda
  ASSIGNED = 'ASSIGNED',         // Tayinlangan
  IN_PROGRESS = 'IN_PROGRESS',   // Bajarilmoqda
  COMPLETED = 'COMPLETED',       // Bajarildi
  CANCELLED = 'CANCELLED',       // Bekor qilingan
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  BOTH = 'BOTH',
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',     // Foiz
  FIXED = 'FIXED',               // Belgilangan summa
}

export enum ReportPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export enum ReportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
}
