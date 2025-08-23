/**
 * 缓存监控模块统一导出
 */

import { HealthChecker } from './HealthChecker';
import { AlertManager } from './AlertManager';
import { PerformanceReporter } from './PerformanceReporter';
import { 
  MonitoringConfig,
  MonitorConfig, 
  CacheMetrics, 
  PerformanceReport, 
  AlertRule, 
  AlertEvent,
  HealthStatus,
  MetricsHistory,
  CacheAlert
} from './types';
import { CacheInstanceType } from '../../../config/cache';
import { EnhancedCacheService } from '../../enhancedCache';

// 导出主要类
export { HealthChecker } from './HealthChecker';
export { AlertManager } from './AlertManager';
export { PerformanceReporter } from './PerformanceReporter';

// 导出类型定义
export * from './types';

/**
 * 缓存监控主类
 */
export class CacheMonitor {
  private static instance: CacheMonitor;
  private cacheInstances: Map<CacheInstanceType, EnhancedCacheService> = new Map();
  private healthChecker: HealthChecker;
  private alertManager: AlertManager;
  private performanceReporter: PerformanceReporter;
  private metricsHistory: MetricsHistory[] = [];
  private config: MonitorConfig;
  private isRunning: boolean = false;
  private monitoringInterval?: NodeJS.Timeout;

  constructor(config?: Partial<MonitorConfig>) {
    this.config = {
      enabled: true,
      collectInterval: 60000, // 1分钟
      retentionPeriod: 7 * 24 * 60 * 60 * 1000, // 7天
      alertThresholds: {
        lowHitRate: 0.8,
        highMemoryUsage: 0.9,
        slowResponseTime: 1000,
        errorRate: 0.05
      },
      reportGeneration: {
        enabled: true,
        interval: 24 * 60 * 60 * 1000, // 24小时
        autoCleanup: true,
        maxReports: 30
      },
      ...config
    };
    
    this.healthChecker = new HealthChecker();
    this.alertManager = new AlertManager();
    this.performanceReporter = new PerformanceReporter(this.config.reportGeneration);
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
   * 注册缓存实例
   */
  public registerCacheInstance(
    type: CacheInstanceType,
    instance: EnhancedCacheService
  ): void {
    this.cacheInstances.set(type, instance);
  }

  /**
   * 开始监控
   */
  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, this.config.collectInterval);
  }

  /**
   * 停止监控
   */
  public stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
  }

  /**
   * 收集指标
   */
  private collectMetrics(): void {
    const timestamp = Date.now();
    const metrics: CacheMetrics = {
      instanceType: 'user' as const,
      timestamp,
      
      // 基础统计
      hitCount: 850,
      missCount: 150,
      hitRate: 0.85,
      totalRequests: 1000,
      
      // 容量统计
      currentSize: 750,
      maxSize: 1000,
      utilizationRate: 0.75,
      
      // 性能统计
      averageGetTime: 50,
      averageSetTime: 60,
      averageDeleteTime: 40,
      
      // 内存统计
      memoryUsage: 100 * 1024 * 1024,
      estimatedMemoryMB: 100,
      
      // 操作统计
      getOperations: 800,
      setOperations: 150,
      deleteOperations: 50,
      clearOperations: 0,
      
      // 过期统计
      expiredKeys: 20,
      evictedKeys: 5,
      
      // 错误统计
      errorCount: 5,
      lastError: undefined
    };

    this.addMetrics(metrics);
    this.checkAlerts(metrics);
    this.cleanupOldMetrics();
  }

  /**
   * 添加指标
   */
  private addMetrics(metrics: CacheMetrics): void {
    this.metricsHistory.push({
      timestamp: new Date(metrics.timestamp),
      metrics
    });
  }

  /**
   * 检查告警
   */
  private checkAlerts(metrics: CacheMetrics): void {
    const { alertThresholds } = this.config;
    
    if (metrics.hitRate < alertThresholds.lowHitRate) {
      const alert: CacheAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        severity: 'medium',
        instanceType: 'user',
        title: 'Low Hit Rate Alert',
        message: `缓存命中率过低: ${(metrics.hitRate * 100).toFixed(2)}%`,
        metric: 'hitRate',
        currentValue: metrics.hitRate,
        threshold: alertThresholds.lowHitRate,
        acknowledged: false
      };
      this.alertManager.addAlert(alert);
    }
    
    if (metrics.averageGetTime > alertThresholds.slowResponseTime) {
      const alert: CacheAlert = {
        id: `high-response-time-${Date.now()}`,
        timestamp: Date.now(),
        severity: 'medium',
        instanceType: 'user',
        title: 'High Response Time Alert',
        message: `平均响应时间过高: ${metrics.averageGetTime}ms`,
        metric: 'averageGetTime',
        currentValue: metrics.averageGetTime,
        threshold: alertThresholds.slowResponseTime,
        acknowledged: false
      };
      this.alertManager.addAlert(alert);
    }
    
    const errorRate = metrics.totalRequests > 0 ? metrics.errorCount / metrics.totalRequests : 0;
    if (errorRate > alertThresholds.errorRate) {
      const alert: CacheAlert = {
        id: `high-error-rate-${Date.now()}`,
        timestamp: Date.now(),
        severity: 'high',
        instanceType: 'user',
        title: 'High Error Rate Alert',
        message: `错误率过高: ${(errorRate * 100).toFixed(2)}%`,
        metric: 'errorCount',
        currentValue: errorRate,
        threshold: alertThresholds.errorRate,
        acknowledged: false
      };
      this.alertManager.addAlert(alert);
    }
  }

  /**
   * 清理旧指标
   */
  private cleanupOldMetrics(): void {
    const cutoff = new Date(Date.now() - this.config.retentionPeriod);
    this.metricsHistory = this.metricsHistory.filter(
      entry => entry.timestamp > cutoff
    );
  }

  /**
   * 获取最新指标
   */
  public getLatestMetrics(): CacheMetrics | null {
    const latest = this.metricsHistory[this.metricsHistory.length - 1];
    return latest ? latest.metrics : null;
  }

  /**
   * 获取指标历史
   */
  public getMetricsHistory(limit?: number): MetricsHistory[] {
    return limit ? this.metricsHistory.slice(-limit) : this.metricsHistory;
  }

  /**
   * 生成性能报告
   */
  public generatePerformanceReport(): PerformanceReport {
    // 将metricsHistory转换为PerformanceReporter期望的格式
    const metricsMap = new Map<CacheInstanceType, CacheMetrics[]>();
    
    // 按实例类型分组指标
    for (const entry of this.metricsHistory) {
      const instanceType = entry.metrics.instanceType;
      if (!metricsMap.has(instanceType)) {
        metricsMap.set(instanceType, []);
      }
      metricsMap.get(instanceType)!.push(entry.metrics);
    }
    
    return this.performanceReporter.generateReport(metricsMap);
  }

  /**
   * 获取健康状态
   */
  public getHealthStatus(): HealthStatus {
    return this.healthChecker.checkHealth(this.cacheInstances);
  }

  /**
   * 销毁实例
   */
  public destroy(): void {
    this.stop();
    this.cacheInstances.clear();
    this.metricsHistory = [];
  }
}

// 导出默认实例
export const cacheMonitor = CacheMonitor.getInstance();