import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  RefreshCw,
  Trash2,
  Zap,
  Play,
  BarChart3,
  Settings,
  Eye,
  TrendingUp,
  Clock
} from 'lucide-react'
import AdminLayout from '../../../components/AdminLayout'
import DeleteConfirmModal from '../../../components/DeleteConfirmModal'
import { useLanguage } from '../../../contexts/language'
import { useCacheMonitor } from '../../../hooks/useCacheMonitor'
import CacheConfigManager from '../CacheConfigManager'
import OverviewTab from './OverviewTab'
import InspectorTab from './InspectorTab'
import HotKeysTab from './HotKeysTab'
import BenchmarkTab from './BenchmarkTab'
import type { TabType, InspectorData, HotKeysData, BenchmarkData } from './types'

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
  
  // 新增功能状态
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [inspectorData, setInspectorData] = useState<InspectorData | null>(null)
  const [hotKeysData, setHotKeysData] = useState<HotKeysData | null>(null)
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData | null>(null)
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
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    
    // 根据标签页自动加载相应数据
    if (tab === 'inspector' && !inspectorData) {
      loadCacheContent(selectedCacheType)
    } else if (tab === 'hotkeys' && !hotKeysData) {
      loadHotKeys(selectedCacheType)
    }
  }

  useEffect(() => {
    refreshData()
  }, [])

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
              { key: 'benchmark', label: '基准测试', icon: Zap },
              { key: 'config', label: '配置管理', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key as TabType)}
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
          <OverviewTab
            health={health}
            cacheStats={cacheStats}
            metrics={metrics}
            onClearCache={handleClearCache}
          />
        )}

        {activeTab === 'inspector' && (
          <InspectorTab
            selectedCacheType={selectedCacheType}
            cacheStats={cacheStats}
            inspectorData={inspectorData}
            isLoadingInspector={isLoadingInspector}
            onCacheTypeChange={setSelectedCacheType}
            onLoadCacheContent={loadCacheContent}
          />
        )}

        {activeTab === 'hotkeys' && (
          <HotKeysTab
            selectedCacheType={selectedCacheType}
            cacheStats={cacheStats}
            hotKeysData={hotKeysData}
            isLoadingHotKeys={isLoadingHotKeys}
            onCacheTypeChange={setSelectedCacheType}
            onLoadHotKeys={loadHotKeys}
          />
        )}

        {activeTab === 'benchmark' && (
          <BenchmarkTab
            selectedCacheType={selectedCacheType}
            cacheStats={cacheStats}
            benchmarkData={benchmarkData}
            isRunningBenchmark={isRunningBenchmark}
            onCacheTypeChange={setSelectedCacheType}
            onRunBenchmark={runBenchmarkTest}
          />
        )}

        {/* 配置管理 */}
        {activeTab === 'config' && (
          <CacheConfigManager />
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
