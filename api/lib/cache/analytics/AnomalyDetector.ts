/**
 * 缓存异常检测器
 * 负责检测缓存指标异常并生成告警
 */

import { EventEmitter } from 'events';
import { 
  MetricType, 
  AnomalyDetection, 
  TimeRange 
} from './types';
import { CacheInstanceType } from '../../../config/cache';

export class AnomalyDetector extends EventEmitter {
  private anomalies: AnomalyDetection[] = [];
  private thresholds: Map<string, { min: number; max: number }> = new Map();
  private isEnabled: boolean = true;

  constructor() {
    super();
    this.initializeThresholds();
  }

  /**
   * 初始化异常检测阈值
   */
  private initializeThresholds(): void {
    // 命中率阈值
    this.thresholds.set(`${MetricType.HIT_RATE}_default`, { min: 0.3, max: 1.0 });
    
    // 内存使用率阈值
    this.thresholds.set(`${MetricType.MEMORY_USAGE}_default`, { min: 0, max: 0.9 });
    
    // 错误率阈值
    this.thresholds.set(`${MetricType.ERROR_RATE}_default`, { min: 0, max: 0.05 });
    
    // 延迟阈值（毫秒）
    this.thresholds.set(`${MetricType.LATENCY}_default`, { min: 0, max: 1000 });
    
    // 驱逐率阈值
    this.thresholds.set(`${MetricType.EVICTION_RATE}_default`, { min: 0, max: 0.1 });
  }

  /**
   * 设置指标阈值
   */
  public setThreshold(
    metric: MetricType,
    instanceType: CacheInstanceType | 'default',
    min: number,
    max: number
  ): void {
    const key = `${metric}_${instanceType}`;
    this.thresholds.set(key, { min, max });
    this.emit('thresholdUpdated', { metric, instanceType, min, max });
  }

  /**
   * 获取指标阈值
   */
  private getThreshold(metric: MetricType, instanceType: CacheInstanceType): { min: number; max: number } {
    const specificKey = `${metric}_${instanceType}`;
    const defaultKey = `${metric}_default`;
    
    return this.thresholds.get(specificKey) || 
           this.thresholds.get(defaultKey) || 
           { min: 0, max: Number.MAX_VALUE };
  }

  /**
   * 检查单个指标异常
   */
  public checkAnomaly(
    metric: MetricType,
    instanceType: CacheInstanceType,
    value: number,
    timestamp: Date = new Date(),
    historicalData: number[] = []
  ): AnomalyDetection | null {
    if (!this.isEnabled) {
      return null;
    }

    const threshold = this.getThreshold(metric, instanceType);
    let isAnomaly = false;
    let severity: 'low' | 'medium' | 'high' = 'low';

    // 基本阈值检查
    if (value < threshold.min || value > threshold.max) {
      isAnomaly = true;
      
      // 计算严重程度
      const deviation = Math.max(
        Math.abs(value - threshold.min) / (threshold.max - threshold.min),
        Math.abs(value - threshold.max) / (threshold.max - threshold.min)
      );
      
      if (deviation > 0.5) {
        severity = 'high';
      } else if (deviation > 0.2) {
        severity = 'medium';
      }
    }

    // 统计异常检查（如果有历史数据）
    if (!isAnomaly && historicalData.length >= 10) {
      const statisticalAnomaly = this.detectStatisticalAnomaly(value, historicalData);
      if (statisticalAnomaly) {
        isAnomaly = true;
        severity = statisticalAnomaly.severity;
      }
    }

    if (!isAnomaly) {
      return null;
    }

    const anomaly: AnomalyDetection = {
      id: this.generateAnomalyId(metric, instanceType, timestamp),
      timestamp,
      instanceType,
      metric,
      value,
      expectedRange: threshold,
      severity,
      possibleCauses: this.getPossibleCauses(metric, value, threshold),
      recommendations: this.getRecommendations(metric, value, threshold)
    };

    this.anomalies.push(anomaly);
    this.emit('anomalyDetected', anomaly);
    
    return anomaly;
  }

  /**
   * 统计异常检测
   */
  private detectStatisticalAnomaly(
    value: number, 
    historicalData: number[]
  ): { severity: 'low' | 'medium' | 'high' } | null {
    if (historicalData.length < 10) {
      return null;
    }

    // 计算均值和标准差
    const mean = historicalData.reduce((sum, val) => sum + val, 0) / historicalData.length;
    const variance = historicalData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / historicalData.length;
    const stdDev = Math.sqrt(variance);

    // Z-score异常检测
    const zScore = Math.abs((value - mean) / stdDev);
    
    if (zScore > 3) {
      return { severity: 'high' };
    } else if (zScore > 2) {
      return { severity: 'medium' };
    } else if (zScore > 1.5) {
      return { severity: 'low' };
    }

    return null;
  }

