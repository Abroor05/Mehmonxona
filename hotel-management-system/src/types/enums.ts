export enum RoomType {
  STANDARD = 'standard',
  LUX = 'deluxe',
  VIP = 'vip',
}

export enum RoomStatus {
  AVAILABLE   = 'available',     // Bo'sh
  OCCUPIED    = 'booked',        // Band
  CLEANING    = 'cleaning',      // Tozalanmoqda
  MAINTENANCE = 'maintenance',   // Ta'mirda
}

export enum BookingStatus {
  PENDING     = 'pending',       // Kutilmoqda
  CONFIRMED   = 'confirmed',     // Tasdiqlangan
  CHECKED_IN  = 'checked_in',    // Kirgan
  CHECKED_OUT = 'checked_out',   // Chiqqan
  CANCELLED   = 'cancelled',     // Bekor qilingan
}

export enum PaymentMethod {
  CASH   = 'cash',               // Naqd
  CARD   = 'card',               // Karta
  ONLINE = 'online',             // Onlayn
}

export enum PaymentStatus {
  PENDING   = 'pending',
  COMPLETED = 'completed',
  FAILED    = 'failed',
  REFUNDED  = 'refunded',
}

export enum StaffRole {
  ADMIN        = 'admin',        // Administrator
  MANAGER      = 'manager',      // Menejer
  RECEPTIONIST = 'receptionist', // Resepsionist
  HOUSEKEEPER  = 'housekeeper',  // Tozalovchi
  ACCOUNTANT   = 'accountant',   // Hisobchi
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
