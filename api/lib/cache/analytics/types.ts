/**
 * 缓存分析系统类型定义
 */

// 时间范围枚举
export enum TimeRange {
  LAST_HOUR = 'LAST_HOUR',
  LAST_DAY = 'LAST_DAY',
  LAST_WEEK = 'LAST_WEEK',
  LAST_MONTH = 'LAST_MONTH'
}

// 分析维度枚举
export enum AnalyticsDimension {
  TIME = 'TIME',
  INSTANCE_TYPE = 'INSTANCE_TYPE',
  KEY_PATTERN = 'KEY_PATTERN',
  OPERATION_TYPE = 'OPERATION_TYPE'
}

// 指标类型枚举
export enum MetricType {
  HIT_RATE = 'HIT_RATE',
  MISS_RATE = 'MISS_RATE',
  THROUGHPUT = 'THROUGHPUT',
  LATENCY = 'LATENCY',
  SIZE = 'SIZE',
  MEMORY_USAGE = 'MEMORY_USAGE',
  EVICTION_RATE = 'EVICTION_RATE',
  ERROR_RATE = 'ERROR_RATE'
}

// 数据点接口
export interface DataPoint {
  timestamp: Date;
  value: number;
}

// 时间序列接口
export interface TimeSeries {
  metric: MetricType;
  instanceType: CacheInstanceType;
  data: DataPoint[];
}

// 统计摘要接口
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
  keyPatterns: string[];
  recommendations: string[];
}

// 异常检测接口
export interface AnomalyDetection {
  id: string;
  timestamp: Date;
  instanceType: CacheInstanceType;
  metric: MetricType;
  value: number;
  expectedRange: {
    min: number;
    max: number;
  };
  severity: 'low' | 'medium' | 'high';
  possibleCauses: string[];
  recommendations: string[];
}

// 性能趋势接口
export interface PerformanceTrend {
  metric: MetricType;
  instanceType: CacheInstanceType;
  direction: 'improving' | 'degrading' | 'stable';
  changeRate: number;
  confidence: number;
  prediction: {
    nextHour: number;
    nextDay: number;
    nextWeek: number;
  };
  factors: {
    factor: string;
    impact: number;
    description: string;
  }[];
}

// 缓存效率分析接口
export interface CacheEfficiencyAnalysis {
  instanceType: CacheInstanceType;
  timeRange: TimeRange;
  hitRateAnalysis: {
    average: number;
    trend: 'up' | 'down' | 'stable';
    potentialImprovement: number;
  };
  memoryEfficiency: {
    utilization: number;
    wastedSpace: number;
    optimizationPotential: number;
  };
  keyPatternAnalysis: {
    pattern: string;
    frequency: number;
    hitRate: number;
  }[];
  recommendations: string[];
}

// 比较分析接口
export interface ComparisonAnalysis {
  metric: MetricType;
  timeRange: TimeRange;
  baseline: {
    instanceType: CacheInstanceType;
    value: number;
  };
  comparison: {
    instanceType: CacheInstanceType;
    value: number;
  };
  difference: {
    absolute: number;
    percentage: number;
  };
  factors: string[];
}

// 从原有代码中导入缓存实例类型
import { CacheInstanceType } from '../../../config/cache';