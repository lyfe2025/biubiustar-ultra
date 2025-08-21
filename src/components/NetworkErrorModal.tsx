import React, { useState } from 'react'
import { useLanguage } from '../contexts/language'
import { getLocalizedNetworkError, NetworkErrorInfo } from '../utils/networkErrorHandler'
import { 
  AlertTriangle, 
  RotateCcw, 
  Wifi,
  Server,
  Clock,
  ShieldAlert
} from 'lucide-react'

interface NetworkErrorModalProps {
  error: any
  isOpen: boolean
  onClose: () => void
  onRetry?: () => void
  title?: string
}

export const NetworkErrorModal: React.FC<NetworkErrorModalProps> = ({
  error,
  isOpen,
  onClose,
  onRetry,
  title
}) => {
  const { language } = useLanguage()
  const [isRetrying, setIsRetrying] = useState(false)
  
  if (!isOpen) return null
  
  const errorInfo = getLocalizedNetworkError(error, language)
  
  const handleRetry = async () => {
    if (!onRetry) return
    
    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
    }
  }
  
  const getErrorIcon = () => {
    switch (errorInfo.type) {
      case 'connection_refused':
      case 'server_not_started':
        return <Server className="w-12 h-12 text-red-500" />
      case 'network_timeout':
        return <Clock className="w-12 h-12 text-yellow-500" />
      case 'ssl_handshake_failed':
        return <ShieldAlert className="w-12 h-12 text-orange-500" />
      case 'dns_resolution_failed':
      case 'network_unreachable':
        return <Wifi className="w-12 h-12 text-blue-500" />
      default:
        return <AlertTriangle className="w-12 h-12 text-red-500" />
    }
  }
  
  const getErrorColor = () => {
    switch (errorInfo.type) {
      case 'connection_refused':
      case 'server_not_started':
        return 'border-red-200 bg-red-50'
      case 'network_timeout':
        return 'border-yellow-200 bg-yellow-50'
      case 'ssl_handshake_failed':
        return 'border-orange-200 bg-orange-50'
      case 'dns_resolution_failed':
      case 'network_unreachable':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-red-200 bg-red-50'
    }
  }
  
  const getStatusText = () => {
    switch (language) {
      case 'zh':
        return '网络状态'
      case 'zh-TW':
        return '網路狀態'
      case 'vi':
        return 'Trạng thái mạng'
      default:
        return 'Network Status'
    }
  }
  
  const getRetryText = () => {
    switch (language) {
      case 'zh':
        return '重试'
      case 'zh-TW':
        return '重試'
      case 'vi':
        return 'Thử lại'
      default:
        return 'Retry'
    }
  }
  
  const getCloseText = () => {
    switch (language) {
      case 'zh':
        return '关闭'
      case 'zh-TW':
        return '關閉'
      case 'vi':
        return 'Đóng'
      default:
        return 'Close'
    }
  }
  
  const getContactSupportText = () => {
    switch (language) {
      case 'zh':
        return '联系技术支持'
      case 'zh-TW':
        return '聯絡技術支援'
      case 'vi':
        return 'Liên hệ hỗ trợ kỹ thuật'
      default:
        return 'Contact Support'
    }
  }
  
  const getTechnicalDetailsText = () => {
    switch (language) {
      case 'zh':
        return '技术详情'
      case 'zh-TW':
        return '技術詳情'
      case 'vi':
        return 'Chi tiết kỹ thuật'
      default:
        return 'Technical Details'
    }
  }
  
  const getShowDetailsText = () => {
    switch (language) {
      case 'zh':
        return '显示详情'
      case 'zh-TW':
        return '顯示詳情'
      case 'vi':
        return 'Hiển thị chi tiết'
      default:
        return 'Show Details'
    }
  }
  
  const getHideDetailsText = () => {
    switch (language) {
      case 'zh':
        return '隐藏详情'
      case 'zh-TW':
        return '隱藏詳情'
      case 'vi':
        return 'Ẩn chi tiết'
      default:
        return 'Hide Details'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className={`relative w-full max-w-md p-6 rounded-lg shadow-xl border ${getErrorColor()}`}>
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* 错误图标 */}
        <div className="flex justify-center mb-4">
          {getErrorIcon()}
        </div>
        
        {/* 错误标题 */}
        <h3 className="text-lg font-semibold text-center text-gray-800 mb-2">
          {title || errorInfo.userMessage}
        </h3>
        
        {/* 状态指示器 */}
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>{getStatusText()}: {errorInfo.userMessage}</span>
          </div>
        </div>
        
        {/* 错误建议 */}
        <div className="text-center text-gray-700 mb-6">
          <p className="text-sm leading-relaxed">{errorInfo.suggestion}</p>
        </div>
        
        {/* 操作按钮 */}
        <div className="flex flex-col space-y-3">
          {errorInfo.retryable && onRetry && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                             <RotateCcw className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? '重试中...' : getRetryText()}
            </button>
          )}
          
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {getCloseText()}
          </button>
        </div>
        
        {/* 技术详情（可折叠） */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 transition-colors">
            {getTechnicalDetailsText()}
          </summary>
          <div className="mt-2 p-3 bg-gray-100 rounded-md">
            <div className="text-xs font-mono text-gray-700 space-y-1">
              <div><strong>错误类型:</strong> {errorInfo.type}</div>
              <div><strong>错误消息:</strong> {errorInfo.message}</div>
              {errorInfo.statusCode && (
                <div><strong>状态码:</strong> {errorInfo.statusCode}</div>
              )}
              <div><strong>可重试:</strong> {errorInfo.retryable ? '是' : '否'}</div>
            </div>
          </div>
        </details>
        
        {/* 联系支持 */}
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              // 这里可以打开联系支持的表单或跳转到支持页面
              console.log('Contact support clicked')
            }}
            className="text-sm text-blue-600 hover:text-blue-800 underline transition-colors"
          >
            {getContactSupportText()}
          </button>
        </div>
      </div>
    </div>
  )
}

export default NetworkErrorModal
