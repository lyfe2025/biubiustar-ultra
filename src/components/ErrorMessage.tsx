import React from 'react'
import { cn } from '../utils/cn'

interface ErrorMessageProps {
  title?: string
  message?: string
  error?: Error | string
  onRetry?: () => void
  onGoHome?: () => void
  className?: string
  variant?: 'default' | 'compact' | 'inline'
  showIcon?: boolean
  retryText?: string
  homeText?: string
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = '出错了',
  message = '抱歉，遇到了一些问题。请稍后重试。',
  error,
  onRetry,
  onGoHome,
  className,
  variant = 'default',
  showIcon = true,
  retryText = '重试',
  homeText = '返回首页'
}) => {
  const getErrorMessage = () => {
    if (typeof error === 'string') {
      return error
    }
    if (error instanceof Error) {
      return error.message
    }
    return message
  }

  const renderDefault = () => (
    <div className={cn(
      'text-center p-8 bg-white rounded-lg shadow-lg max-w-md mx-auto',
      className
    )}>
      {showIcon && (
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
      )}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
      <p className="text-gray-600 mb-6">
        {getErrorMessage()}
      </p>
      <div className="space-y-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            {retryText}
          </button>
        )}
        {onGoHome && (
          <button
            onClick={onGoHome}
            className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            {homeText}
          </button>
        )}
      </div>
      {process.env.NODE_ENV === 'development' && error instanceof Error && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm text-gray-500">
            错误详情 (开发环境)
          </summary>
          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
            {error.message}
            {'\n'}
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  )

  const renderCompact = () => (
    <div className={cn(
      'text-center py-6 px-4 bg-red-50 border border-red-200 rounded-lg',
      className
    )}>
      <div className="flex items-center justify-center mb-3">
        {showIcon && (
          <div className="text-red-500 text-2xl mr-2">⚠️</div>
        )}
        <h3 className="text-lg font-semibold text-red-800">{title}</h3>
      </div>
      <p className="text-red-600 mb-4 text-sm">
        {getErrorMessage()}
      </p>
      <div className="flex justify-center space-x-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
          >
            {retryText}
          </button>
        )}
        {onGoHome && (
          <button
            onClick={onGoHome}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            {homeText}
          </button>
        )}
      </div>
    </div>
  )

  const renderInline = () => (
    <div className={cn(
      'flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg',
      className
    )}>
      <div className="flex items-center">
        {showIcon && (
          <div className="text-red-500 text-lg mr-2">⚠️</div>
        )}
        <div>
          <p className="text-red-800 font-medium text-sm">{title}</p>
          <p className="text-red-600 text-xs">{getErrorMessage()}</p>
        </div>
      </div>
      <div className="flex space-x-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
          >
            {retryText}
          </button>
        )}
      </div>
    </div>
  )

  const renderVariant = () => {
    switch (variant) {
      case 'compact':
        return renderCompact()
      case 'inline':
        return renderInline()
      default:
        return renderDefault()
    }
  }

  return renderVariant()
}

export default ErrorMessage