/**
 * 缓存调试工具
 * 提供缓存分析和调试功能
 */

import { EnhancedCacheService } from '../lib/enhancedCache.js';
import { userCache, contentCache, statsCache, configCache } from '../lib/cacheInstances.js';

// 缓存实例映射
const cacheInstances = {
  user: userCache,
  content: contentCache,
  stats: statsCache,
  config: configCache
};

/**
 * 缓存调试器类
 */
export class CacheDebugger {
  /**
   * 获取所有缓存的详细统计信息
   */
  static getAllCacheStats() {
    const stats: any = {
      timestamp: new Date().toISOString(),
      caches: {},
      summary: {
        totalSize: 0,
        totalMaxSize: 0,
        totalHits: 0,
        totalMisses: 0,
        averageHitRate: 0
      },
      memory: process.memoryUsage()
    };

    let totalHitRate = 0;
    let cacheCount = 0;

    for (const [name, cache] of Object.entries(cacheInstances)) {
      const cacheStats = cache.getStats();
      stats.caches[name] = {
        ...cacheStats,
        utilizationRate: (cacheStats.size / cacheStats.maxSize) * 100,
        hitRate: cacheStats.hitRate
      };

      // 累计汇总数据
      stats.summary.totalSize += cacheStats.size;
      stats.summary.totalMaxSize += cacheStats.maxSize;
      stats.summary.totalHits += cacheStats.totalHits;
      stats.summary.totalMisses += cacheStats.totalMisses;
      // Note: sets and deletes are not available in CacheStats interface
      // stats.summary.totalSets += cacheStats.sets;
      // stats.summary.totalDeletes += cacheStats.deletes;
      
      totalHitRate += stats.caches[name].hitRate;
      cacheCount++;
    }

    stats.summary.averageHitRate = cacheCount > 0 ? totalHitRate / cacheCount : 0;
    stats.summary.overallUtilization = stats.summary.totalMaxSize > 0 
      ? (stats.summary.totalSize / stats.summary.totalMaxSize) * 100 
      : 0;

    return stats;
  }

  /**
   * 分析缓存性能
   */
  static analyzeCachePerformance(cacheName?: string) {
    const analysis: any = {
      timestamp: new Date().toISOString(),
      analysis: {}
    };

    const cachesToAnalyze = cacheName 
      ? { [cacheName]: cacheInstances[cacheName as keyof typeof cacheInstances] }
      : cacheInstances;

    for (const [name, cache] of Object.entries(cachesToAnalyze)) {
      if (!cache) continue;

      const stats = cache.getStats();
      const hitRate = stats.totalHits + stats.totalMisses > 0
        ? (stats.totalHits / (stats.totalHits + stats.totalMisses)) * 100 
        : 0;
      
      const utilizationRate = (stats.size / stats.maxSize) * 100;
      
      analysis.analysis[name] = {
        stats,
        performance: {
          hitRate,
          utilizationRate,
          efficiency: hitRate * (utilizationRate / 100), // 综合效率指标
        },
        recommendations: this.generateRecommendations(stats, hitRate, utilizationRate),
        health: this.assessCacheHealth(stats, hitRate, utilizationRate)
      };
    }

    return analysis;
  }

  /**
   * 生成缓存优化建议
   */
  private static generateRecommendations(stats: any, hitRate: number, utilizationRate: number): string[] {
    const recommendations: string[] = [];

    // 命中率分析
    if (hitRate < 50) {
      recommendations.push('命中率过低，考虑调整缓存策略或增加TTL时间');
    } else if (hitRate < 70) {
      recommendations.push('命中率偏低，建议优化缓存键设计或预热策略');
    } else if (hitRate > 95) {
      recommendations.push('命中率很高，可以考虑减少缓存大小以节省内存');
    }

    // 利用率分析
    if (utilizationRate > 90) {
      recommendations.push('缓存利用率过高，建议增加maxSize或优化清理策略');
    } else if (utilizationRate < 30) {
      recommendations.push('缓存利用率较低，可以考虑减少maxSize以节省内存');
    }

    // 操作频率分析
    const totalOps = stats.totalHits + stats.totalMisses;
    if (totalOps > 0) {
      // Note: delete operations are not tracked in current CacheStats
      // const deleteRate = (stats.deletes / totalOps) * 100;
      // if (deleteRate > 20) {
      //   recommendations.push('删除操作频率较高，检查是否存在频繁的缓存失效');
      // }
    }

    // 内存使用分析
    if (stats.size > stats.maxSize * 0.8) {
      recommendations.push('接近缓存容量上限，考虑优化数据结构或增加容量');
    }

    return recommendations;
  }

