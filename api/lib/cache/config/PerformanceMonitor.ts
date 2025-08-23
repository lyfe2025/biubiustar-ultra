import { CacheInstanceType, PerformanceReport, PerformanceMonitorOptions, OptimizationSuggestion } from './types';
import { EventEmitter } from 'events';

/**
 * 性能监控器
 * 负责监控缓存性能并生成报告和优化建议
 */
export class PerformanceMonitor extends EventEmitter {
  private monitoringIntervals: Map<CacheInstanceType, NodeJS.Timeout> = new Map();
  private performanceData: Map<CacheInstanceType, PerformanceReport[]> = new Map();
  private options: PerformanceMonitorOptions;
  private isMonitoring: boolean = false;

  constructor(options: PerformanceMonitorOptions) {
    super();
    this.options = {
      enabled: true,
      reportInterval: 60000, // 1 minute
      collectDetailedStats: true,
      alertThresholds: {
        hitRate: 0.8, // 80%
        memoryUsage: 0.9, // 90%
        responseTime: 100 // 100ms
      },
      ...options
    };
  }

  /**
   * 开始监控
   */
  public startMonitoring(instanceTypes: CacheInstanceType[]): void {
    if (!this.options.enabled) {
      console.log('Performance monitoring is disabled');
      return;
    }

    this.isMonitoring = true;
    
    instanceTypes.forEach(instanceType => {
      this.startInstanceMonitoring(instanceType);
    });

    console.log(`Performance monitoring started for: ${instanceTypes.join(', ')}`);
  }

  /**
   * 停止监控
   */
  public stopMonitoring(): void {
    this.isMonitoring = false;
    
    this.monitoringIntervals.forEach((interval, instanceType) => {
      clearInterval(interval);
      console.log(`Stopped monitoring for ${instanceType}`);
    });
    
    this.monitoringIntervals.clear();
    console.log('Performance monitoring stopped');
  }

  /**
   * 开始单个实例监控
   */
  private startInstanceMonitoring(instanceType: CacheInstanceType): void {
    // 清除现有的监控间隔
    const existingInterval = this.monitoringIntervals.get(instanceType);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // 设置新的监控间隔
    const interval = setInterval(() => {
      this.collectPerformanceData(instanceType);
    }, this.options.reportInterval);

    this.monitoringIntervals.set(instanceType, interval);
  }

  /**
   * 收集性能数据
   */
  private async collectPerformanceData(instanceType: CacheInstanceType): Promise<void> {
    try {
      const report = await this.generatePerformanceReport(instanceType);
      
      // 存储报告
      if (!this.performanceData.has(instanceType)) {
        this.performanceData.set(instanceType, []);
      }
      
      const reports = this.performanceData.get(instanceType)!;
      reports.push(report);
      
      // 保持最近100个报告
      if (reports.length > 100) {
        reports.shift();
      }

      // 检查警报阈值
      this.checkAlertThresholds(report);

      // 发出性能报告事件
      this.emit('performanceReport', report);
      
    } catch (error) {
      console.error(`Failed to collect performance data for ${instanceType}:`, error);
    }
  }

  /**
   * 生成性能报告
   */
  public async generatePerformanceReport(instanceType: CacheInstanceType): Promise<PerformanceReport> {
    // 这里需要从实际的缓存实例获取统计数据
    // 由于我们在分离过程中，这里使用模拟数据
    const mockStats = this.getMockCacheStats(instanceType);
    
    const report: PerformanceReport = {
      instanceType,
      hitRate: mockStats.hits / (mockStats.hits + mockStats.misses) || 0,
      missRate: mockStats.misses / (mockStats.hits + mockStats.misses) || 0,
      evictionRate: mockStats.evictions / mockStats.operations || 0,
      memoryUsage: {
        current: mockStats.memoryUsed,
        peak: mockStats.peakMemory,
        percentage: mockStats.memoryUsed / mockStats.maxMemory
      },
      operationStats: {
        gets: mockStats.gets,
        sets: mockStats.sets,
        deletes: mockStats.deletes,
        clears: mockStats.clears
      },
      averageResponseTime: mockStats.avgResponseTime,
      recommendations: this.generateRecommendations(mockStats),
      timestamp: new Date()
    };

    return report;
  }

  /**
   * 获取模拟缓存统计数据
   */
  private getMockCacheStats(instanceType: CacheInstanceType) {
    // 模拟不同实例类型的性能数据
    const baseStats = {
      hits: Math.floor(Math.random() * 1000) + 500,
      misses: Math.floor(Math.random() * 200) + 50,
      evictions: Math.floor(Math.random() * 50),
      operations: 0,
      memoryUsed: Math.floor(Math.random() * 50) + 10, // MB
      maxMemory: 100, // MB
      peakMemory: Math.floor(Math.random() * 80) + 20,
      gets: Math.floor(Math.random() * 800) + 400,
      sets: Math.floor(Math.random() * 300) + 100,
      deletes: Math.floor(Math.random() * 50) + 10,
      clears: Math.floor(Math.random() * 5),
      avgResponseTime: Math.floor(Math.random() * 50) + 10 // ms
    };

    baseStats.operations = baseStats.gets + baseStats.sets + baseStats.deletes + baseStats.clears;
    
    return baseStats;
  }

