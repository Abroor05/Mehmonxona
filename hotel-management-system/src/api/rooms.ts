import axiosInstance from './axiosInstance'
import { Room, CreateRoomDto, UpdateRoomDto, UpdateRoomStatusDto, PaginatedResponse } from '../types'
import { RoomType, RoomStatus } from '../types/enums'

export const roomsApi = {
  getAll: async (params?: { page?: number; pageSize?: number; type?: RoomType; status?: RoomStatus }): Promise<PaginatedResponse<Room>> => {
    const response = await axiosInstance.get<PaginatedResponse<Room>>('/rooms', { params })
    return response.data
  },

  getById: async (id: string): Promise<Room> => {
    const response = await axiosInstance.get<Room>(`/rooms/${id}`)
    return response.data
  },

  getAvailableRooms: async (params: { checkInDate: string; checkOutDate: string; type?: RoomType; guestsCount?: number }): Promise<Room[]> => {
    const response = await axiosInstance.get<Room[]>('/rooms/available', { params })
    return response.data
  },

  create: async (data: CreateRoomDto): Promise<Room> => {
    const response = await axiosInstance.post<Room>('/rooms', data)
    return response.data
  },

  update: async (id: string, data: UpdateRoomDto): Promise<Room> => {
    const response = await axiosInstance.put<Room>(`/rooms/${id}`, data)
    return response.data
  },

  updateStatus: async (id: string, data: UpdateRoomStatusDto): Promise<Room> => {
    const response = await axiosInstance.patch<Room>(`/rooms/${id}/status`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/rooms/${id}`)
  },
}
