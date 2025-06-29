/**
 * Common utility types and generics used across the application
 */

// Utility type for making specific properties optional
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Utility type for making specific properties required
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

// Utility type for nullable fields
export type Nullable<T> = { [K in keyof T]: T[K] | null }

// Utility type for timestamps
export interface Timestamps {
  created_at: string
  updated_at: string
}

// Utility type for soft delete
export interface SoftDelete {
  deleted_at: string | null
}

// Common status types
export type Status = 'active' | 'inactive' | 'pending' | 'archived'

// Common currency type
export type Currency = 'USD' | 'EUR' | 'GBP'

// Common image type
export interface Image {
  url: string
  alt?: string
  width?: number
  height?: number
}

// Common address type
export interface Address {
  street: string
  city: string
  state: string
  country: string
  postalCode: string
}

// Common social links type
export interface SocialLinks {
  website?: string
  twitter?: string
  instagram?: string
  facebook?: string
  linkedin?: string
}

// Common metadata type
export type Metadata = Record<string, any>

// Common ID types
export type UUID = string
export type Email = string
export type PhoneNumber = string

// Form field types
export interface FormField<T = any> {
  name: string
  label: string
  type: string
  value: T
  error?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  options?: Array<{ label: string; value: any }>
} 