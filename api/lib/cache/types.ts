/**
 * 缓存模块统一类型定义
 * 集中管理所有缓存相关的基础类型和接口
 */

// 导入基础配置类型
import type { CacheConfig, CacheConfigs, CacheInstanceType } from '../../config/cache';

// 重新导出基础配置类型
export type { CacheConfig, CacheConfigs, CacheInstanceType } from '../../config/cache';
export { CACHE_INSTANCE_TYPES, getCacheConfig, CacheKeyGenerator, CACHE_PREFIXES, CACHE_TTL, CACHE_ENV } from '../../config/cache';

// 重新导出各模块的类型
export * from './config/types';
export * from './env/types';
export * from './validator/types';
export * from './analytics/types';
export * from './prewarming/types';
// 避免类型名称冲突，使用命名空间导出
export * as HotReloadTypes from './hot-reload/types';
export * as ImportExportTypes from './import-export/types';
export * as MonitoringTypes from './monitoring/types';
// 注释掉暂时不存在的模块
// export * from './utils/types';

/**
 * 缓存操作结果
 */
export interface CacheOperationResult {
  success: boolean;
  message?: string;
  data?: any;
  error?: Error;
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  size: number;
  maxSize: number;
  hitRate: number;
  missRate: number;
  hits: number;
  misses: number;
  evictions: number;
  memoryUsage?: number;
  lastAccess?: Date;
  createdAt?: Date;
}

/**
 * 缓存项元数据
 */
export interface CacheItemMetadata {
  key: string;
  size: number;
  ttl: number;
  createdAt: Date;
  lastAccess: Date;
  accessCount: number;
  tags?: string[];
}

/**
 * 缓存事件类型
 */
export enum CacheEventType {
  HIT = 'hit',
  MISS = 'miss',
  SET = 'set',
  DELETE = 'delete',
  CLEAR = 'clear',
  EXPIRE = 'expire',
  EVICT = 'evict',
  ERROR = 'error'
}

/**
 * 缓存事件数据
 */
export interface CacheEvent {
  type: CacheEventType;
  key: string;
  instanceType: CacheInstanceType;
  timestamp: Date;
  metadata?: CacheItemMetadata;
  error?: Error;
}

/**
 * 缓存健康状态
 */
export interface CacheHealthStatus {
  instanceType: CacheInstanceType;
  status: 'healthy' | 'warning' | 'critical' | 'error';
  message?: string;
  metrics: CacheStats;
  lastCheck: Date;
}

/**
 * 缓存性能指标
 */
export interface CachePerformanceMetrics {
  instanceType: CacheInstanceType;
  responseTime: {
    avg: number;
    min: number;
    max: number;
    p95: number;
    p99: number;
  };
  throughput: {
    requestsPerSecond: number;
    operationsPerSecond: number;
  };
  memory: {
    used: number;
    available: number;
    utilization: number;
  };
  errors: {
    count: number;
    rate: number;
    lastError?: Error;
  };
}

/**
 * 缓存优化建议
 */
export interface CacheOptimizationSuggestion {
  instanceType: CacheInstanceType;
  type: 'performance' | 'memory' | 'configuration' | 'usage';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  estimatedImpact: string;
  implementationComplexity: 'low' | 'medium' | 'high';
}

/**
 * 缓存监控配置
 */
export interface CacheMonitoringConfig {
  enabled: boolean;
  interval: number;
  thresholds: {
    hitRate: number;
    memoryUsage: number;
    responseTime: number;
    errorRate: number;
  };
  alerts: {
    email?: string[];
    webhook?: string;
    slack?: string;
  };
}

/**
 * 缓存备份信息
 */
export interface CacheBackupInfo {
  id: string;
  instanceType: CacheInstanceType;
  timestamp: Date;
  size: number;
  itemCount: number;
  checksum: string;
  metadata: {
    version: string;
    environment: string;
    description?: string;
  };
}

/**
 * 缓存恢复选项
 */
export interface CacheRestoreOptions {
  backupId: string;
  overwrite: boolean;
  validateChecksum: boolean;
  preserveExisting: boolean;
  dryRun: boolean;
}

/**
 * 缓存同步状态
 */
export interface CacheSyncStatus {
  instanceType: CacheInstanceType;
  lastSync: Date;
  status: 'synced' | 'syncing' | 'error' | 'pending';
  conflicts: number;
  syncedItems: number;
  failedItems: number;
  error?: Error;
}

/**
 * 缓存分析报告
 */
export interface CacheAnalysisReport {
  instanceType: CacheInstanceType;
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalRequests: number;
    hitRate: number;
    avgResponseTime: number;
    memoryEfficiency: number;
    errorRate: number;
  };
  trends: {
    hitRateTrend: 'improving' | 'stable' | 'declining';
    performanceTrend: 'improving' | 'stable' | 'declining';
    memoryTrend: 'improving' | 'stable' | 'declining';
  };
  recommendations: CacheOptimizationSuggestion[];
  charts: {
    hitRateOverTime: Array<{ timestamp: Date; value: number }>;
    responseTimeOverTime: Array<{ timestamp: Date; value: number }>;
    memoryUsageOverTime: Array<{ timestamp: Date; value: number }>;
  };
}