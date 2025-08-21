import { useState, useCallback } from 'react'
import { useLanguage } from '../contexts/language'
import { getLocalizedNetworkError, NetworkErrorInfo } from '../utils/networkErrorHandler'

interface UseNetworkErrorReturn {
  error: any
  errorInfo: NetworkErrorInfo | null
  isErrorModalOpen: boolean
  showError: (error: any) => void
  hideError: () => void
  clearError: () => void
  retry: () => void
  isRetrying: boolean
}

interface UseNetworkErrorOptions {
  onRetry?: () => Promise<void> | void
  autoHide?: boolean
  autoHideDelay?: number
}

export const useNetworkError = (options: UseNetworkErrorOptions = {}): UseNetworkErrorReturn => {
  const { language } = useLanguage()
  const [error, setError] = useState<any>(null)
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  
  const { onRetry, autoHide = false, autoHideDelay = 5000 } = options
  
  const errorInfo = error ? getLocalizedNetworkError(error, language) : null
  
  const showError = useCallback((newError: any) => {
    setError(newError)
    setIsErrorModalOpen(true)
    
    // 自动隐藏错误提示（如果启用）
    if (autoHide) {
      setTimeout(() => {
        hideError()
      }, autoHideDelay)
    }
  }, [autoHide, autoHideDelay])
  
  const hideError = useCallback(() => {
    setIsErrorModalOpen(false)
  }, [])
  
  const clearError = useCallback(() => {
    setError(null)
    setIsErrorModalOpen(false)
    setIsRetrying(false)
  }, [])
  
  const retry = useCallback(async () => {
    if (!onRetry) return
    
    setIsRetrying(true)
    try {
      await onRetry()
      clearError() // 重试成功后清除错误
    } catch (retryError) {
      // 重试失败，显示新错误
      setError(retryError)
    } finally {
      setIsRetrying(false)
    }
  }, [onRetry, clearError])
  
  return {
    error,
    errorInfo,
    isErrorModalOpen,
    showError,
    hideError,
    clearError,
    retry,
    isRetrying
  }
}

export default useNetworkError
