import { CacheInstanceType } from '../../../config/cache';

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
 * 健康检查结果
 */
export interface HealthCheckResult {
  instanceType: CacheInstanceType;
  timestamp: number;
  isHealthy: boolean;
  checks: {
    connectivity: boolean;
    responseTime: number;
    memoryUsage: number;
    hitRate: number;
    errorRate: number;
  };
  issues: string[];
  score: number; // 0-100
}

/**
 * 监控状态
 */
export interface MonitorStatus {
  isRunning: boolean;
  config: MonitorConfig;
  metricsCount: number;
  reportsCount: number;
  activeAlertsCount: number;
  lastCollectionTime?: number;
  lastReportTime?: number;
}

/**
 * 监控配置（别名）
 */
export type MonitoringConfig = MonitorConfig;

/**
 * 告警规则
 */
export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  enabled: boolean;
  instanceTypes?: CacheInstanceType[];
}

/**
 * 告警事件
 */
export interface AlertEvent {
  id: string;
  ruleId: string;
  timestamp: number;
  instanceType: CacheInstanceType;
  message: string;
  resolved: boolean;
  resolvedAt?: number;
}

/**
 * 健康状态
 */
export interface HealthStatus {
  overall: 'healthy' | 'warning' | 'critical';
  instances: Map<CacheInstanceType, HealthCheckResult>;
  summary: {
    totalInstances: number;
    healthyInstances: number;
    warningInstances: number;
    criticalInstances: number;
  };
  lastCheck: number;
}

/**
 * 指标历史记录
 */
export interface MetricsHistory {
  timestamp: Date;
  metrics: CacheMetrics;
}