  /**
   * 生成异常ID
   */
  private generateAnomalyId(
    metric: MetricType,
    instanceType: CacheInstanceType,
    timestamp: Date
  ): string {
    return `${metric}_${instanceType}_${timestamp.getTime()}`;
  }

  /**
   * 获取可能的原因
   */
  private getPossibleCauses(
    metric: MetricType,
    value: number,
    threshold: { min: number; max: number }
  ): string[] {
    const causes: string[] = [];

    switch (metric) {
      case MetricType.HIT_RATE:
        if (value < threshold.min) {
          causes.push('缓存大小不足');
          causes.push('TTL设置过短');
          causes.push('数据访问模式发生变化');
          causes.push('缓存预热不充分');
        }
        break;

      case MetricType.MEMORY_USAGE:
        if (value > threshold.max) {
          causes.push('缓存数据过多');
          causes.push('内存泄漏');
          causes.push('大对象缓存');
          causes.push('清理策略不当');
        }
        break;

      case MetricType.ERROR_RATE:
        if (value > threshold.max) {
          causes.push('网络连接问题');
          causes.push('后端服务异常');
          causes.push('配置错误');
          causes.push('资源不足');
        }
        break;

      case MetricType.LATENCY:
        if (value > threshold.max) {
          causes.push('网络延迟增加');
          causes.push('缓存服务器负载过高');
          causes.push('磁盘I/O瓶颈');
          causes.push('内存不足导致交换');
        }
        break;

      case MetricType.EVICTION_RATE:
        if (value > threshold.max) {
          causes.push('缓存容量不足');
          causes.push('数据访问频率过高');
          causes.push('TTL设置不合理');
          causes.push('内存压力过大');
        }
        break;

      default:
        causes.push('未知原因，需要进一步调查');
    }

    return causes;
  }

  /**
   * 获取建议
   */
  private getRecommendations(
    metric: MetricType,
    value: number,
    threshold: { min: number; max: number }
  ): string[] {
    const recommendations: string[] = [];

    switch (metric) {
      case MetricType.HIT_RATE:
        if (value < threshold.min) {
          recommendations.push('增加缓存大小');
          recommendations.push('调整TTL设置');
          recommendations.push('优化缓存预热策略');
          recommendations.push('分析访问模式并调整缓存策略');
        }
        break;

      case MetricType.MEMORY_USAGE:
        if (value > threshold.max) {
          recommendations.push('增加内存容量');
          recommendations.push('优化数据结构');
          recommendations.push('调整清理策略');
          recommendations.push('实施数据压缩');
        }
        break;

      case MetricType.ERROR_RATE:
        if (value > threshold.max) {
          recommendations.push('检查网络连接');
          recommendations.push('验证后端服务状态');
          recommendations.push('审查配置设置');
          recommendations.push('增加重试机制');
        }
        break;

      case MetricType.LATENCY:
        if (value > threshold.max) {
          recommendations.push('优化网络配置');
          recommendations.push('增加服务器资源');
          recommendations.push('实施连接池');
          recommendations.push('考虑数据本地化');
        }
        break;

      case MetricType.EVICTION_RATE:
        if (value > threshold.max) {
          recommendations.push('增加缓存容量');
          recommendations.push('优化数据生命周期管理');
          recommendations.push('实施智能清理策略');
          recommendations.push('考虑分层缓存架构');
        }
        break;

      default:
        recommendations.push('联系技术支持进行详细分析');
    }

    return recommendations;
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
   * 清理历史异常记录
   */
  public cleanupAnomalies(olderThan: Date): number {
    const originalLength = this.anomalies.length;
    this.anomalies = this.anomalies.filter(anomaly => anomaly.timestamp > olderThan);
    const cleaned = originalLength - this.anomalies.length;
    
    this.emit('anomaliesCleanup', { cleaned, olderThan });
    return cleaned;
  }

  /**
   * 启用/禁用异常检测
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.emit('detectionToggled', { enabled });
  }

  /**
   * 获取检测器统计信息
   */
  public getDetectorStatistics(): {
    isEnabled: boolean;
    totalAnomalies: number;
    anomaliesByType: Record<MetricType, number>;
    anomaliesBySeverity: Record<'low' | 'medium' | 'high', number>;
  } {
    const anomaliesByType = {} as Record<MetricType, number>;
    const anomaliesBySeverity = { low: 0, medium: 0, high: 0 };

    // 初始化计数器
    Object.values(MetricType).forEach(metric => {
      anomaliesByType[metric] = 0;
    });

    // 统计异常
    this.anomalies.forEach(anomaly => {
      anomaliesByType[anomaly.metric]++;
      anomaliesBySeverity[anomaly.severity]++;
    });

    return {
      isEnabled: this.isEnabled,
      totalAnomalies: this.anomalies.length,
      anomaliesByType,
      anomaliesBySeverity
    };
  }

  /**
   * 销毁检测器
   */
  public destroy(): void {
    this.anomalies = [];
    this.thresholds.clear();
    this.removeAllListeners();
  }
}