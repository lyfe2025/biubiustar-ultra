/**
 * 缓存健康监控服务
 * 负责监控缓存失效频率、生成健康报告和优化建议
 */

export interface InvalidationStats {
  count: number;
  lastInvalidation: number;
  frequency: number; // 每分钟失效次数
  impact: 'high' | 'medium' | 'low';
  reasons: string[];
}

export interface HealthRecommendation {
  type: 'warning' | 'info' | 'success';
  message: string;
  keys?: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface HealthReport {
  totalInvalidations: number;
  highImpactKeys: Array<{
    key: string;
    frequency: number;
    count: number;
    lastInvalidation: number;
    impact: string;
  }>;
  averageFrequency: number;
  recommendations: HealthRecommendation[];
  timestamp: string;
  healthScore: number; // 0-100 健康评分
}

export class CacheHealthMonitor {
  private invalidationStats = new Map<string, InvalidationStats>();
  private readonly HIGH_FREQUENCY_THRESHOLD = 10; // 每分钟10次为高频
  private readonly MEDIUM_FREQUENCY_THRESHOLD = 5; // 每分钟5次为中频
  private readonly HEALTH_CHECK_INTERVAL = 60000; // 1分钟检查一次
  private healthCheckTimer?: NodeJS.Timeout;
  private readonly MAX_REASONS_PER_KEY = 20; // 每个键最多保留20个失效原因
  private readonly STATS_RETENTION_HOURS = 24; // 统计数据保留24小时

  constructor() {
    this.startHealthCheck();
    // 移除模拟数据初始化，专注于真实数据收集
  }

  /**
   * 记录缓存失效事件
   */
  recordInvalidation(cacheKey: string, reason: string = 'unknown'): void {
    const now = Date.now();
    const stats = this.invalidationStats.get(cacheKey) || {
      count: 0,
      lastInvalidation: 0,
      frequency: 0,
      impact: 'low' as const,
      reasons: []
    };

    // 计算失效频率（每分钟）
    if (stats.lastInvalidation > 0) {
      const timeDiffMinutes = (now - stats.lastInvalidation) / 1000 / 60;
      if (timeDiffMinutes > 0) {
        // 使用加权平均计算频率，新事件权重更高
        const weight = 0.7;
        stats.frequency = stats.frequency * (1 - weight) + (1 / timeDiffMinutes) * weight;
      }
    }

    stats.count++;
    stats.lastInvalidation = now;
    
    // 记录失效原因（最多保留最近20个）
    stats.reasons.push(reason);
    if (stats.reasons.length > this.MAX_REASONS_PER_KEY) {
      stats.reasons = stats.reasons.slice(-this.MAX_REASONS_PER_KEY);
    }

    // 评估影响级别
    stats.impact = this.calculateImpact(stats.frequency);

    this.invalidationStats.set(cacheKey, stats);
    
    // 记录日志用于调试
    console.log(`[健康监控] 记录缓存失效: ${cacheKey}, 原因: ${reason}, 频率: ${stats.frequency.toFixed(2)}/分钟, 影响: ${stats.impact}`);
  }

  /**
   * 计算影响级别
   */
  private calculateImpact(frequency: number): 'high' | 'medium' | 'low' {
    if (frequency > this.HIGH_FREQUENCY_THRESHOLD) return 'high';
    if (frequency > this.MEDIUM_FREQUENCY_THRESHOLD) return 'medium';
    return 'low';
  }

