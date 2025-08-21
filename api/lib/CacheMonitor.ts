import { CacheInstanceType, CACHE_INSTANCE_TYPES } from '../config/cache';
import { EnhancedCacheService } from './enhancedCache';
import { cacheInstances } from './cacheInstances';

/**
 * 监控指标类型
 */
export interface CacheMetrics {
  instanceType: CacheInstanceType;
  timestamp: number;
  
  // 基础统计
  hitCount: number;
  missCount: number;
  hitRate: number;
  totalRequests: number;
  
  // 容量统计
  currentSize: number;
  maxSize: number;
  utilizationRate: number;
  
  // 性能统计
  averageGetTime: number;
  averageSetTime: number;
  averageDeleteTime: number;
  
  // 内存统计
  memoryUsage: number;
  estimatedMemoryMB: number;
  
  // 操作统计
  getOperations: number;
  setOperations: number;
  deleteOperations: number;
  clearOperations: number;
  
  // 过期统计
  expiredKeys: number;
  evictedKeys: number;
  
  // 错误统计
  errorCount: number;
  lastError?: string;
}

/**
 * 性能报告
 */
export interface PerformanceReport {
  reportId: string;
  generatedAt: number;
  timeRange: {
    start: number;
    end: number;
    duration: number;
  };
  
  // 总体统计
  summary: {
    totalInstances: number;
    totalRequests: number;
    overallHitRate: number;
    totalMemoryUsageMB: number;
    averageResponseTime: number;
  };
  
  // 各实例详细报告
  instanceReports: Map<CacheInstanceType, InstanceReport>;
  
  // 性能趋势
  trends: {
    hitRateTrend: 'improving' | 'stable' | 'declining';
    memoryTrend: 'increasing' | 'stable' | 'decreasing';
    performanceTrend: 'improving' | 'stable' | 'declining';
  };
  
  // 问题和建议
  issues: PerformanceIssue[];
  recommendations: string[];
  
  // 预测
  predictions?: {
    memoryUsageIn24h: number;
    expectedHitRateChange: number;
    recommendedActions: string[];
  };
}

/**
 * 实例报告
 */
export interface InstanceReport {
  instanceType: CacheInstanceType;
  metrics: CacheMetrics;
  
  // 时间段内的变化
  changes: {
    hitRateChange: number;
    memoryChange: number;
    requestCountChange: number;
  };
  
  // 性能评级
  performanceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  
  // 具体问题
  issues: PerformanceIssue[];
  
  // 优化建议
  optimizations: string[];
}

/**
 * 性能问题
 */
export interface PerformanceIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'performance' | 'memory' | 'reliability' | 'efficiency';
  title: string;
  description: string;
  impact: string;
  suggestedAction: string;
  instanceType?: CacheInstanceType;
}

/**
 * 监控配置
 */
export interface MonitorConfig {
  enabled: boolean;
  collectInterval: number; // 收集间隔（毫秒）
  retentionPeriod: number; // 数据保留期（毫秒）
  alertThresholds: {
    lowHitRate: number; // 低命中率阈值
    highMemoryUsage: number; // 高内存使用率阈值
    slowResponseTime: number; // 慢响应时间阈值（毫秒）
    errorRate: number; // 错误率阈值
  };
  reportGeneration: {
    enabled: boolean;
    interval: number; // 报告生成间隔（毫秒）
    autoCleanup: boolean;
    maxReports: number;
  };
}

/**
 * 警报
 */
export interface CacheAlert {
  id: string;
  timestamp: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  instanceType: CacheInstanceType;
  title: string;
  message: string;
  metric: keyof CacheMetrics;
  currentValue: number;
  threshold: number;
  acknowledged: boolean;
}

/**
 * 缓存监控器
 * 提供实时监控、性能分析和报告生成功能
 */
export class CacheMonitor {
  private static instance: CacheMonitor;
  private metricsHistory: Map<CacheInstanceType, CacheMetrics[]> = new Map();
  private reports: Map<string, PerformanceReport> = new Map();
  private alerts: Map<string, CacheAlert> = new Map();
  private config: MonitorConfig;
  private collectTimer?: NodeJS.Timeout;
  private reportTimer?: NodeJS.Timeout;
  private isRunning = false;

