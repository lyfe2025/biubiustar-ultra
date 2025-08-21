import { EnhancedCacheService } from './enhancedCache';
import { CacheInstanceType } from '../config/cache';
import { cacheEventNotification, CacheEventType, EventSeverity } from './CacheEventNotification';

/**
 * 时间范围类型
 */
export enum TimeRange {
  LAST_HOUR = 'last_hour',
  LAST_DAY = 'last_day',
  LAST_WEEK = 'last_week',
  LAST_MONTH = 'last_month',
  CUSTOM = 'custom'
}

/**
 * 分析维度
 */
export enum AnalyticsDimension {
  TIME = 'time',
  INSTANCE = 'instance',
  KEY_PATTERN = 'key_pattern',
  OPERATION = 'operation',
  SIZE = 'size',
  TTL = 'ttl'
}

/**
 * 指标类型
 */
export enum MetricType {
  HIT_RATE = 'hit_rate',
  MISS_RATE = 'miss_rate',
  THROUGHPUT = 'throughput',
  LATENCY = 'latency',
  MEMORY_USAGE = 'memory_usage',
  SIZE = 'size',
  EVICTION_RATE = 'eviction_rate',
  ERROR_RATE = 'error_rate'
}

/**
 * 数据点
 */
export interface DataPoint {
  timestamp: Date;
  value: number;
  metadata?: Record<string, any>;
}

/**
 * 时间序列数据
 */
export interface TimeSeries {
  metric: MetricType;
  dimension: AnalyticsDimension;
  instanceType?: CacheInstanceType;
  data: DataPoint[];
  aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count';
}

/**
 * 统计摘要
 */
export interface StatisticsSummary {
  instanceType: CacheInstanceType;
  timeRange: TimeRange;
  startTime: Date;
  endTime: Date;
  metrics: {
    hitRate: {
      current: number;
      average: number;
      min: number;
      max: number;
      trend: 'up' | 'down' | 'stable';
    };
    throughput: {
      current: number;
      average: number;
      peak: number;
      trend: 'up' | 'down' | 'stable';
    };
    memoryUsage: {
      current: number;
      average: number;
      peak: number;
      trend: 'up' | 'down' | 'stable';
    };
    latency: {
      p50: number;
      p95: number;
      p99: number;
      average: number;
    };
    errorRate: {
      current: number;
      average: number;
      total: number;
    };
  };
  keyPatterns: Array<{
    pattern: string;
    count: number;
    hitRate: number;
    avgSize: number;
  }>;
  recommendations: string[];
}

/**
 * 异常检测结果
 */
export interface AnomalyDetection {
  instanceType: CacheInstanceType;
  metric: MetricType;
  timestamp: Date;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  possibleCauses: string[];
  recommendations: string[];
}

/**
 * 性能趋势
 */
export interface PerformanceTrend {
  metric: MetricType;
  instanceType: CacheInstanceType;
  direction: 'improving' | 'degrading' | 'stable';
  changeRate: number; // 变化率百分比
  confidence: number; // 置信度 0-1
  prediction: {
    nextHour: number;
    nextDay: number;
    nextWeek: number;
  };
  factors: Array<{
    factor: string;
    impact: number; // 影响权重
    description: string;
  }>;
}

/**
 * 缓存效率分析
 */
export interface CacheEfficiencyAnalysis {
  instanceType: CacheInstanceType;
  timeRange: TimeRange;
  efficiency: {
    overall: number; // 总体效率评分 0-100
    hitRateScore: number;
    memoryUtilizationScore: number;
    throughputScore: number;
    latencyScore: number;
  };
  bottlenecks: Array<{
    type: 'memory' | 'cpu' | 'network' | 'configuration';
    severity: number; // 0-100
    description: string;
    impact: string;
    solution: string;
  }>;
  optimizationOpportunities: Array<{
    type: 'ttl' | 'size' | 'eviction' | 'prewarming';
    potential: number; // 潜在改进百分比
    description: string;
    implementation: string;
    effort: 'low' | 'medium' | 'high';
  }>;
}

