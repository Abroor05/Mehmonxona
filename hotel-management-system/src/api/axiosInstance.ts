import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — JWT token qo'shish
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — 401 da token yangilash
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          localStorage.clear()
          window.location.href = '/login'
          return Promise.reject(error)
        }

        // Django simplejwt refresh endpoint
        const response = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        })
        const { access } = response.data
        localStorage.setItem('accessToken', access)
        originalRequest.headers.Authorization = `Bearer ${access}`
        return axiosInstance(originalRequest)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
