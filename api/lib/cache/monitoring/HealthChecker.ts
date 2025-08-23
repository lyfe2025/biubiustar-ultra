import { CacheInstanceType } from '../../../config/cache';
import { EnhancedCacheService } from '../../enhancedCache';
import { HealthCheckResult } from './types';

/**
 * 健康检查器
 * 负责执行缓存实例的健康检查
 */
export class HealthChecker {
  private healthHistory: Map<CacheInstanceType, HealthCheckResult[]> = new Map();
  private maxHistorySize = 100;

  /**
   * 执行健康检查
   */
  public async performHealthCheck(
    instanceType: CacheInstanceType,
    cacheInstance: EnhancedCacheService
  ): Promise<HealthCheckResult> {
    const timestamp = Date.now();
    const checks = {
      connectivity: false,
      responseTime: 0,
      memoryUsage: 0,
      hitRate: 0,
      errorRate: 0
    };
    const issues: string[] = [];
    let score = 100;

    try {
      // 连接性检查
      const testKey = `__health_check_${timestamp}`;
      const testValue = 'health_test';
      
      const startTime = Date.now();
      await cacheInstance.set(testKey, testValue, 1000);
      const setValue = await cacheInstance.get(testKey);
      await cacheInstance.delete(testKey);
      const endTime = Date.now();
      
      checks.connectivity = setValue === testValue;
      checks.responseTime = endTime - startTime;
      
      if (!checks.connectivity) {
        issues.push('Cache connectivity test failed');
        score -= 50;
      }
      
      if (checks.responseTime > 100) {
        issues.push(`Slow response time: ${checks.responseTime}ms`);
        score -= Math.min(30, Math.floor(checks.responseTime / 10));
      }
      
      // 获取统计信息
      const stats = cacheInstance.getStats();
      
      // 内存使用检查
      checks.memoryUsage = stats.size / stats.maxSize;
      if (checks.memoryUsage > 0.9) {
        issues.push(`High memory usage: ${(checks.memoryUsage * 100).toFixed(1)}%`);
        score -= 20;
      }
      
      // 命中率检查
      checks.hitRate = stats.hitRate;
      if (checks.hitRate < 0.7) {
        issues.push(`Low hit rate: ${(checks.hitRate * 100).toFixed(1)}%`);
        score -= 15;
      }
      
      // 错误率检查
      const totalOperations = (stats.gets || 0) + (stats.sets || 0) + (stats.deletes || 0);
      checks.errorRate = totalOperations > 0 ? (stats.errors || 0) / totalOperations : 0;
      if (checks.errorRate > 0.05) {
        issues.push(`High error rate: ${(checks.errorRate * 100).toFixed(1)}%`);
        score -= 25;
      }
      
    } catch (error) {
      checks.connectivity = false;
      issues.push(`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      score = 0;
    }

    const result: HealthCheckResult = {
      instanceType,
      timestamp,
      isHealthy: score >= 70 && checks.connectivity,
      checks,
      issues,
      score: Math.max(0, score)
    };

    // 存储健康检查历史
    this.storeHealthResult(instanceType, result);

    return result;
  }

  /**
   * 存储健康检查结果
   */
  private storeHealthResult(instanceType: CacheInstanceType, result: HealthCheckResult): void {
    const history = this.healthHistory.get(instanceType) || [];
    history.push(result);
    
    // 限制历史记录长度
    if (history.length > this.maxHistorySize) {
      history.splice(0, history.length - this.maxHistorySize);
    }
    
    this.healthHistory.set(instanceType, history);
  }

  /**
   * 获取最新健康状态
   */
  public getLatestHealth(instanceType: CacheInstanceType): HealthCheckResult | undefined {
    const history = this.healthHistory.get(instanceType) || [];
    return history[history.length - 1];
  }

  /**
   * 获取健康检查历史
   */
  public getHealthHistory(
    instanceType: CacheInstanceType,
    timeRange?: { start: number; end: number }
  ): HealthCheckResult[] {
    const history = this.healthHistory.get(instanceType) || [];
    
    if (!timeRange) {
      return [...history];
    }
    
    return history.filter(
      result => result.timestamp >= timeRange.start && result.timestamp <= timeRange.end
    );
  }

  /**
   * 获取所有实例的最新健康状态
   */
  public getAllLatestHealth(): Map<CacheInstanceType, HealthCheckResult> {
    const result = new Map<CacheInstanceType, HealthCheckResult>();
    
    for (const [instanceType, history] of this.healthHistory) {
      if (history.length > 0) {
        result.set(instanceType, history[history.length - 1]);
      }
    }
    
    return result;
  }

  /**
   * 计算健康趋势
   */
  public getHealthTrend(
    instanceType: CacheInstanceType,
    timeRange: { start: number; end: number }
  ): {
    trend: 'improving' | 'stable' | 'declining';
    averageScore: number;
    healthyPercentage: number;
  } {
    const history = this.getHealthHistory(instanceType, timeRange);
    
    if (history.length === 0) {
      return {
        trend: 'stable',
        averageScore: 0,
        healthyPercentage: 0
      };
    }
    
    const averageScore = history.reduce((sum, result) => sum + result.score, 0) / history.length;
    const healthyCount = history.filter(result => result.isHealthy).length;
    const healthyPercentage = healthyCount / history.length;
    
    // 简单的趋势分析
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    
    if (history.length >= 3) {
      const recent = history.slice(-3);
      const older = history.slice(-6, -3);
      
      if (older.length > 0) {
        const recentAvg = recent.reduce((sum, r) => sum + r.score, 0) / recent.length;
        const olderAvg = older.reduce((sum, r) => sum + r.score, 0) / older.length;
        
        if (recentAvg > olderAvg + 5) {
          trend = 'improving';
        } else if (recentAvg < olderAvg - 5) {
          trend = 'declining';
        }
      }
    }
    
    return {
      trend,
      averageScore,
      healthyPercentage
    };
  }

  /**
   * 清理历史数据
   */
  public cleanupHistory(cutoffTime: number): void {
    for (const [instanceType, history] of this.healthHistory) {
      const filteredHistory = history.filter(result => result.timestamp > cutoffTime);
      this.healthHistory.set(instanceType, filteredHistory);
    }
  }

  /**
   * 获取健康检查统计
   */
  public getHealthStats(): {
    totalChecks: number;
    healthyInstances: number;
    unhealthyInstances: number;
    averageScore: number;
  } {
    const allLatest = this.getAllLatestHealth();
    const healthyCount = Array.from(allLatest.values()).filter(result => result.isHealthy).length;
    const totalCount = allLatest.size;
    const averageScore = totalCount > 0 
      ? Array.from(allLatest.values()).reduce((sum, result) => sum + result.score, 0) / totalCount
      : 0;
    
    return {
      totalChecks: Array.from(this.healthHistory.values())
        .reduce((total, history) => total + history.length, 0),
      healthyInstances: healthyCount,
      unhealthyInstances: totalCount - healthyCount,
      averageScore
    };
  }

  /**
   * 更新配置
   */
  public updateConfig(config: any): void {
    // 更新健康检查配置
    // 这里可以添加配置验证和更新逻辑
    console.log('Health checker config updated:', config);
  }

  /**
   * 检查所有缓存实例的健康状态
   */
  public checkHealth(cacheInstances: Map<any, any>): any {
    const healthResults = new Map();
    const overallStatus = {
      isHealthy: true,
      totalInstances: cacheInstances.size,
      healthyInstances: 0,
      unhealthyInstances: 0,
      averageScore: 0,
      lastChecked: Date.now(),
      issues: [] as string[]
    };

    let totalScore = 0;
    
    for (const [instanceType, instance] of cacheInstances) {
      const latestHealth = this.getLatestHealth(instanceType);
      if (latestHealth) {
        healthResults.set(instanceType, latestHealth);
        totalScore += latestHealth.score;
        
        if (latestHealth.isHealthy) {
          overallStatus.healthyInstances++;
        } else {
          overallStatus.unhealthyInstances++;
          overallStatus.isHealthy = false;
          overallStatus.issues.push(...latestHealth.issues);
        }
      } else {
        // 如果没有健康检查历史，标记为不健康
        overallStatus.unhealthyInstances++;
        overallStatus.isHealthy = false;
        overallStatus.issues.push(`No health data for ${instanceType}`);
      }
    }
    
    overallStatus.averageScore = cacheInstances.size > 0 ? totalScore / cacheInstances.size : 0;
    
    return {
      overall: overallStatus,
      instances: healthResults
    };
  }

  /**
   * 销毁健康检查器
   */
  public destroy(): void {
    this.healthHistory.clear();
  }
}