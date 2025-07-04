// Secure token actions using backend API instead of direct Supabase calls
// This replaces the old token-actions.ts file for better security

import { tokenService } from '../../../services/token-service'
import { toast } from 'sonner'

/**
 * Securely purchase tokens through backend API
 * Replaces the old purchaseTokens function that used direct Supabase calls
 */
export async function purchaseTokensSecure(
  amount: number, 
  packageType: '50' | '100' | '250' | '500',
  paymentIntentId: string
) {
  try {
    console.log('🔐 Secure token purchase:', { amount, packageType })
    
    const result = await tokenService.purchaseTokens(amount, packageType, paymentIntentId)
    
    if (result) {
      console.log('✅ Purchase successful:', result)
      return { 
        success: true, 
        newBalance: result.newBalance,
        amountAdded: result.amountAdded
      }
    }
    
    return { success: false, error: 'Purchase failed' }

  } catch (error) {
    console.error('Purchase error:', error)
    return { success: false, error: 'Purchase failed' }
  }
}

/**
 * Get user's token balance from secure backend
 * Replaces direct Supabase queries
 */
export async function getTokenBalanceSecure(): Promise<number> {
  try {
    const balance = await tokenService.getTokenBalance()
    console.log('💰 Current token balance:', balance)
    return balance
  } catch (error) {
    console.error('Error getting token balance:', error)
    return 0
  }
}

/**
 * Place a song bid using secure backend
 * Replaces the old placeSongBid function
 */
export async function placeSongBidSecure(
  songId: string,
  bidAmount: number,
  eventId?: string
) {
  try {
    console.log('🎵 Placing secure bid:', { songId, bidAmount, eventId })
    
    const result = await tokenService.placeBid(songId, bidAmount, eventId)
    
    if (result) {
      console.log('✅ Bid placed successfully:', result)
      return {
        success: true,
        newBalance: result.newBalance,
        bidAmount: result.bidAmount
      }
    }
    
    return { success: false, error: 'Bid failed' }

  } catch (error) {
    console.error('Bid error:', error)
    return { success: false, error: 'Bid failed' }
  }
}

/**
 * Get transaction history from secure backend
 * Replaces direct database queries
 */
export async function getTransactionHistorySecure(page: number = 1, limit: number = 20) {
  try {
    const result = await tokenService.getTransactionHistory(page, limit)
    
    if (result) {
      console.log('📊 Transaction history loaded:', result.transactions.length, 'transactions')
      return result
    }
    
    return { transactions: [], pagination: { page, limit, hasMore: false } }

  } catch (error) {
    console.error('Error loading transaction history:', error)
    return { transactions: [], pagination: { page, limit, hasMore: false } }
  }
}

/**
 * Check if user is authenticated for token operations
 */
export async function checkTokenAuth(): Promise<boolean> {
  try {
    return await tokenService.isAuthenticated()
  } catch (error) {
    console.error('Auth check error:', error)
    return false
  }
}

// Migration guide for existing components:
// 
// OLD (insecure):
// import { purchaseTokens } from '@/features/payments/actions/token-actions'
// 
// NEW (secure):
// import { purchaseTokensSecure } from '@/features/payments/actions/secure-token-actions'
// 
// OLD usage:
// const result = await purchaseTokens(userId, amount)
// 
// NEW usage:
// const result = await purchaseTokensSecure(amount, packageType, paymentIntentId)
// 
// Benefits of new approach:
// ✅ Server-side validation and business logic
// ✅ Proper authentication with JWT tokens
// ✅ Protection against client-side manipulation
// ✅ Comprehensive error handling
// ✅ Audit logging in backend
// ✅ Rate limiting and security checks

export default {
  purchaseTokensSecure,
  getTokenBalanceSecure,
  placeSongBidSecure,
  getTransactionHistorySecure,
  checkTokenAuth
} 