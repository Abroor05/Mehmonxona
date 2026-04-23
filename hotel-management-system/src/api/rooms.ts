import axiosInstance from './axiosInstance'
import { Room, CreateRoomDto, UpdateRoomDto, UpdateRoomStatusDto, PaginatedResponse } from '../types'
import { RoomType, RoomStatus } from '../types/enums'

const normalize = (r: Record<string, unknown>): Room => ({
  id:             String(r.id),
  roomNumber:     r.room_number as string,
  type:           r.room_type as RoomType,
  capacity:       r.capacity as number,
  pricePerNight:  Number(r.price_per_night),
  status:         r.status as RoomStatus,
  description:    r.description as string | undefined,
  createdAt:      r.created_at as string,
  updatedAt:      r.updated_at as string,
})

export const roomsApi = {
  // GET /api/v1/rooms/
  getAll: async (params?: {
    page?: number
    pageSize?: number
    type?: RoomType
    status?: RoomStatus
  }): Promise<PaginatedResponse<Room>> => {
    const response = await axiosInstance.get('/rooms/', {
      params: {
        room_type: params?.type,
        status:    params?.status,
        page:      params?.page,
      },
    })
    const data = response.data
    if (data.results) {
      return {
        data:       data.results.map(normalize),
        total:      data.count,
        page:       params?.page || 1,
        pageSize:   20,
        totalPages: Math.ceil(data.count / 20),
      }
    }
    const list = Array.isArray(data) ? data : []
    return { data: list.map(normalize), total: list.length, page: 1, pageSize: list.length, totalPages: 1 }
  },

  getById: async (id: string): Promise<Room> => {
    const response = await axiosInstance.get(`/rooms/${id}/`)
    return normalize(response.data)
  },

  // GET /api/v1/rooms/available/?check_in=&check_out=
  getAvailableRooms: async (params: {
    checkInDate: string
    checkOutDate: string
    type?: RoomType
    guestsCount?: number
  }): Promise<Room[]> => {
    const response = await axiosInstance.get('/rooms/available/', {
      params: {
        check_in:  params.checkInDate,
        check_out: params.checkOutDate,
        room_type: params.type,
        capacity:  params.guestsCount,
      },
    })
    const data = response.data
    const list = data.results || (Array.isArray(data) ? data : [])
    return list.map(normalize)
  },

  create: async (data: CreateRoomDto): Promise<Room> => {
    const response = await axiosInstance.post('/rooms/', {
      room_number:     data.roomNumber,
      room_type:       data.type,
      capacity:        data.capacity,
      price_per_night: data.pricePerNight,
      description:     data.description,
    })
    return normalize(response.data)
  },

  update: async (id: string, data: UpdateRoomDto): Promise<Room> => {
    const response = await axiosInstance.patch(`/rooms/${id}/`, {
      room_number:     data.roomNumber,
      room_type:       data.type,
      capacity:        data.capacity,
      price_per_night: data.pricePerNight,
      description:     data.description,
      status:          data.status,
    })
    return normalize(response.data)
  },

  // PATCH /api/v1/rooms/<id>/status/
  updateStatus: async (id: string, data: UpdateRoomStatusDto): Promise<Room> => {
    const response = await axiosInstance.patch(`/rooms/${id}/status/`, {
      status: data.status,
      reason: data.reason,
    })
    // Response: { message, room }
    const room = response.data.room || response.data
    return normalize(room)
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/rooms/${id}/`)
  },
}
