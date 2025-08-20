interface PerformanceMetric {
  url: string
  method: string
  duration: number
  status: number
  timestamp: number
  userAgent?: string
  error?: string
}

interface PerformanceConfig {
  slowRequestThreshold: number // 慢请求阈值（毫秒）
  maxMetrics: number // 最大存储指标数量
  enableConsoleLog: boolean // 是否启用控制台日志
  enableLocalStorage: boolean // 是否启用本地存储
  enabled: boolean // 是否启用性能监控
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private config: PerformanceConfig
  private static instance: PerformanceMonitor

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      slowRequestThreshold: 1000, // 1秒
      maxMetrics: 100,
      enableConsoleLog: process.env.NODE_ENV === 'development',
      enableLocalStorage: true,
      enabled: this.getEnabledFromStorage(), // 从本地存储获取启用状态
      ...config
    }

    // 从本地存储恢复指标
    this.loadMetricsFromStorage()
  }

  static getInstance(config?: Partial<PerformanceConfig>): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor(config)
    }
    return PerformanceMonitor.instance
  }

  // 记录请求性能
  recordRequest(metric: Omit<PerformanceMetric, 'timestamp'>) {
    // 如果监控被禁用，直接返回
    if (!this.config.enabled) {
      return
    }

    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    }

    this.metrics.push(fullMetric)

    // 限制存储数量
    if (this.metrics.length > this.config.maxMetrics) {
      this.metrics = this.metrics.slice(-this.config.maxMetrics)
    }

    // 检查是否为慢请求
    if (metric.duration > this.config.slowRequestThreshold) {
      this.handleSlowRequest(fullMetric)
    }

    // 检查是否为错误请求
    if (metric.status >= 400) {
      this.handleErrorRequest(fullMetric)
    }

    // 保存到本地存储
    this.saveMetricsToStorage()

    // 控制台日志
    if (this.config.enableConsoleLog) {
      this.logMetric(fullMetric)
    }
  }

  // 处理慢请求
  private handleSlowRequest(metric: PerformanceMetric) {
    console.warn('🐌 慢请求检测:', {
      url: metric.url,
      method: metric.method,
      duration: `${metric.duration}ms`,
      threshold: `${this.config.slowRequestThreshold}ms`
    })

    // 可以在这里添加更多处理逻辑，如发送到监控服务
  }

  // 处理错误请求
  private handleErrorRequest(metric: PerformanceMetric) {
    console.error('❌ 错误请求检测:', {
      url: metric.url,
      method: metric.method,
      status: metric.status,
      error: metric.error,
      duration: `${metric.duration}ms`
    })

    // 可以在这里添加更多处理逻辑，如发送到错误监控服务
  }

  // 记录日志
  private logMetric(metric: PerformanceMetric) {
    const statusColor = metric.status >= 400 ? '🔴' : metric.status >= 300 ? '🟡' : '🟢'
    const durationColor = metric.duration > this.config.slowRequestThreshold ? '🐌' : '⚡'
    
    console.log(`${statusColor} ${durationColor} ${metric.method} ${metric.url} - ${metric.status} (${metric.duration}ms)`)
  }

  // 获取性能统计
  getStats() {
    const now = Date.now()
    const last24h = this.metrics.filter(m => now - m.timestamp < 24 * 60 * 60 * 1000)
    const last1h = this.metrics.filter(m => now - m.timestamp < 60 * 60 * 1000)

    const calculateStats = (metrics: PerformanceMetric[]) => {
      if (metrics.length === 0) return null

      const durations = metrics.map(m => m.duration)
      const errorCount = metrics.filter(m => m.status >= 400).length
      const slowCount = metrics.filter(m => m.duration > this.config.slowRequestThreshold).length

      return {
        totalRequests: metrics.length,
        averageDuration: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
        minDuration: Math.min(...durations),
        maxDuration: Math.max(...durations),
        errorRate: Math.round((errorCount / metrics.length) * 100),
        slowRequestRate: Math.round((slowCount / metrics.length) * 100),
        errorCount,
        slowCount
      }
    }

    return {
      all: calculateStats(this.metrics),
      last24h: calculateStats(last24h),
      last1h: calculateStats(last1h)
    }
  }

  // 获取慢请求列表
  getSlowRequests(limit = 10) {
    return this.metrics
      .filter(m => m.duration > this.config.slowRequestThreshold)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit)
  }

  // 获取错误请求列表
  getErrorRequests(limit = 10) {
    return this.metrics
      .filter(m => m.status >= 400)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  }

  // 清除指标
  clearMetrics() {
    this.metrics = []
    this.saveMetricsToStorage()
  }

  // 从本地存储加载指标
  private loadMetricsFromStorage() {
    if (!this.config.enableLocalStorage) return

    try {
      const stored = localStorage.getItem('performance_metrics')
      if (stored) {
        this.metrics = JSON.parse(stored)
      }
    } catch (error) {
      console.warn('加载性能指标失败:', error)
    }
  }

  // 保存指标到本地存储
  private saveMetricsToStorage() {
    if (!this.config.enableLocalStorage) return

    try {
      localStorage.setItem('performance_metrics', JSON.stringify(this.metrics))
    } catch (error) {
      console.warn('保存性能指标失败:', error)
    }
  }

  // 从本地存储获取启用状态
  private getEnabledFromStorage(): boolean {
    try {
      const stored = localStorage.getItem('performance_monitoring_enabled')
      return stored ? JSON.parse(stored) : false // 默认关闭
    } catch (error) {
      console.warn('获取性能监控启用状态失败:', error)
      return false
    }
  }

  // 保存启用状态到本地存储
  private saveEnabledToStorage() {
    try {
      localStorage.setItem('performance_monitoring_enabled', JSON.stringify(this.config.enabled))
    } catch (error) {
      console.warn('保存性能监控启用状态失败:', error)
    }
  }

  // 启用性能监控
  enable() {
    this.config.enabled = true
    this.saveEnabledToStorage()
    console.log('✅ 性能监控已启用')
  }

  // 禁用性能监控
  disable() {
    this.config.enabled = false
    this.saveEnabledToStorage()
    console.log('❌ 性能监控已禁用')
  }

  // 获取监控启用状态
  isEnabled(): boolean {
    return this.config.enabled
  }

  // 设置监控启用状态
  setEnabled(enabled: boolean) {
    this.config.enabled = enabled
    this.saveEnabledToStorage()
    console.log(enabled ? '✅ 性能监控已启用' : '❌ 性能监控已禁用')
  }

  // 记录自定义指标
  recordMetric(name: string, duration: number, additionalData?: Record<string, any>) {
    const metric: PerformanceMetric = {
      url: `custom:${name}`,
      method: 'CUSTOM',
      duration,
      status: 200,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      ...additionalData
    }

    this.recordRequest({
      url: metric.url,
      method: metric.method,
      duration: metric.duration,
      status: metric.status,
      error: metric.error
    })
  }

  // 导出指标数据
  exportMetrics() {
    return {
      metrics: this.metrics,
      stats: this.getStats(),
      config: this.config,
      exportTime: new Date().toISOString()
    }
  }
}

