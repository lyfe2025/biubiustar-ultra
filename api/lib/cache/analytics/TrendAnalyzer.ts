/**
 * 缓存趋势分析器
 * 负责分析缓存指标趋势和预测未来性能
 */

import { EventEmitter } from 'events';
import { 
  MetricType, 
  PerformanceTrend, 
  TimeRange 
} from './types';
import { CacheInstanceType } from '../../../config/cache';

export class TrendAnalyzer extends EventEmitter {
  constructor() {
    super();
  }

  /**
   * 计算趋势方向
   */
  public calculateTrend(data: number[]): 'up' | 'down' | 'stable' {
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
   * 获取性能趋势
   */
  public getPerformanceTrend(
    metric: MetricType,
    instanceType: CacheInstanceType,
    data: number[],
    timeRange: TimeRange = TimeRange.LAST_DAY
  ): PerformanceTrend {
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
    
    const result: PerformanceTrend = {
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

    // 添加额外的影响因素分析
    this.addAdditionalFactors(result, metric, data);
    
    this.emit('trendAnalyzed', result);
    return result;
  }

  /**
   * 添加额外的影响因素
   */
  private addAdditionalFactors(
    trend: PerformanceTrend,
    metric: MetricType,
    data: number[]
  ): void {
    // 检查波动性
    const volatility = this.calculateVolatility(data);
    if (volatility > 0.2) {
      trend.factors.push({
        factor: 'Volatility',
        impact: volatility,
        description: `High metric volatility (${(volatility * 100).toFixed(1)}%) indicates unstable behavior`
      });
    }

    // 检查季节性
    const seasonality = this.detectSeasonality(data);
    if (seasonality.detected) {
      trend.factors.push({
        factor: 'Seasonality',
        impact: seasonality.strength,
        description: `Periodic pattern detected with cycle of ~${seasonality.period} data points`
      });
    }

    // 检查异常值影响
    const outlierImpact = this.calculateOutlierImpact(data);
    if (outlierImpact > 0.1) {
      trend.factors.push({
        factor: 'Outliers',
        impact: outlierImpact,
        description: `Outliers significantly affecting the trend (${(outlierImpact * 100).toFixed(1)}% impact)`
      });
    }

    // 根据指标类型添加特定因素
    switch (metric) {
      case MetricType.HIT_RATE:
        if (trend.direction === 'degrading' && trend.changeRate < -10) {
          trend.factors.push({
            factor: 'Cache efficiency',
            impact: Math.abs(trend.changeRate) / 100,
            description: 'Significant hit rate degradation indicates cache efficiency issues'
          });
        }
        break;

      case MetricType.MEMORY_USAGE:
        if (trend.direction === 'improving' && data[data.length - 1] < 0.5) {
          trend.factors.push({
            factor: 'Memory optimization',
            impact: 0.5,
            description: 'Memory usage improvement suggests optimization is effective'
          });
        }
        break;

      case MetricType.LATENCY:
        if (trend.direction === 'degrading' && trend.changeRate > 20) {
          trend.factors.push({
            factor: 'Performance degradation',
            impact: Math.min(1, trend.changeRate / 100),
            description: 'Rapid latency increase indicates significant performance issues'
          });
        }
        break;
    }
  }

  /**
   * 计算数据波动性
   */
  private calculateVolatility(data: number[]): number {
    if (data.length < 3) {
      return 0;
    }

    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const squaredDiffs = data.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / data.length;
    const stdDev = Math.sqrt(variance);

    // 变异系数 (CV) = 标准差 / 平均值
    return mean !== 0 ? stdDev / Math.abs(mean) : 0;
  }

  /**
   * 检测季节性
   */
  private detectSeasonality(data: number[]): { detected: boolean; period: number; strength: number } {
    if (data.length < 10) {
      return { detected: false, period: 0, strength: 0 };
    }

    // 简单的自相关分析来检测季节性
    let maxCorrelation = 0;
    let bestPeriod = 0;

    // 尝试不同的周期长度
    for (let period = 2; period <= Math.floor(data.length / 3); period++) {
      let correlation = 0;
      let count = 0;

      for (let i = 0; i < data.length - period; i++) {
        correlation += data[i] * data[i + period];
        count++;
      }

      correlation = count > 0 ? correlation / count : 0;

      if (correlation > maxCorrelation) {
        maxCorrelation = correlation;
        bestPeriod = period;
      }
    }

    // 计算季节性强度
    const strength = maxCorrelation / (this.calculateVariance(data) || 1);

    return {
      detected: strength > 0.3,
      period: bestPeriod,
      strength: Math.min(1, strength)
    };
  }

  /**
   * 计算方差
   */
  private calculateVariance(data: number[]): number {
    if (data.length < 2) {
      return 0;
    }

    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    return data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  }

  /**
   * 计算异常值对趋势的影响
   */
  private calculateOutlierImpact(data: number[]): number {
    if (data.length < 5) {
      return 0;
    }

    // 计算原始趋势
    const originalTrend = this.calculateSimpleLinearRegression(data);

    // 移除异常值
    const cleanData = this.removeOutliers(data);
    if (cleanData.length === data.length) {
      return 0; // 没有异常值
    }

    // 计算清理后的趋势
    const cleanTrend = this.calculateSimpleLinearRegression(cleanData);

    // 计算趋势变化百分比
    const slopeChange = Math.abs((cleanTrend.slope - originalTrend.slope) / (originalTrend.slope || 0.0001));
    const interceptChange = Math.abs((cleanTrend.intercept - originalTrend.intercept) / (originalTrend.intercept || 0.0001));

    return Math.min(1, (slopeChange + interceptChange) / 2);
  }

  /**
   * 移除异常值
   */
  private removeOutliers(data: number[]): number[] {
    if (data.length < 5) {
      return [...data];
    }

    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const stdDev = Math.sqrt(data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length);

    // 移除超过3个标准差的值
    return data.filter(val => Math.abs(val - mean) <= 3 * stdDev);
  }

  /**
   * 计算简单线性回归
   */
  private calculateSimpleLinearRegression(data: number[]): { slope: number; intercept: number } {
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
  }

  /**
   * 销毁分析器
   */
  public destroy(): void {
    this.removeAllListeners();
  }
}