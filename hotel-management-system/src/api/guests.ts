import axiosInstance from './axiosInstance'
import { Guest, CreateGuestDto, UpdateGuestDto, PaginatedResponse } from '../types'

// Helper: normalize Django user fields (snake_case → camelCase)
const normalize = (u: Record<string, unknown>): Guest => ({
  id:            String(u.id),
  firstName:     u.first_name as string,
  lastName:      u.last_name as string,
  passportNumber: u.passport_number as string || '',
  phone:         u.phone as string,
  email:         u.email as string,
  nationality:   u.nationality as string | undefined,
  createdAt:     u.created_at as string,
  updatedAt:     u.updated_at as string,
})

export const guestsApi = {
  // GET /api/v1/auth/users/?role=customer
  getAll: async (params?: {
    page?: number
    pageSize?: number
    search?: string
  }): Promise<PaginatedResponse<Guest>> => {
    const response = await axiosInstance.get('/auth/users/', {
      params: {
        role:      'customer',
        page:      params?.page,
        page_size: params?.pageSize,
        search:    params?.search,
      },
    })
    const data = response.data
    // Django pagination: { count, next, previous, results }
    if (data.results) {
      return {
        data:       data.results.map(normalize),
        total:      data.count,
        page:       params?.page || 1,
        pageSize:   params?.pageSize || 20,
        totalPages: Math.ceil(data.count / (params?.pageSize || 20)),
      }
    }
    // Non-paginated
    const list = Array.isArray(data) ? data : []
    return {
      data:       list.map(normalize),
      total:      list.length,
      page:       1,
      pageSize:   list.length,
      totalPages: 1,
    }
  },

  getById: async (id: string): Promise<Guest> => {
    const response = await axiosInstance.get(`/auth/users/${id}/`)
    return normalize(response.data)
  },

  create: async (data: CreateGuestDto): Promise<Guest> => {
    const response = await axiosInstance.post('/auth/users/', {
      first_name:      data.firstName,
      last_name:       data.lastName,
      passport_number: data.passportNumber,
      phone:           data.phone,
      email:           data.email,
      nationality:     data.nationality,
      role:            'customer',
      username:        data.email.split('@')[0] + '_' + Date.now(),
      password:        'TempPass123!',
    })
    return normalize(response.data)
  },

  update: async (id: string, data: UpdateGuestDto): Promise<Guest> => {
    const response = await axiosInstance.patch(`/auth/users/${id}/`, {
      first_name:  data.firstName,
      last_name:   data.lastName,
      phone:       data.phone,
      email:       data.email,
      nationality: data.nationality,
    })
    return normalize(response.data)
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/auth/users/${id}/`)
  },

  checkPassportExists: async (_passportNumber: string): Promise<{ exists: boolean }> => {
    // Django doesn't have this endpoint — return false for now
    return { exists: false }
  },
}
