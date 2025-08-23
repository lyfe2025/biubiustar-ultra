import { CacheConfigs, CacheInstanceType, OptimizationSuggestion } from '../types';
import { PerformanceAnalysis } from './types';

/**
 * 性能分析器
 * 负责分析缓存配置的性能影响并生成优化建议
 */
export class PerformanceAnalyzer {
  private static readonly MEMORY_PER_ENTRY = 1024; // 假设每个条目1KB
  private static readonly MAX_RECOMMENDED_MEMORY = 100 * 1024 * 1024; // 100MB
  private static readonly OPTIMAL_TTL = 1800000; // 30分钟
  private static readonly MAX_REASONABLE_TTL = 86400000; // 24小时

  /**
   * 分析配置性能
   */
  public static analyzePerformance(config: CacheConfigs): PerformanceAnalysis {
    let totalMemoryEstimate = 0;
    const bottlenecks: string[] = [];
    const recommendations: OptimizationSuggestion[] = [];

    // 分析每个缓存实例
    for (const [instanceType, instanceConfig] of Object.entries(config)) {
      const instanceAnalysis = this.analyzeInstance(instanceType as CacheInstanceType, instanceConfig);
      
      totalMemoryEstimate += instanceAnalysis.memoryEstimate;
      bottlenecks.push(...instanceAnalysis.bottlenecks);
      recommendations.push(...instanceAnalysis.recommendations);
    }

    // 计算整体性能评分
    const performanceScore = this.calculatePerformanceScore(config, totalMemoryEstimate);

    return {
      memoryEstimate: totalMemoryEstimate,
      performanceScore,
      bottlenecks,
      recommendations
    };
  }

  /**
   * 分析单个缓存实例
   */
  private static analyzeInstance(
    instanceType: CacheInstanceType, 
    config: any
  ): {
    memoryEstimate: number;
    bottlenecks: string[];
    recommendations: OptimizationSuggestion[];
  } {
    const memoryEstimate = config.maxSize * this.MEMORY_PER_ENTRY;
    const bottlenecks: string[] = [];
    const recommendations: OptimizationSuggestion[] = [];

    // 内存使用分析
    if (memoryEstimate > this.MAX_RECOMMENDED_MEMORY) {
      bottlenecks.push(`${instanceType}: High memory usage (${Math.round(memoryEstimate / 1024 / 1024)}MB)`);
      
      recommendations.push({
        type: 'memory',
        priority: 'high',
        description: 'Reduce cache size to optimize memory usage',
        currentValue: config.maxSize,
        suggestedValue: Math.floor(this.MAX_RECOMMENDED_MEMORY / this.MEMORY_PER_ENTRY),
        expectedImpact: `Reduce memory usage to ${Math.round(this.MAX_RECOMMENDED_MEMORY / 1024 / 1024)}MB`,
        configPath: `${instanceType}.maxSize`
      });
    }

    // TTL 分析
    if (config.defaultTTL > this.MAX_REASONABLE_TTL) {
      bottlenecks.push(`${instanceType}: Very long TTL may cause stale data`);
      
      recommendations.push({
        type: 'ttl',
        priority: 'medium',
        description: 'Consider shorter TTL for better cache freshness',
        currentValue: config.defaultTTL,
        suggestedValue: this.OPTIMAL_TTL,
        expectedImpact: 'Improved data freshness and reduced memory usage',
        configPath: `${instanceType}.defaultTTL`
      });
    }

    // 清理间隔分析
    if (config.cleanupInterval > config.defaultTTL / 2) {
      bottlenecks.push(`${instanceType}: Cleanup interval too long relative to TTL`);
      
      recommendations.push({
        type: 'cleanup',
        priority: 'medium',
        description: 'Cleanup interval is too long relative to TTL',
        currentValue: config.cleanupInterval,
        suggestedValue: Math.floor(config.defaultTTL / 4),
        expectedImpact: 'More efficient memory cleanup and better performance',
        configPath: `${instanceType}.cleanupInterval`
      });
    }

    // 频繁清理分析
    if (config.cleanupInterval < 10000) {
      bottlenecks.push(`${instanceType}: Very frequent cleanup may impact performance`);
      
      recommendations.push({
        type: 'cleanup',
        priority: 'low',
        description: 'Cleanup interval is too frequent',
        currentValue: config.cleanupInterval,
        suggestedValue: 30000, // 30秒
        expectedImpact: 'Reduced CPU overhead from cleanup operations',
        configPath: `${instanceType}.cleanupInterval`
      });
    }

    // 大缓存 + 长TTL组合分析
    if (config.maxSize > 10000 && config.defaultTTL > 3600000) {
      bottlenecks.push(`${instanceType}: Large cache with long TTL combination`);
      
      recommendations.push({
        type: 'memory',
        priority: 'high',
        description: 'Large cache with long TTL may consume significant memory',
        currentValue: `${config.maxSize} entries, ${config.defaultTTL}ms TTL`,
        suggestedValue: `Reduce either maxSize to 5000 or TTL to 1800000ms`,
        expectedImpact: 'Balanced memory usage and data freshness',
        configPath: `${instanceType}.maxSize or ${instanceType}.defaultTTL`
      });
    }

    return {
      memoryEstimate,
      bottlenecks,
      recommendations
    };
  }

