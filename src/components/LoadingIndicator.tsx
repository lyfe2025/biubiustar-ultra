import React from 'react'
import { cn } from '../utils/cn'

interface LoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'purple' | 'blue' | 'gray' | 'white'
  text?: string
  className?: string
  showText?: boolean
  variant?: 'spinner' | 'dots' | 'pulse'
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'md',
  color = 'purple',
  text = '加载中...',
  className,
  showText = true,
  variant = 'spinner'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const colorClasses = {
    purple: 'border-purple-200 border-t-purple-600',
    blue: 'border-blue-200 border-t-blue-600',
    gray: 'border-gray-200 border-t-gray-600',
    white: 'border-white/30 border-t-white'
  }

  const textColorClasses = {
    purple: 'text-purple-600',
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    white: 'text-white'
  }

  const renderSpinner = () => (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className={cn(
          'animate-spin rounded-full border-2',
          sizeClasses[size],
          colorClasses[color]
        )}></div>
      </div>
      {showText && (
        <p className={cn(
          'mt-2 text-sm font-medium',
          textColorClasses[color]
        )}>
          {text}
        </p>
      )}
    </div>
  )

  const renderDots = () => (
    <div className="flex flex-col items-center">
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'rounded-full animate-pulse',
              size === 'sm' && 'w-2 h-2',
              size === 'md' && 'w-3 h-3',
              size === 'lg' && 'w-4 h-4',
              size === 'xl' && 'w-5 h-5',
              color === 'purple' && 'bg-purple-600',
              color === 'blue' && 'bg-blue-600',
              color === 'gray' && 'bg-gray-600',
              color === 'white' && 'bg-white'
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1.4s'
            }}
          />
        ))}
      </div>
      {showText && (
        <p className={cn(
          'mt-2 text-sm font-medium',
          textColorClasses[color]
        )}>
          {text}
        </p>
      )}
    </div>
  )

  const renderPulse = () => (
    <div className="flex flex-col items-center">
      <div className={cn(
        'rounded-full animate-pulse',
        sizeClasses[size],
        color === 'purple' && 'bg-purple-600',
        color === 'blue' && 'bg-blue-600',
        color === 'gray' && 'bg-gray-600',
        color === 'white' && 'bg-white'
      )}></div>
      {showText && (
        <p className={cn(
          'mt-2 text-sm font-medium',
          textColorClasses[color]
        )}>
          {text}
        </p>
      )}
    </div>
  )

  const renderVariant = () => {
    switch (variant) {
      case 'dots':
        return renderDots()
      case 'pulse':
        return renderPulse()
      default:
        return renderSpinner()
    }
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      {renderVariant()}
    </div>
  )
}

export default LoadingIndicator