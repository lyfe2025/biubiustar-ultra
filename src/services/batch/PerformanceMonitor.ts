/**
 * 批量数据服务的性能监控器
 * 负责性能指标收集、记录和统计分析
 */

import { PerformanceMetrics } from './types';

export class PerformanceMonitor {
  private performanceMetrics: PerformanceMetrics[] = [];
  private readonly maxMetricsCount = 100;
  private readonly statsMetricsCount = 50;

  /**
   * 生成唯一的请求ID
   * @returns 请求ID字符串
   */
  generateRequestId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 记录性能指标
   * @param metrics 性能指标对象
   */
  recordMetrics(metrics: PerformanceMetrics): void {
    this.performanceMetrics.push(metrics);
    
    // 只保留最近的指标记录
    if (this.performanceMetrics.length > this.maxMetricsCount) {
      this.performanceMetrics.shift();
    }
    
    // 在开发环境下输出性能日志
    if (process.env.NODE_ENV === 'development') {
      console.log('批量数据获取性能:', {
        requestId: metrics.requestId,
        duration: metrics.duration,
        batchSize: metrics.batchSize,
        cacheHit: metrics.cacheHit,
        errors: metrics.errors
      });
    }
  }

  /**
   * 获取性能统计信息
   * @param cacheSize 当前缓存大小
   * @returns 性能统计对象或null
   */
  getPerformanceStats(cacheSize: number = 0) {
    const recentMetrics = this.performanceMetrics.slice(-this.statsMetricsCount);
    
    if (recentMetrics.length === 0) {
      return null;
    }
    
    const totalRequests = recentMetrics.length;
    const cacheHits = recentMetrics.filter(m => m.cacheHit).length;
    const avgDuration = recentMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / totalRequests;
    const errorRate = recentMetrics.filter(m => m.errors.length > 0).length / totalRequests;
    
    return {
      totalRequests,
      cacheHitRate: cacheHits / totalRequests,
      avgDuration,
      errorRate,
      cacheSize
    };
  }

  /**
   * 获取详细的性能分析
   * @returns 详细性能分析对象
   */
  getDetailedPerformanceAnalysis() {
    const recentMetrics = this.performanceMetrics.slice(-this.statsMetricsCount);
    
    if (recentMetrics.length === 0) {
      return null;
    }

    // 按请求类型分组统计
    const typeStats = new Map<string, {
      count: number;
      totalDuration: number;
      errors: number;
      cacheHits: number;
    }>();

    recentMetrics.forEach(metric => {
      const type = metric.requestType || 'unknown';
      const stats = typeStats.get(type) || {
        count: 0,
        totalDuration: 0,
        errors: 0,
        cacheHits: 0
      };

      stats.count++;
      stats.totalDuration += metric.duration || 0;
      stats.errors += metric.errors.length;
      if (metric.cacheHit) stats.cacheHits++;

      typeStats.set(type, stats);
    });

    // 转换为分析结果
    const typeAnalysis = Array.from(typeStats.entries()).map(([type, stats]) => ({
      type,
      count: stats.count,
      avgDuration: stats.totalDuration / stats.count,
      errorRate: stats.errors / stats.count,
      cacheHitRate: stats.cacheHits / stats.count
    }));

    // 整体统计
    const totalRequests = recentMetrics.length;
    const totalDuration = recentMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    const totalErrors = recentMetrics.reduce((sum, m) => sum + m.errors.length, 0);
    const totalCacheHits = recentMetrics.filter(m => m.cacheHit).length;

    return {
      overall: {
        totalRequests,
        avgDuration: totalDuration / totalRequests,
        errorRate: totalErrors / totalRequests,
        cacheHitRate: totalCacheHits / totalRequests
      },
      byType: typeAnalysis,
      timeRange: {
        start: recentMetrics[0]?.timestamp,
        end: recentMetrics[recentMetrics.length - 1]?.timestamp
      }
    };
  }

