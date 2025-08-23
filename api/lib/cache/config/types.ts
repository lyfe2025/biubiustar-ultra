import * as CacheTypes from '../../../config/cache';

type CacheConfig = CacheTypes.CacheConfig;
type CacheConfigs = CacheTypes.CacheConfigs;
type CacheInstanceType = CacheTypes.CacheInstanceType;

/**
 * 配置变更事件类型
 */
export interface ConfigChangeEvent {
  type: 'update' | 'reload' | 'reset';
  instanceType?: CacheInstanceType;
  oldConfig?: CacheConfigs;
  newConfig?: CacheConfigs;
  timestamp: Date;
  source: 'manual' | 'auto' | 'hotreload' | 'env';
  changes?: Array<{
    path: string;
    oldValue: any;
    newValue: any;
  }>;
}

/**
 * 性能报告接口
 */
export interface PerformanceReport {
  instanceType: CacheInstanceType;
  hitRate: number;
  missRate: number;
  evictionRate: number;
  memoryUsage: {
    current: number;
    peak: number;
    percentage: number;
  };
  operationStats: {
    gets: number;
    sets: number;
    deletes: number;
    clears: number;
  };
  averageResponseTime: number;
  recommendations: string[];
  timestamp: Date;
}

/**
 * 配置验证结果
 */
export interface ConfigValidationResult {
  isValid: boolean;
  errors: Array<{
    path: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
  warnings: string[];
  suggestions: string[];
}

/**
 * 配置优化建议
 */
export interface OptimizationSuggestion {
  type: 'memory' | 'performance' | 'ttl' | 'cleanup';
  priority: 'high' | 'medium' | 'low';
  description: string;
  currentValue: any;
  suggestedValue: any;
  expectedImpact: string;
  configPath: string;
}

/**
 * 配置加载选项
 */
export interface ConfigLoadOptions {
  validateOnLoad?: boolean;
  applyEnvironmentOverrides?: boolean;
  createBackup?: boolean;
  source?: 'file' | 'env' | 'default';
}

/**
 * 配置更新选项
 */
export interface ConfigUpdateOptions {
  validate?: boolean;
  backup?: boolean;
  notifyListeners?: boolean;
  source?: 'manual' | 'auto' | 'hotreload' | 'env';
}

/**
 * 配置监听器类型
 */
export type ConfigChangeListener = (event: ConfigChangeEvent) => void | Promise<void>;

/**
 * 性能监控选项
 */
export interface PerformanceMonitorOptions {
  enabled: boolean;
  reportInterval: number; // 毫秒
  collectDetailedStats: boolean;
  alertThresholds: {
    hitRate: number;
    memoryUsage: number;
    responseTime: number;
  };
}

/**
 * 配置管理器状态
 */
export interface ConfigManagerState {
  isInitialized: boolean;
  lastUpdate: Date;
  configVersion: string;
  activeListeners: number;
  performanceMonitoring: boolean;
  hotReloadEnabled: boolean;
}

export { CacheConfig, CacheConfigs, CacheInstanceType };