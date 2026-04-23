import axiosInstance from './axiosInstance'
import { Payment, Invoice, ProcessPaymentDto, RefundDto, PaginatedResponse } from '../types'
import { PaymentMethod, PaymentStatus } from '../types/enums'

const normalizePayment = (p: Record<string, unknown>): Payment => ({
  id:                String(p.id),
  transactionNumber: p.transaction_number as string,
  bookingId:         String(p.booking),
  amount:            Number(p.amount),
  method:            p.method as PaymentMethod,
  status:            p.status as PaymentStatus,
  processedBy:       p.processed_by_name as string || 'Staff',
  processedAt:       p.processed_at as string,
  notes:             p.notes as string | undefined,
})

export const paymentsApi = {
  // GET /api/v1/payments/
  getAll: async (params?: {
    page?: number
    pageSize?: number
    method?: PaymentMethod
    startDate?: string
    endDate?: string
  }): Promise<PaginatedResponse<Payment>> => {
    const response = await axiosInstance.get('/payments/', {
      params: {
        method:    params?.method,
        date_from: params?.startDate,
        date_to:   params?.endDate,
        page:      params?.page,
      },
    })
    const data = response.data
    if (data.results) {
      return {
        data:       data.results.map(normalizePayment),
        total:      data.count,
        page:       params?.page || 1,
        pageSize:   20,
        totalPages: Math.ceil(data.count / 20),
      }
    }
    const list = Array.isArray(data) ? data : []
    return { data: list.map(normalizePayment), total: list.length, page: 1, pageSize: list.length, totalPages: 1 }
  },

  // POST /api/v1/payments/
  processPayment: async (data: ProcessPaymentDto): Promise<Payment> => {
    const response = await axiosInstance.post('/payments/', {
      booking: Number(data.bookingId),
      amount:  data.amount,
      method:  data.method,
    })
    return normalizePayment(response.data)
  },

  // POST /api/v1/payments/<id>/refund/
  refund: async (data: RefundDto): Promise<Payment> => {
    const response = await axiosInstance.post(`/payments/${data.paymentId}/refund/`)
    return normalizePayment(response.data.payment || response.data)
  },

  // GET /api/v1/payments/invoice/<booking_id>/
  getInvoice: async (bookingId: string): Promise<Invoice> => {
    const response = await axiosInstance.get(`/payments/invoice/${bookingId}/`)
    const d = response.data
    return {
      id:             String(bookingId),
      invoiceNumber:  d.invoice_number || `INV-${d.booking_number}`,
      bookingId:      String(bookingId),
      guestId:        '',
      roomCharges:    Number(d.room_charges || 0),
      serviceCharges: 0,
      discountAmount: Number(d.discount || 0),
      taxAmount:      0,
      totalAmount:    Number(d.total_amount || 0),
      paidAmount:     Number(d.paid_amount || 0),
      balance:        Number(d.balance_due || 0),
      items:          (d.payments || []).map((p: Record<string, unknown>) => ({
        description: `To'lov — ${p.method}`,
        quantity:    1,
        unitPrice:   Number(p.amount),
        total:       Number(p.amount),
      })),
      createdAt:      new Date().toISOString(),
    }
  },

  validateDiscount: async (
    _code: string,
    _amount: number
  ): Promise<{ valid: boolean; discountAmount: number }> => {
    // Django doesn't have this endpoint yet
    return { valid: false, discountAmount: 0 }
  },
}
