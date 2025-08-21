import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Database,
  RefreshCw,
  Trash2,
  Zap,
  MemoryStick,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  BarChart3,
  Settings,
  Save,
  RotateCcw,
  Eye,
  TrendingUp,
  FlameKindling,
  Clock,
  FileText,
  Layers
} from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import DeleteConfirmModal from '../../components/DeleteConfirmModal'
import { useLanguage } from '../../contexts/language'
import { useCacheMonitor, type CacheStats } from '@/hooks/useCacheMonitor'

const AdminCachePerformance = () => {
  const { t } = useLanguage()
  const {
    health,
    stats: cacheStats,
    metrics,
    isLoading,
    error,
    refreshData,
    clearCache,
    runPerformanceTest,
    inspectCache,
    getHotKeys,
    runBenchmark
  } = useCacheMonitor()
  
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [clearTarget, setClearTarget] = useState<string | null>(null)
  const [isRunningTest, setIsRunningTest] = useState(false)
  
  // 缓存配置相关状态
  const [showCacheConfig, setShowCacheConfig] = useState(false)
  const [cacheConfigs, setCacheConfigs] = useState<Record<string, any>>({})
  const [editingConfig, setEditingConfig] = useState<string | null>(null)
  const [configValues, setConfigValues] = useState<Record<string, any>>({})
  const [isSavingConfig, setIsSavingConfig] = useState(false)

  // 新增功能状态
  const [activeTab, setActiveTab] = useState<'overview' | 'inspector' | 'hotkeys' | 'benchmark'>('overview')
  const [inspectorData, setInspectorData] = useState<any>(null)
  const [hotKeysData, setHotKeysData] = useState<any>(null)
  const [benchmarkData, setBenchmarkData] = useState<any>(null)
  const [selectedCacheType, setSelectedCacheType] = useState<string>('user')
  const [isLoadingInspector, setIsLoadingInspector] = useState(false)
  const [isLoadingHotKeys, setIsLoadingHotKeys] = useState(false)
  const [isRunningBenchmark, setIsRunningBenchmark] = useState(false)

  const handleClearCache = (cacheType: string) => {
    setClearTarget(cacheType)
    setShowClearConfirm(true)
  }

  const handleClearAllCaches = () => {
    setClearTarget('all')
    setShowClearConfirm(true)
  }

  const confirmClearCache = async () => {
    try {
      if (clearTarget === 'all') {
        await clearCache() // 不传参数表示清理所有缓存
        toast.success(t('admin.cache.messages.allCachesCleared') || '所有缓存已清除')
      } else if (clearTarget) {
        await clearCache(clearTarget)
        toast.success(t('admin.cache.messages.cacheCleared') || `${clearTarget} 缓存已清除`)
      }
      await refreshData()
    } catch (error) {
      toast.error(t('admin.cache.messages.clearCacheFailed') || '清除缓存失败')
    } finally {
      setShowClearConfirm(false)
      setClearTarget(null)
    }
  }

  const handleRunPerformanceTest = async () => {
    setIsRunningTest(true)
    try {
      await runPerformanceTest()
      toast.success(t('admin.cache.messages.testCompleted') || '性能测试完成')
      await refreshData()
    } catch (error) {
      toast.error(t('admin.cache.messages.testFailed') || '性能测试失败')
    } finally {
      setIsRunningTest(false)
    }
  }

  // 获取缓存配置
  const fetchCacheConfigs = async () => {
    try {
      const response = await fetch('/api/admin/settings/cache')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const result = await response.json()
      if (result.success) {
        setCacheConfigs(result.data.cacheTypes.reduce((acc: any, item: any) => {
          acc[item.type] = item
          return acc
        }, {}))
      }
    } catch (error) {
      console.error('获取缓存配置失败:', error)
      toast.error(t('admin.cache.messages.configFetchFailed') || '获取缓存配置失败')
    }
  }

  // 更新缓存配置
  const updateCacheConfig = async (cacheType: string, config: any) => {
    setIsSavingConfig(true)
    try {
      const response = await fetch('/api/admin/settings/cache', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cacheType,
          ...config
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      if (result.success) {
        toast.success(t('admin.cache.messages.configUpdated', { cacheType }) || `${cacheType} 缓存配置已更新`)
        await fetchCacheConfigs()
        await refreshData()
        setEditingConfig(null)
        setConfigValues({})
      } else {
        throw new Error(result.error || '更新失败')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : (t('admin.cache.messages.configUpdateFailed') || '更新缓存配置失败')
      toast.error(message)
    } finally {
      setIsSavingConfig(false)
    }
  }

  // 开始编辑配置
  const startEditConfig = (cacheType: string) => {
    const config = cacheConfigs[cacheType]
    if (config) {
      setEditingConfig(cacheType)
      setConfigValues({
        maxSize: config.maxSize,
        defaultTTL: Math.round(config.defaultTTL / 1000), // 转为秒
        cleanupInterval: Math.round(config.cleanupInterval / 1000) // 转为秒
      })
    }
  }

  // 取消编辑
  const cancelEditConfig = () => {
    setEditingConfig(null)
    setConfigValues({})
  }

  // 保存配置
  const saveConfig = async () => {
    if (!editingConfig) return
    
    await updateCacheConfig(editingConfig, {
      maxSize: parseInt(configValues.maxSize),
      defaultTTL: parseInt(configValues.defaultTTL) * 1000, // 转为毫秒
      cleanupInterval: parseInt(configValues.cleanupInterval) * 1000 // 转为毫秒
    })
  }

  // 加载缓存内容
  const loadCacheContent = async (cacheType: string) => {
    setIsLoadingInspector(true)
    try {
      const data = await inspectCache(cacheType, 20, 0)
      setInspectorData(data)
    } catch (error) {
      console.error('加载缓存内容失败:', error)
    } finally {
      setIsLoadingInspector(false)
    }
  }

  // 加载热点数据
  const loadHotKeys = async (cacheType: string) => {
    setIsLoadingHotKeys(true)
    try {
      const data = await getHotKeys(cacheType, 20)
      setHotKeysData(data)
    } catch (error) {
      console.error('加载热点数据失败:', error)
    } finally {
      setIsLoadingHotKeys(false)
    }
  }

  // 执行基准测试
  const runBenchmarkTest = async (cacheType: string) => {
    setIsRunningBenchmark(true)
    try {
      const data = await runBenchmark(cacheType, {
        testSize: 1000,
        iterations: 3,
        dataSize: 'medium'
      })
      setBenchmarkData(data)
      toast.success('基准测试完成')
    } catch (error) {
      console.error('基准测试失败:', error)
    } finally {
      setIsRunningBenchmark(false)
    }
  }

  // 标签页切换处理
  const handleTabChange = (tab: 'overview' | 'inspector' | 'hotkeys' | 'benchmark') => {
    setActiveTab(tab)
    
    // 根据标签页自动加载相应数据
    if (tab === 'inspector' && !inspectorData) {
      loadCacheContent(selectedCacheType)
    } else if (tab === 'hotkeys' && !hotKeysData) {
      loadHotKeys(selectedCacheType)
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`
  }

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

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50'
      case 'error':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const formatDurationFromMs = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60 * 1000) return `${Math.round(ms / 1000)}s`
    if (ms < 60 * 60 * 1000) return `${Math.round(ms / (60 * 1000))}min`
    return `${Math.round(ms / (60 * 60 * 1000))}h`
  }

  // 初始化加载缓存配置
  React.useEffect(() => {
    if (showCacheConfig && Object.keys(cacheConfigs).length === 0) {
      fetchCacheConfigs()
    }
  }, [showCacheConfig])

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 页面标题和操作 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('admin.cache.title') || '缓存性能监控'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {t('admin.cache.description') || '监控缓存健康状态、性能指标和内存使用情况'}
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <button
              onClick={refreshData}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('admin.cache.refresh') || '刷新'}
            </button>
            
            <button
              onClick={handleRunPerformanceTest}
              disabled={isRunningTest}
              className={`inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isRunningTest 
                  ? 'text-blue-400 bg-blue-50 cursor-not-allowed' 
                  : 'text-blue-700 bg-white hover:bg-blue-50'
              }`}
            >
              <Play className={`h-4 w-4 mr-2 ${isRunningTest ? 'animate-spin' : ''}`} />
              {isRunningTest ? (t('admin.cache.testRunning') || '测试中...') : (t('admin.cache.performanceTest') || '性能测试')}
            </button>
            
            <button
              onClick={handleClearAllCaches}
              className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('admin.cache.clearAll') || '清除所有缓存'}
            </button>
          </div>
        </div>

        {/* 标签页导航 */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {[
              { key: 'overview', label: '概览', icon: BarChart3 },
              { key: 'inspector', label: '内容查看', icon: Eye },
              { key: 'hotkeys', label: '热点分析', icon: TrendingUp },
              { key: 'benchmark', label: '基准测试', icon: Zap }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key as any)}
                className={`${
                  activeTab === tab.key
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm inline-flex items-center`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* 标签页内容 */}
        {activeTab === 'overview' && (
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
                    onClick={() => handleClearCache(cacheType)}
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

        {/* 缓存配置管理 */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Settings className="h-5 w-5 text-indigo-600 mr-2" />
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {t('admin.cache.config.title') || '缓存配置管理'}
                </h3>
              </div>
              <button
                onClick={() => setShowCacheConfig(!showCacheConfig)}
                className="inline-flex items-center px-3 py-2 border border-indigo-300 shadow-sm text-sm leading-4 font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Settings className="h-4 w-4 mr-2" />
                {showCacheConfig ? (t('admin.cache.config.hideConfig') || '隐藏配置') : (t('admin.cache.config.manageConfig') || '管理配置')}
              </button>
            </div>
          </div>
          
          {showCacheConfig && (
            <div className="px-4 pb-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.entries(cacheConfigs).map(([cacheType, config]: [string, any]) => {
                  const isEditing = editingConfig === cacheType
                  const currentStats = cacheStats?.[cacheType]
                  
                  return (
                    <div key={cacheType} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-medium text-gray-900 capitalize flex items-center">
                          {getHealthStatusIcon(health?.[cacheType as keyof typeof health] || 'unknown')}
                          <span className="ml-2">{cacheType} {t('admin.cache.config.cacheTypeSuffix') || '缓存'}</span>
                        </h4>
                        {!isEditing && (
                          <button
                            onClick={() => startEditConfig(cacheType)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                          >
                            {t('admin.cache.config.editConfig') || '编辑配置'}
                          </button>
                        )}
                      </div>
                      
                      {isEditing ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t('admin.cache.config.maxSize') || '最大条目数'} (maxSize)
                            </label>
                            <input
                              type="number"
                              min="10"
                              max="10000"
                              value={configValues.maxSize || ''}
                              onChange={(e) => setConfigValues(prev => ({ ...prev, maxSize: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder={t('admin.cache.config.maxSizePlaceholder') || '输入最大条目数'}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {t('admin.cache.config.currentUsage') || '当前使用'}: {currentStats?.size || 0} / {config.maxSize}
                            </p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t('admin.cache.config.defaultTTL') || '默认过期时间'} ({t('admin.cache.config.seconds') || '秒'})
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="86400"
                              value={configValues.defaultTTL || ''}
                              onChange={(e) => setConfigValues(prev => ({ ...prev, defaultTTL: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder={t('admin.cache.config.ttlPlaceholder') || '输入过期时间（秒）'}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {t('admin.cache.config.current') || '当前'}: {formatDurationFromMs(config.defaultTTL)}
                            </p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t('admin.cache.config.cleanupInterval') || '清理间隔'} ({t('admin.cache.config.seconds') || '秒'})
                            </label>
                            <input
                              type="number"
                              min="10"
                              max="3600"
                              value={configValues.cleanupInterval || ''}
                              onChange={(e) => setConfigValues(prev => ({ ...prev, cleanupInterval: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder={t('admin.cache.config.cleanupPlaceholder') || '输入清理间隔（秒）'}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {t('admin.cache.config.current') || '当前'}: {formatDurationFromMs(config.cleanupInterval)}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2 pt-2">
                            <button
                              onClick={saveConfig}
                              disabled={isSavingConfig}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Save className="h-4 w-4 mr-1" />
                              {isSavingConfig ? (t('admin.cache.config.saving') || '保存中...') : (t('admin.cache.config.save') || '保存')}
                            </button>
                            <button
                              onClick={cancelEditConfig}
                              disabled={isSavingConfig}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              {t('common.cancel') || '取消'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">{t('admin.cache.config.maxSize') || '最大条目数'}:</span>
                              <span className="font-medium ml-2">{config.maxSize}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">{t('admin.cache.config.currentUsage') || '当前使用'}:</span>
                              <span className="font-medium ml-2">{currentStats?.size || 0}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">{t('admin.cache.config.defaultTTL') || '过期时间'}:</span>
                              <span className="font-medium ml-2">{formatDurationFromMs(config.defaultTTL)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">{t('admin.cache.config.cleanupInterval') || '清理间隔'}:</span>
                              <span className="font-medium ml-2">{formatDurationFromMs(config.cleanupInterval)}</span>
                            </div>
                          </div>
                          
                          {/* 使用率进度条 */}
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>{t('admin.cache.config.capacityUtilization') || '容量使用率'}</span>
                              <span>{formatPercentage((currentStats?.size || 0) / (config.maxSize || 1))}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  (currentStats?.size || 0) / (config.maxSize || 1) > 0.8 
                                    ? 'bg-red-600' 
                                    : (currentStats?.size || 0) / (config.maxSize || 1) > 0.6 
                                    ? 'bg-yellow-600' 
                                    : 'bg-green-600'
                                }`}
                                style={{ width: `${Math.min(((currentStats?.size || 0) / (config.maxSize || 1)) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              
              {Object.keys(cacheConfigs).length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>{t('admin.cache.config.noConfigData') || '暂无缓存配置数据'}</p>
                  <button
                    onClick={fetchCacheConfigs}
                    className="mt-2 text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                  >
                    {t('admin.cache.config.clickRefresh') || '点击刷新'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
          </>
        )}

        {/* 缓存内容查看器 */}
        {activeTab === 'inspector' && (
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
                    onChange={(e) => setSelectedCacheType(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    {Object.keys(cacheStats || {}).map(cacheType => (
                      <option key={cacheType} value={cacheType}>{cacheType}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => loadCacheContent(selectedCacheType)}
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
                      <div className="space-y-2 max-h-96 overflow-y-auto">
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
        )}

        {/* 热点数据分析 */}
        {activeTab === 'hotkeys' && (
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
                    onChange={(e) => setSelectedCacheType(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    {Object.keys(cacheStats || {}).map(cacheType => (
                      <option key={cacheType} value={cacheType}>{cacheType}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => loadHotKeys(selectedCacheType)}
                    disabled={isLoadingHotKeys}
                    className="inline-flex items-center px-3 py-2 border border-orange-300 shadow-sm text-sm leading-4 font-medium rounded-md text-orange-700 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingHotKeys ? 'animate-spin' : ''}`} />
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
        )}

        {/* 基准测试 */}
        {activeTab === 'benchmark' && (
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
                    onChange={(e) => setSelectedCacheType(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    {Object.keys(cacheStats || {}).map(cacheType => (
                      <option key={cacheType} value={cacheType}>{cacheType}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => runBenchmarkTest(selectedCacheType)}
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
        )}
      </div>

      {/* 清除缓存确认对话框 */}
      <DeleteConfirmModal
        isOpen={showClearConfirm}
        onClose={() => {
          setShowClearConfirm(false)
          setClearTarget(null)
        }}
        onConfirm={confirmClearCache}
        title={clearTarget === 'all' ? (t('admin.cache.dialog.clearAllTitle') || '清除所有缓存') : (t('admin.cache.dialog.clearCacheTitle', { cacheType: clearTarget }) || `清除 ${clearTarget} 缓存`)}
        message={clearTarget === 'all' 
          ? (t('admin.cache.dialog.clearAllConfirm') || '确定要清除所有缓存吗？此操作将清空所有缓存数据。') 
          : (t('admin.cache.dialog.clearCacheConfirm', { cacheType: clearTarget }) || `确定要清除 ${clearTarget} 缓存吗？此操作将清空该缓存的所有数据。`)
        }
        itemIcon={<Trash2 className="w-5 h-5 text-red-600" />}
        confirmText={t('admin.cache.clear') || '清除'}
        cancelText={t('common.cancel') || '取消'}
      />
    </AdminLayout>
  )
}

export default AdminCachePerformance