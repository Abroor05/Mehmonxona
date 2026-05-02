import {
  RoomType, RoomStatus, BookingStatus, PaymentMethod, PaymentStatus,
  StaffRole, ServiceType, ServiceOrderStatus, NotificationChannel,
  DiscountType, ReportPeriod, ReportFormat
} from './enums'

// ==================== GUEST ====================
export interface Guest {
  id: string
  firstName: string
  lastName: string
  passportNumber: string
  phone: string
  email: string
  nationality?: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

export interface CreateGuestDto {
  firstName: string
  lastName: string
  passportNumber: string
  phone: string
  email: string
  nationality?: string
}

export interface UpdateGuestDto extends Partial<CreateGuestDto> {}

// ==================== ROOM ====================
export interface RoomImage {
  id:         string
  imageUrl:   string
  caption?:   string
  isPrimary:  boolean
  order:      number
  uploadedAt: string
}

export interface Room {
  id: string
  roomNumber: string
  type: RoomType
  capacity: number
  pricePerNight: number
  status: RoomStatus
  description?: string
  amenities?: string[]
  floor?: number
  images?: RoomImage[]
  primaryImage?: string
  createdAt: string
  updatedAt: string
}

export interface CreateRoomDto {
  roomNumber: string
  type: RoomType
  capacity: number
  pricePerNight: number
  description?: string
  amenities?: string[] | string
  floor?: number
}

export interface UpdateRoomDto extends Partial<Omit<CreateRoomDto, 'amenities'>> {
  status?: RoomStatus
  amenities?: string[] | string
}

export interface UpdateRoomStatusDto {
  status: RoomStatus
  reason?: string
}

// ==================== BOOKING ====================
export interface Booking {
  id: string
  bookingNumber: string
  guestId: string
  guest?: Guest
  roomId: string
  room?: Room
  checkInDate: string
  checkOutDate: string
  actualCheckIn?: string
  actualCheckOut?: string
  guestsCount: number
  status: BookingStatus
  totalAmount: number
  discountCode?: string
  discountAmount?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CreateBookingDto {
  guestId: string
  roomId?: string
  roomType?: RoomType
  checkInDate: string
  checkOutDate: string
  guestsCount: number
  discountCode?: string
  notes?: string
}

export interface CheckInDto {
  bookingId?: string
  passportNumber?: string
}

export interface CheckOutDto {
  bookingId: string
  paymentMethod: PaymentMethod
}

// ==================== PAYMENT ====================
export interface Payment {
  id: string
  transactionNumber: string
  bookingId: string
  booking?: Booking
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  processedBy: string
  processedAt: string
  notes?: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  bookingId: string
  booking?: Booking
  guestId: string
  guest?: Guest
  roomCharges: number
  serviceCharges: number
  discountAmount: number
  taxAmount: number
  totalAmount: number
  paidAmount: number
  balance: number
  items: InvoiceItem[]
  createdAt: string
}

export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface ProcessPaymentDto {
  bookingId: string
  amount: number
  method: PaymentMethod
  discountCode?: string
}

export interface RefundDto {
  paymentId: string
  amount: number
  reason: string
}

// ==================== DISCOUNT ====================
export interface Discount {
  id: string
  code: string
  type: DiscountType
  value: number
  minAmount?: number
  maxUses?: number
  usedCount: number
  validFrom: string
  validTo: string
  isActive: boolean
}

// ==================== STAFF ====================
export interface Staff {
  id: string
  firstName: string
  lastName: string
  role: StaffRole
  phone: string
  email: string
  hourlyRate: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateStaffDto {
  firstName: string
  lastName: string
  role: StaffRole
  phone: string
  email: string
  hourlyRate: number
  password: string
}

export interface UpdateStaffDto extends Partial<Omit<CreateStaffDto, 'password'>> {}

export interface Schedule {
  id: string
  staffId: string
  staff?: Staff
  date: string
  startTime: string
  endTime: string
  hoursWorked?: number
}

export interface MonthlySalary {
  staffId: string
  staff?: Staff
  month: string
  totalHours: number
  hourlyRate: number
  totalSalary: number
}

// ==================== SERVICE ====================
export interface ServiceOrder {
  id: string
  orderNumber: string
  bookingId: string
  booking?: Booking
  serviceType: ServiceType
  assignedStaffId?: string
  assignedStaff?: Staff
  status: ServiceOrderStatus
  scheduledAt: string
  completedAt?: string
  price: number
  notes?: string
  createdAt: string
}

export interface CreateServiceOrderDto {
  bookingId: string
  serviceType: ServiceType
  scheduledAt: string
  notes?: string
}

// ==================== NOTIFICATION ====================
export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  channel: NotificationChannel
  isRead: boolean
  createdAt: string
}

// ==================== REPORTS ====================
export interface ReportQueryDto {
  period: ReportPeriod
  startDate?: string
  endDate?: string
  format?: ReportFormat
}

export interface RevenueReport {
  period: string
  totalRevenue: number
  roomRevenue: number
  serviceRevenue: number
  data: { date: string; revenue: number }[]
}

export interface OccupancyReport {
  totalRooms: number
  occupiedRooms: number
  occupancyRate: number
  byType: { type: RoomType; total: number; occupied: number; rate: number }[]
}

export interface GuestStats {
  totalGuests: number
  newGuests: number
  returningGuests: number
  byNationality: { nationality: string; count: number }[]
}

// ==================== AUTH ====================
export interface LoginDto {
  username: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: UserProfile
}

export interface UserProfile {
  id: string
  username: string
  firstName: string
  lastName: string
  role: StaffRole
  email: string
}

// ==================== COMMON ====================
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiError {
  message: string
  statusCode: number
  errors?: Record<string, string[]>
}