  private constructor() {
    this.config = this.getDefaultConfig();
    this.initializeMetricsHistory();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): CacheMonitor {
    if (!CacheMonitor.instance) {
      CacheMonitor.instance = new CacheMonitor();
    }
    return CacheMonitor.instance;
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): MonitorConfig {
    return {
      enabled: true,
      collectInterval: 30000, // 30秒
      retentionPeriod: 24 * 60 * 60 * 1000, // 24小时
      alertThresholds: {
        lowHitRate: 0.7, // 70%
        highMemoryUsage: 0.9, // 90%
        slowResponseTime: 100, // 100ms
        errorRate: 0.05 // 5%
      },
      reportGeneration: {
        enabled: true,
        interval: 60 * 60 * 1000, // 1小时
        autoCleanup: true,
        maxReports: 24 // 保留24个报告
      }
    };
  }

  /**
   * 初始化指标历史记录
   */
  private initializeMetricsHistory(): void {
    const instanceTypeKeys = Object.keys(cacheInstances) as (keyof typeof cacheInstances)[];
    for (const instanceType of instanceTypeKeys) {
      this.metricsHistory.set(instanceType, []);
    }
  }

  /**
   * 启动监控
   */
  public start(config?: Partial<MonitorConfig>): void {
    if (this.isRunning) {
      console.warn('Cache monitor is already running');
      return;
    }

    if (config) {
      this.config = { ...this.config, ...config };
    }

    if (!this.config.enabled) {
      console.log('Cache monitor is disabled');
      return;
    }

    this.isRunning = true;
    
    // 启动指标收集
    this.collectTimer = setInterval(() => {
      this.collectMetrics();
    }, this.config.collectInterval);

    // 启动报告生成
    if (this.config.reportGeneration.enabled) {
      this.reportTimer = setInterval(() => {
        this.generatePerformanceReport();
      }, this.config.reportGeneration.interval);
    }

    console.log('Cache monitor started');
  }