  /**
   * 计算性能评分 (0-100)
   */
  private static calculatePerformanceScore(config: CacheConfigs, totalMemoryEstimate: number): number {
    let score = 100;
    const instanceCount = Object.keys(config).length;

    // 内存使用评分 (40%权重)
    const memoryScore = Math.max(0, 100 - (totalMemoryEstimate / this.MAX_RECOMMENDED_MEMORY) * 40);
    score = score * 0.4 + memoryScore * 0.4;

    // TTL合理性评分 (30%权重)
    let ttlScore = 100;
    for (const instanceConfig of Object.values(config)) {
      if (instanceConfig.defaultTTL > this.MAX_REASONABLE_TTL) {
        ttlScore -= 30 / instanceCount;
      } else if (instanceConfig.defaultTTL > this.OPTIMAL_TTL * 2) {
        ttlScore -= 15 / instanceCount;
      }
    }
    score = score * 0.7 + ttlScore * 0.3;

    // 清理效率评分 (20%权重)
    let cleanupScore = 100;
    for (const instanceConfig of Object.values(config)) {
      if (instanceConfig.cleanupInterval > instanceConfig.defaultTTL / 2) {
        cleanupScore -= 20 / instanceCount;
      } else if (instanceConfig.cleanupInterval < 10000) {
        cleanupScore -= 10 / instanceCount;
      }
    }
    score = score * 0.8 + cleanupScore * 0.2;

    // 配置一致性评分 (10%权重)
    let consistencyScore = this.calculateConsistencyScore(config);
    score = score * 0.9 + consistencyScore * 0.1;

    return Math.round(Math.max(0, Math.min(100, score)));
  }

  /**
   * 计算配置一致性评分
   */
  private static calculateConsistencyScore(config: CacheConfigs): number {
    const instances = Object.values(config);
    if (instances.length <= 1) return 100;

    let score = 100;
    const avgTTL = instances.reduce((sum, cfg) => sum + cfg.defaultTTL, 0) / instances.length;
    const avgSize = instances.reduce((sum, cfg) => sum + cfg.maxSize, 0) / instances.length;

    // 检查TTL变异性
    const ttlVariance = instances.reduce((sum, cfg) => sum + Math.pow(cfg.defaultTTL - avgTTL, 2), 0) / instances.length;
    const ttlStdDev = Math.sqrt(ttlVariance);
    if (ttlStdDev > avgTTL * 0.5) {
      score -= 20; // TTL差异过大
    }

    // 检查大小变异性
    const sizeVariance = instances.reduce((sum, cfg) => sum + Math.pow(cfg.maxSize - avgSize, 2), 0) / instances.length;
    const sizeStdDev = Math.sqrt(sizeVariance);
    if (sizeStdDev > avgSize * 0.5) {
      score -= 20; // 大小差异过大
    }

    return Math.max(0, score);
  }

  /**
   * 生成优化建议
   */
  public static generateOptimizationSuggestions(config: CacheConfigs): OptimizationSuggestion[] {
    const analysis = this.analyzePerformance(config);
    
    // 按优先级排序建议
    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    
    return analysis.recommendations.sort((a, b) => {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * 估算内存使用
   */
  public static estimateMemoryUsage(config: CacheConfigs): {
    total: number;
    byInstance: Record<string, number>;
    formatted: string;
  } {
    const byInstance: Record<string, number> = {};
    let total = 0;

    for (const [instanceType, instanceConfig] of Object.entries(config)) {
      const memory = instanceConfig.maxSize * this.MEMORY_PER_ENTRY;
      byInstance[instanceType] = memory;
      total += memory;
    }

    const formatBytes = (bytes: number): string => {
      if (bytes < 1024) return `${bytes}B`;
      if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
      return `${Math.round(bytes / 1024 / 1024)}MB`;
    };

    return {
      total,
      byInstance,
      formatted: formatBytes(total)
    };
  }

  /**
   * 检查配置是否存在性能风险
   */
  public static hasPerformanceRisks(config: CacheConfigs): {
    hasRisks: boolean;
    risks: string[];
    severity: 'low' | 'medium' | 'high';
  } {
    const analysis = this.analyzePerformance(config);
    const risks: string[] = [];
    let maxSeverity: 'low' | 'medium' | 'high' = 'low';

    // 检查高优先级建议
    const highPriorityIssues = analysis.recommendations.filter(r => r.priority === 'high');
    if (highPriorityIssues.length > 0) {
      maxSeverity = 'high';
      risks.push(...highPriorityIssues.map(r => r.description));
    }

    // 检查中等优先级建议
    const mediumPriorityIssues = analysis.recommendations.filter(r => r.priority === 'medium');
    if (mediumPriorityIssues.length > 0 && maxSeverity === 'low') {
      maxSeverity = 'medium';
    }
    risks.push(...mediumPriorityIssues.map(r => r.description));

    // 检查性能评分
    if (analysis.performanceScore < 60) {
      maxSeverity = 'high';
      risks.push('Overall performance score is low');
    } else if (analysis.performanceScore < 80 && maxSeverity === 'low') {
      maxSeverity = 'medium';
    }

    return {
      hasRisks: risks.length > 0,
      risks,
      severity: maxSeverity
    };
  }
}