  /**
   * 评估缓存健康状态
   */
  private static assessCacheHealth(stats: any, hitRate: number, utilizationRate: number): string {
    let score = 0;
    
    // 命中率评分 (40%权重)
    if (hitRate >= 80) score += 40;
    else if (hitRate >= 60) score += 30;
    else if (hitRate >= 40) score += 20;
    else score += 10;
    
    // 利用率评分 (30%权重)
    if (utilizationRate >= 50 && utilizationRate <= 80) score += 30;
    else if (utilizationRate >= 30 && utilizationRate <= 90) score += 20;
    else score += 10;
    
    // 操作平衡性评分 (30%权重)
    const totalOps = stats.totalHits + stats.totalMisses;
    if (totalOps > 0) {
      // Note: set/delete operations are not tracked in current CacheStats
      // Use hit rate as a proxy for operation balance
      if (hitRate >= 70) score += 30;
      else if (hitRate >= 50) score += 20;
      else score += 10;
    }
    
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  /**
   * 获取缓存热点数据分析
   */
  static getHotspotAnalysis(cacheName: string, topN: number = 10) {
    const cache = cacheInstances[cacheName as keyof typeof cacheInstances];
    if (!cache) {
      throw new Error(`Cache '${cacheName}' not found`);
    }

    // 获取缓存内部数据（需要访问私有属性）
    const cacheData = (cache as any).cache || {};
    const accessCounts = (cache as any).accessCounts || {};
    
    const hotspots = Object.entries(accessCounts)
      .map(([key, count]) => ({
        key,
        accessCount: count as number,
        hasData: key in cacheData,
        dataSize: key in cacheData ? JSON.stringify(cacheData[key]).length : 0
      }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, topN);

    return {
      cacheName,
      topN,
      hotspots,
      totalKeys: Object.keys(cacheData).length,
      totalAccessCounts: Object.values(accessCounts).reduce((sum: number, count) => sum + (count as number), 0),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 内存使用分析
   */
  static getMemoryAnalysis() {
    const memUsage = process.memoryUsage();
    const stats = this.getAllCacheStats();
    
    // 估算缓存占用的内存
    let estimatedCacheMemory = 0;
    for (const [name, cache] of Object.entries(cacheInstances)) {
      const cacheData = (cache as any).cache || {};
      for (const [key, value] of Object.entries(cacheData)) {
        estimatedCacheMemory += JSON.stringify({ key, value }).length * 2; // 粗略估算
      }
    }

    return {
      timestamp: new Date().toISOString(),
      processMemory: {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
        arrayBuffers: memUsage.arrayBuffers
      },
      memoryInMB: {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024)
      },
      cacheMemory: {
        estimatedBytes: estimatedCacheMemory,
        estimatedMB: Math.round(estimatedCacheMemory / 1024 / 1024),
        percentageOfHeap: (estimatedCacheMemory / memUsage.heapUsed) * 100
      },
      cacheStats: stats.summary
    };
  }

  /**
   * 缓存数据导出
   */
  static exportCacheData(cacheName: string, includeValues: boolean = false) {
    const cache = cacheInstances[cacheName as keyof typeof cacheInstances];
    if (!cache) {
      throw new Error(`Cache '${cacheName}' not found`);
    }

    const cacheData = (cache as any).cache || {};
    const ttlData = (cache as any).ttl || {};
    const accessCounts = (cache as any).accessCounts || {};
    
    const exportData = {
      cacheName,
      timestamp: new Date().toISOString(),
      stats: cache.getStats(),
      keys: Object.keys(cacheData).map(key => ({
        key,
        hasValue: includeValues,
        value: includeValues ? cacheData[key] : '[HIDDEN]',
        ttl: ttlData[key] || null,
        accessCount: accessCounts[key] || 0,
        size: JSON.stringify(cacheData[key]).length
      }))
    };

    return exportData;
  }

  /**
   * 缓存一致性检查
   */
  static async checkCacheConsistency(cacheName: string, sampleSize: number = 10) {
    const cache = cacheInstances[cacheName as keyof typeof cacheInstances];
    if (!cache) {
      throw new Error(`Cache '${cacheName}' not found`);
    }

    const cacheData = (cache as any).cache || {};
    const keys = Object.keys(cacheData);
    const sampleKeys = keys.slice(0, Math.min(sampleSize, keys.length));
    
    const results = {
      cacheName,
      sampleSize: sampleKeys.length,
      totalKeys: keys.length,
      checks: [] as any[],
      summary: {
        consistent: 0,
        inconsistent: 0,
        errors: 0
      },
      timestamp: new Date().toISOString()
    };

    for (const key of sampleKeys) {
      try {
        const directValue = cacheData[key];
        const getValue = await cache.get(key);
        
        const isConsistent = JSON.stringify(directValue) === JSON.stringify(getValue);
        
        results.checks.push({
          key,
          consistent: isConsistent,
          directValue: directValue ? '[EXISTS]' : '[NULL]',
          getValue: getValue ? '[EXISTS]' : '[NULL]'
        });
        
        if (isConsistent) {
          results.summary.consistent++;
        } else {
          results.summary.inconsistent++;
        }
      } catch (error) {
        results.checks.push({
          key,
          error: (error as Error).message
        });
        results.summary.errors++;
      }
    }

    return results;
  }

  /**
   * 生成缓存报告
   */
  static generateReport() {
    const stats = this.getAllCacheStats();
    const performance = this.analyzeCachePerformance();
    const memory = this.getMemoryAnalysis();
    
    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalCaches: Object.keys(cacheInstances).length,
        overallHealth: this.calculateOverallHealth(performance),
        memoryUsage: memory.memoryInMB,
        recommendations: this.generateGlobalRecommendations(stats, memory)
      },
      details: {
        stats,
        performance,
        memory
      }
    };
  }

  /**
   * 计算整体健康状态
   */
  private static calculateOverallHealth(performance: any): string {
    const healthScores = Object.values(performance.analysis).map((cache: any) => {
      switch (cache.health) {
        case 'excellent': return 4;
        case 'good': return 3;
        case 'fair': return 2;
        case 'poor': return 1;
        default: return 0;
      }
    });
    
    const averageScore = healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length;
    
    if (averageScore >= 3.5) return 'excellent';
    if (averageScore >= 2.5) return 'good';
    if (averageScore >= 1.5) return 'fair';
    return 'poor';
  }

  /**
   * 生成全局优化建议
   */
  private static generateGlobalRecommendations(stats: any, memory: any): string[] {
    const recommendations: string[] = [];
    
    // 内存使用建议
    if (memory.memoryInMB.heapUsed > 500) {
      recommendations.push('堆内存使用较高，考虑优化缓存大小或实现更积极的清理策略');
    }
    
    // 缓存利用率建议
    if (stats.summary.overallUtilization > 85) {
      recommendations.push('整体缓存利用率较高，考虑增加缓存容量或优化数据结构');
    } else if (stats.summary.overallUtilization < 30) {
      recommendations.push('整体缓存利用率较低，可以考虑减少缓存容量以节省内存');
    }
    
    // 命中率建议
    if (stats.summary.averageHitRate < 60) {
      recommendations.push('平均命中率较低，建议检查缓存策略和键设计');
    }
    
    return recommendations;
  }
}

/**
 * 缓存监控器 - 用于实时监控
 */
export class CacheMonitor {
  private static intervals: NodeJS.Timeout[] = [];
  private static isMonitoring = false;
  
