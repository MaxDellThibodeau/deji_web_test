import axios from 'axios'

// Create axios instance pointing to djei-backend
export const apiClient = axios.create({
  baseURL: import.meta.env.DEV 
    ? 'http://localhost:3001/api'      // Development: djei-backend
    : 'https://api.djei.com/api',      // Production: deployed backend
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    // We'll add auth token logic when we create auth store
    // const token = useAuthStore.getState().token
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, logout user
      // useAuthStore.getState().logout()
      // window.location.href = '/login'
      console.log('Unauthorized - would redirect to login')
    }
    return Promise.reject(error)
  }
)

export default apiClient 