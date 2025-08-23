import React from 'react'
import { Eye, RefreshCw, Layers } from 'lucide-react'
import { formatBytes, formatPercentage } from './utils'
import type { InspectorData } from './types'

interface InspectorTabProps {
  selectedCacheType: string
  cacheStats: any
  inspectorData: InspectorData | null
  isLoadingInspector: boolean
  onCacheTypeChange: (cacheType: string) => void
  onLoadCacheContent: (cacheType: string) => void
}

const InspectorTab: React.FC<InspectorTabProps> = ({
  selectedCacheType,
  cacheStats,
  inspectorData,
  isLoadingInspector,
  onCacheTypeChange,
  onLoadCacheContent
}) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Eye className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">缓存内容查看器</h3>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedCacheType}
              onChange={(e) => onCacheTypeChange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              {Object.keys(cacheStats || {}).map(cacheType => (
                <option key={cacheType} value={cacheType}>{cacheType}</option>
              ))}
            </select>
            <button
              onClick={() => onLoadCacheContent(selectedCacheType)}
              disabled={isLoadingInspector}
              className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingInspector ? 'animate-spin' : ''}`} />
              {isLoadingInspector ? '加载中...' : '刷新'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="px-4 pb-5">
        {isLoadingInspector ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-2" />
            <p className="text-gray-500">正在加载缓存内容...</p>
          </div>
        ) : inspectorData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900">{inspectorData.stats?.size || 0}</div>
                <div className="text-gray-500">当前条目</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900">{inspectorData.stats?.maxSize || 0}</div>
                <div className="text-gray-500">最大容量</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900">{formatPercentage(inspectorData.stats?.hitRate || 0)}</div>
                <div className="text-gray-500">命中率</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900">{formatBytes(inspectorData.stats?.memoryUsage || 0)}</div>
                <div className="text-gray-500">内存使用</div>
              </div>
            </div>
            
            {inspectorData.entries && inspectorData.entries.length > 0 ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">缓存条目 (显示前20条)</h4>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {inspectorData.entries.map((entry: any, index: number) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-mono text-blue-600 truncate flex-1 mr-2">{entry.key}</span>
                        <span className="text-xs text-gray-500 whitespace-nowrap">访问: {entry.accessCount}次</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        <pre className="whitespace-pre-wrap max-h-20 overflow-y-auto bg-gray-50 p-2 rounded">
                          {JSON.stringify(entry.data, null, 2)}
                        </pre>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>创建: {new Date(entry.timestamp).toLocaleString()}</span>
                        <span>最后访问: {new Date(entry.lastAccess).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Layers className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">该缓存暂无数据</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Eye className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">选择缓存类型并点击刷新查看内容</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default InspectorTab
