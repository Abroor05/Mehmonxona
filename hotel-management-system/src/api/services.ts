import axiosInstance from './axiosInstance'
import { ServiceOrder, CreateServiceOrderDto, PaginatedResponse } from '../types'
import { ServiceType, ServiceOrderStatus } from '../types/enums'

export const servicesApi = {
  getOrders: async (params?: { page?: number; pageSize?: number; status?: ServiceOrderStatus; serviceType?: ServiceType; date?: string }): Promise<PaginatedResponse<ServiceOrder>> => {
    const response = await axiosInstance.get<PaginatedResponse<ServiceOrder>>('/services/orders', { params })
    return response.data
  },

  createOrder: async (data: CreateServiceOrderDto): Promise<ServiceOrder> => {
    const response = await axiosInstance.post<ServiceOrder>('/services/orders', data)
    return response.data
  },

  completeOrder: async (orderId: string): Promise<ServiceOrder> => {
    const response = await axiosInstance.post<ServiceOrder>(`/services/orders/${orderId}/complete`)
    return response.data
  },

  assignStaff: async (orderId: string, staffId: string): Promise<ServiceOrder> => {
    const response = await axiosInstance.post<ServiceOrder>(`/services/orders/${orderId}/assign`, { staffId })
    return response.data
  },

  getCleaningSchedule: async (date: string): Promise<ServiceOrder[]> => {
    const response = await axiosInstance.get<ServiceOrder[]>('/services/cleaning-schedule', { params: { date } })
    return response.data
  },

  getServiceTypes: async (): Promise<{ type: ServiceType; name: string; price: number }[]> => {
    const response = await axiosInstance.get('/services/types')
    return response.data
  },
}
