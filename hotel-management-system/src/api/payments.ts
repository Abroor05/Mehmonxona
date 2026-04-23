import axiosInstance from './axiosInstance'
import { Payment, Invoice, ProcessPaymentDto, RefundDto, PaginatedResponse } from '../types'
import { PaymentMethod } from '../types/enums'

export const paymentsApi = {
  getAll: async (params?: { page?: number; pageSize?: number; method?: PaymentMethod; startDate?: string; endDate?: string }): Promise<PaginatedResponse<Payment>> => {
    const response = await axiosInstance.get<PaginatedResponse<Payment>>('/payments', { params })
    return response.data
  },

  processPayment: async (data: ProcessPaymentDto): Promise<Payment> => {
    const response = await axiosInstance.post<Payment>('/payments', data)
    return response.data
  },

  refund: async (data: RefundDto): Promise<Payment> => {
    const response = await axiosInstance.post<Payment>('/payments/refund', data)
    return response.data
  },

  getInvoice: async (bookingId: string): Promise<Invoice> => {
    const response = await axiosInstance.get<Invoice>(`/payments/invoice/${bookingId}`)
    return response.data
  },

  validateDiscount: async (code: string, amount: number): Promise<{ valid: boolean; discountAmount: number }> => {
    const response = await axiosInstance.post('/payments/validate-discount', { code, amount })
    return response.data
  },
}
