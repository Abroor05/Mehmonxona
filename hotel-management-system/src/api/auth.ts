import axiosInstance from './axiosInstance'
import { LoginDto, AuthResponse } from '../types'

export const authApi = {
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', data)
    return response.data
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const response = await axiosInstance.post('/auth/refresh', { refreshToken })
    return response.data
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    await axiosInstance.post('/auth/change-password', data)
  },

  getProfile: async () => {
    const response = await axiosInstance.get('/auth/profile')
    return response.data
  },
}
