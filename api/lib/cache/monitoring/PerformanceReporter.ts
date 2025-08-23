import { CacheInstanceType, CACHE_INSTANCE_TYPES } from '../../../config/cache';
import { CacheMetrics, PerformanceReport, InstanceReport, PerformanceIssue, MonitorConfig } from './types';

/**
 * 性能报告生成器
 * 负责生成缓存性能报告
 */
export class PerformanceReporter {
  private reports: Map<string, PerformanceReport> = new Map();
  private config: MonitorConfig['reportGeneration'];

  constructor(config: MonitorConfig['reportGeneration']) {
    this.config = config;
  }

  /**
   * 生成性能报告
   */
  public generateReport(
    metricsHistory: Map<CacheInstanceType, CacheMetrics[]>,
    timeRange?: { start: number; end: number }
  ): PerformanceReport {
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
      const history = metricsHistory.get(instanceType) || [];
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
    const trends = this.analyzeTrends(metricsHistory, range);
    
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
    if (this.config.autoCleanup) {
      this.cleanupOldReports();
    }
    
    return report;
  }

  /**
   * 生成实例报告
   */
  public generateInstanceReport(
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
   * 计算实例趋势
   */
  public calculateInstanceTrend(
    metrics: CacheMetrics[],
    metric: keyof Pick<CacheMetrics, 'hitRate' | 'utilizationRate' | 'averageGetTime'>
  ): 'improving' | 'stable' | 'declining' {
    if (metrics.length < 3) {
      return 'stable';
    }
    
    const values = metrics.map(m => {
      switch (metric) {
        case 'hitRate':
          return m.hitRate;
        case 'utilizationRate':
          return m.utilizationRate;
        case 'averageGetTime':
          return m.averageGetTime;
        default:
          return 0;
      }
    });
    
    // 简单的线性回归趋势分析
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    // 对于响应时间，斜率为负表示改善
    if (metric === 'averageGetTime') {
      if (slope < -0.1) return 'improving';
      if (slope > 0.1) return 'declining';
    } else {
      // 对于命中率等，斜率为正表示改善
      if (slope > 0.01) return 'improving';
      if (slope < -0.01) return 'declining';
    }
    
    return 'stable';
  }

  /**
   * 分析总体趋势
   */
  private analyzeTrends(
    metricsHistory: Map<CacheInstanceType, CacheMetrics[]>,
    timeRange: { start: number; end: number }
  ): PerformanceReport['trends'] {
    const allMetrics: CacheMetrics[] = [];
    
    for (const history of metricsHistory.values()) {
      const relevantMetrics = history.filter(
        m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      );
      allMetrics.push(...relevantMetrics);
    }
    
    if (allMetrics.length === 0) {
      return {
        hitRateTrend: 'stable',
        memoryTrend: 'stable',
        performanceTrend: 'stable'
      };
    }
    
    // 按时间排序
    allMetrics.sort((a, b) => a.timestamp - b.timestamp);
    
    // 计算各项趋势
    const hitRateTrend = this.calculateInstanceTrend(allMetrics, 'hitRate');
    const memoryTrend = this.calculateInstanceTrend(allMetrics, 'utilizationRate');
    const performanceTrend = this.calculateInstanceTrend(allMetrics, 'averageGetTime');
    
    return {
      hitRateTrend,
      memoryTrend: memoryTrend === 'improving' ? 'decreasing' : 
                   memoryTrend === 'declining' ? 'increasing' : 'stable',
      performanceTrend
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
    let highMemoryCount = 0;
    let lowHitRateCount = 0;
    
    for (const report of instanceReports.values()) {
      totalMemory += report.metrics.estimatedMemoryMB;
      
      if (report.performanceGrade === 'D' || report.performanceGrade === 'F') {
        lowPerformanceCount++;
      }
      
      if (report.metrics.utilizationRate > 0.9) {
        highMemoryCount++;
      }
      
      if (report.metrics.hitRate < 0.7) {
        lowHitRateCount++;
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
    
    if (highMemoryCount > instanceReports.size / 2) {
      recommendations.push('Implement global memory optimization strategies');
    }
    
    if (lowHitRateCount > instanceReports.size / 3) {
      recommendations.push('Review cache warming and TTL strategies across all instances');
    }
  }

  /**
   * 清理旧报告
   */
  private cleanupOldReports(): void {
    const reports = Array.from(this.reports.entries())
      .sort(([, a], [, b]) => b.generatedAt - a.generatedAt);
    
    if (reports.length > this.config.maxReports) {
      const toDelete = reports.slice(this.config.maxReports);
      for (const [reportId] of toDelete) {
        this.reports.delete(reportId);
      }
    }
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
   * 获取报告统计
   */
  public getReportStats(): {
    totalReports: number;
    latestReportTime?: number;
    averageReportSize: number;
    reportFrequency: number;
  } {
    const reports = this.getReports();
    const totalReports = reports.length;
    const latestReportTime = reports.length > 0 ? reports[0].generatedAt : undefined;
    
    // 计算平均报告大小（实例数量）
    const averageReportSize = totalReports > 0 
      ? reports.reduce((sum, report) => sum + report.summary.totalInstances, 0) / totalReports
      : 0;
    
    // 计算报告频率（每小时）
    let reportFrequency = 0;
    if (reports.length >= 2) {
      const timeSpan = reports[0].generatedAt - reports[reports.length - 1].generatedAt;
      const hours = timeSpan / (60 * 60 * 1000);
      reportFrequency = hours > 0 ? (reports.length - 1) / hours : 0;
    }
    
    return {
      totalReports,
      latestReportTime,
      averageReportSize,
      reportFrequency
    };
  }

  /**
   * 更新配置
   */
  public updateConfig(newConfig: Partial<MonitorConfig['reportGeneration']>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 销毁报告生成器
   */
  public destroy(): void {
    this.reports.clear();
  }
}