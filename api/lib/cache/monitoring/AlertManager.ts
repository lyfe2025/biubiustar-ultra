import { CacheInstanceType } from '../../../config/cache';
import { CacheAlert, CacheMetrics, PerformanceIssue, MonitorConfig } from './types';

/**
 * 警报管理器
 * 负责管理缓存监控的警报系统
 */
export class AlertManager {
  private alerts: Map<string, CacheAlert> = new Map();
  private alertHistory: CacheAlert[] = [];
  private alertCallbacks: ((alert: CacheAlert) => void)[] = [];
  private maxHistorySize = 1000;

  /**
   * 根据指标检查并生成警报
   */
  public checkMetricsAlerts(metrics: CacheMetrics, thresholds: MonitorConfig['alertThresholds']): CacheAlert[] {
    const alerts: CacheAlert[] = [];

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

    // 检查错误率
    const totalOperations = metrics.getOperations + metrics.setOperations + metrics.deleteOperations;
    const errorRate = totalOperations > 0 ? metrics.errorCount / totalOperations : 0;
    if (errorRate > thresholds.errorRate) {
      alerts.push({
        id: `high-error-rate-${metrics.instanceType}-${metrics.timestamp}`,
        timestamp: metrics.timestamp,
        severity: errorRate > thresholds.errorRate * 2 ? 'critical' : 'high',
        instanceType: metrics.instanceType,
        title: 'High Error Rate',
        message: `Error rate is ${(errorRate * 100).toFixed(1)}%, above threshold of ${(thresholds.errorRate * 100).toFixed(1)}%`,
        metric: 'errorCount',
        currentValue: errorRate,
        threshold: thresholds.errorRate,
        acknowledged: false
      });
    }

    // 存储新警报
    for (const alert of alerts) {
      this.addAlert(alert);
    }

    return alerts;
  }