  /**
   * 获取性能趋势分析
   * @param timeWindowMs 时间窗口（毫秒）
   * @returns 性能趋势对象
   */
  getPerformanceTrends(timeWindowMs: number = 5 * 60 * 1000) {
    const now = Date.now();
    const cutoffTime = now - timeWindowMs;
    
    const recentMetrics = this.performanceMetrics.filter(
      m => m.timestamp && m.timestamp > cutoffTime
    );

    if (recentMetrics.length < 2) {
      return null;
    }

    // 按时间分段统计
    const segmentDuration = timeWindowMs / 5; // 分为5个时间段
    const segments = Array.from({ length: 5 }, (_, i) => {
      const segmentStart = cutoffTime + i * segmentDuration;
      const segmentEnd = segmentStart + segmentDuration;
      
      const segmentMetrics = recentMetrics.filter(
        m => m.timestamp! >= segmentStart && m.timestamp! < segmentEnd
      );

      if (segmentMetrics.length === 0) {
        return {
          timeRange: { start: segmentStart, end: segmentEnd },
          count: 0,
          avgDuration: 0,
          errorRate: 0,
          cacheHitRate: 0
        };
      }

      const totalDuration = segmentMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);
      const errors = segmentMetrics.filter(m => m.errors.length > 0).length;
      const cacheHits = segmentMetrics.filter(m => m.cacheHit).length;

      return {
        timeRange: { start: segmentStart, end: segmentEnd },
        count: segmentMetrics.length,
        avgDuration: totalDuration / segmentMetrics.length,
        errorRate: errors / segmentMetrics.length,
        cacheHitRate: cacheHits / segmentMetrics.length
      };
    });

    return {
      timeWindow: timeWindowMs,
      segments,
      totalMetrics: recentMetrics.length
    };
  }

  /**
   * 清除所有性能指标
   */
  clearMetrics(): void {
    this.performanceMetrics = [];
  }

  /**
   * 获取当前存储的指标数量
   * @returns 指标数量
   */
  getMetricsCount(): number {
    return this.performanceMetrics.length;
  }

  /**
   * 获取最近的指标记录
   * @param count 获取的记录数量
   * @returns 最近的指标数组
   */
  getRecentMetrics(count: number = 10): PerformanceMetrics[] {
    return this.performanceMetrics.slice(-count);
  }

  /**
   * 检查性能是否异常
   * @param thresholds 性能阈值配置
   * @returns 性能异常检查结果
   */
  checkPerformanceAnomalies(thresholds: {
    maxAvgDuration?: number;
    maxErrorRate?: number;
    minCacheHitRate?: number;
  } = {}) {
    const stats = this.getPerformanceStats();
    if (!stats) {
      return null;
    }

    const {
      maxAvgDuration = 5000, // 5秒
      maxErrorRate = 0.1, // 10%
      minCacheHitRate = 0.3 // 30%
    } = thresholds;

    const anomalies = [];

    if (stats.avgDuration > maxAvgDuration) {
      anomalies.push({
        type: 'high_duration',
        message: `平均响应时间过高: ${stats.avgDuration.toFixed(2)}ms (阈值: ${maxAvgDuration}ms)`,
        value: stats.avgDuration,
        threshold: maxAvgDuration
      });
    }

    if (stats.errorRate > maxErrorRate) {
      anomalies.push({
        type: 'high_error_rate',
        message: `错误率过高: ${(stats.errorRate * 100).toFixed(2)}% (阈值: ${(maxErrorRate * 100).toFixed(2)}%)`,
        value: stats.errorRate,
        threshold: maxErrorRate
      });
    }

    if (stats.cacheHitRate < minCacheHitRate) {
      anomalies.push({
        type: 'low_cache_hit_rate',
        message: `缓存命中率过低: ${(stats.cacheHitRate * 100).toFixed(2)}% (阈值: ${(minCacheHitRate * 100).toFixed(2)}%)`,
        value: stats.cacheHitRate,
        threshold: minCacheHitRate
      });
    }

    return {
      hasAnomalies: anomalies.length > 0,
      anomalies,
      stats
    };
  }
}