  /**
   * 停止监控
   */
  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.collectTimer) {
      clearInterval(this.collectTimer);
      this.collectTimer = undefined;
    }

    if (this.reportTimer) {
      clearInterval(this.reportTimer);
      this.reportTimer = undefined;
    }

    console.log('Cache monitor stopped');
  }

  /**
   * 收集指标
   */
  private async collectMetrics(): Promise<void> {
    const timestamp = Date.now();

    for (const [instanceTypeKey, cacheInstance] of Object.entries(cacheInstances)) {
      if (cacheInstance) {
        try {
          const instanceType = instanceTypeKey as keyof typeof cacheInstances;
          const metrics = await this.collectInstanceMetrics(
            instanceType,
            cacheInstance,
            timestamp
          );
          
          this.addMetrics(instanceType, metrics);
          this.checkAlerts(metrics);
        } catch (error) {
          console.error(`Error collecting metrics for ${instanceTypeKey}:`, error);
        }
      }
    }

    // 清理过期数据
    this.cleanupOldMetrics();
  }

  /**
   * 收集单个实例指标
   */
  private async collectInstanceMetrics(
    instanceType: CacheInstanceType,
    cacheInstance: EnhancedCacheService,
    timestamp: number
  ): Promise<CacheMetrics> {
    const stats = cacheInstance.getStats();
    const startTime = Date.now();
    
    // 测试响应时间
    const testKey = `__monitor_test_${timestamp}`;
    const testValue = 'test';
    
    const getStartTime = Date.now();
    await cacheInstance.get(testKey);
    const getTime = Date.now() - getStartTime;
    
    const setStartTime = Date.now();
    await cacheInstance.set(testKey, testValue, 1000);
    const setTime = Date.now() - setStartTime;
    
    const deleteStartTime = Date.now();
    await cacheInstance.delete(testKey);
    const deleteTime = Date.now() - deleteStartTime;

    return {
      instanceType,
      timestamp,
      
      // 基础统计
      hitCount: stats.hits,
      missCount: stats.misses,
      hitRate: stats.hitRate,
      totalRequests: stats.hits + stats.misses,
      
      // 容量统计
      currentSize: stats.size,
      maxSize: stats.maxSize,
      utilizationRate: stats.size / stats.maxSize,
      
      // 性能统计
      averageGetTime: getTime,
      averageSetTime: setTime,
      averageDeleteTime: deleteTime,
      
      // 内存统计
      memoryUsage: stats.memoryUsage,
      estimatedMemoryMB: stats.memoryUsage / (1024 * 1024),
      
      // 操作统计
      getOperations: stats.gets || 0,
      setOperations: stats.sets || 0,
      deleteOperations: stats.deletes || 0,
      clearOperations: stats.clears || 0,
      
      // 过期统计
      expiredKeys: stats.expired || 0,
      evictedKeys: stats.evicted || 0,
      
      // 错误统计
      errorCount: stats.errors || 0,
      lastError: stats.lastError
    };
  }

  /**
   * 添加指标到历史记录
   */
  private addMetrics(instanceType: CacheInstanceType, metrics: CacheMetrics): void {
    const history = this.metricsHistory.get(instanceType) || [];
    history.push(metrics);
    
    // 限制历史记录长度
    const maxEntries = Math.ceil(this.config.retentionPeriod / this.config.collectInterval);
    if (history.length > maxEntries) {
      history.splice(0, history.length - maxEntries);
    }
    
    this.metricsHistory.set(instanceType, history);
  }

  /**
   * 检查警报
   */
  private checkAlerts(metrics: CacheMetrics): void {
    const alerts: CacheAlert[] = [];
    const thresholds = this.config.alertThresholds;

    // 检查命中率
    if (metrics.hitRate < thresholds.lowHitRate) {
      alerts.push({
        id: `low-hit-rate-${metrics.instanceType}-${metrics.timestamp}`,
        timestamp: metrics.timestamp,
        severity: metrics.hitRate < 0.5 ? 'critical' : 'high',
        instanceType: metrics.instanceType,
        title: 'Low Cache Hit Rate',
        message: `Hit rate is ${(metrics.hitRate * 100).toFixed(1)}%, below threshold of ${(thresholds.lowHitRate * 100).toFixed(1)}%`,
        metric: 'hitRate',
        currentValue: metrics.hitRate,
        threshold: thresholds.lowHitRate,
        acknowledged: false
      });
    }

    // 检查内存使用率
    if (metrics.utilizationRate > thresholds.highMemoryUsage) {
      alerts.push({
        id: `high-memory-${metrics.instanceType}-${metrics.timestamp}`,
        timestamp: metrics.timestamp,
        severity: metrics.utilizationRate > 0.95 ? 'critical' : 'high',
        instanceType: metrics.instanceType,
        title: 'High Memory Usage',
        message: `Memory utilization is ${(metrics.utilizationRate * 100).toFixed(1)}%, above threshold of ${(thresholds.highMemoryUsage * 100).toFixed(1)}%`,
        metric: 'utilizationRate',
        currentValue: metrics.utilizationRate,
        threshold: thresholds.highMemoryUsage,
        acknowledged: false
      });
    }

    // 检查响应时间
    const avgResponseTime = (metrics.averageGetTime + metrics.averageSetTime) / 2;
    if (avgResponseTime > thresholds.slowResponseTime) {
      alerts.push({
        id: `slow-response-${metrics.instanceType}-${metrics.timestamp}`,
        timestamp: metrics.timestamp,
        severity: avgResponseTime > thresholds.slowResponseTime * 2 ? 'high' : 'medium',
        instanceType: metrics.instanceType,
        title: 'Slow Response Time',
        message: `Average response time is ${avgResponseTime.toFixed(1)}ms, above threshold of ${thresholds.slowResponseTime}ms`,
        metric: 'averageGetTime',
        currentValue: avgResponseTime,
        threshold: thresholds.slowResponseTime,
        acknowledged: false
      });
    }

    // 存储警报
    for (const alert of alerts) {
      this.alerts.set(alert.id, alert);
    }
  }

  /**
   * 清理过期指标
   */
  private cleanupOldMetrics(): void {
    const cutoffTime = Date.now() - this.config.retentionPeriod;
    
    for (const [instanceType, history] of this.metricsHistory) {
      const filteredHistory = history.filter(metrics => metrics.timestamp > cutoffTime);
      this.metricsHistory.set(instanceType, filteredHistory);
    }
  }

  /**
   * 生成性能报告
   */
  public generatePerformanceReport(timeRange?: { start: number; end: number }): PerformanceReport {
    const now = Date.now();
    const reportId = `report-${now}`;
    
    const range = timeRange || {
      start: now - (60 * 60 * 1000), // 1小时前
      end: now
    };
    
    const duration = range.end - range.start;
    const instanceReports = new Map<CacheInstanceType, InstanceReport>();
    const allIssues: PerformanceIssue[] = [];
    const recommendations: string[] = [];
    
    let totalRequests = 0;
    let totalHits = 0;
    let totalMemoryMB = 0;
    let totalResponseTime = 0;
    let instanceCount = 0;

    // 生成各实例报告
    for (const instanceType of CACHE_INSTANCE_TYPES) {
      const history = this.metricsHistory.get(instanceType) || [];
      const relevantMetrics = history.filter(
        m => m.timestamp >= range.start && m.timestamp <= range.end
      );
      
      if (relevantMetrics.length === 0) continue;
      
      const latestMetrics = relevantMetrics[relevantMetrics.length - 1];
      const instanceReport = this.generateInstanceReport(instanceType, relevantMetrics);
      
      instanceReports.set(instanceType, instanceReport);
      allIssues.push(...instanceReport.issues);
      
      // 累计统计
      totalRequests += latestMetrics.totalRequests;
      totalHits += latestMetrics.hitCount;
      totalMemoryMB += latestMetrics.estimatedMemoryMB;
      totalResponseTime += (latestMetrics.averageGetTime + latestMetrics.averageSetTime) / 2;
      instanceCount++;
    }

    // 生成总体建议
    this.generateRecommendations(instanceReports, recommendations);
    
    // 分析趋势
    const trends = this.analyzeTrends(range);
    
    const report: PerformanceReport = {
      reportId,
      generatedAt: now,
      timeRange: { ...range, duration },
      summary: {
        totalInstances: instanceCount,
        totalRequests,
        overallHitRate: totalRequests > 0 ? totalHits / totalRequests : 0,
        totalMemoryUsageMB: totalMemoryMB,
        averageResponseTime: instanceCount > 0 ? totalResponseTime / instanceCount : 0
      },
      instanceReports,
      trends,
      issues: allIssues,
      recommendations
    };
    
    // 存储报告
    this.reports.set(reportId, report);
    
    // 清理旧报告
    if (this.config.reportGeneration.autoCleanup) {
      this.cleanupOldReports();
    }
    
    return report;
  }

  /**
   * 生成实例报告
   */
  private generateInstanceReport(
    instanceType: CacheInstanceType,
    metrics: CacheMetrics[]
  ): InstanceReport {
    if (metrics.length === 0) {
      throw new Error(`No metrics available for ${instanceType}`);
    }
    
    const latest = metrics[metrics.length - 1];
    const oldest = metrics[0];
    const issues: PerformanceIssue[] = [];
    const optimizations: string[] = [];
    
    // 计算变化
    const changes = {
      hitRateChange: latest.hitRate - oldest.hitRate,
      memoryChange: latest.estimatedMemoryMB - oldest.estimatedMemoryMB,
      requestCountChange: latest.totalRequests - oldest.totalRequests
    };
    
    // 性能评级
    let grade: InstanceReport['performanceGrade'] = 'A';
    let score = 100;
    
    if (latest.hitRate < 0.9) score -= 10;
    if (latest.hitRate < 0.8) score -= 10;
    if (latest.hitRate < 0.7) score -= 20;
    
    if (latest.utilizationRate > 0.9) score -= 15;
    if (latest.utilizationRate > 0.95) score -= 10;
    
    const avgResponseTime = (latest.averageGetTime + latest.averageSetTime) / 2;
    if (avgResponseTime > 50) score -= 10;
    if (avgResponseTime > 100) score -= 15;
    
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';
    else grade = 'F';
    
    // 识别问题
    if (latest.hitRate < 0.7) {
      issues.push({
        severity: 'high',
        category: 'performance',
        title: 'Low Hit Rate',
        description: `Hit rate is only ${(latest.hitRate * 100).toFixed(1)}%`,
        impact: 'Increased backend load and slower response times',
        suggestedAction: 'Review cache TTL settings and data access patterns',
        instanceType
      });
      optimizations.push('Increase TTL for frequently accessed data');
      optimizations.push('Implement cache warming strategies');
    }
    
    if (latest.utilizationRate > 0.9) {
      issues.push({
        severity: 'medium',
        category: 'memory',
        title: 'High Memory Usage',
        description: `Memory utilization is ${(latest.utilizationRate * 100).toFixed(1)}%`,
        impact: 'Risk of cache evictions and performance degradation',
        suggestedAction: 'Increase cache size or implement better eviction policies',
        instanceType
      });
      optimizations.push('Consider increasing maxSize');
      optimizations.push('Implement data compression');
    }
    
    if (avgResponseTime > 100) {
      issues.push({
        severity: 'medium',
        category: 'performance',
        title: 'Slow Response Time',
        description: `Average response time is ${avgResponseTime.toFixed(1)}ms`,
        impact: 'Degraded user experience and application performance',
        suggestedAction: 'Optimize cache implementation or consider hardware upgrades',
        instanceType
      });
      optimizations.push('Optimize cache data structures');
      optimizations.push('Consider using faster storage');
    }
    
    return {
      instanceType,
      metrics: latest,
      changes,
      performanceGrade: grade,
      issues,
      optimizations
    };
  }

  /**
   * 生成建议
   */
  private generateRecommendations(
    instanceReports: Map<CacheInstanceType, InstanceReport>,
    recommendations: string[]
  ): void {
    let totalMemory = 0;
    let lowPerformanceCount = 0;
    
    for (const report of instanceReports.values()) {
      totalMemory += report.metrics.estimatedMemoryMB;
      if (report.performanceGrade === 'D' || report.performanceGrade === 'F') {
        lowPerformanceCount++;
      }
    }
    
    if (totalMemory > 1000) {
      recommendations.push('Consider implementing global memory limits and monitoring');
    }
    
    if (lowPerformanceCount > 0) {
      recommendations.push('Review and optimize underperforming cache instances');
    }
    
    if (instanceReports.size > 5) {
      recommendations.push('Consider consolidating cache instances to reduce complexity');
    }
  }

  /**
   * 分析趋势
   */
  private analyzeTrends(timeRange: { start: number; end: number }): PerformanceReport['trends'] {
    // 简化的趋势分析
    return {
      hitRateTrend: 'stable',
      memoryTrend: 'stable',
      performanceTrend: 'stable'
    };
  }

  /**
   * 清理旧报告
   */
  private cleanupOldReports(): void {
    const reports = Array.from(this.reports.entries())
      .sort(([, a], [, b]) => b.generatedAt - a.generatedAt);
    
    if (reports.length > this.config.reportGeneration.maxReports) {
      const toDelete = reports.slice(this.config.reportGeneration.maxReports);
      for (const [reportId] of toDelete) {
        this.reports.delete(reportId);
      }
    }
  }

  /**
   * 获取最新指标
   */
  public getLatestMetrics(instanceType?: CacheInstanceType): CacheMetrics | Map<CacheInstanceType, CacheMetrics> {
    if (instanceType) {
      const history = this.metricsHistory.get(instanceType) || [];
      return history[history.length - 1];
    }
    
    const result = new Map<CacheInstanceType, CacheMetrics>();
    for (const [type, history] of this.metricsHistory) {
      if (history.length > 0) {
        result.set(type, history[history.length - 1]);
      }
    }
    return result;
  }

  /**
   * 获取指标历史
   */
  public getMetricsHistory(
    instanceType: CacheInstanceType,
    timeRange?: { start: number; end: number }
  ): CacheMetrics[] {
    const history = this.metricsHistory.get(instanceType) || [];
    
    if (!timeRange) {
      return [...history];
    }
    
    return history.filter(
      m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
    );
  }

  /**
   * 获取所有报告
   */
  public getReports(): PerformanceReport[] {
    return Array.from(this.reports.values())
      .sort((a, b) => b.generatedAt - a.generatedAt);
  }

  /**
   * 获取特定报告
   */
  public getReport(reportId: string): PerformanceReport | undefined {
    return this.reports.get(reportId);
  }

  /**
   * 获取活跃警报
   */
  public getActiveAlerts(): CacheAlert[] {
    return Array.from(this.alerts.values())
      .filter(alert => !alert.acknowledged)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * 确认警报
   */
  public acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  /**
   * 获取监控状态
   */
  public getStatus(): {
    isRunning: boolean;
    config: MonitorConfig;
    metricsCount: number;
    reportsCount: number;
    activeAlertsCount: number;
  } {
    return {
      isRunning: this.isRunning,
      config: this.config,
      metricsCount: Array.from(this.metricsHistory.values())
        .reduce((total, history) => total + history.length, 0),
      reportsCount: this.reports.size,
      activeAlertsCount: this.getActiveAlerts().length
    };
  }

  /**
   * 更新配置
   */
  public updateConfig(newConfig: Partial<MonitorConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  /**
   * 销毁监控器
   */
  public destroy(): void {
    this.stop();
    this.metricsHistory.clear();
    this.reports.clear();
    this.alerts.clear();
    CacheMonitor.instance = undefined as any;
  }
}

// 导出默认实例
export const cacheMonitor = CacheMonitor.getInstance();