/**
 * 比较分析结果
 */
export interface ComparisonAnalysis {
  baseline: {
    instanceType: CacheInstanceType;
    timeRange: TimeRange;
    metrics: Record<MetricType, number>;
  };
  comparison: {
    instanceType: CacheInstanceType;
    timeRange: TimeRange;
    metrics: Record<MetricType, number>;
  };
  differences: Record<MetricType, {
    absolute: number;
    percentage: number;
    significance: 'negligible' | 'minor' | 'moderate' | 'major';
  }>;
  insights: string[];
}

/**
 * 缓存分析器
 */
export class CacheAnalytics {
  private cacheInstances: Map<CacheInstanceType, EnhancedCacheService> = new Map();
  private metricsHistory: Map<string, TimeSeries> = new Map();
  private anomalies: AnomalyDetection[] = [];
  private isCollecting: boolean = false;
  private collectionInterval: NodeJS.Timeout | null = null;
  private collectionIntervalMs: number = 60000; // 1分钟
  private maxHistoryPoints: number = 10080; // 7天的分钟数据
  private anomalyThresholds: Map<MetricType, { min: number; max: number; stdDevMultiplier: number }> = new Map();

  constructor() {
    this.initializeAnomalyThresholds();
    this.initializeEventListeners();
  }

  /**
   * 初始化异常检测阈值
   */
  private initializeAnomalyThresholds(): void {
    this.anomalyThresholds.set(MetricType.HIT_RATE, {
      min: 0.3, // 命中率低于30%
      max: 1.0,
      stdDevMultiplier: 2.0
    });
    
    this.anomalyThresholds.set(MetricType.MEMORY_USAGE, {
      min: 0,
      max: 0.9, // 内存使用率超过90%
      stdDevMultiplier: 2.5
    });
    
    this.anomalyThresholds.set(MetricType.ERROR_RATE, {
      min: 0,
      max: 0.05, // 错误率超过5%
      stdDevMultiplier: 3.0
    });
    
    this.anomalyThresholds.set(MetricType.LATENCY, {
      min: 0,
      max: 1000, // 延迟超过1秒
      stdDevMultiplier: 2.0
    });
  }

  /**
   * 初始化事件监听器
   */
  private initializeEventListeners(): void {
    cacheEventNotification.addEventListener('analytics-listener', {
      eventTypes: [
        CacheEventType.CACHE_STATS_UPDATED,
        CacheEventType.PERFORMANCE_WARNING,
        CacheEventType.MEMORY_WARNING
      ],
      callback: async (eventType, data) => {
        if (eventType === CacheEventType.CACHE_STATS_UPDATED) {
          await this.handleStatsUpdate(data);
        }
      }
    });
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
   * 开始数据收集
   */
  public startCollection(intervalMs: number = 60000): void {
    if (this.isCollecting) {
      return;
    }

    this.collectionIntervalMs = intervalMs;
    this.isCollecting = true;

    this.collectionInterval = setInterval(async () => {
      await this.collectMetrics();
    }, intervalMs);

    cacheEventNotification.emitEvent(CacheEventType.MONITORING_STARTED, {
      timestamp: new Date(),
      severity: EventSeverity.INFO,
      source: 'CacheAnalytics',
      message: `Analytics collection started with ${intervalMs}ms interval`,
      metadata: { intervalMs }
    });
  }

  /**
   * 停止数据收集
   */
  public stopCollection(): void {
    if (!this.isCollecting) {
      return;
    }

    this.isCollecting = false;

    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = null;
    }

    cacheEventNotification.emitEvent(CacheEventType.MONITORING_STOPPED, {
      timestamp: new Date(),
      severity: EventSeverity.INFO,
      source: 'CacheAnalytics',
      message: 'Analytics collection stopped'
    });
  }