  /**
   * 获取缓存健康报告
   */
  getHealthReport(): HealthReport {
    const allStats = Array.from(this.invalidationStats.entries());
    const totalInvalidations = allStats.reduce((sum, [_, stats]) => sum + stats.count, 0);
    
    const highImpactKeys = allStats
      .filter(([_, stats]) => stats.impact === 'high')
      .map(([key, stats]) => ({
        key,
        frequency: Number(stats.frequency.toFixed(2)),
        count: stats.count,
        lastInvalidation: stats.lastInvalidation,
        impact: stats.impact
      }))
      .sort((a, b) => b.frequency - a.frequency);

    const averageFrequency = allStats.length > 0 
      ? allStats.reduce((sum, [_, stats]) => sum + stats.frequency, 0) / allStats.length 
      : 0;

    const recommendations = this.generateRecommendations(allStats);
    const healthScore = this.calculateHealthScore(allStats);

    return {
      totalInvalidations,
      highImpactKeys,
      averageFrequency: Number(averageFrequency.toFixed(2)),
      recommendations,
      timestamp: new Date().toISOString(),
      healthScore
    };
  }

  /**
   * 生成优化建议
   */
  private generateRecommendations(allStats: Array<[string, InvalidationStats]>): HealthRecommendation[] {
    const recommendations: HealthRecommendation[] = [];

    // 高频失效警告
    const highFreqKeys = allStats.filter(([_, stats]) => stats.frequency > this.HIGH_FREQUENCY_THRESHOLD);
    if (highFreqKeys.length > 0) {
      recommendations.push({
        type: 'warning',
        message: `发现${highFreqKeys.length}个高频失效缓存，建议优化失效策略或降低TTL`,
        keys: highFreqKeys.map(([key, _]) => key),
        priority: 'high'
      });
    }

    // 中频失效提醒
    const mediumFreqKeys = allStats.filter(([_, stats]) => 
      stats.frequency > this.MEDIUM_FREQUENCY_THRESHOLD && stats.frequency <= this.HIGH_FREQUENCY_THRESHOLD
    );
    if (mediumFreqKeys.length > 0) {
      recommendations.push({
        type: 'info',
        message: `${mediumFreqKeys.length}个缓存失效频率较高，建议监控其变化趋势`,
        keys: mediumFreqKeys.map(([key, _]) => key),
        priority: 'medium'
      });
    }

    // 整体健康状况
    const totalKeys = allStats.length;
    const healthyKeys = allStats.filter(([_, stats]) => stats.frequency <= this.MEDIUM_FREQUENCY_THRESHOLD).length;
    
    if (totalKeys > 0) {
      const healthyRatio = healthyKeys / totalKeys;
      if (healthyRatio > 0.8) {
        recommendations.push({
          type: 'success',
          message: '缓存整体健康状况良好，失效频率在合理范围内',
          priority: 'low'
        });
      } else if (healthyRatio < 0.5) {
        recommendations.push({
          type: 'warning',
          message: '缓存整体健康状况需要关注，建议全面检查缓存策略',
          priority: 'high'
        });
      }
    }

    return recommendations;
  }

  /**
   * 计算健康评分 (0-100)
   */
  private calculateHealthScore(allStats: Array<[string, InvalidationStats]>): number {
    if (allStats.length === 0) return 100;

    const totalKeys = allStats.length;
    const highImpactKeys = allStats.filter(([_, stats]) => stats.impact === 'high').length;
    const mediumImpactKeys = allStats.filter(([_, stats]) => stats.impact === 'medium').length;
    const lowImpactKeys = allStats.filter(([_, stats]) => stats.impact === 'low').length;

    // 改进的权重计算：考虑频率和影响
    let totalScore = 0;
    
    for (const [_, stats] of allStats) {
      let keyScore = 100;
      
      // 基于频率的评分调整
      if (stats.frequency > this.HIGH_FREQUENCY_THRESHOLD) {
        keyScore -= 40; // 高频失效扣分
      } else if (stats.frequency > this.MEDIUM_FREQUENCY_THRESHOLD) {
        keyScore -= 20; // 中频失效扣分
      }
      
      // 基于影响级别的评分调整
      if (stats.impact === 'high') {
        keyScore -= 30;
      } else if (stats.impact === 'medium') {
        keyScore -= 15;
      }
      
      // 基于失效次数的评分调整
      if (stats.count > 100) {
        keyScore -= 20;
      } else if (stats.count > 50) {
        keyScore -= 10;
      }
      
      totalScore += Math.max(0, keyScore);
    }
    
    const averageScore = totalScore / totalKeys;
    return Math.round(Math.max(0, Math.min(100, averageScore)));
  }

