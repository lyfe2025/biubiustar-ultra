import React from 'react'
import { Zap, RefreshCw } from 'lucide-react'
import type { BenchmarkData } from './types'

interface BenchmarkTabProps {
  selectedCacheType: string
  cacheStats: any
  benchmarkData: BenchmarkData | null
  isRunningBenchmark: boolean
  onCacheTypeChange: (cacheType: string) => void
  onRunBenchmark: (cacheType: string) => void
}

const BenchmarkTab: React.FC<BenchmarkTabProps> = ({
  selectedCacheType,
  cacheStats,
  benchmarkData,
  isRunningBenchmark,
  onCacheTypeChange,
  onRunBenchmark
}) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Zap className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">性能基准测试</h3>
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
              onClick={() => onRunBenchmark(selectedCacheType)}
              disabled={isRunningBenchmark}
              className="inline-flex items-center px-3 py-2 border border-purple-300 shadow-sm text-sm leading-4 font-medium rounded-md text-purple-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              <Zap className={`h-4 w-4 mr-2 ${isRunningBenchmark ? 'animate-bounce' : ''}`} />
              {isRunningBenchmark ? '测试中...' : '开始测试'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="px-4 pb-5">
        {isRunningBenchmark ? (
          <div className="text-center py-8">
            <Zap className="h-8 w-8 animate-bounce mx-auto text-purple-600 mb-2" />
            <p className="text-gray-500">正在执行基准测试...</p>
            <div className="mt-4 max-w-md mx-auto">
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        ) : benchmarkData ? (
          <div className="space-y-6">
            {/* 测试配置 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">测试配置</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">缓存类型:</span>
                  <span className="ml-1 font-medium">{benchmarkData.testConfig?.cacheType}</span>
                </div>
                <div>
                  <span className="text-gray-500">测试大小:</span>
                  <span className="ml-1 font-medium">{benchmarkData.testConfig?.testSize}</span>
                </div>
                <div>
                  <span className="text-gray-500">迭代次数:</span>
                  <span className="ml-1 font-medium">{benchmarkData.testConfig?.iterations}</span>
                </div>
                <div>
                  <span className="text-gray-500">数据大小:</span>
                  <span className="ml-1 font-medium">{benchmarkData.testConfig?.dataSize}</span>
                </div>
              </div>
            </div>

            {/* 平均结果 */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">平均性能指标</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-lg font-bold text-purple-600">{benchmarkData.averages?.avgWriteTime || 0}ms</div>
                  <div className="text-sm text-gray-500">平均写入时间</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{benchmarkData.averages?.avgReadTime || 0}ms</div>
                  <div className="text-sm text-gray-500">平均读取时间</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-lg font-bold text-green-600">{benchmarkData.averages?.avgOpsPerSecond || 0}</div>
                  <div className="text-sm text-gray-500">每秒操作数</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-lg font-bold text-orange-600">{benchmarkData.averages?.avgHitRate?.toFixed(1) || 0}%</div>
                  <div className="text-sm text-gray-500">命中率</div>
                </div>
              </div>
            </div>

            {/* 详细结果表格 */}
            {benchmarkData.results && (
              <div className="bg-white border rounded-lg">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900">详细测试结果</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">迭代</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">写入时间</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">读取时间</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">删除时间</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">总时间</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作/秒</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">命中率</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {benchmarkData.results.map((result: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{result.iteration}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.writeTime}ms</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.readTime}ms</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.deleteTime}ms</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.totalTime}ms</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.opsPerSecond}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.hitRate.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Zap className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">选择缓存类型并点击开始测试</p>
            <p className="text-xs text-gray-400 mt-1">基准测试将执行1000次操作，进行3轮迭代</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default BenchmarkTab
