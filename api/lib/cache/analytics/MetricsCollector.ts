/**
 * 缓存指标收集器
 * 负责收集、存储和管理缓存指标数据
 */

import { EventEmitter } from 'events';
import { 
  MetricType, 
  DataPoint, 
  TimeSeries, 
  TimeRange 
} from './types';
import { CacheInstanceType } from '../../../config/cache';

export class MetricsCollector extends EventEmitter {
  private metricsHistory: Map<string, TimeSeries> = new Map();
  private cacheInstances: Map<CacheInstanceType, any> = new Map();
  private isCollecting: boolean = false;
  private collectionIntervalMs: number = 60000; // 1分钟
  private collectionTimer?: NodeJS.Timeout;

  constructor() {
    super();
  }

  /**
   * 注册缓存实例
   */
  public registerCacheInstance(instanceType: CacheInstanceType, instance: any): void {
    this.cacheInstances.set(instanceType, instance);
    
    // 为每个指标类型初始化时间序列
    Object.values(MetricType).forEach(metric => {
      const key = `${metric}_${instanceType}`;
      if (!this.metricsHistory.has(key)) {
        this.metricsHistory.set(key, {
          metric,
          instanceType,
          data: []
        });
      }
    });

    this.emit('instanceRegistered', { instanceType, instance });
  }

  /**
   * 开始数据收集
   */
  public startCollection(intervalMs: number = 60000): void {
    if (this.isCollecting) {
      return;
    }

    this.collectionIntervalMs = intervalMs;
    this.isCollecting = true;

    this.collectionTimer = setInterval(() => {
      this.collectMetrics();
    }, this.collectionIntervalMs);

    this.emit('collectionStarted', { intervalMs });
  }

  /**
   * 停止数据收集
   */
  public stopCollection(): void {
    if (!this.isCollecting) {
      return;
    }

    this.isCollecting = false;
    
    if (this.collectionTimer) {
      clearInterval(this.collectionTimer);
      this.collectionTimer = undefined;
    }

    this.emit('collectionStopped');
  }

  /**
   * 收集指标数据
   */
  private async collectMetrics(): Promise<void> {
    const timestamp = new Date();

    for (const [instanceType, instance] of this.cacheInstances) {
      try {
        const stats = await this.getInstanceStats(instance);
        
        // 收集各种指标
        this.addDataPoint(MetricType.HIT_RATE, instanceType, timestamp, stats.hitRate || 0);
        this.addDataPoint(MetricType.MISS_RATE, instanceType, timestamp, stats.missRate || 0);
        this.addDataPoint(MetricType.THROUGHPUT, instanceType, timestamp, stats.throughput || 0);
        this.addDataPoint(MetricType.LATENCY, instanceType, timestamp, stats.averageLatency || 0);
        this.addDataPoint(MetricType.SIZE, instanceType, timestamp, stats.size || 0);
        this.addDataPoint(MetricType.MEMORY_USAGE, instanceType, timestamp, stats.memoryUsage || 0);
        this.addDataPoint(MetricType.EVICTION_RATE, instanceType, timestamp, stats.evictionRate || 0);
        this.addDataPoint(MetricType.ERROR_RATE, instanceType, timestamp, stats.errorRate || 0);

        this.emit('metricsCollected', { instanceType, stats, timestamp });
      } catch (error) {
        this.emit('collectionError', { instanceType, error });
      }
    }
  }

  /**
   * 获取实例统计信息
   */
  private async getInstanceStats(instance: any): Promise<any> {
    if (typeof instance.getStats === 'function') {
      return await instance.getStats();
    }
    
    // 默认统计信息
    return {
      hitRate: 0,
      missRate: 0,
      throughput: 0,
      averageLatency: 0,
      size: 0,
      memoryUsage: 0,
      evictionRate: 0,
      errorRate: 0
    };
  }

