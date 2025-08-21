import React from 'react';
import { RefreshCw, Info, TrendingUp } from 'lucide-react';
import CacheStatusIndicator from './CacheStatusIndicator';

interface CacheInfo {
  cached: boolean;
  timestamp: string;
}

interface CacheStatusPanelProps {
  title?: string;
  cacheInfo?: CacheInfo;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  stats?: {
    label: string;
    value: string | number;
  }[];
  className?: string;
}

/**
 * 详细的缓存状态面板组件
 * 用于显示数据区块的缓存状态和相关统计信息
 */
export const CacheStatusPanel: React.FC<CacheStatusPanelProps> = ({
  title,
  cacheInfo,
  onRefresh,
  isRefreshing = false,
  stats,
  className = ''
}) => {
  if (!cacheInfo && !stats) return null;

  return (
    <div className={`bg-gray-50 rounded-lg p-4 border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {title && (
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">{title}</span>
            </div>
          )}

          {cacheInfo && (
            <CacheStatusIndicator
              isCached={cacheInfo.cached}
              timestamp={cacheInfo.timestamp}
              onRefresh={onRefresh}
              isRefreshing={isRefreshing}
              size="sm"
              showLabel={false}
            />
          )}
        </div>

        <div className="flex items-center space-x-4">
          {stats && stats.length > 0 && (
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              {stats.map((stat, index) => (
                <div key={index} className="text-xs text-gray-600">
                  <span className="font-medium">{stat.value}</span> {stat.label}
                </div>
              ))}
            </div>
          )}

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-1 text-purple-600 hover:text-purple-800 px-2 py-1 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50 text-sm"
              title={cacheInfo?.cached ? '刷新缓存' : '刷新数据'}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>刷新</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CacheStatusPanel;
