import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useAuthStore } from '@/features/auth/stores/auth-store'

export interface ApiError {
  message: string
  code?: string
  statusCode?: number
}

export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

// Create the main axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.DEV 
    ? 'http://localhost:3001/api'      // Development: djei-backend
    : 'https://api.djei.com/api',      // Production: deployed backend
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add auth token and setup
api.interceptors.request.use(
  (config: AxiosRequestConfig): any => {
    // Add auth token if available
    const token = useAuthStore.getState().session?.access_token
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
      })
    }

    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor - Handle responses and errors
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // Log response in development
    if (import.meta.env.DEV) {
      const duration = new Date().getTime() - response.config.metadata?.startTime?.getTime() || 0
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`, {
        status: response.status,
        data: response.data,
      })
    }

    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh the token
        const authStore = useAuthStore.getState()
        await authStore.refreshUser()
        
        // Retry the request with new token
        const newToken = useAuthStore.getState().session?.access_token
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        console.error('Token refresh failed:', refreshError)
        useAuthStore.getState().logout()
        
        // Redirect to login if we're in the browser
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    }

    // Handle other errors
    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || 'An error occurred',
      code: error.response?.data?.code || error.code,
      statusCode: error.response?.status,
    }

    // Log error in development
    if (import.meta.env.DEV) {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        message: apiError.message,
        data: error.response?.data,
      })
    }

    return Promise.reject(apiError)
  }
)

// Helper methods for common HTTP operations
export const apiService = {
  // GET request
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.get<ApiResponse<T>>(url, config)
    return response.data.data || response.data
  },

  // POST request
  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.post<ApiResponse<T>>(url, data, config)
    return response.data.data || response.data
  },

  // PUT request
  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.put<ApiResponse<T>>(url, data, config)
    return response.data.data || response.data
  },

  // PATCH request
  patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.patch<ApiResponse<T>>(url, data, config)
    return response.data.data || response.data
  },

  // DELETE request
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.delete<ApiResponse<T>>(url, config)
    return response.data.data || response.data
  },

  // Upload file
  upload: async <T = any>(url: string, file: File, config?: AxiosRequestConfig): Promise<T> => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post<ApiResponse<T>>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data || response.data
  },

  // Get raw axios instance for advanced usage
  getInstance: () => api,
}

// Export the main API instance as default
export default api 