  /**
   * 从性能问题生成警报
   */
  public generateAlertsFromIssues(issues: PerformanceIssue[], timestamp: number): CacheAlert[] {
    const alerts: CacheAlert[] = [];

    for (const issue of issues) {
      const alert: CacheAlert = {
        id: `issue-${issue.instanceType || 'global'}-${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp,
        severity: issue.severity,
        instanceType: issue.instanceType || 'global' as CacheInstanceType,
        title: issue.title,
        message: `${issue.description}. Impact: ${issue.impact}`,
        metric: 'hitRate', // 默认指标
        currentValue: 0,
        threshold: 0,
        acknowledged: false
      };

      alerts.push(alert);
      this.addAlert(alert);
    }

    return alerts;
  }

  /**
   * 添加警报
   */
  public addAlert(alert: CacheAlert): void {
    // 检查是否已存在相同的警报（避免重复）
    const existingAlert = Array.from(this.alerts.values()).find(
      existing => 
        existing.instanceType === alert.instanceType &&
        existing.title === alert.title &&
        existing.timestamp > alert.timestamp - 60000 && // 1分钟内的相同警报
        !existing.acknowledged
    );

    if (existingAlert) {
      return; // 跳过重复警报
    }

    this.alerts.set(alert.id, alert);
    this.alertHistory.push(alert);

    // 限制历史记录长度
    if (this.alertHistory.length > this.maxHistorySize) {
      this.alertHistory.splice(0, this.alertHistory.length - this.maxHistorySize);
    }

    // 触发回调
    for (const callback of this.alertCallbacks) {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error in alert callback:', error);
      }
    }
  }

  /**
   * 获取活跃警报
   */
  public getActiveAlerts(instanceType?: CacheInstanceType): CacheAlert[] {
    const activeAlerts = Array.from(this.alerts.values())
      .filter(alert => !alert.acknowledged);

    if (instanceType) {
      return activeAlerts.filter(alert => alert.instanceType === instanceType);
    }

    return activeAlerts.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * 获取所有警报
   */
  public getAllAlerts(instanceType?: CacheInstanceType): CacheAlert[] {
    const allAlerts = Array.from(this.alerts.values());

    if (instanceType) {
      return allAlerts.filter(alert => alert.instanceType === instanceType);
    }

    return allAlerts.sort((a, b) => b.timestamp - a.timestamp);
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
   * 删除警报
   */
  public deleteAlert(alertId: string): boolean {
    return this.alerts.delete(alertId);
  }

  /**
   * 获取警报统计
   */
  public getAlertStats(): {
    total: number;
    active: number;
    acknowledged: number;
    bySeverity: Record<CacheAlert['severity'], number>;
    byInstance: Record<string, number>;
  } {
    const allAlerts = Array.from(this.alerts.values());
    const activeAlerts = allAlerts.filter(alert => !alert.acknowledged);
    
    const bySeverity: Record<CacheAlert['severity'], number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };
    
    const byInstance: Record<string, number> = {};
    
    for (const alert of allAlerts) {
      bySeverity[alert.severity]++;
      byInstance[alert.instanceType] = (byInstance[alert.instanceType] || 0) + 1;
    }
    
    return {
      total: allAlerts.length,
      active: activeAlerts.length,
      acknowledged: allAlerts.length - activeAlerts.length,
      bySeverity,
      byInstance
    };
  }

  /**
   * 添加警报回调
   */
  public addAlertCallback(callback: (alert: CacheAlert) => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * 移除警报回调
   */
  public removeAlertCallback(callback: (alert: CacheAlert) => void): void {
    const index = this.alertCallbacks.indexOf(callback);
    if (index > -1) {
      this.alertCallbacks.splice(index, 1);
    }
  }

  /**
   * 获取警报历史
   */
  public getAlertHistory(
    timeRange?: { start: number; end: number },
    instanceType?: CacheInstanceType
  ): CacheAlert[] {
    let history = [...this.alertHistory];

    if (timeRange) {
      history = history.filter(
        alert => alert.timestamp >= timeRange.start && alert.timestamp <= timeRange.end
      );
    }

    if (instanceType) {
      history = history.filter(alert => alert.instanceType === instanceType);
    }

    return history.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * 清理过期警报
   */
  public cleanupExpiredAlerts(cutoffTime: number): number {
    const expiredAlerts = Array.from(this.alerts.entries())
      .filter(([, alert]) => alert.timestamp < cutoffTime && alert.acknowledged);
    
    for (const [alertId] of expiredAlerts) {
      this.alerts.delete(alertId);
    }

    // 清理历史记录
    this.alertHistory = this.alertHistory.filter(alert => alert.timestamp > cutoffTime);

    return expiredAlerts.length;
  }

  /**
   * 获取警报趋势
   */
  public getAlertTrend(
    timeRange: { start: number; end: number },
    instanceType?: CacheInstanceType
  ): {
    trend: 'increasing' | 'stable' | 'decreasing';
    totalAlerts: number;
    averageAlertsPerHour: number;
    severityDistribution: Record<CacheAlert['severity'], number>;
  } {
    const history = this.getAlertHistory(timeRange, instanceType);
    const duration = timeRange.end - timeRange.start;
    const hours = duration / (60 * 60 * 1000);
    
    const severityDistribution: Record<CacheAlert['severity'], number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };
    
    for (const alert of history) {
      severityDistribution[alert.severity]++;
    }
    
    // 简单的趋势分析
    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
    
    if (history.length >= 6) {
      const midPoint = Math.floor(history.length / 2);
      const recentHalf = history.slice(0, midPoint);
      const olderHalf = history.slice(midPoint);
      
      const recentRate = recentHalf.length / (hours / 2);
      const olderRate = olderHalf.length / (hours / 2);
      
      if (recentRate > olderRate * 1.2) {
        trend = 'increasing';
      } else if (recentRate < olderRate * 0.8) {
        trend = 'decreasing';
      }
    }
    
    return {
      trend,
      totalAlerts: history.length,
      averageAlertsPerHour: hours > 0 ? history.length / hours : 0,
      severityDistribution
    };
  }

  /**
   * 更新配置
   */
  public updateConfig(thresholds: MonitorConfig['alertThresholds']): void {
    // 存储新的阈值配置
    // 这里可以添加配置验证逻辑
    console.log('Alert thresholds updated:', thresholds);
  }

  /**
   * 销毁警报管理器
   */
  public destroy(): void {
    this.alerts.clear();
    this.alertHistory = [];
    this.alertCallbacks = [];
  }
}