  /**
   * 获取特定缓存键的统计信息
   */
  getKeyStats(cacheKey: string): InvalidationStats | null {
    return this.invalidationStats.get(cacheKey) || null;
  }

  /**
   * 清理过期统计数据（超过24小时的数据）
   */
  private cleanupExpiredStats(): void {
    const now = Date.now();
    const expireTime = this.STATS_RETENTION_HOURS * 60 * 60 * 1000; // 24小时

    const entries = Array.from(this.invalidationStats.entries());
    for (const [key, stats] of entries) {
      if (now - stats.lastInvalidation > expireTime) {
        this.invalidationStats.delete(key);
      }
    }
  }

  /**
   * 启动健康检查定时器
   */
  private startHealthCheck(): void {
    this.healthCheckTimer = setInterval(() => {
      this.cleanupExpiredStats();
      this.logHealthStatus();
    }, this.HEALTH_CHECK_INTERVAL);
  }

  /**
   * 记录健康状态日志
   */
  private logHealthStatus(): void {
    const overview = this.getStatsOverview();
    const healthReport = this.getHealthReport();
    
    console.log(`[健康监控] 状态概览: 总键数=${overview.totalKeys}, 高影响=${overview.highImpactCount}, 中影响=${overview.mediumImpactCount}, 低影响=${overview.lowImpactCount}, 健康评分=${healthReport.healthScore}`);
    
    // 如果有高影响键，记录详细信息
    if (overview.highImpactCount > 0) {
      const entries = Array.from(this.invalidationStats.entries());
      const highImpactKeys = entries
        .filter(([_, stats]) => stats.impact === 'high')
        .map(([key, stats]) => `${key}(${stats.frequency.toFixed(2)}/分钟)`);
      
      console.warn(`[健康监控] 高影响缓存键: ${highImpactKeys.join(', ')}`);
    }
  }

  /**
   * 停止健康检查
   */
  stopHealthCheck(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }
  }

  /**
   * 重置所有统计数据
   */
  reset(): void {
    this.invalidationStats.clear();
  }

  /**
   * 获取统计概览
   */
  getStatsOverview() {
    return {
      totalKeys: this.invalidationStats.size,
      highImpactCount: Array.from(this.invalidationStats.values()).filter(s => s.impact === 'high').length,
      mediumImpactCount: Array.from(this.invalidationStats.values()).filter(s => s.impact === 'medium').length,
      lowImpactCount: Array.from(this.invalidationStats.values()).filter(s => s.impact === 'low').length
    };
  }

  /**
   * 获取实时健康状态
   */
  getRealTimeHealthStatus() {
    const now = Date.now();
    const entries = Array.from(this.invalidationStats.entries());
    const recentStats = entries
      .filter(([_, stats]) => now - stats.lastInvalidation < 5 * 60 * 1000) // 最近5分钟
      .map(([key, stats]) => ({
        key,
        count: stats.count,
        frequency: stats.frequency,
        impact: stats.impact,
        lastInvalidation: stats.lastInvalidation,
        timeSinceLast: Math.round((now - stats.lastInvalidation) / 1000 / 60) // 分钟
      }))
      .sort((a, b) => b.frequency - a.frequency);

    return {
      recentInvalidations: recentStats,
      totalRecentKeys: recentStats.length,
      highFrequencyKeys: recentStats.filter(s => s.frequency > this.HIGH_FREQUENCY_THRESHOLD).length,
      mediumFrequencyKeys: recentStats.filter(s => s.frequency > this.MEDIUM_FREQUENCY_THRESHOLD && s.frequency <= this.HIGH_FREQUENCY_THRESHOLD).length,
      timestamp: new Date().toISOString()
    };
  }
}

// 单例实例
export const cacheHealthMonitor = new CacheHealthMonitor();