  /**
   * 生成优化建议
   */
  private generateRecommendations(stats: any): string[] {
    const recommendations: string[] = [];
    
    const hitRate = stats.hits / (stats.hits + stats.misses);
    const memoryUsage = stats.memoryUsed / stats.maxMemory;
    
    if (hitRate < 0.7) {
      recommendations.push('Consider increasing cache size or TTL to improve hit rate');
    }
    
    if (memoryUsage > 0.8) {
      recommendations.push('Memory usage is high, consider reducing cache size or implementing more aggressive cleanup');
    }
    
    if (stats.avgResponseTime > 50) {
      recommendations.push('Average response time is high, consider optimizing cache operations');
    }
    
    if (stats.evictions > stats.operations * 0.1) {
      recommendations.push('High eviction rate detected, consider increasing cache size');
    }
    
    return recommendations;
  }

  /**
   * 检查警报阈值
   */
  private checkAlertThresholds(report: PerformanceReport): void {
    const { alertThresholds } = this.options;
    
    if (report.hitRate < alertThresholds.hitRate) {
      this.emit('alert', {
        type: 'hitRate',
        instanceType: report.instanceType,
        value: report.hitRate,
        threshold: alertThresholds.hitRate,
        message: `Hit rate (${(report.hitRate * 100).toFixed(1)}%) is below threshold (${(alertThresholds.hitRate * 100).toFixed(1)}%)`
      });
    }
    
    if (report.memoryUsage.percentage > alertThresholds.memoryUsage) {
      this.emit('alert', {
        type: 'memoryUsage',
        instanceType: report.instanceType,
        value: report.memoryUsage.percentage,
        threshold: alertThresholds.memoryUsage,
        message: `Memory usage (${(report.memoryUsage.percentage * 100).toFixed(1)}%) is above threshold (${(alertThresholds.memoryUsage * 100).toFixed(1)}%)`
      });
    }
    
    if (report.averageResponseTime > alertThresholds.responseTime) {
      this.emit('alert', {
        type: 'responseTime',
        instanceType: report.instanceType,
        value: report.averageResponseTime,
        threshold: alertThresholds.responseTime,
        message: `Average response time (${report.averageResponseTime}ms) is above threshold (${alertThresholds.responseTime}ms)`
      });
    }
  }

  /**
   * 获取性能历史数据
   */
  public getPerformanceHistory(instanceType: CacheInstanceType, limit?: number): PerformanceReport[] {
    const reports = this.performanceData.get(instanceType) || [];
    return limit ? reports.slice(-limit) : reports;
  }

  /**
   * 生成优化建议
   */
  public generateOptimizationSuggestions(instanceType: CacheInstanceType): OptimizationSuggestion[] {
    const reports = this.getPerformanceHistory(instanceType, 10);
    if (reports.length === 0) {
      return [];
    }

    const suggestions: OptimizationSuggestion[] = [];
    const latestReport = reports[reports.length - 1];
    
    // 基于最新报告生成建议
    if (latestReport.hitRate < 0.7) {
      suggestions.push({
        type: 'ttl',
        priority: 'high',
        description: 'Increase TTL to improve hit rate',
        currentValue: 'Current TTL',
        suggestedValue: 'Increased TTL',
        expectedImpact: 'Improved hit rate by 10-20%',
        configPath: `${instanceType}.defaultTTL`
      });
    }
    
    if (latestReport.memoryUsage.percentage > 0.8) {
      suggestions.push({
        type: 'memory',
        priority: 'high',
        description: 'Reduce cache size or implement more aggressive cleanup',
        currentValue: latestReport.memoryUsage.current,
        suggestedValue: latestReport.memoryUsage.current * 0.8,
        expectedImpact: 'Reduced memory pressure',
        configPath: `${instanceType}.maxSize`
      });
    }
    
    return suggestions;
  }

  /**
   * 获取监控状态
   */
  public getMonitoringStatus(): {
    isMonitoring: boolean;
    monitoredInstances: CacheInstanceType[];
    options: PerformanceMonitorOptions;
  } {
    return {
      isMonitoring: this.isMonitoring,
      monitoredInstances: Array.from(this.monitoringIntervals.keys()),
      options: this.options
    };
  }

  /**
   * 更新监控选项
   */
  public updateOptions(newOptions: Partial<PerformanceMonitorOptions>): void {
    this.options = { ...this.options, ...newOptions };
    
    // 如果监控间隔改变，重启监控
    if (newOptions.reportInterval && this.isMonitoring) {
      const monitoredInstances = Array.from(this.monitoringIntervals.keys());
      this.stopMonitoring();
      this.startMonitoring(monitoredInstances);
    }
  }
}