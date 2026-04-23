import axiosInstance from './axiosInstance'
import { Booking, CreateBookingDto, CheckInDto, CheckOutDto, PaginatedResponse } from '../types'
import { BookingStatus } from '../types/enums'

const normalize = (b: Record<string, unknown>): Booking => ({
  id:             String(b.id),
  bookingNumber:  b.booking_number as string,
  guestId:        String(b.customer),
  guest:          b.customer_name ? {
    id:            String(b.customer),
    firstName:     (b.customer_name as string).split(' ')[0] || '',
    lastName:      (b.customer_name as string).split(' ').slice(1).join(' ') || '',
    passportNumber: '',
    phone:         '',
    email:         '',
    createdAt:     '',
    updatedAt:     '',
  } : undefined,
  roomId:         String(b.room),
  room:           b.room_number ? {
    id:            String(b.room),
    roomNumber:    b.room_number as string,
    type:          b.room_type as never,
    capacity:      2,
    pricePerNight: 0,
    status:        'available' as never,
    createdAt:     '',
    updatedAt:     '',
  } : undefined,
  checkInDate:    b.check_in as string,
  checkOutDate:   b.check_out as string,
  actualCheckIn:  b.actual_check_in as string | undefined,
  actualCheckOut: b.actual_check_out as string | undefined,
  guestsCount:    b.guests_count as number,
  status:         b.status as BookingStatus,
  totalAmount:    Number(b.total_amount),
  discountCode:   undefined,
  discountAmount: Number(b.discount_amount || 0),
  notes:          b.notes as string,
  createdAt:      b.created_at as string,
  updatedAt:      b.updated_at as string,
})

export const bookingsApi = {
  // GET /api/v1/bookings/
  getAll: async (params?: {
    page?: number
    pageSize?: number
    status?: BookingStatus
    startDate?: string
    endDate?: string
  }): Promise<PaginatedResponse<Booking>> => {
    const response = await axiosInstance.get('/bookings/', {
      params: {
        status:    params?.status,
        date_from: params?.startDate,
        date_to:   params?.endDate,
        page:      params?.page,
      },
    })
    const data = response.data
    if (data.results) {
      return {
        data:       data.results.map(normalize),
        total:      data.count,
        page:       params?.page || 1,
        pageSize:   20,
        totalPages: Math.ceil(data.count / 20),
      }
    }
    const list = Array.isArray(data) ? data : []
    return { data: list.map(normalize), total: list.length, page: 1, pageSize: list.length, totalPages: 1 }
  },

  getById: async (id: string): Promise<Booking> => {
    const response = await axiosInstance.get(`/bookings/${id}/`)
    return normalize(response.data)
  },

  // POST /api/v1/bookings/
  create: async (data: CreateBookingDto): Promise<Booking> => {
    const response = await axiosInstance.post('/bookings/', {
      room:            Number(data.roomId),
      check_in:        data.checkInDate,
      check_out:       data.checkOutDate,
      guests_count:    data.guestsCount,
      discount_amount: data.discountCode ? 0 : 0,
      notes:           data.notes || '',
    })
    return normalize(response.data)
  },

  // POST /api/v1/bookings/check-in/
  checkIn: async (data: CheckInDto): Promise<Booking> => {
    const response = await axiosInstance.post('/bookings/check-in/', {
      booking_number: data.bookingId,
      booking_id:     data.bookingId,
    })
    const result = response.data.booking || response.data
    return normalize(result)
  },

  // POST /api/v1/bookings/check-out/
  checkOut: async (data: CheckOutDto): Promise<Booking> => {
    const response = await axiosInstance.post('/bookings/check-out/', {
      booking_id: Number(data.bookingId),
    })
    const result = response.data.booking || response.data
    return normalize(result)
  },

  // POST /api/v1/bookings/<id>/cancel/
  cancel: async (id: string, reason?: string): Promise<Booking> => {
    const response = await axiosInstance.post(`/bookings/${id}/cancel/`, { reason })
    return normalize(response.data.booking || { id, booking_number: '', status: 'cancelled' })
  },

  getByGuestId: async (guestId: string): Promise<Booking[]> => {
    const response = await axiosInstance.get('/bookings/', {
      params: { customer: guestId },
    })
    const data = response.data
    const list = data.results || (Array.isArray(data) ? data : [])
    return list.map(normalize)
  },
}
