import axiosInstance from './axiosInstance'
import { Guest, CreateGuestDto, UpdateGuestDto, PaginatedResponse } from '../types'

export const guestsApi = {
  getAll: async (params?: { page?: number; pageSize?: number; search?: string }): Promise<PaginatedResponse<Guest>> => {
    const response = await axiosInstance.get<PaginatedResponse<Guest>>('/guests', { params })
    return response.data
  },

  getById: async (id: string): Promise<Guest> => {
    const response = await axiosInstance.get<Guest>(`/guests/${id}`)
    return response.data
  },

  create: async (data: CreateGuestDto): Promise<Guest> => {
    const response = await axiosInstance.post<Guest>('/guests', data)
    return response.data
  },

  update: async (id: string, data: UpdateGuestDto): Promise<Guest> => {
    const response = await axiosInstance.put<Guest>(`/guests/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/guests/${id}`)
  },

  checkPassportExists: async (passportNumber: string): Promise<{ exists: boolean }> => {
    const response = await axiosInstance.get('/guests/check-passport', { params: { passportNumber } })
    return response.data
  },
}
