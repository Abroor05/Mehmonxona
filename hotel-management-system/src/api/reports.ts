import axiosInstance from './axiosInstance'
import { ReportQueryDto, RevenueReport, OccupancyReport, GuestStats } from '../types'

export const reportsApi = {
  getRevenue: async (params: ReportQueryDto): Promise<RevenueReport> => {
    const response = await axiosInstance.get<RevenueReport>('/reports/revenue', { params })
    return response.data
  },

  getOccupancy: async (params: ReportQueryDto): Promise<OccupancyReport> => {
    const response = await axiosInstance.get<OccupancyReport>('/reports/occupancy', { params })
    return response.data
  },

  getGuestStats: async (params: ReportQueryDto): Promise<GuestStats> => {
    const response = await axiosInstance.get<GuestStats>('/reports/guests', { params })
    return response.data
  },

  exportReport: async (type: string, params: ReportQueryDto): Promise<Blob> => {
    const response = await axiosInstance.get(`/reports/${type}/export`, {
      params,
      responseType: 'blob',
    })
    return response.data
  },

  getDashboardStats: async (): Promise<{
    totalRooms: number
    occupiedRooms: number
    todayCheckIns: number
    todayCheckOuts: number
    todayRevenue: number
    pendingServices: number
  }> => {
    const response = await axiosInstance.get('/reports/dashboard')
    return response.data
  },
}
