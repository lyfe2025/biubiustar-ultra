/**
 * 缓存效率分析器
 * 负责分析缓存效率并生成优化建议
 */

import { EventEmitter } from 'events';
import { 
  MetricType, 
  CacheEfficiencyAnalysis, 
  ComparisonAnalysis, 
  TimeRange 
} from './types';
import { CacheInstanceType } from '../../../config/cache';

export class EfficiencyAnalyzer extends EventEmitter {
  constructor() {
    super();
  }

  /**
   * 分析缓存效率
   */
  public analyzeCacheEfficiency(
    instanceType: CacheInstanceType,
    hitRateData: number[],
    memoryData: number[],
    throughputData: number[],
    timeRange: TimeRange = TimeRange.LAST_DAY
  ): CacheEfficiencyAnalysis {
    const hitRateAnalysis = this.analyzeHitRate(hitRateData);
    const memoryEfficiency = this.analyzeMemoryEfficiency(memoryData);
    const keyPatternAnalysis = this.analyzeKeyPatterns(instanceType);
    const recommendations = this.generateEfficiencyRecommendations(
      hitRateAnalysis,
      memoryEfficiency,
      keyPatternAnalysis
    );

    const analysis: CacheEfficiencyAnalysis = {
      instanceType,
      timeRange,
      hitRateAnalysis,
      memoryEfficiency,
      keyPatternAnalysis,
      recommendations
    };

    this.emit('efficiencyAnalyzed', analysis);
    return analysis;
  }

  /**
   * 分析命中率
   */
  private analyzeHitRate(hitRateData: number[]): {
    average: number;
    trend: 'up' | 'down' | 'stable';
    potentialImprovement: number;
  } {
    if (hitRateData.length === 0) {
      return {
        average: 0,
        trend: 'stable',
        potentialImprovement: 0
      };
    }

    const average = hitRateData.reduce((sum, val) => sum + val, 0) / hitRateData.length;
    const trend = this.calculateTrend(hitRateData);
    
    // 计算潜在改进空间
    const maxPossibleHitRate = 0.95; // 假设最大可能命中率为95%
    const potentialImprovement = Math.max(0, maxPossibleHitRate - average);

    return {
      average,
      trend,
      potentialImprovement
    };
  }

  /**
   * 分析内存效率
   */
  private analyzeMemoryEfficiency(memoryData: number[]): {
    utilization: number;
    wastedSpace: number;
    optimizationPotential: number;
  } {
    if (memoryData.length === 0) {
      return {
        utilization: 0,
        wastedSpace: 0,
        optimizationPotential: 0
      };
    }

    const averageUtilization = memoryData.reduce((sum, val) => sum + val, 0) / memoryData.length;
    
    // 计算浪费的空间（基于理想利用率80%）
    const idealUtilization = 0.8;
    const wastedSpace = Math.max(0, averageUtilization - idealUtilization);
    
    // 计算优化潜力
    const optimizationPotential = this.calculateMemoryOptimizationPotential(memoryData);

    return {
      utilization: averageUtilization,
      wastedSpace,
      optimizationPotential
    };
  }

  /**
   * 计算内存优化潜力
   */
  private calculateMemoryOptimizationPotential(memoryData: number[]): number {
    if (memoryData.length < 3) {
      return 0;
    }

    // 计算内存使用的波动性
    const mean = memoryData.reduce((sum, val) => sum + val, 0) / memoryData.length;
    const variance = memoryData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / memoryData.length;
    const stdDev = Math.sqrt(variance);
    
    // 高波动性表示有优化空间
    const volatility = mean > 0 ? stdDev / mean : 0;
    
    // 检查是否有明显的内存泄漏趋势
    const trend = this.calculateTrend(memoryData);
    const leakageFactor = trend === 'up' ? 0.3 : 0;
    
    return Math.min(1, volatility + leakageFactor);
  }

  /**
   * 分析键模式
   */
  private analyzeKeyPatterns(instanceType: CacheInstanceType): {
    pattern: string;
    frequency: number;
    hitRate: number;
  }[] {
    // 这里应该从实际的缓存实例中获取键模式数据
    // 目前返回模拟数据
    const patterns = [
      {
        pattern: 'user:*',
        frequency: 0.4,
        hitRate: 0.85
      },
      {
        pattern: 'session:*',
        frequency: 0.3,
        hitRate: 0.92
      },
      {
        pattern: 'cache:*',
        frequency: 0.2,
        hitRate: 0.78
      },
      {
        pattern: 'temp:*',
        frequency: 0.1,
        hitRate: 0.45
      }
    ];

    return patterns;
  }

