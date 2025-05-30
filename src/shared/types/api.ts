/**
 * Common API response types used across features
 */

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
}

export interface ValidationError {
  field: string
  message: string
}

export type ApiValidationError = {
  code: 'VALIDATION_ERROR'
  message: string
  errors: ValidationError[]
}

// Common query parameters
export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface SortParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface SearchParams {
  query?: string
  filters?: Record<string, any>
} 