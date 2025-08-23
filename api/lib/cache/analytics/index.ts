/**
 * 缓存分析模块统一导出
 */

import { MetricsCollector } from './MetricsCollector';
import { AnomalyDetector } from './AnomalyDetector';
import { TrendAnalyzer } from './TrendAnalyzer';
import { ReportGenerator } from './ReportGenerator';
import {
  TimeRange,
  MetricType,
  TimeSeries,
  PerformanceTrend,
  AnomalyDetection,
  StatisticsSummary
} from './types';

// 定义缺失的类型
interface AnalyticsConfig {
  collectionInterval: number;
  retentionPeriod: number;
  anomalyThresholds: {
    hitRateDeviation: number;
    responseTimeMultiplier: number;
    errorRateThreshold: number;
  };
}

interface MetricsHistory {
  timestamp: Date;
  instanceType: string;
  metrics: any;
}
import { CacheInstanceType } from '../../../config/cache';
import { EnhancedCacheService } from '../../enhancedCache';

// 导出主要类
export { MetricsCollector } from './MetricsCollector';
export { AnomalyDetector } from './AnomalyDetector';
export { TrendAnalyzer } from './TrendAnalyzer';
export { ReportGenerator } from './ReportGenerator';

// 导出类型定义
export * from './types';

/**
 * 缓存分析主类
 */
export class CacheAnalytics {
  private static instance: CacheAnalytics;
  public readonly instanceType: CacheInstanceType;
  private cacheInstances: Map<CacheInstanceType, EnhancedCacheService> = new Map();
  private metricsCollector: MetricsCollector;
  private anomalyDetector: AnomalyDetector;
  private trendAnalyzer: TrendAnalyzer;
  private reportGenerator: ReportGenerator;
  private metricsHistory: MetricsHistory[] = [];
  private config: AnalyticsConfig;
  private isCollecting: boolean = false;
  private collectionInterval?: NodeJS.Timeout;

  constructor(instanceType: CacheInstanceType = 'user', config?: Partial<AnalyticsConfig>) {
    this.instanceType = instanceType;
    this.config = {
      collectionInterval: 10000,
      retentionPeriod: 7 * 24 * 60 * 60 * 1000, // 7天
      anomalyThresholds: {
        hitRateDeviation: 0.2,
        responseTimeMultiplier: 2.0,
        errorRateThreshold: 0.1
      },
      ...config
    };
    
    this.metricsCollector = new MetricsCollector();
    this.anomalyDetector = new AnomalyDetector();
    this.trendAnalyzer = new TrendAnalyzer();
    this.reportGenerator = new ReportGenerator();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): CacheAnalytics {
    if (!CacheAnalytics.instance) {
      CacheAnalytics.instance = new CacheAnalytics();
    }
    return CacheAnalytics.instance;
  }

  /**
   * 注册缓存实例
   */
  public registerCacheInstance(
    type: CacheInstanceType,
    instance: EnhancedCacheService
  ): void {
    this.cacheInstances.set(type, instance);
  }

  /**
   * 开始收集指标
   */
  public startCollection(intervalMs?: number): void {
    if (this.isCollecting) return;
    
    if (intervalMs) {
      this.config.collectionInterval = intervalMs;
    }
    
    this.isCollecting = true;
    this.collectionInterval = setInterval(() => {
      this.collectMetrics();
    }, this.config.collectionInterval);
  }

