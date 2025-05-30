import type { VariantProps } from "class-variance-authority"
import type { UseEmblaCarouselType } from "embla-carousel-react"
import type { HTMLAttributes, ButtonHTMLAttributes, TextareaHTMLAttributes } from "react"

// Button types
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<any> {
  asChild?: boolean
}

// Carousel types
export interface CarouselProps {
  opts?: Record<string, any>
  plugins?: any[]
  orientation?: "horizontal" | "vertical"
  setApi?: (api: UseEmblaCarouselType[1]) => void
}

export interface CarouselContextProps extends CarouselProps {
  carouselRef: UseEmblaCarouselType[0]
  api: UseEmblaCarouselType[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
}

// Chart types
export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut'
  data: any
  options?: any
}

export interface ChartContextProps {
  config: ChartConfig
}

// Toast types
export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive'
  duration?: number
}

export interface ToastActionElement {
  altText: string
  onClick: () => void
  children: React.ReactNode
}

// Form types
export interface FormItemContextValue {
  id: string
}

// Textarea types
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {} 