  /**
   * 生成效率优化建议
   */
  private generateEfficiencyRecommendations(
    hitRateAnalysis: any,
    memoryEfficiency: any,
    keyPatternAnalysis: any[]
  ): string[] {
    const recommendations: string[] = [];

    // 命中率相关建议
    if (hitRateAnalysis.average < 0.7) {
      recommendations.push('命中率较低，建议增加缓存大小或调整TTL设置');
    }
    
    if (hitRateAnalysis.trend === 'down') {
      recommendations.push('命中率呈下降趋势，建议检查数据访问模式变化');
    }
    
    if (hitRateAnalysis.potentialImprovement > 0.2) {
      recommendations.push(`命中率有${(hitRateAnalysis.potentialImprovement * 100).toFixed(1)}%的提升空间，建议优化缓存策略`);
    }

    // 内存效率相关建议
    if (memoryEfficiency.utilization > 0.9) {
      recommendations.push('内存使用率过高，建议增加内存容量或优化数据结构');
    }
    
    if (memoryEfficiency.wastedSpace > 0.1) {
      recommendations.push(`检测到${(memoryEfficiency.wastedSpace * 100).toFixed(1)}%的内存浪费，建议优化内存分配`);
    }
    
    if (memoryEfficiency.optimizationPotential > 0.3) {
      recommendations.push('内存使用模式不稳定，建议实施内存优化策略');
    }

    // 键模式相关建议
    const lowHitRatePatterns = keyPatternAnalysis.filter(pattern => pattern.hitRate < 0.6);
    if (lowHitRatePatterns.length > 0) {
      recommendations.push(`发现低命中率键模式：${lowHitRatePatterns.map(p => p.pattern).join(', ')}，建议优化这些模式的缓存策略`);
    }
    
    const highFrequencyLowHitRate = keyPatternAnalysis.filter(pattern => 
      pattern.frequency > 0.2 && pattern.hitRate < 0.8
    );
    if (highFrequencyLowHitRate.length > 0) {
      recommendations.push('高频访问但低命中率的键模式需要特别关注和优化');
    }

    return recommendations;
  }

  /**
   * 比较分析
   */
  public compareMetrics(
    metric: MetricType,
    timeRange: TimeRange,
    baseline: { instanceType: CacheInstanceType; data: number[] },
    comparison: { instanceType: CacheInstanceType; data: number[] }
  ): ComparisonAnalysis {
    const baselineValue = baseline.data.length > 0 ? 
      baseline.data.reduce((sum, val) => sum + val, 0) / baseline.data.length : 0;
    
    const comparisonValue = comparison.data.length > 0 ? 
      comparison.data.reduce((sum, val) => sum + val, 0) / comparison.data.length : 0;
    
    const absoluteDifference = comparisonValue - baselineValue;
    const percentageDifference = baselineValue !== 0 ? 
      (absoluteDifference / baselineValue) * 100 : 0;
    
    const factors = this.identifyComparisonFactors(
      metric,
      baseline,
      comparison,
      absoluteDifference
    );

    const analysis: ComparisonAnalysis = {
      metric,
      timeRange,
      baseline: {
        instanceType: baseline.instanceType,
        value: baselineValue
      },
      comparison: {
        instanceType: comparison.instanceType,
        value: comparisonValue
      },
      difference: {
        absolute: absoluteDifference,
        percentage: percentageDifference
      },
      factors
    };

    this.emit('comparisonAnalyzed', analysis);
    return analysis;
  }

  /**
   * 识别比较因素
   */
  private identifyComparisonFactors(
    metric: MetricType,
    baseline: any,
    comparison: any,
    difference: number
  ): string[] {
    const factors: string[] = [];

    switch (metric) {
      case MetricType.HIT_RATE:
        if (Math.abs(difference) > 0.1) {
          factors.push('缓存配置差异');
          factors.push('数据访问模式不同');
          factors.push('缓存大小差异');
        }
        break;

      case MetricType.MEMORY_USAGE:
        if (Math.abs(difference) > 0.2) {
          factors.push('数据结构差异');
          factors.push('缓存策略不同');
          factors.push('内存分配策略差异');
        }
        break;

      case MetricType.LATENCY:
        if (Math.abs(difference) > 50) {
          factors.push('网络环境差异');
          factors.push('硬件性能差异');
          factors.push('负载水平不同');
        }
        break;

      case MetricType.THROUGHPUT:
        if (Math.abs(difference) > 100) {
          factors.push('并发处理能力差异');
          factors.push('资源配置不同');
          factors.push('优化程度差异');
        }
        break;

      default:
        factors.push('配置差异');
        factors.push('环境差异');
    }

    return factors;
  }

