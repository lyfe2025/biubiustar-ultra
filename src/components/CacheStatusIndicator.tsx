import React from 'react';
import { RefreshCw, Database, Clock } from 'lucide-react';

interface CacheStatusIndicatorProps {
  isCached?: boolean;
  timestamp?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

/**
 * 统一的缓存状态指示器组件
 * 显示数据是否来自缓存、时间戳，并提供刷新功能
 */
export const CacheStatusIndicator: React.FC<CacheStatusIndicatorProps> = ({
  isCached = false,
  timestamp,
  onRefresh,
  isRefreshing = false,
  size = 'md',
  showLabel = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const formatTimestamp = (ts: string) => {
    try {
      return new Date(ts).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return ts;
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${sizeClasses[size]} ${className}`}>
      {/* 状态指示器 */}
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isCached ? 'bg-green-500' : 'bg-blue-500'}`} />
        {showLabel && (
          <span className="text-gray-600">
            {isCached ? '缓存数据' : '实时数据'}
            {timestamp && (
              <span className="ml-1 text-xs text-gray-400">
                ({formatTimestamp(timestamp)})
              </span>
            )}
          </span>
        )}
      </div>

      {/* 刷新按钮 */}
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center space-x-1 text-purple-600 hover:text-purple-800 px-2 py-1 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
          title={isCached ? '刷新缓存' : '刷新数据'}
        >
          <RefreshCw className={`${iconSizes[size]} ${isRefreshing ? 'animate-spin' : ''}`} />
          {showLabel && (
            <span>{isCached ? '刷新缓存' : '刷新'}</span>
          )}
        </button>
      )}
    </div>
  );
};

export default CacheStatusIndicator;
