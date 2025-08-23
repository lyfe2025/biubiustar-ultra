import React from 'react'
import { TrendingUp, RefreshCw, FlameKindling } from 'lucide-react'
import type { HotKeysData } from './types'

interface HotKeysTabProps {
  selectedCacheType: string
  cacheStats: any
  hotKeysData: HotKeysData | null
  isLoadingHotKeys: boolean
  onCacheTypeChange: (cacheType: string) => void
  onLoadHotKeys: (cacheType: string) => void
}

const HotKeysTab: React.FC<HotKeysTabProps> = ({
  selectedCacheType,
  cacheStats,
  hotKeysData,
  isLoadingHotKeys,
  onCacheTypeChange,
  onLoadHotKeys
}) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 text-orange-600 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">热点数据分析</h3>
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
              onClick={() => onLoadHotKeys(selectedCacheType)}
              disabled={isLoadingHotKeys}
              className="inline-flex items-center px-3 py-2 border border-orange-300 shadow-sm text-sm leading-4 font-medium rounded-md text-orange-700 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingHotKeys ? 'animate-pulse' : ''}`} />
              {isLoadingHotKeys ? '分析中...' : '分析'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="px-4 pb-5">
        {isLoadingHotKeys ? (
          <div className="text-center py-8">
            <TrendingUp className="h-8 w-8 animate-pulse mx-auto text-orange-600 mb-2" />
            <p className="text-gray-500">正在分析热点数据...</p>
          </div>
        ) : hotKeysData ? (
          <div className="space-y-4">
            {hotKeysData.hotKeys && hotKeysData.hotKeys.length > 0 ? (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <FlameKindling className="h-4 w-4 mr-2 text-orange-600" />
                  热点数据排行 (按访问频次)
                </h4>
                <div className="space-y-2">
                  {hotKeysData.hotKeys.map((item: any, index: number) => (
                    <div key={index} className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                            index === 0 ? 'bg-yellow-500' : 
                            index === 1 ? 'bg-gray-400' : 
                            index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                          }`}>
                            {index + 1}
                          </div>
                          <span className="font-mono text-sm text-blue-600 truncate">{item.key}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{item.accessCount} 次访问</div>
                          <div className="text-xs text-gray-500">最后访问: {new Date(item.lastAccess).toLocaleString()}</div>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              index === 0 ? 'bg-yellow-500' : 
                              index === 1 ? 'bg-gray-400' : 
                              index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                            }`}
                            style={{ 
                              width: `${Math.min((item.accessCount / (hotKeysData.hotKeys[0]?.accessCount || 1)) * 100, 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FlameKindling className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">暂无热点数据</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">选择缓存类型并点击分析查看热点数据</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default HotKeysTab
