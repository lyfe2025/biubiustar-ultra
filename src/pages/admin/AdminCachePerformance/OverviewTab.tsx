import React from 'react'
import { Database, MemoryStick, Trash2, CheckCircle, AlertTriangle, XCircle, Activity } from 'lucide-react'
import { useLanguage } from '../../../contexts/language'
import { useCacheMonitor, type CacheStats } from '../../../hooks/useCacheMonitor'
import { formatBytes, formatPercentage, getHealthStatusColor } from './utils'

interface OverviewTabProps {
  health: any
  cacheStats: any
  metrics: any
  onClearCache: (cacheType: string) => void
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  health,
  cacheStats,
  metrics,
  onClearCache
}) => {
  const { t } = useLanguage()

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Activity className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <>
      {/* 缓存健康状态 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center">
            <Database className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {t('admin.cache.health.title') || '缓存健康状态'}
            </h3>
            <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                getHealthStatusColor('healthy')
              }`}>
              healthy
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 pb-5">
          {Object.entries(cacheStats || {}).map(([cacheType, stats]) => {
            const cacheStats = stats as CacheStats
            const cacheHealth = health?.[cacheType as keyof typeof health] || 'unknown'
            return (
            <div key={cacheType} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  {getHealthStatusIcon(cacheHealth)}
                  <h4 className="ml-2 text-sm font-medium text-gray-900 capitalize">
                    {cacheType}
                  </h4>
                </div>
                <button
                  onClick={() => onClearCache(cacheType)}
                  className="text-red-600 hover:text-red-800 text-sm"
                  title={t('admin.cache.clear') || '清除'}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('admin.cache.health.size') || '大小'}:</span>
                  <span className="font-medium">{cacheStats.size || 0}/{cacheStats.maxSize || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('admin.cache.health.hitRate') || '命中率'}:</span>
                  <span className="font-medium">{formatPercentage(cacheStats.hitRate || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('admin.cache.health.memoryUsage') || '内存'}:</span>
                  <span className="font-medium">{formatBytes(cacheStats.memoryUsage || 0)}</span>
                </div>
                
                {/* 利用率进度条 */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{t('admin.cache.health.utilization') || '利用率'}</span>
                    <span>{formatPercentage((cacheStats.size || 0) / (cacheStats.maxSize || 1))}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        (cacheStats.size || 0) / (cacheStats.maxSize || 1) > 0.8 
                          ? 'bg-red-600' 
                          : (cacheStats.size || 0) / (cacheStats.maxSize || 1) > 0.6 
                          ? 'bg-yellow-600' 
                          : 'bg-green-600'
                      }`}
                      style={{ width: `${Math.min(((cacheStats.size || 0) / (cacheStats.maxSize || 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            )
          })}
        </div>
      </div>

      {/* 性能指标概览 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {t('admin.cache.metrics.title') || '性能指标概览'}
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 pb-5">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {metrics?.totalRequests || 0}
            </div>
            <div className="text-sm text-gray-500">{t('admin.cache.metrics.totalCaches') || '总缓存数'}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {metrics?.cacheHits || 0}
            </div>
            <div className="text-sm text-gray-500">{t('admin.cache.metrics.totalHits') || '缓存命中'}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {metrics?.cacheMisses || 0}
            </div>
            <div className="text-sm text-gray-500">{t('admin.cache.metrics.totalMisses') || '缓存未命中'}</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-orange-600">
              {formatPercentage(metrics?.hitRate || 0)}
            </div>
            <div className="text-sm text-gray-500">{t('admin.cache.metrics.overallHitRate') || '缓存命中率'}</div>
          </div>
        </div>
      </div>

      {/* 系统内存使用情况 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center">
            <MemoryStick className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {t('admin.cache.memory.title') || '系统内存使用情况'}
            </h3>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 pb-5">
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-lg font-bold text-blue-600">
              {formatBytes(metrics?.memoryUsage?.rss || 0)}
            </div>
            <div className="text-sm text-gray-500">{t('admin.cache.memory.rss') || 'RSS'}</div>
            <div className="text-xs text-gray-400 mt-1">{t('admin.cache.memory.rssDesc') || '常驻内存'}</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-lg font-bold text-green-600">
              {formatBytes(metrics?.memoryUsage?.heapUsed || 0)}
            </div>
            <div className="text-sm text-gray-500">{t('admin.cache.memory.heapUsed') || 'Heap Used'}</div>
            <div className="text-xs text-gray-400 mt-1">{t('admin.cache.memory.heapUsedDesc') || '已用堆内存'}</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-lg font-bold text-yellow-600">
              {formatBytes(metrics?.memoryUsage?.heapTotal || 0)}
            </div>
            <div className="text-sm text-gray-500">{t('admin.cache.memory.heapTotal') || 'Heap Total'}</div>
            <div className="text-xs text-gray-400 mt-1">{t('admin.cache.memory.heapTotalDesc') || '总堆内存'}</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-lg font-bold text-purple-600">
              {formatBytes(metrics?.memoryUsage?.external || 0)}
            </div>
            <div className="text-sm text-gray-500">{t('admin.cache.memory.external') || 'External'}</div>
            <div className="text-xs text-gray-400 mt-1">{t('admin.cache.memory.externalDesc') || '外部内存'}</div>
          </div>
        </div>
        
        {/* 堆内存使用率 */}
        {metrics?.memoryUsage?.heapUsed && metrics?.memoryUsage?.heapTotal && (
          <div className="px-4 pb-5">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>{t('admin.cache.memory.heapUtilization') || '堆内存使用率'}</span>
              <span>{formatPercentage(metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${
                  (metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal) > 0.8 
                    ? 'bg-red-600' 
                    : (metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal) > 0.6 
                    ? 'bg-yellow-600' 
                    : 'bg-green-600'
                }`}
                style={{ width: `${Math.min((metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default OverviewTab
