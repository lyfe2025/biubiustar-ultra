import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

export interface CacheStats {
  size: number;
  maxSize: number;
  hitRate: number;
  memoryUsage: number;
  ttl?: number;
  errors?: number;
  lastError?: string;
  // 命中统计
  hits?: number;
  misses?: number;
  totalHits?: number;
  totalMisses?: number;
  missRate?: number;
  // 操作统计
  gets?: number;
  sets?: number;
  deletes?: number;
  clears?: number;
  // 过期统计
  expired?: number;
  evicted?: number;
  // 其他统计
  itemCount?: number;
  avgAccessTime?: number;
}

interface CacheHealth {
  user: string
  content: string
  stats: string
  config: string
  session: string
}

interface CacheMetrics {
  totalRequests: number
  cacheHits: number
  cacheMisses: number
  hitRate: number
  avgResponseTime: number
  memoryUsage: {
    rss: number
    heapUsed: number
    heapTotal: number
    external: number
  }
}

interface CacheMonitorData {
  health: CacheHealth | null
  stats: Record<string, CacheStats> | null
  metrics: CacheMetrics | null
  isLoading: boolean
  error: string | null
}

export const useCacheMonitor = () => {
  const [data, setData] = useState<CacheMonitorData>({
    health: null,
    stats: null,
    metrics: null,
    isLoading: false,
    error: null
  })

  // 获取缓存健康状态
  const fetchCacheHealth = useCallback(async () => {
    try {
      const response = await fetch('/api/health/cache')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Failed to fetch cache health:', error)
      throw error
    }
  }, [])

  // 获取缓存统计数据
  const fetchCacheStats = useCallback(async () => {
    try {
      const response = await fetch('/api/health/cache/stats')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Failed to fetch cache stats:', error)
      throw error
    }
  }, [])

  // 获取缓存性能指标
  const fetchCacheMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/cache-debug/memory-analysis')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Failed to fetch cache metrics:', error)
      throw error
    }
  }, [])

  // 刷新所有缓存数据
  const refreshData = useCallback(async () => {
    setData(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const [healthResponse, statsResponse, metricsResponse] = await Promise.all([
        fetchCacheHealth(),
        fetchCacheStats(),
        fetchCacheMetrics()
      ])
      
      // 处理健康状态数据 - 从API返回的数据中提取正确的健康状态
      const health = healthResponse?.detailed || healthResponse || null
      
      // 处理统计数据 - 从API返回的caches字段中提取
      const stats = statsResponse?.caches || null
      
      // 处理性能指标数据 - 组合内存使用数据
      const metrics = {
        totalRequests: metricsResponse?.summary?.totalCaches || 0,
        cacheHits: 0,
        cacheMisses: 0,
        hitRate: metricsResponse?.summary?.avgHitRate || 0,
        avgResponseTime: 0,
        memoryUsage: {
          rss: metricsResponse?.processMemory?.rss || statsResponse?.memory?.rss || 0,
          heapUsed: metricsResponse?.processMemory?.heapUsed || statsResponse?.memory?.heapUsed || 0,
          heapTotal: metricsResponse?.processMemory?.heapTotal || statsResponse?.memory?.heapTotal || 0,
          external: metricsResponse?.processMemory?.external || statsResponse?.memory?.external || 0
        }
      }
      
      setData({
        health,
        stats,
        metrics,
        isLoading: false,
        error: null
      })
    } catch (error) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '获取缓存数据失败'
      }))
    }
  }, [fetchCacheHealth, fetchCacheStats, fetchCacheMetrics])

  // 清理指定类型的缓存
  const clearCache = useCallback(async (cacheType?: string) => {
    try {
      const url = cacheType 
        ? `/api/health/cache/clear?cacheType=${cacheType}`
        : '/api/health/cache/clear'
      
      const response = await fetch(url, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      if (result.success) {
        toast.success(cacheType ? `${cacheType}缓存已清理` : '所有缓存已清理')
        // 刷新数据
        await refreshData()
      } else {
        throw new Error(result.error || '清理缓存失败')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '清理缓存失败'
      toast.error(message)
      throw error
    }
  }, [refreshData])

  // 执行缓存性能测试
  const runPerformanceTest = useCallback(async (testSize: number = 100) => {
    try {
      const response = await fetch('/api/health/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ testSize })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      if (result.success) {
        toast.success('缓存性能测试完成')
        return result.data
      } else {
        throw new Error(result.error || '性能测试失败')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '性能测试失败'
      toast.error(message)
      throw error
    }
  }, [])

  // 获取缓存内容
  const inspectCache = useCallback(async (cacheType: string, limit: number = 10, offset: number = 0) => {
    try {
      const response = await fetch(`/api/cache-debug/inspect/${cacheType}?limit=${limit}&offset=${offset}`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const result = await response.json()
      if (result.success) {
        return result.data
      } else {
        throw new Error(result.error || '获取缓存内容失败')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '获取缓存内容失败'
      toast.error(message)
      throw error
    }
  }, [])

  // 获取热点数据分析
  const getHotKeys = useCallback(async (cacheType: string, limit: number = 20) => {
    try {
      const response = await fetch(`/api/cache-debug/hotkeys/${cacheType}?limit=${limit}`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const result = await response.json()
      if (result.success) {
        return result.data
      } else {
        throw new Error(result.error || '获取热点数据失败')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '获取热点数据失败'
      toast.error(message)
      throw error
    }
  }, [])

  // 执行详细基准测试
  const runBenchmark = useCallback(async (cacheType: string, testConfig: {
    testSize?: number
    iterations?: number
    dataSize?: 'small' | 'medium' | 'large'
  } = {}) => {
    try {
      const response = await fetch('/api/cache-debug/benchmark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cacheType,
          testSize: testConfig.testSize || 1000,
          iterations: testConfig.iterations || 3,
          dataSize: testConfig.dataSize || 'medium'
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      if (result.success) {
        toast.success('基准测试完成')
        return result.data
      } else {
        throw new Error(result.error || '基准测试失败')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '基准测试失败'
      toast.error(message)
      throw error
    }
  }, [])

  // 初始化数据加载
  useEffect(() => {
    refreshData()
  }, [])

  return {
    ...data,
    refreshData,
    clearCache,
    runPerformanceTest,
    inspectCache,
    getHotKeys,
    runBenchmark
  }
}