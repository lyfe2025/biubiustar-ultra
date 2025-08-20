import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Activity,
  Clock,
  AlertTriangle,
  TrendingUp,
  Download,
  RefreshCw,
  Trash2,
  BarChart3,
  Zap,
  Globe
} from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import DeleteConfirmModal from '../../components/DeleteConfirmModal'
import { useLanguage } from '../../contexts/language'
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor'

const AdminPerformance = () => {
  const { t } = useLanguage()
  const {
    stats,
    slowRequests,
    errorRequests,
    clearMetrics,
    exportReport
  } = usePerformanceMonitor()
  
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30) // 30秒
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // 自动刷新功能
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      // 触发数据刷新（usePerformanceMonitor会自动更新）
      window.location.reload()
    }, refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  const handleClearMetrics = () => {
    setShowClearConfirm(true)
  }

  const confirmClearMetrics = () => {
    clearMetrics()
    toast.success(t('admin.performance.messages.dataCleared') || '性能指标已清除')
    setShowClearConfirm(false)
  }

  const handleExportData = () => {
    try {
      exportReport()
      toast.success(t('admin.performance.messages.dataExported') || '数据已导出')
    } catch (error) {
      toast.error(t('admin.performance.messages.exportFailed') || '导出失败')
    }
  }

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`
  }

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600 bg-green-50'
    if (value <= thresholds.warning) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 页面标题和操作 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('admin.performance.title') || '性能监控'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {t('admin.performance.description') || '监控系统性能指标和请求统计'}
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            {/* 自动刷新控制 */}
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span>{t('admin.performance.autoRefresh') || '自动刷新'}</span>
              </label>
              
              {autoRefresh && (
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="text-sm border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value={10}>10s</option>
                  <option value={30}>30s</option>
                  <option value={60}>60s</option>
                </select>
              )}
            </div>
            
            {/* 操作按钮 */}
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('admin.performance.refresh') || '刷新'}
            </button>
            
            <button
              onClick={handleExportData}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <Download className="h-4 w-4 mr-2" />
              {t('admin.performance.export') || '导出'}
            </button>
            
            <button
              onClick={handleClearMetrics}
              className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('admin.performance.clear') || '清除'}
            </button>
          </div>
        </div>

        {/* 性能统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 总请求数 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t('admin.performance.stats.totalRequests') || '总请求数'}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {(stats.all?.totalRequests || 0).toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* 平均响应时间 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t('admin.performance.stats.averageResponseTime') || '平均响应时间'}
                    </dt>
                    <dd className={`text-lg font-medium ${
                      getStatusColor(stats.all?.averageDuration || 0, { good: 500, warning: 1000 }).split(' ')[0]
                    }`}>
                      {formatDuration(stats.all?.averageDuration || 0)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* 错误率 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t('admin.performance.stats.errorRate') || '错误率'}
                    </dt>
                    <dd className={`text-lg font-medium ${
                      getStatusColor(stats.all?.errorRate || 0, { good: 0.01, warning: 0.05 }).split(' ')[0]
                    }`}>
                      {formatPercentage(stats.all?.errorRate || 0)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* 慢请求率 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t('admin.performance.stats.slowRequestRate') || '慢请求率'}
                    </dt>
                    <dd className={`text-lg font-medium ${
                      getStatusColor(stats.all?.slowRequestRate || 0, { good: 0.05, warning: 0.1 }).split(' ')[0]
                    }`}>
                      {formatPercentage(stats.all?.slowRequestRate || 0)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 慢请求列表 */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center">
              <Zap className="h-5 w-5 text-yellow-600 mr-2" />
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {t('admin.performance.slowRequests.title') || '慢请求列表'}
              </h3>
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {slowRequests.length}
              </span>
            </div>
          </div>
          <ul className="divide-y divide-gray-200">
            {slowRequests.length === 0 ? (
              <li className="px-4 py-4 text-center text-gray-500">
                {t('admin.performance.slowRequests.noData') || '暂无慢请求记录'}
              </li>
            ) : (
              slowRequests.slice(0, 10).map((request, index) => (
                <li key={index} className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {request.method} {request.url}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(request.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-yellow-600 font-medium">
                        {formatDuration(request.duration)}
                      </span>
                      {request.status && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.status >= 400 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {request.status}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* 错误请求列表 */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {t('admin.performance.errorRequests.title') || '错误请求列表'}
              </h3>
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {errorRequests.length}
              </span>
            </div>
          </div>
          <ul className="divide-y divide-gray-200">
            {errorRequests.length === 0 ? (
              <li className="px-4 py-4 text-center text-gray-500">
                {t('admin.performance.errorRequests.noData') || '暂无错误请求记录'}
              </li>
            ) : (
              errorRequests.slice(0, 10).map((request, index) => (
                <li key={index} className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {request.method} {request.url}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(request.timestamp).toLocaleString()}
                      </p>
                      {request.error && (
                        <p className="text-sm text-red-600 mt-1">
                          {request.error}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">
                        {formatDuration(request.duration)}
                      </span>
                      {request.status && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {request.status}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* 清除性能数据确认对话框 */}
      <DeleteConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={confirmClearMetrics}
        title={t('admin.performance.clearConfirmTitle') || '清除性能数据'}
        message={t('admin.performance.clearConfirm') || '确定要清除所有性能数据吗？此操作无法撤销。'}
        itemIcon={<Trash2 className="w-5 h-5 text-red-600" />}
        confirmText={t('admin.performance.clear') || '清除'}
        cancelText={t('common.cancel') || '取消'}
      />
    </AdminLayout>
  )
}

export default AdminPerformance