  /**
   * 收集指标数据
   */
  private async collectMetrics(): Promise<void> {
    const timestamp = new Date();

    for (const [instanceType, cache] of this.cacheInstances) {
      try {
        const stats = cache.getStats();
        
        // 收集各种指标
        this.addDataPoint(MetricType.HIT_RATE, instanceType, timestamp, stats.hitRate);
        this.addDataPoint(MetricType.MISS_RATE, instanceType, timestamp, stats.missRate);
        this.addDataPoint(MetricType.SIZE, instanceType, timestamp, stats.size);
        this.addDataPoint(MetricType.MEMORY_USAGE, instanceType, timestamp, stats.memoryUsage);
        
        // 计算吞吐量（基于操作次数的变化）
        const throughput = (stats.hits + stats.misses) / (this.collectionIntervalMs / 1000);
        this.addDataPoint(MetricType.THROUGHPUT, instanceType, timestamp, throughput);
        
        // 检测异常
        await this.detectAnomalies(instanceType, timestamp, stats);
        
      } catch (error) {
        console.error(`Failed to collect metrics for ${instanceType}:`, error);
      }
    }
  }

  /**
   * 添加数据点
   */
  private addDataPoint(
    metric: MetricType,
    instanceType: CacheInstanceType,
    timestamp: Date,
    value: number
  ): void {
    const key = `${metric}_${instanceType}`;
    
    if (!this.metricsHistory.has(key)) {
      this.metricsHistory.set(key, {
        metric,
        dimension: AnalyticsDimension.TIME,
        instanceType,
        data: [],
        aggregation: 'avg'
      });
    }

    const timeSeries = this.metricsHistory.get(key)!;
    timeSeries.data.push({ timestamp, value });

    // 限制历史数据大小
    if (timeSeries.data.length > this.maxHistoryPoints) {
      timeSeries.data.splice(0, timeSeries.data.length - this.maxHistoryPoints);
    }
  }

  /**
   * 异常检测
   */
  private async detectAnomalies(
    instanceType: CacheInstanceType,
    timestamp: Date,
    stats: any
  ): Promise<void> {
    const metrics = [
      { type: MetricType.HIT_RATE, value: stats.hitRate },
      { type: MetricType.MEMORY_USAGE, value: stats.memoryUsage / (1024 * 1024) }, // 转换为MB
      { type: MetricType.ERROR_RATE, value: 0 } // 需要从错误统计中获取
    ];

    for (const { type, value } of metrics) {
      const threshold = this.anomalyThresholds.get(type);
      if (!threshold) continue;

      const historical = this.getHistoricalData(type, instanceType, TimeRange.LAST_DAY);
      if (historical.length < 10) continue; // 需要足够的历史数据

      const anomaly = this.checkAnomaly(type, instanceType, timestamp, value, historical, threshold);
      if (anomaly) {
        this.anomalies.push(anomaly);
        
        // 发送异常事件
        await cacheEventNotification.emitPerformanceWarning({
          instanceType,
          metric: type,
          value,
          threshold: threshold.max,
          source: 'CacheAnalytics',
          message: anomaly.description,
          metadata: { anomaly }
        });
      }
    }
  }

  /**
   * 检查单个指标异常
   */
  private checkAnomaly(
    metric: MetricType,
    instanceType: CacheInstanceType,
    timestamp: Date,
    value: number,
    historical: number[],
    threshold: { min: number; max: number; stdDevMultiplier: number }
  ): AnomalyDetection | null {
    // 基本阈值检查
    if (value < threshold.min || value > threshold.max) {
      return {
        instanceType,
        metric,
        timestamp,
        value,
        expectedValue: (threshold.min + threshold.max) / 2,
        deviation: Math.abs(value - (threshold.min + threshold.max) / 2),
        severity: value > threshold.max ? 'high' : 'medium',
        description: `${metric} value ${value} is outside normal range [${threshold.min}, ${threshold.max}]`,
        possibleCauses: this.getPossibleCauses(metric, value > threshold.max),
        recommendations: this.getRecommendations(metric, value > threshold.max)
      };
    }

    // 统计异常检查
    const mean = historical.reduce((a, b) => a + b, 0) / historical.length;
    const variance = historical.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / historical.length;
    const stdDev = Math.sqrt(variance);
    const deviation = Math.abs(value - mean);

    if (deviation > stdDev * threshold.stdDevMultiplier) {
      return {
        instanceType,
        metric,
        timestamp,
        value,
        expectedValue: mean,
        deviation,
        severity: deviation > stdDev * (threshold.stdDevMultiplier + 1) ? 'critical' : 'medium',
        description: `${metric} value ${value} deviates significantly from historical average ${mean.toFixed(2)} (${deviation.toFixed(2)} > ${(stdDev * threshold.stdDevMultiplier).toFixed(2)})`,
        possibleCauses: this.getPossibleCauses(metric, value > mean),
        recommendations: this.getRecommendations(metric, value > mean)
      };
    }

    return null;
  }

