/**
 * 性能监控服务
 * 用于追踪API调用性能、缓存命中率和系统性能指标
 */

export interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  cached?: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  totalRequests: number;
}

export interface APIMetrics {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  averageResponseTime: number;
  slowestCall: number;
  fastestCall: number;
}

export interface SystemMetrics {
  cacheMetrics: CacheMetrics;
  apiMetrics: APIMetrics;
  recentMetrics: PerformanceMetric[];
  startTime: number;
  uptime: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private cacheHits = 0;
  private cacheMisses = 0;
  private startTime = Date.now();
  private maxMetricsHistory = 1000; // 最多保留1000条记录

  /**
   * 开始性能监控
   */
  startMetric(name: string, metadata?: Record<string, any>): string {
    const metricId = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const metric: PerformanceMetric = {
      name,
      startTime: Date.now(),
      success: false,
      metadata
    };
    
    this.metrics.push(metric);
    console.log(`⏱️ 开始监控: ${name}`);
    
    return metricId;
  }

  /**
   * 结束性能监控
   */
  endMetric(name: string, success: boolean, cached?: boolean, error?: string): void {
    const metric = this.metrics.find(m => 
      m.name === name && !m.endTime
    );
    
    if (metric) {
      metric.endTime = Date.now();
      metric.duration = metric.endTime - metric.startTime;
      metric.success = success;
      metric.cached = cached;
      metric.error = error;
      
      // 更新缓存统计
      if (cached !== undefined) {
        if (cached) {
          this.cacheHits++;
        } else {
          this.cacheMisses++;
        }
      }
      
      console.log(`✅ 监控结束: ${name} - ${metric.duration}ms ${cached ? '(缓存命中)' : ''} ${success ? '成功' : '失败'}`);
      
      // 清理旧记录
      this.cleanupOldMetrics();
    }
  }

  /**
   * 记录缓存命中
   */
  recordCacheHit(): void {
    this.cacheHits++;
  }

  /**
   * 记录缓存未命中
   */
  recordCacheMiss(): void {
    this.cacheMisses++;
  }

  /**
   * 获取缓存指标
   */
  getCacheMetrics(): CacheMetrics {
    const totalRequests = this.cacheHits + this.cacheMisses;
    return {
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: totalRequests > 0 ? (this.cacheHits / totalRequests) * 100 : 0,
      totalRequests
    };
  }

  /**
   * 获取API指标
   */
  getAPIMetrics(): APIMetrics {
    const completedMetrics = this.metrics.filter(m => m.endTime && m.duration);
    const successfulCalls = completedMetrics.filter(m => m.success).length;
    const failedCalls = completedMetrics.filter(m => !m.success).length;
    const durations = completedMetrics.map(m => m.duration!).filter(d => d > 0);
    
    return {
      totalCalls: completedMetrics.length,
      successfulCalls,
      failedCalls,
      averageResponseTime: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
      slowestCall: durations.length > 0 ? Math.max(...durations) : 0,
      fastestCall: durations.length > 0 ? Math.min(...durations) : 0
    };
  }

  /**
   * 获取系统指标
   */
  getSystemMetrics(): SystemMetrics {
    return {
      cacheMetrics: this.getCacheMetrics(),
      apiMetrics: this.getAPIMetrics(),
      recentMetrics: this.metrics.slice(-50), // 最近50条记录
      startTime: this.startTime,
      uptime: Date.now() - this.startTime
    };
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport(): string {
    const cacheMetrics = this.getCacheMetrics();
    const apiMetrics = this.getAPIMetrics();
    const uptime = Date.now() - this.startTime;
    
    return `
📊 性能监控报告
================

🎯 缓存性能:
  - 命中率: ${cacheMetrics.hitRate.toFixed(2)}%
  - 总请求: ${cacheMetrics.totalRequests}
  - 命中次数: ${cacheMetrics.hits}
  - 未命中次数: ${cacheMetrics.misses}

🚀 API性能:
  - 总调用次数: ${apiMetrics.totalCalls}
  - 成功率: ${apiMetrics.totalCalls > 0 ? ((apiMetrics.successfulCalls / apiMetrics.totalCalls) * 100).toFixed(2) : 0}%
  - 平均响应时间: ${apiMetrics.averageResponseTime.toFixed(2)}ms
  - 最快响应: ${apiMetrics.fastestCall}ms
  - 最慢响应: ${apiMetrics.slowestCall}ms

⏰ 系统运行时间: ${Math.floor(uptime / 1000 / 60)}分钟
    `;
  }

  /**
   * 清理旧的性能记录
   */
  private cleanupOldMetrics(): void {
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }
  }

  /**
   * 记录性能指标（简化版本）
   */
  recordMetric(name: string, duration: number, success: boolean = true): void {
    const metric: PerformanceMetric = {
      name,
      startTime: Date.now() - duration,
      endTime: Date.now(),
      duration,
      success
    };
    
    this.metrics.push(metric);
    console.log(`📊 记录指标: ${name} - ${duration}ms ${success ? '成功' : '失败'}`);
    
    // 清理旧记录
    this.cleanupOldMetrics();
  }

  /**
   * 重置所有指标
   */
  reset(): void {
    this.metrics = [];
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.startTime = Date.now();
    console.log('🔄 性能监控指标已重置');
  }

  /**
   * 导出性能数据
   */
  exportMetrics(): {
    metrics: PerformanceMetric[];
    cacheMetrics: CacheMetrics;
    apiMetrics: APIMetrics;
    exportTime: number;
  } {
    return {
      metrics: [...this.metrics],
      cacheMetrics: this.getCacheMetrics(),
      apiMetrics: this.getAPIMetrics(),
      exportTime: Date.now()
    };
  }
}

// 创建全局性能监控实例
export const performanceMonitor = new PerformanceMonitor();

// 性能监控装饰器
export function withPerformanceMonitoring<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  name: string
): T {
  return (async (...args: any[]) => {
    const startTime = Date.now();
    let success = false;
    let error: string | undefined;
    
    try {
      const result = await fn(...args);
      success = true;
      return result;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
      throw err;
    } finally {
      const duration = Date.now() - startTime;
      performanceMonitor.endMetric(name, success, undefined, error);
    }
  }) as T;
}

// 性能监控中间件
export function createPerformanceMiddleware() {
  return {
    onRequest: (name: string, metadata?: Record<string, any>) => {
      return performanceMonitor.startMetric(name, metadata);
    },
    onResponse: (name: string, success: boolean, cached?: boolean, error?: string) => {
      performanceMonitor.endMetric(name, success, cached, error);
    },
    onCacheHit: () => {
      performanceMonitor.recordCacheHit();
    },
    onCacheMiss: () => {
      performanceMonitor.recordCacheMiss();
    }
  };
}

// 开发环境下的性能监控日志
if (import.meta.env.DEV) {
  // 每30秒输出一次性能报告
  setInterval(() => {
    const metrics = performanceMonitor.getSystemMetrics();
    if (metrics.apiMetrics.totalCalls > 0) {
      console.log(performanceMonitor.getPerformanceReport());
    }
  }, 30000);
}