  /**
   * 计算趋势
   */
  private calculateTrend(data: number[]): 'up' | 'down' | 'stable' {
    if (data.length < 2) {
      return 'stable';
    }

    const recentData = data.slice(-Math.min(10, data.length));
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
   * 生成综合效率报告
   */
  public generateEfficiencyReport(
    instanceType: CacheInstanceType,
    metricsData: {
      hitRate: number[];
      memoryUsage: number[];
      throughput: number[];
      latency: number[];
    },
    timeRange: TimeRange = TimeRange.LAST_DAY
  ): {
    overallScore: number;
    categoryScores: {
      hitRate: number;
      memoryEfficiency: number;
      performance: number;
    };
    recommendations: string[];
    priorityActions: string[];
  } {
    // 计算各项得分
    const hitRateScore = this.calculateHitRateScore(metricsData.hitRate);
    const memoryScore = this.calculateMemoryScore(metricsData.memoryUsage);
    const performanceScore = this.calculatePerformanceScore(
      metricsData.throughput,
      metricsData.latency
    );

    // 计算综合得分
    const overallScore = (hitRateScore * 0.4 + memoryScore * 0.3 + performanceScore * 0.3);

    // 生成建议和优先行动
    const recommendations = this.generateComprehensiveRecommendations(
      hitRateScore,
      memoryScore,
      performanceScore
    );
    
    const priorityActions = this.identifyPriorityActions(
      hitRateScore,
      memoryScore,
      performanceScore
    );

    const report = {
      overallScore,
      categoryScores: {
        hitRate: hitRateScore,
        memoryEfficiency: memoryScore,
        performance: performanceScore
      },
      recommendations,
      priorityActions
    };

    this.emit('efficiencyReportGenerated', { instanceType, report });
    return report;
  }

  /**
   * 计算命中率得分
   */
  private calculateHitRateScore(hitRateData: number[]): number {
    if (hitRateData.length === 0) return 0;
    
    const average = hitRateData.reduce((sum, val) => sum + val, 0) / hitRateData.length;
    return Math.min(100, average * 100);
  }

  /**
   * 计算内存得分
   */
  private calculateMemoryScore(memoryData: number[]): number {
    if (memoryData.length === 0) return 0;
    
    const average = memoryData.reduce((sum, val) => sum + val, 0) / memoryData.length;
    // 理想内存使用率在60-80%之间
    if (average >= 0.6 && average <= 0.8) {
      return 100;
    } else if (average < 0.6) {
      return 50 + (average / 0.6) * 50;
    } else {
      return Math.max(0, 100 - (average - 0.8) * 500);
    }
  }

  /**
   * 计算性能得分
   */
  private calculatePerformanceScore(throughputData: number[], latencyData: number[]): number {
    let score = 0;
    let factors = 0;

    if (throughputData.length > 0) {
      const avgThroughput = throughputData.reduce((sum, val) => sum + val, 0) / throughputData.length;
      // 假设1000 ops/s为满分
      score += Math.min(100, (avgThroughput / 1000) * 100);
      factors++;
    }

    if (latencyData.length > 0) {
      const avgLatency = latencyData.reduce((sum, val) => sum + val, 0) / latencyData.length;
      // 延迟越低得分越高，100ms为满分
      score += Math.max(0, 100 - avgLatency / 10);
      factors++;
    }

    return factors > 0 ? score / factors : 0;
  }

  /**
   * 生成综合建议
   */
  private generateComprehensiveRecommendations(
    hitRateScore: number,
    memoryScore: number,
    performanceScore: number
  ): string[] {
    const recommendations: string[] = [];

    if (hitRateScore < 70) {
      recommendations.push('优化缓存策略以提高命中率');
      recommendations.push('分析访问模式并调整缓存大小');
    }

    if (memoryScore < 70) {
      recommendations.push('优化内存使用效率');
      recommendations.push('实施更好的内存管理策略');
    }

    if (performanceScore < 70) {
      recommendations.push('优化系统性能配置');
      recommendations.push('考虑硬件升级或架构优化');
    }

    return recommendations;
  }

  /**
   * 识别优先行动
   */
  private identifyPriorityActions(
    hitRateScore: number,
    memoryScore: number,
    performanceScore: number
  ): string[] {
    const actions: string[] = [];
    const scores = [
      { name: 'hitRate', score: hitRateScore },
      { name: 'memory', score: memoryScore },
      { name: 'performance', score: performanceScore }
    ].sort((a, b) => a.score - b.score);

    // 优先处理得分最低的项目
    const lowestScore = scores[0];
    if (lowestScore.score < 50) {
      switch (lowestScore.name) {
        case 'hitRate':
          actions.push('立即检查和优化缓存命中率');
          break;
        case 'memory':
          actions.push('立即优化内存使用');
          break;
        case 'performance':
          actions.push('立即检查性能瓶颈');
          break;
      }
    }

    return actions;
  }

  /**
   * 销毁分析器
   */
  public destroy(): void {
    this.removeAllListeners();
  }
}