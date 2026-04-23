import axiosInstance from './axiosInstance'
import { ReportQueryDto, RevenueReport, OccupancyReport, GuestStats } from '../types'

export const reportsApi = {
  // GET /api/v1/reports/revenue/
  getRevenue: async (params: ReportQueryDto): Promise<RevenueReport> => {
    const response = await axiosInstance.get('/reports/revenue/', {
      params: {
        period: params.period?.toLowerCase() || 'monthly',
        year:   new Date().getFullYear(),
      },
    })
    const d = response.data
    return {
      period:         d.period || 'monthly',
      totalRevenue:   Number(d.total || 0),
      roomRevenue:    Number(d.total || 0),
      serviceRevenue: 0,
      data:           (d.data || []).map((item: Record<string, unknown>) => ({
        date:    String(item.date || item.month || ''),
        revenue: Number(item.revenue || 0),
      })),
    }
  },

  // GET /api/v1/reports/occupancy/
  getOccupancy: async (_params: ReportQueryDto): Promise<OccupancyReport> => {
    const response = await axiosInstance.get('/reports/occupancy/')
    const d = response.data
    return {
      totalRooms:    d.total_rooms || 0,
      occupiedRooms: d.by_status?.find((s: Record<string, unknown>) => s.status === 'booked')?.count || 0,
      occupancyRate: 0,
      byType:        (d.by_type || []).map((t: Record<string, unknown>) => ({
        type:     t.type as never,
        total:    Number(t.total || 0),
        occupied: Number(t.occupied || 0),
        rate:     Number(t.rate || 0),
      })),
    }
  },

  // GET /api/v1/reports/guests/
  getGuestStats: async (_params: ReportQueryDto): Promise<GuestStats> => {
    const response = await axiosInstance.get('/reports/guests/')
    const d = response.data
    return {
      totalGuests:      d.total_customers || 0,
      newGuests:        d.total_customers || 0,
      returningGuests:  0,
      byNationality:    [],
    }
  },

  // GET /api/v1/reports/dashboard/
  getDashboardStats: async (): Promise<{
    totalRooms: number
    occupiedRooms: number
    todayCheckIns: number
    todayCheckOuts: number
    todayRevenue: number
    pendingServices: number
  }> => {
    const response = await axiosInstance.get('/reports/dashboard/')
    const d = response.data
    return {
      totalRooms:      d.total_rooms || 0,
      occupiedRooms:   d.occupied_rooms || 0,
      todayCheckIns:   d.today_check_ins || 0,
      todayCheckOuts:  d.today_check_outs || 0,
      todayRevenue:    d.today_revenue || 0,
      pendingServices: d.pending_services || 0,
    }
  },

  exportReport: async (_type: string, _params: ReportQueryDto): Promise<Blob> => {
    return new Blob(['Export not available'], { type: 'text/plain' })
  },
}