  /**
   * 开始监控
   */
  static startMonitoring(intervalMs: number = 60000) {
    if (this.isMonitoring) {
      console.log('Cache monitoring is already running');
      return;
    }
    
    this.isMonitoring = true;
    
    // 定期输出缓存统计
    const statsInterval = setInterval(() => {
      const stats = CacheDebugger.getAllCacheStats();
      console.log('=== Cache Stats ===');
      console.log(`Total Size: ${stats.summary.totalSize}/${stats.summary.totalMaxSize}`);
      console.log(`Hit Rate: ${stats.summary.averageHitRate.toFixed(2)}%`);
      console.log(`Memory: ${stats.memory.heapUsed / 1024 / 1024} MB`);
      
      for (const [name, cache] of Object.entries(stats.caches)) {
        console.log(`${name}: ${(cache as any).size}/${(cache as any).maxSize} (${(cache as any).hitRate.toFixed(1)}%)`);
      }
    }, intervalMs);
    
    this.intervals.push(statsInterval);
    
    console.log(`Cache monitoring started with ${intervalMs}ms interval`);
  }
  
  /**
   * 停止监控
   */
  static stopMonitoring() {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    this.isMonitoring = false;
    console.log('Cache monitoring stopped');
  }
  
  /**
   * 获取监控状态
   */
  static getMonitoringStatus() {
    return {
      isMonitoring: this.isMonitoring,
      activeIntervals: this.intervals.length
    };
  }
}