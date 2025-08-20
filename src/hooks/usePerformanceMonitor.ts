import { useState, useEffect, useCallback } from 'react'
import { performanceMonitor, PerformanceMetric } from '../services/PerformanceMonitor'

interface PerformanceStats {
  totalRequests: number
  averageDuration: number
  minDuration: number
  maxDuration: number
  errorRate: number
  slowRequestRate: number
  errorCount: number
  slowCount: number
}

interface UsePerformanceMonitorReturn {
  stats: {
    all: PerformanceStats | null
    last24h: PerformanceStats | null
    last1h: PerformanceStats | null
  }
  slowRequests: PerformanceMetric[]
  errorRequests: PerformanceMetric[]
  refreshStats: () => void
  clearMetrics: () => void
  exportMetrics: () => any
}

/**
 * 性能监控Hook
 * 提供性能统计数据和操作方法
 */
export function usePerformanceMonitor(): UsePerformanceMonitorReturn {
  const [stats, setStats] = useState(performanceMonitor.getStats())
  const [slowRequests, setSlowRequests] = useState<PerformanceMetric[]>([])
  const [errorRequests, setErrorRequests] = useState<PerformanceMetric[]>([])

  const refreshStats = useCallback(() => {
    setStats(performanceMonitor.getStats())
    setSlowRequests(performanceMonitor.getSlowRequests())
    setErrorRequests(performanceMonitor.getErrorRequests())
  }, [])

  const clearMetrics = useCallback(() => {
    performanceMonitor.clearMetrics()
    refreshStats()
  }, [refreshStats])

  const exportMetrics = useCallback(() => {
    return performanceMonitor.exportMetrics()
  }, [])

  // 定期刷新统计数据
  useEffect(() => {
    refreshStats()
    
    const interval = setInterval(refreshStats, 30000) // 每30秒刷新一次
    
    return () => clearInterval(interval)
  }, [refreshStats])

  return {
    stats,
    slowRequests,
    errorRequests,
    refreshStats,
    clearMetrics,
    exportMetrics
  }
}

/**
 * 性能监控仪表板Hook
 * 专门用于管理员仪表板显示性能数据
 */
export function usePerformanceDashboard() {
  const {
    stats,
    slowRequests,
    errorRequests,
    refreshStats,
    clearMetrics,
    exportMetrics
  } = usePerformanceMonitor()

  // 格式化统计数据用于显示
  const formatStats = useCallback((statsData: PerformanceStats | null) => {
    if (!statsData) return null

    return {
      ...statsData,
      averageDurationFormatted: `${statsData.averageDuration}ms`,
      minDurationFormatted: `${statsData.minDuration}ms`,
      maxDurationFormatted: `${statsData.maxDuration}ms`,
      errorRateFormatted: `${statsData.errorRate}%`,
      slowRequestRateFormatted: `${statsData.slowRequestRate}%`
    }
  }, [])

  // 获取性能健康状态
  const getHealthStatus = useCallback(() => {
    const current = stats.last1h
    if (!current) return 'unknown'

    if (current.errorRate > 10 || current.slowRequestRate > 20) {
      return 'critical'
    } else if (current.errorRate > 5 || current.slowRequestRate > 10) {
      return 'warning'
    } else {
      return 'healthy'
    }
  }, [stats.last1h])

  // 导出性能报告
  const exportReport = useCallback(() => {
    const data = exportMetrics()
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [exportMetrics])

  return {
    stats: {
      all: formatStats(stats.all),
      last24h: formatStats(stats.last24h),
      last1h: formatStats(stats.last1h)
    },
    slowRequests,
    errorRequests,
    healthStatus: getHealthStatus(),
    refreshStats,
    clearMetrics,
    exportReport
  }
}