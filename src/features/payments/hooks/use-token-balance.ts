import { useState, useEffect, useCallback } from 'react'
import { tokenService, type TokenTransaction } from '../../../services/token-service'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { toast } from 'sonner'

/**
 * Custom hook for managing token balance and operations
 * Uses the secure backend API instead of direct Supabase calls
 */
export const useTokenBalance = () => {
  const { user, isAuthenticated } = useAuth()
  const [balance, setBalance] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [transactions, setTransactions] = useState<TokenTransaction[]>([])
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)

  // Load balance when user changes or component mounts
  useEffect(() => {
    if (isAuthenticated && user) {
      loadBalance()
    } else {
      setBalance(0)
      setIsLoading(false)
    }
  }, [isAuthenticated, user])

  /**
   * Load the current token balance from backend
   */
  const loadBalance = useCallback(async () => {
    if (!isAuthenticated) {
      setBalance(0)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const newBalance = await tokenService.getTokenBalance()
      setBalance(newBalance)
    } catch (error) {
      console.error('Error loading token balance:', error)
      // tokenService already shows error toast
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  /**
   * Refresh balance manually (with success toast)
   */
  const refreshBalance = useCallback(async () => {
    await loadBalance()
    toast.success('Token balance refreshed')
  }, [loadBalance])

  /**
   * Purchase tokens using the secure backend
   */
  const purchaseTokens = useCallback(async (
    amount: number,
    packageType: '50' | '100' | '250' | '500',
    paymentIntentId: string
  ) => {
    if (!isAuthenticated) {
      toast.error('Authentication required to purchase tokens')
      return false
    }

    try {
      const result = await tokenService.purchaseTokens(amount, packageType, paymentIntentId)
      if (result) {
        setBalance(result.newBalance)
        return true
      }
      return false
    } catch (error) {
      console.error('Error purchasing tokens:', error)
      return false
    }
  }, [isAuthenticated])

  /**
   * Place a bid using tokens
   */
  const placeBid = useCallback(async (
    songId: string,
    bidAmount: number,
    eventId?: string
  ) => {
    if (!isAuthenticated) {
      toast.error('Authentication required to place bids')
      return false
    }

    if (balance < bidAmount) {
      toast.error(`Insufficient tokens. You need ${bidAmount} but only have ${balance}.`)
      return false
    }

    try {
      const result = await tokenService.placeBid(songId, bidAmount, eventId)
      if (result) {
        setBalance(result.newBalance)
        return true
      }
      return false
    } catch (error) {
      console.error('Error placing bid:', error)
      return false
    }
  }, [isAuthenticated, balance])

  /**
   * Load transaction history
   */
  const loadTransactionHistory = useCallback(async (page: number = 1, limit: number = 20) => {
    if (!isAuthenticated) {
      return
    }

    setIsLoadingTransactions(true)
    try {
      const result = await tokenService.getTransactionHistory(page, limit)
      if (result) {
        setTransactions(result.transactions)
      }
    } catch (error) {
      console.error('Error loading transaction history:', error)
    } finally {
      setIsLoadingTransactions(false)
    }
  }, [isAuthenticated])

  /**
   * Check if user has enough tokens for a specific amount
   */
  const hasEnoughTokens = useCallback((amount: number): boolean => {
    return balance >= amount
  }, [balance])

  /**
   * Get formatted balance display
   */
  const getFormattedBalance = useCallback((): string => {
    return balance.toLocaleString()
  }, [balance])

  return {
    // State
    balance,
    isLoading,
    transactions,
    isLoadingTransactions,
    isAuthenticated,

    // Actions
    loadBalance,
    refreshBalance,
    purchaseTokens,
    placeBid,
    loadTransactionHistory,

    // Utilities
    hasEnoughTokens,
    getFormattedBalance,
  }
}

export default useTokenBalance 