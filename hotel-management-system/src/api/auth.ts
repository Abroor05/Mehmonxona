import axiosInstance from './axiosInstance'
import { LoginDto, AuthResponse, UserProfile } from '../types'

export const authApi = {
  // POST /api/v1/auth/login/
  // Django returns: { access, refresh, user: {...} }
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/auth/login/', data)
    const { access, refresh, user } = response.data
    // Normalize Django response to our AuthResponse format
    return {
      accessToken:  access,
      refreshToken: refresh,
      user: {
        id:        String(user.id),
        username:  user.username,
        email:     user.email,
        firstName: user.first_name,
        lastName:  user.last_name,
        role:      user.role,
      },
    }
  },

  // POST /api/v1/auth/logout/
  logout: async (refreshToken: string): Promise<void> => {
    try {
      await axiosInstance.post('/auth/logout/', { refresh: refreshToken })
    } catch {
      // Ignore logout errors — clear local storage anyway
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  },

  // POST /api/v1/auth/token/refresh/
  refreshToken: async (refresh: string): Promise<{ access: string }> => {
    const response = await axiosInstance.post('/auth/token/refresh/', { refresh })
    return response.data
  },

  // GET /api/v1/auth/profile/
  getProfile: async (): Promise<UserProfile> => {
    const response = await axiosInstance.get('/auth/profile/')
    const u = response.data
    return {
      id:        String(u.id),
      username:  u.username,
      email:     u.email,
      firstName: u.first_name,
      lastName:  u.last_name,
      role:      u.role,
    }
  },

  // POST /api/v1/auth/change-password/
  changePassword: async (data: { old_password: string; new_password: string }): Promise<void> => {
    await axiosInstance.post('/auth/change-password/', data)
  },
}
