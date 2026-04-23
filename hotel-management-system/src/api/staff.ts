import axiosInstance from './axiosInstance'
import { Staff, CreateStaffDto, UpdateStaffDto, Schedule, MonthlySalary, PaginatedResponse } from '../types'
import { StaffRole } from '../types/enums'

export const staffApi = {
  getAll: async (params?: { page?: number; pageSize?: number; role?: StaffRole; isActive?: boolean }): Promise<PaginatedResponse<Staff>> => {
    const response = await axiosInstance.get<PaginatedResponse<Staff>>('/staff', { params })
    return response.data
  },

  getById: async (id: string): Promise<Staff> => {
    const response = await axiosInstance.get<Staff>(`/staff/${id}`)
    return response.data
  },

  create: async (data: CreateStaffDto): Promise<Staff> => {
    const response = await axiosInstance.post<Staff>('/staff', data)
    return response.data
  },

  update: async (id: string, data: UpdateStaffDto): Promise<Staff> => {
    const response = await axiosInstance.put<Staff>(`/staff/${id}`, data)
    return response.data
  },

  archive: async (id: string): Promise<void> => {
    await axiosInstance.post(`/staff/${id}/archive`)
  },

  getSchedule: async (staffId: string, month: string): Promise<Schedule[]> => {
    const response = await axiosInstance.get<Schedule[]>(`/staff/${staffId}/schedule`, { params: { month } })
    return response.data
  },

  updateSchedule: async (staffId: string, schedules: Omit<Schedule, 'id' | 'staffId'>[]): Promise<Schedule[]> => {
    const response = await axiosInstance.put<Schedule[]>(`/staff/${staffId}/schedule`, { schedules })
    return response.data
  },

  getMonthlySalary: async (staffId: string, month: string): Promise<MonthlySalary> => {
    const response = await axiosInstance.get<MonthlySalary>(`/staff/${staffId}/salary`, { params: { month } })
    return response.data
  },
}