// 创建全局实例
export const performanceMonitor = PerformanceMonitor.getInstance()

// 创建性能监控中间件
export function createPerformanceMiddleware() {
  return {
    onRequest: (url: string, method: string) => {
      return performance.now()
    },
    onResponse: (startTime: number, url: string, method: string, status: number, error?: string) => {
      const duration = Math.round(performance.now() - startTime)
      performanceMonitor.recordRequest({
        url,
        method,
        duration,
        status,
        error
      })
    }
  }
}

// 拦截 fetch 请求
const originalFetch = window.fetch
window.fetch = async function(...args) {
  const startTime = performance.now()
  const url = args[0] as string
  const options = args[1] as RequestInit
  const method = options?.method || 'GET'

  try {
    const response = await originalFetch.apply(this, args)
    const duration = Math.round(performance.now() - startTime)

    performanceMonitor.recordRequest({
      url,
      method,
      duration,
      status: response.status
    })

    return response
  } catch (error) {
    const duration = Math.round(performance.now() - startTime)
    
    performanceMonitor.recordRequest({
      url,
      method,
      duration,
      status: 0,
      error: error instanceof Error ? error.message : String(error)
    })

    throw error
  }
}

export default PerformanceMonitor
export type { PerformanceMetric, PerformanceConfig }