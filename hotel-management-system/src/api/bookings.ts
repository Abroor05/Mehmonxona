import axiosInstance from './axiosInstance'
import { Booking, CreateBookingDto, CheckInDto, CheckOutDto, PaginatedResponse } from '../types'
import { BookingStatus } from '../types/enums'

export const bookingsApi = {
  getAll: async (params?: { page?: number; pageSize?: number; status?: BookingStatus; startDate?: string; endDate?: string }): Promise<PaginatedResponse<Booking>> => {
    const response = await axiosInstance.get<PaginatedResponse<Booking>>('/bookings', { params })
    return response.data
  },

  getById: async (id: string): Promise<Booking> => {
    const response = await axiosInstance.get<Booking>(`/bookings/${id}`)
    return response.data
  },

  create: async (data: CreateBookingDto): Promise<Booking> => {
    const response = await axiosInstance.post<Booking>('/bookings', data)
    return response.data
  },

  checkIn: async (data: CheckInDto): Promise<Booking> => {
    const response = await axiosInstance.post<Booking>('/bookings/check-in', data)
    return response.data
  },

  checkOut: async (data: CheckOutDto): Promise<Booking> => {
    const response = await axiosInstance.post<Booking>('/bookings/check-out', data)
    return response.data
  },

  cancel: async (id: string, reason?: string): Promise<Booking> => {
    const response = await axiosInstance.post<Booking>(`/bookings/${id}/cancel`, { reason })
    return response.data
  },

  getByGuestId: async (guestId: string): Promise<Booking[]> => {
    const response = await axiosInstance.get<Booking[]>(`/bookings/guest/${guestId}`)
    return response.data
  },
}
