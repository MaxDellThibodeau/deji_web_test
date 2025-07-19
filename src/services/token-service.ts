import { createClientClient } from '@/shared/services/client'
import { toast } from 'sonner'

// Types for API responses
interface TokenBalance {
  balance: number
}

interface TokenPurchaseResponse {
  success: boolean
  newBalance: number
  amountAdded: number
}

interface TokenBidResponse {
  success: boolean
  newBalance: number
  bidAmount: number
  songId: string
}

interface TokenTransaction {
  id: string
  profile_id: string
  amount: number
  transaction_type: 'purchase' | 'bid' | 'admin_adjustment' | 'reward'
  description: string
  metadata?: Record<string, any>
  created_at: string
}

interface TransactionHistoryResponse {
  transactions: TokenTransaction[]
  pagination: {
    page: number
    limit: number
    hasMore: boolean
  }
}

interface ApiError {
  error: string
  details?: any
}

class TokenService {
  private readonly baseUrl: string
  
  constructor() {
    // Use environment variable for API URL, fallback to localhost for development
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
  }

  /**
   * Get the user's current token balance from backend
   */
  async getTokenBalance(): Promise<number> {
    try {
      const token = await this.getAuthToken()
      if (!token) {
        throw new Error('No authentication token available')
      }

      const response = await fetch(`${this.baseUrl}/api/payments/tokens/balance`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData: ApiError = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data: TokenBalance = await response.json()
      return data.balance

    } catch (error) {
      console.error('Error fetching token balance:', error)
      toast.error('Failed to load token balance')
      return 0 // Return 0 as fallback
    }
  }

  /**
   * Purchase tokens securely through backend
   */
  async purchaseTokens(
    amount: number, 
    packageType: '50' | '100' | '250' | '500',
    paymentIntentId: string
  ): Promise<TokenPurchaseResponse | null> {
    try {
      const token = await this.getAuthToken()
      if (!token) {
        toast.error('Authentication required to purchase tokens')
        return null
      }

      const requestBody = {
        amount,
        packageType,
        paymentIntentId
      }

      console.log('🔐 Purchasing tokens via backend:', requestBody)

      const response = await fetch(`${this.baseUrl}/api/payments/tokens/purchase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (!response.ok) {
        const errorData: ApiError = data
        console.error('Token purchase failed:', errorData)
        
        // Handle specific error cases
        if (response.status === 401) {
          toast.error('Authentication expired. Please log in again.')
        } else if (response.status === 400) {
          toast.error(errorData.error || 'Invalid purchase request')
        } else {
          toast.error('Failed to purchase tokens. Please try again.')
        }
        return null
      }

      const purchaseData: TokenPurchaseResponse = data
      toast.success(`Successfully purchased ${purchaseData.amountAdded} tokens!`)
      
      console.log('✅ Token purchase successful:', purchaseData)
      return purchaseData

    } catch (error) {
      console.error('Error purchasing tokens:', error)
      toast.error('Network error. Please check your connection.')
      return null
    }
  }

  /**
   * Place a bid on a song using tokens
   */
  async placeBid(
    songId: string, 
    bidAmount: number, 
    eventId?: string
  ): Promise<TokenBidResponse | null> {
    try {
      const token = await this.getAuthToken()
      if (!token) {
        toast.error('Authentication required to place bids')
        return null
      }

      const requestBody = {
        songId,
        bidAmount,
        eventId
      }

      console.log('🎵 Placing bid via backend:', requestBody)

      const response = await fetch(`${this.baseUrl}/api/payments/tokens/bid`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (!response.ok) {
        const errorData: ApiError = data
        console.error('Bid placement failed:', errorData)
        
        if (response.status === 400 && errorData.error === 'Insufficient tokens') {
          // Backend returns additional fields for insufficient tokens error
          const insufficientTokensError = errorData as ApiError & { currentBalance?: number; required?: number }
          const balanceMsg = insufficientTokensError.currentBalance !== undefined 
            ? ` You have ${insufficientTokensError.currentBalance} tokens.`
            : ''
          toast.error(`Insufficient tokens. You need ${bidAmount} tokens.${balanceMsg}`)
        } else if (response.status === 401) {
          toast.error('Authentication expired. Please log in again.')
        } else {
          toast.error(errorData.error || 'Failed to place bid')
        }
        return null
      }

      const bidData: TokenBidResponse = data
      toast.success(`Bid placed! ${bidData.bidAmount} tokens spent.`)
      
      console.log('✅ Bid placement successful:', bidData)
      return bidData

    } catch (error) {
      console.error('Error placing bid:', error)
      toast.error('Network error. Please check your connection.')
      return null
    }
  }

  /**
   * Get transaction history for the user
   */
  async getTransactionHistory(page: number = 1, limit: number = 20): Promise<TransactionHistoryResponse | null> {
    try {
      const token = await this.getAuthToken()
      if (!token) {
        toast.error('Authentication required to view transaction history')
        return null
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })

      const response = await fetch(`${this.baseUrl}/api/payments/tokens/transactions?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData: ApiError = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data: TransactionHistoryResponse = await response.json()
      return data

    } catch (error) {
      console.error('Error fetching transaction history:', error)
      toast.error('Failed to load transaction history')
      return null
    }
  }

  /**
   * Get the current user's JWT token for API authentication
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      const supabase = createClientClient()
      if (!supabase) {
        return null
      }

      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
        return null
      }

      return session?.access_token || null

    } catch (error) {
      console.error('Error retrieving auth token:', error)
      return null
    }
  }

  /**
   * Check if the user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthToken()
    return !!token
  }
}

// Export singleton instance
export const tokenService = new TokenService()

// Export types for use in components
export type {
  TokenBalance,
  TokenPurchaseResponse,
  TokenBidResponse,
  TokenTransaction,
  TransactionHistoryResponse,
  ApiError
} 