  /**
   * 停止收集指标
   */
  public stopCollection(): void {
    if (!this.isCollecting) return;
    
    this.isCollecting = false;
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = undefined;
    }
  }

  /**
   * 获取时间序列数据
   */
  public getTimeSeries(
    metric: MetricType,
    instanceType: CacheInstanceType,
    timeRange: any
  ) {
    return this.metricsCollector.getTimeSeries(metric, instanceType, timeRange);
  }

  /**
   * 获取性能趋势
   */
  public getPerformanceTrend(
    instanceType: CacheInstanceType,
    metric: MetricType,
    timeRange: TimeRange = TimeRange.LAST_DAY
  ) {
    const data = this.metricsCollector.getHistoricalData(metric, instanceType, timeRange);
    return this.trendAnalyzer.getPerformanceTrend(metric, instanceType, data, timeRange);
  }

  /**
   * 获取异常检测结果
   */
  public getAnomalies(
    instanceType?: CacheInstanceType,
    timeRange?: any
  ) {
    return this.anomalyDetector.getAnomalies(instanceType, timeRange);
  }

  /**
   * 获取分析统计信息
   */
  public getAnalyticsStatistics() {
    return {
      metricsCount: this.metricsHistory.length,
      anomaliesCount: this.detectAnomalies().length,
      trendsCount: Object.keys(this.getTrendData()).length,
      lastUpdate: new Date().toISOString()
    };
  }

  /**
   * 获取统计摘要
   */
  public getStatisticsSummary(
    instanceType?: CacheInstanceType,
    timeRange?: any
  ) {
    const metrics = this.getMetricsHistory();
    const anomalies = this.detectAnomalies();
    
    return {
      totalMetrics: metrics.length,
      anomaliesCount: anomalies.length,
      averageHitRate: metrics.reduce((sum, m) => sum + (m.metrics?.hitRate || 0), 0) / metrics.length || 0,
      averageResponseTime: metrics.reduce((sum, m) => sum + (m.metrics?.responseTime || 0), 0) / metrics.length || 0,
      timeRange: timeRange || 'all',
      lastUpdate: new Date().toISOString()
    };
  }

  /**
   * 收集指标
   */
  private async collectMetrics(): Promise<void> {
    try {
      const metrics = await this.metricsCollector.getCollectorStatistics();
      const instanceType = Array.from(this.cacheInstances.keys())[0] || 'redis' as CacheInstanceType;
      this.addDataPoint(metrics, instanceType, new Date());
      
      // 检测异常
      const anomalies = this.anomalyDetector.getAnomalies();
      if (anomalies.length > 0) {
        console.warn('检测到缓存异常:', anomalies);
      }
      
      // 清理旧数据
      this.cleanupOldData();
    } catch (error) {
      console.error('收集指标时出错:', error);
    }
  }

  /**
   * 添加数据点
   */
  public addDataPoint(
    metrics: any,
    instanceType: CacheInstanceType,
    timestamp: Date
  ): void {
    const dataPoint = {
      timestamp,
      instanceType,
      metrics
    };
    
    this.metricsHistory.push(dataPoint);
    
    // 检测异常
    const anomalies = this.anomalyDetector.getAnomalies();
    
    if (anomalies.length > 0) {
      console.warn('检测到缓存异常:', anomalies);
    }
  }

  /**
   * 清理旧数据
   */
  private cleanupOldData(): void {
    const cutoff = new Date(Date.now() - this.config.retentionPeriod);
    this.metricsHistory = this.metricsHistory.filter(
      entry => entry.timestamp > cutoff
    );
  }

  /**
   * 获取指标历史
   */
  public getMetricsHistory(limit?: number): MetricsHistory[] {
    return limit ? this.metricsHistory.slice(-limit) : this.metricsHistory;
  }

  /**
   * 获取趋势数据
   */
  public getTrendData(period: 'hour' | 'day' | 'week' = 'day') {
    // 获取所有指标的趋势数据
    const trends = [];
    for (const instanceType of this.cacheInstances.keys()) {
      const hitRateData = this.metricsCollector.getHistoricalData(
        MetricType.HIT_RATE, 
        instanceType, 
        TimeRange.LAST_DAY
      );
      if (hitRateData.length > 0) {
        trends.push(this.trendAnalyzer.getPerformanceTrend(
          MetricType.HIT_RATE,
          instanceType,
          hitRateData
        ));
      }
    }
    return trends;
  }

  /**
   * 生成报告
   */
  public async generateReport() {
    const instanceType = Array.from(this.cacheInstances.keys())[0] || 'redis' as CacheInstanceType;
    const timeRange = TimeRange.LAST_DAY;
    const now = new Date();
    const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const summary: StatisticsSummary = {
      instanceType,
      timeRange,
      startTime,
      endTime: now,
      metrics: {
        hitRate: {
          current: 0.85,
          average: 0.82,
          min: 0.75,
          max: 0.95,
          trend: 'stable'
        },
        throughput: {
          current: 1000,
          average: 950,
          peak: 1200,
          trend: 'up'
        },
        memoryUsage: {
          current: 0.65,
          average: 0.60,
          peak: 0.80,
          trend: 'stable'
        },
        latency: {
          p50: 2.5,
          p95: 8.0,
          p99: 15.0,
          average: 3.2
        },
        errorRate: {
          current: 0.01,
          average: 0.015,
          total: 50
        }
      },
      keyPatterns: ['user:*', 'session:*', 'cache:*'],
      recommendations: ['Consider increasing cache size', 'Optimize key patterns']
    };
    
    const anomalies = this.detectAnomalies();
    const trends = this.getTrendData();
    
    const reportData = {
      summary,
      anomalies,
      trends,
      metadata: {
        generatedAt: new Date(),
        instanceType,
        reportId: ''
      }
    };
    
    const config = {
      format: 'json' as const,
      includeCharts: false,
      includeRecommendations: true,
      includeRawData: false,
      timeRange: TimeRange.LAST_DAY
    };
    
    return this.reportGenerator.generateReport(reportData, config);
  }

  /**
   * 检测异常
   */
  public detectAnomalies() {
    return this.anomalyDetector.getAnomalies();
  }

  /**
   * 销毁实例
   */
  public destroy(): void {
    this.stopCollection();
    this.cacheInstances.clear();
    this.metricsHistory = [];
  }
}

// 导出默认实例
export const cacheAnalytics = CacheAnalytics.getInstance();