  /**
   * 添加数据点
   */
  public addDataPoint(
    metric: MetricType,
    instanceType: CacheInstanceType,
    timestamp: Date,
    value: number
  ): void {
    const key = `${metric}_${instanceType}`;
    const timeSeries = this.metricsHistory.get(key);
    
    if (timeSeries) {
      timeSeries.data.push({ timestamp, value });
      
      // 限制数据点数量，保留最近的数据
      const maxDataPoints = 10000;
      if (timeSeries.data.length > maxDataPoints) {
        timeSeries.data = timeSeries.data.slice(-maxDataPoints);
      }
      
      this.emit('dataPointAdded', { metric, instanceType, timestamp, value });
    }
  }

  /**
   * 获取历史数据
   */
  public getHistoricalData(
    metric: MetricType,
    instanceType: CacheInstanceType,
    timeRange: TimeRange
  ): number[] {
    const key = `${metric}_${instanceType}`;
    const timeSeries = this.metricsHistory.get(key);
    
    if (!timeSeries) {
      return [];
    }

    const now = new Date();
    let startTime: Date;

    switch (timeRange) {
      case TimeRange.LAST_HOUR:
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case TimeRange.LAST_DAY:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case TimeRange.LAST_WEEK:
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case TimeRange.LAST_MONTH:
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(0);
    }

    return timeSeries.data
      .filter(point => point.timestamp >= startTime)
      .map(point => point.value);
  }

  /**
   * 获取时间序列数据
   */
  public getTimeSeries(
    metric: MetricType,
    instanceType: CacheInstanceType,
    timeRange: TimeRange = TimeRange.LAST_DAY
  ): TimeSeries | null {
    const key = `${metric}_${instanceType}`;
    const timeSeries = this.metricsHistory.get(key);
    
    if (!timeSeries) {
      return null;
    }

    const now = new Date();
    let startTime: Date;

    switch (timeRange) {
      case TimeRange.LAST_HOUR:
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case TimeRange.LAST_DAY:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case TimeRange.LAST_WEEK:
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case TimeRange.LAST_MONTH:
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(0);
    }

    return {
      ...timeSeries,
      data: timeSeries.data.filter(point => point.timestamp >= startTime)
    };
  }

  /**
   * 清理历史数据
   */
  public cleanupHistory(olderThan: Date): number {
    let cleaned = 0;
    
    for (const [key, timeSeries] of this.metricsHistory) {
      const originalLength = timeSeries.data.length;
      timeSeries.data = timeSeries.data.filter(point => point.timestamp > olderThan);
      cleaned += originalLength - timeSeries.data.length;
    }
    
    this.emit('historyCleanup', { cleaned, olderThan });
    return cleaned;
  }

  /**
   * 获取收集器统计信息
   */
  public getCollectorStatistics(): {
    isCollecting: boolean;
    collectionInterval: number;
    totalDataPoints: number;
    registeredInstances: number;
    memoryUsage: number;
  } {
    const totalDataPoints = Array.from(this.metricsHistory.values())
      .reduce((sum, series) => sum + series.data.length, 0);
    
    return {
      isCollecting: this.isCollecting,
      collectionInterval: this.collectionIntervalMs,
      totalDataPoints,
      registeredInstances: this.cacheInstances.size,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * 估算内存使用
   */
  private estimateMemoryUsage(): number {
    // 简单估算：每个数据点约100字节
    const dataPointsSize = Array.from(this.metricsHistory.values())
      .reduce((sum, series) => sum + series.data.length, 0) * 100;
    
    return dataPointsSize;
  }

  /**
   * 处理统计更新事件
   */
  public async handleStatsUpdate(data: any): Promise<void> {
    if (data.metadata && data.metadata.instanceType && data.metadata.stats) {
      const { instanceType, stats } = data.metadata;
      const timestamp = data.timestamp;
      
      // 更新指标数据
      this.addDataPoint(MetricType.HIT_RATE, instanceType, timestamp, stats.hitRate);
      this.addDataPoint(MetricType.SIZE, instanceType, timestamp, stats.size);
      this.addDataPoint(MetricType.MEMORY_USAGE, instanceType, timestamp, stats.memoryUsage);
    }
  }

  /**
   * 销毁收集器
   */
  public destroy(): void {
    this.stopCollection();
    this.metricsHistory.clear();
    this.cacheInstances.clear();
    this.removeAllListeners();
  }
}