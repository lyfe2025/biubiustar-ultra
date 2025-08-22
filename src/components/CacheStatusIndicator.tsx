import React from 'react'
import { Clock, RefreshCw, AlertTriangle } from 'lucide-react'

interface CacheStatusIndicatorProps {
  isCacheHit: boolean
  cacheTimestamp?: string
  isCacheExpired?: boolean
  onForceRefresh?: () => void
  showRefreshButton?: boolean
  className?: string
}

export const CacheStatusIndicator: React.FC<CacheStatusIndicatorProps> = ({
  isCacheHit,
  cacheTimestamp,
  isCacheExpired = false,
  onForceRefresh,
  showRefreshButton = true,
  className = ''
}) => {
  // 格式化时间
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      
      if (diffInMinutes < 1) {
        return '刚刚'
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes}分钟前`
      } else if (diffInMinutes < 1440) {
        const hours = Math.floor(diffInMinutes / 60)
        return `${hours}小时前`
      } else {
        const days = Math.floor(diffInMinutes / 1440)
        return `${days}天前`
      }
    } catch {
      return '未知时间'
    }
  }

  // 获取缓存状态颜色
  const getStatusColor = () => {
    if (!isCacheHit) return 'text-gray-500'
    if (isCacheExpired) return 'text-orange-600'
    return 'text-green-600'
  }

  // 获取缓存状态图标
  const getStatusIcon = () => {
    if (!isCacheHit) return null
    if (isCacheExpired) return <AlertTriangle className="w-4 h-4" />
    return <Clock className="w-4 h-4" />
  }

  // 获取缓存状态文本
  const getStatusText = () => {
    if (!isCacheHit) return '实时数据'
    if (isCacheExpired) return '缓存已过期'
    return '缓存数据'
  }

  return (
    <div className={`flex items-center space-x-3 text-sm ${className}`}>
      {/* 缓存状态指示器 */}
      <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
        {getStatusIcon()}
        <span>{getStatusText()}</span>
        {cacheTimestamp && (
          <span className="text-gray-500">
            ({formatTime(cacheTimestamp)})
          </span>
        )}
      </div>

      {/* 强制刷新按钮 */}
      {showRefreshButton && onForceRefresh && (
        <button
          onClick={onForceRefresh}
          className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          title="强制刷新数据"
        >
          <RefreshCw className="w-4 h-4" />
          <span>刷新</span>
        </button>
      )}
    </div>
  )
}

export default CacheStatusIndicator
