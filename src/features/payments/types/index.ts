export interface SubscriptionPlan {
  id: number
  name: string
  description: string
  price_monthly: number
  price_yearly: number
  features: Record<string, any>
}

export interface SubscriptionPlanSelectorProps {
  plans: SubscriptionPlan[]
  currentPlanId?: number
}

export interface CheckoutFormProps {
  eventName: string
  ticketType: string
  quantity: number
  unitPrice: number
  onSuccess: () => void
  onCancel: () => void
}

export interface TokenPurchaseFormProps {
  userId: string
  onSuccess: () => void
}

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | 'canceled'
  created: number
}

export interface PaymentMethod {
  id: string
  type: string
  card?: {
    brand: string
    last4: string
    exp_month: number
    exp_year: number
  }
}

export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded'

export interface PaymentTransaction {
  id: string
  user_id: string
  amount: number
  currency: string
  status: PaymentStatus
  payment_method?: PaymentMethod
  created_at: string
  updated_at: string
  metadata?: Record<string, any>
} 