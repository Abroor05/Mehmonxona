import axiosInstance from './axiosInstance'
import { Staff, CreateStaffDto, UpdateStaffDto, Schedule, MonthlySalary, PaginatedResponse } from '../types'
import { StaffRole } from '../types/enums'

const normalizeStaff = (s: Record<string, unknown>): Staff => ({
  id:          String(s.id),
  firstName:   s.first_name as string || '',
  lastName:    s.last_name as string || '',
  role:        s.role as StaffRole,
  phone:       s.phone as string || '',
  email:       s.email as string || '',
  hourlyRate:  Number(s.hourly_rate || 0),
  isActive:    Boolean(s.is_active !== false),
  createdAt:   s.created_at as string || '',
  updatedAt:   s.updated_at as string || '',
})

export const staffApi = {
  // GET /api/v1/staff/
  getAll: async (params?: {
    page?: number
    pageSize?: number
    role?: StaffRole
    isActive?: boolean
  }): Promise<PaginatedResponse<Staff>> => {
    const response = await axiosInstance.get('/staff/', {
      params: { page: params?.page },
    })
    const data = response.data
    if (data.results) {
      return {
        data:       data.results.map(normalizeStaff),
        total:      data.count,
        page:       params?.page || 1,
        pageSize:   20,
        totalPages: Math.ceil(data.count / 20),
      }
    }
    const list = Array.isArray(data) ? data : []
    return { data: list.map(normalizeStaff), total: list.length, page: 1, pageSize: list.length, totalPages: 1 }
  },

  getById: async (id: string): Promise<Staff> => {
    const response = await axiosInstance.get(`/staff/${id}/`)
    return normalizeStaff(response.data)
  },

  create: async (data: CreateStaffDto): Promise<Staff> => {
    // First create user, then staff profile
    const userResponse = await axiosInstance.post('/auth/users/', {
      username:   data.email.split('@')[0] + '_' + Date.now(),
      email:      data.email,
      first_name: data.firstName,
      last_name:  data.lastName,
      phone:      data.phone,
      role:       data.role,
      password:   data.password,
    })
    const userId = userResponse.data.id
    const staffResponse = await axiosInstance.post('/staff/', {
      user:        userId,
      hourly_rate: data.hourlyRate,
    })
    return normalizeStaff(staffResponse.data)
  },

  update: async (id: string, data: UpdateStaffDto): Promise<Staff> => {
    const response = await axiosInstance.patch(`/staff/${id}/`, {
      hourly_rate: data.hourlyRate,
    })
    return normalizeStaff(response.data)
  },

  archive: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/staff/${id}/`)
  },

  getSchedule: async (staffId: string, _month: string): Promise<Schedule[]> => {
    const response = await axiosInstance.get(`/staff/${staffId}/schedule/`)
    const data = response.data
    const list = data.results || (Array.isArray(data) ? data : [])
    return list.map((s: Record<string, unknown>) => ({
      id:          String(s.id),
      staffId:     String(s.staff),
      date:        s.date as string,
      startTime:   s.start_time as string,
      endTime:     s.end_time as string,
      hoursWorked: Number(s.hours_worked || 0),
    }))
  },

  updateSchedule: async (staffId: string, schedules: Omit<Schedule, 'id' | 'staffId'>[]): Promise<Schedule[]> => {
    const results = await Promise.all(
      schedules.map((s) =>
        axiosInstance.post(`/staff/${staffId}/schedule/`, {
          date:       s.date,
          start_time: s.startTime,
          end_time:   s.endTime,
        })
      )
    )
    return results.map((r) => ({
      id:          String(r.data.id),
      staffId,
      date:        r.data.date,
      startTime:   r.data.start_time,
      endTime:     r.data.end_time,
      hoursWorked: Number(r.data.hours_worked || 0),
    }))
  },

  getMonthlySalary: async (staffId: string, month: string): Promise<MonthlySalary> => {
    const [year, m] = month.split('-')
    const response = await axiosInstance.get(`/staff/${staffId}/salary/`, {
      params: { year, month: m },
    })
    const d = response.data
    return {
      staffId,
      month,
      totalHours:  0,
      hourlyRate:  Number(d.hourly_rate || 0),
      totalSalary: Number(d.total_salary || 0),
    }
  },
}