  /**
   * 获取可能原因
   */
  private getPossibleCauses(metric: MetricType, isHigh: boolean): string[] {
    const causes: Record<MetricType, { high: string[]; low: string[] }> = {
      [MetricType.HIT_RATE]: {
        high: ['Optimal cache configuration', 'Good data locality'],
        low: ['Cache size too small', 'Poor key distribution', 'Inappropriate TTL settings', 'Cold cache']
      },
      [MetricType.MEMORY_USAGE]: {
        high: ['Memory leak', 'Large objects cached', 'Insufficient cleanup', 'High cache size limit'],
        low: ['Aggressive eviction', 'Small cache size', 'Low usage period']
      },
      [MetricType.ERROR_RATE]: {
        high: ['System overload', 'Network issues', 'Configuration errors', 'Resource exhaustion'],
        low: ['Normal operation']
      },
      [MetricType.LATENCY]: {
        high: ['System overload', 'Network congestion', 'Large object serialization', 'Lock contention'],
        low: ['Optimal performance']
      },
      [MetricType.THROUGHPUT]: {
        high: ['High demand', 'Efficient operations'],
        low: ['Low usage', 'Performance bottlenecks', 'System constraints']
      },
      [MetricType.MISS_RATE]: {
        high: ['Cache size too small', 'Poor key distribution', 'Inappropriate TTL settings'],
        low: ['Good cache configuration', 'Optimal hit rate']
      },
      [MetricType.SIZE]: {
        high: ['High data volume', 'Large objects', 'Insufficient cleanup'],
        low: ['Low usage', 'Aggressive eviction']
      },
      [MetricType.EVICTION_RATE]: {
        high: ['Cache size too small', 'High data volume', 'Short TTL'],
        low: ['Appropriate cache size', 'Low data volume']
      }
    };

    return causes[metric] ? (isHigh ? causes[metric].high : causes[metric].low) : [];
  }

  /**
   * 获取建议
   */
  private getRecommendations(metric: MetricType, isHigh: boolean): string[] {
    const recommendations: Record<MetricType, { high: string[]; low: string[] }> = {
      [MetricType.HIT_RATE]: {
        high: ['Maintain current configuration'],
        low: ['Increase cache size', 'Adjust TTL settings', 'Implement prewarming', 'Review key patterns']
      },
      [MetricType.MEMORY_USAGE]: {
        high: ['Increase cleanup frequency', 'Reduce cache size limit', 'Implement memory monitoring', 'Check for memory leaks'],
        low: ['Consider increasing cache size', 'Review eviction policies']
      },
      [MetricType.ERROR_RATE]: {
        high: ['Check system resources', 'Review error logs', 'Implement circuit breaker', 'Add retry logic'],
        low: ['Continue monitoring']
      },
      [MetricType.LATENCY]: {
        high: ['Optimize serialization', 'Check network connectivity', 'Review system load', 'Consider caching smaller objects'],
        low: ['Maintain current performance']
      },
      [MetricType.THROUGHPUT]: {
        high: ['Monitor system capacity', 'Consider scaling'],
        low: ['Investigate performance bottlenecks', 'Review system configuration']
      },
      [MetricType.MISS_RATE]: {
        high: ['Increase cache size', 'Adjust TTL settings', 'Implement prewarming'],
        low: ['Maintain current configuration']
      },
      [MetricType.SIZE]: {
        high: ['Increase cleanup frequency', 'Review data retention policies'],
        low: ['Consider increasing cache utilization']
      },
      [MetricType.EVICTION_RATE]: {
        high: ['Increase cache size', 'Optimize TTL settings'],
        low: ['Monitor cache utilization']
      }
    };

    return recommendations[metric] ? (isHigh ? recommendations[metric].high : recommendations[metric].low) : [];
  }

