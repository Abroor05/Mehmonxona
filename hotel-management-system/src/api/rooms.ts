import axiosInstance from './axiosInstance'
import { Room, RoomImage, CreateRoomDto, UpdateRoomDto, UpdateRoomStatusDto, PaginatedResponse } from '../types'
import { RoomType, RoomStatus } from '../types/enums'

const normalize = (r: Record<string, unknown>): Room => ({
  id:             String(r.id),
  roomNumber:     r.room_number as string,
  type:           r.room_type as RoomType,
  capacity:       r.capacity as number,
  pricePerNight:  Number(r.price_per_night),
  status:         r.status as RoomStatus,
  description:    r.description as string | undefined,
  amenities:      r.amenities_list as string[] | undefined,
  floor:          r.floor as number | undefined,
  images:         Array.isArray(r.images)
    ? (r.images as Record<string, unknown>[]).map(normalizeImage)
    : [],
  primaryImage:   r.primary_image as string | undefined,
  createdAt:      r.created_at as string,
  updatedAt:      r.updated_at as string,
})

const normalizeImage = (img: Record<string, unknown>): RoomImage => ({
  id:         String(img.id),
  imageUrl:   (img.image_url || img.image) as string,
  caption:    img.caption as string | undefined,
  isPrimary:  Boolean(img.is_primary),
  order:      Number(img.order ?? 0),
  uploadedAt: img.uploaded_at as string,
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
        room_type:  params?.type,
        status:     params?.status,
        page:       params?.page,
        page_size:  params?.pageSize ?? 200,
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

  create: async (data: CreateRoomDto & { imageFiles?: File[] }): Promise<Room> => {
    const response = await axiosInstance.post('/rooms/', {
      room_number:     data.roomNumber,
      room_type:       data.type,
      capacity:        data.capacity,
      price_per_night: data.pricePerNight,
      description:     data.description,
      amenities:       Array.isArray(data.amenities) ? data.amenities.join(', ') : (data.amenities ?? ''),
      floor:           data.floor ?? 1,
    })
    const room = normalize(response.data)

    // Rasmlar bo'lsa — yuklash
    if (data.imageFiles && data.imageFiles.length > 0) {
      try {
        const uploaded = await roomsApi.uploadImages(room.id, data.imageFiles)
        room.images = uploaded
        if (uploaded.length > 0) room.primaryImage = uploaded[0].imageUrl
      } catch {
        // Xona yaratildi, lekin rasm yuklanmadi — xatolikni e'tiborsiz qoldiramiz
      }
    }
    return room
  },

  update: async (id: string, data: UpdateRoomDto): Promise<Room> => {
    const response = await axiosInstance.patch(`/rooms/${id}/`, {
      room_number:     data.roomNumber,
      room_type:       data.type,
      capacity:        data.capacity,
      price_per_night: data.pricePerNight,
      description:     data.description,
      amenities:       Array.isArray(data.amenities) ? data.amenities.join(', ') : (data.amenities ?? ''),
      status:          data.status,
    })
    return normalize(response.data)
  },

  updateStatus: async (id: string, data: UpdateRoomStatusDto): Promise<Room> => {
    const response = await axiosInstance.patch(`/rooms/${id}/status/`, {
      status: data.status,
      reason: data.reason,
    })
    const room = response.data.room || response.data
    return normalize(room)
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/rooms/${id}/`)
  },

  // ── Rasm API ──────────────────────────────────────────────────────────────

  // POST /api/v1/rooms/<id>/images/  — bir nechta rasm yuklash
  uploadImages: async (roomId: string, files: File[], caption?: string): Promise<RoomImage[]> => {
    const formData = new FormData()
    files.forEach((file) => formData.append('images', file))
    if (caption) formData.append('caption', caption)

    const response = await axiosInstance.post(`/rooms/${roomId}/images/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return (response.data as Record<string, unknown>[]).map(normalizeImage)
  },

  // DELETE /api/v1/rooms/<id>/images/<image_id>/
  deleteImage: async (roomId: string, imageId: string): Promise<void> => {
    await axiosInstance.delete(`/rooms/${roomId}/images/${imageId}/`)
  },

  // PATCH /api/v1/rooms/<id>/images/<image_id>/primary/
  setPrimaryImage: async (roomId: string, imageId: string): Promise<void> => {
    await axiosInstance.patch(`/rooms/${roomId}/images/${imageId}/primary/`)
  },
}