  /**
   * 获取历史数据
   */
  private getHistoricalData(
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
   * 获取统计摘要
   */
  public getStatisticsSummary(
    instanceType: CacheInstanceType,
    timeRange: TimeRange = TimeRange.LAST_DAY
  ): StatisticsSummary {
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
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // 获取各指标的历史数据
    const hitRateData = this.getHistoricalData(MetricType.HIT_RATE, instanceType, timeRange);
    const throughputData = this.getHistoricalData(MetricType.THROUGHPUT, instanceType, timeRange);
    const memoryData = this.getHistoricalData(MetricType.MEMORY_USAGE, instanceType, timeRange);
    
    // 计算趋势
    const hitRateTrend = this.calculateTrend(hitRateData);
    const throughputTrend = this.calculateTrend(throughputData);
    const memoryTrend = this.calculateTrend(memoryData);

    return {
      instanceType,
      timeRange,
      startTime,
      endTime: now,
      metrics: {
        hitRate: {
          current: hitRateData[hitRateData.length - 1] || 0,
          average: hitRateData.length > 0 ? hitRateData.reduce((a, b) => a + b, 0) / hitRateData.length : 0,
          min: hitRateData.length > 0 ? Math.min(...hitRateData) : 0,
          max: hitRateData.length > 0 ? Math.max(...hitRateData) : 0,
          trend: hitRateTrend
        },
        throughput: {
          current: throughputData[throughputData.length - 1] || 0,
          average: throughputData.length > 0 ? throughputData.reduce((a, b) => a + b, 0) / throughputData.length : 0,
          peak: throughputData.length > 0 ? Math.max(...throughputData) : 0,
          trend: throughputTrend
        },
        memoryUsage: {
          current: memoryData[memoryData.length - 1] || 0,
          average: memoryData.length > 0 ? memoryData.reduce((a, b) => a + b, 0) / memoryData.length : 0,
          peak: memoryData.length > 0 ? Math.max(...memoryData) : 0,
          trend: memoryTrend
        },
        latency: {
          p50: 0, // 需要实现百分位数计算
          p95: 0,
          p99: 0,
          average: 0
        },
        errorRate: {
          current: 0,
          average: 0,
          total: 0
        }
      },
      keyPatterns: [], // 需要实现键模式分析
      recommendations: this.generateRecommendations(instanceType, hitRateData, throughputData, memoryData)
    };
  }

  /**
   * 计算趋势
   */
  private calculateTrend(data: number[]): 'up' | 'down' | 'stable' {
    if (data.length < 2) {
      return 'stable';
    }

    const recentData = data.slice(-Math.min(10, data.length)); // 最近10个数据点
    const firstHalf = recentData.slice(0, Math.floor(recentData.length / 2));
    const secondHalf = recentData.slice(Math.floor(recentData.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (changePercent > 5) {
      return 'up';
    } else if (changePercent < -5) {
      return 'down';
    } else {
      return 'stable';
    }
  }

  /**
   * 生成建议
   */
  private generateRecommendations(
    instanceType: CacheInstanceType,
    hitRateData: number[],
    throughputData: number[],
    memoryData: number[]
  ): string[] {
    const recommendations: string[] = [];

    // 命中率建议
    const avgHitRate = hitRateData.length > 0 ? hitRateData.reduce((a, b) => a + b, 0) / hitRateData.length : 0;
    if (avgHitRate < 0.7) {
      recommendations.push('命中率较低，建议增加缓存大小或调整TTL设置');
    }

    // 内存使用建议
    const avgMemory = memoryData.length > 0 ? memoryData.reduce((a, b) => a + b, 0) / memoryData.length : 0;
    if (avgMemory > 0.8) {
      recommendations.push('内存使用率较高，建议增加清理频率或减少缓存大小');
    }

    // 吞吐量建议
    const throughputTrend = this.calculateTrend(throughputData);
    if (throughputTrend === 'down') {
      recommendations.push('吞吐量呈下降趋势，建议检查系统性能和配置');
    }

    return recommendations;
  }

  /**
   * 获取性能趋势
   */
  public getPerformanceTrend(
    metric: MetricType,
    instanceType: CacheInstanceType,
    timeRange: TimeRange = TimeRange.LAST_DAY
  ): PerformanceTrend {
    const data = this.getHistoricalData(metric, instanceType, timeRange);
    
    if (data.length < 5) {
      return {
        metric,
        instanceType,
        direction: 'stable',
        changeRate: 0,
        confidence: 0,
        prediction: { nextHour: 0, nextDay: 0, nextWeek: 0 },
        factors: []
      };
    }

    // 简单的线性回归趋势分析
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // 计算R²
    const yMean = sumY / n;
    const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - (slope * x[i] + intercept), 2), 0);
    const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const rSquared = 1 - (ssRes / ssTot);
    
    const direction = slope > 0.01 ? 'improving' : slope < -0.01 ? 'degrading' : 'stable';
    const changeRate = (slope / yMean) * 100;
    
    return {
      metric,
      instanceType,
      direction,
      changeRate,
      confidence: Math.max(0, Math.min(1, rSquared)),
      prediction: {
        nextHour: slope * (n + 1) + intercept,
        nextDay: slope * (n + 24) + intercept,
        nextWeek: slope * (n + 168) + intercept
      },
      factors: [
        {
          factor: 'Historical trend',
          impact: Math.abs(slope),
          description: `Linear trend shows ${direction} pattern`
        }
      ]
    };
  }

  /**
   * 获取异常检测结果
   */
  public getAnomalies(
    instanceType?: CacheInstanceType,
    timeRange: TimeRange = TimeRange.LAST_DAY
  ): AnomalyDetection[] {
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
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    return this.anomalies.filter(anomaly => {
      const matchesTime = anomaly.timestamp >= startTime;
      const matchesInstance = !instanceType || anomaly.instanceType === instanceType;
      return matchesTime && matchesInstance;
    });
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
   * 处理统计更新事件
   */
  private async handleStatsUpdate(data: any): Promise<void> {
    // 处理来自事件系统的统计更新
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
   * 清理历史数据
   */
  public cleanupHistory(olderThan: Date): number {
    let cleaned = 0;
    
    for (const [key, timeSeries] of this.metricsHistory) {
      const originalLength = timeSeries.data.length;
      timeSeries.data = timeSeries.data.filter(point => point.timestamp > olderThan);
      cleaned += originalLength - timeSeries.data.length;
    }
    
    // 清理异常记录
    const originalAnomaliesLength = this.anomalies.length;
    this.anomalies = this.anomalies.filter(anomaly => anomaly.timestamp > olderThan);
    cleaned += originalAnomaliesLength - this.anomalies.length;
    
    return cleaned;
  }

  /**
   * 获取分析统计
   */
  public getAnalyticsStatistics(): {
    isCollecting: boolean;
    collectionInterval: number;
    totalDataPoints: number;
    totalAnomalies: number;
    registeredInstances: number;
    memoryUsage: number;
  } {
    const totalDataPoints = Array.from(this.metricsHistory.values())
      .reduce((sum, series) => sum + series.data.length, 0);
    
    return {
      isCollecting: this.isCollecting,
      collectionInterval: this.collectionIntervalMs,
      totalDataPoints,
      totalAnomalies: this.anomalies.length,
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
    
    // 异常记录约500字节每个
    const anomaliesSize = this.anomalies.length * 500;
    
    return dataPointsSize + anomaliesSize;
  }

  /**
   * 销毁实例
   */
  public destroy(): void {
    this.stopCollection();
    this.metricsHistory.clear();
    this.anomalies = [];
    this.cacheInstances.clear();
  }
}

// 导出默认实例
export const cacheAnalytics = new CacheAnalytics();