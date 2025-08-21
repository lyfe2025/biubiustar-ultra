import { EventEmitter } from 'events';
import { CacheConfig, CacheConfigs, CacheInstanceType } from '../config/cache';
import { EnhancedCacheService } from './enhancedCache';
import * as cacheInstances from './cacheInstances';

/**
 * 缓存配置变更事件类型
 */
export interface CacheConfigChangeEvent {
  type: CacheInstanceType;
  oldConfig: CacheConfig;
  newConfig: CacheConfig;
  timestamp: number;
}

/**
 * 缓存性能报告
 */
export interface CachePerformanceReport {
  instanceType: CacheInstanceType;
  hitRate: number;
  memoryUsage: number;
  itemCount: number;
  avgResponseTime: number;
  recommendations: string[];
}

/**
 * 缓存配置验证结果
 */
export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 统一的缓存配置管理器
 * 负责管理所有缓存实例的配置、监控和优化
 */
export class CacheConfigManager extends EventEmitter {
  private static instance: CacheConfigManager;
  private currentConfigs: Map<CacheInstanceType, CacheConfig> = new Map();
  private performanceHistory: Map<CacheInstanceType, CachePerformanceReport[]> = new Map();
  private configValidators: Map<string, (config: CacheConfig) => ConfigValidationResult> = new Map();
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;

  private constructor() {
    super();
    this.initializeDefaultValidators();
    this.loadCurrentConfigs();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): CacheConfigManager {
    if (!CacheConfigManager.instance) {
      CacheConfigManager.instance = new CacheConfigManager();
    }
    return CacheConfigManager.instance;
  }

  /**
   * 初始化默认配置验证器
   */
  private initializeDefaultValidators(): void {
    // 基础配置验证器
    this.configValidators.set('basic', (config: CacheConfig) => {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (config.maxSize <= 0) {
        errors.push('maxSize must be greater than 0');
      }
      if (config.defaultTTL <= 0) {
        errors.push('defaultTTL must be greater than 0');
      }
      if (config.cleanupInterval <= 0) {
        errors.push('cleanupInterval must be greater than 0');
      }

      // 性能建议
      if (config.maxSize > 10000) {
        warnings.push('Large maxSize may impact memory usage');
      }
      if (config.defaultTTL > 3600000) { // 1 hour
        warnings.push('Long TTL may lead to stale data');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    });

    // 内存使用验证器
    this.configValidators.set('memory', (config: CacheConfig) => {
      const errors: string[] = [];
      const warnings: string[] = [];

      const estimatedMemory = config.maxSize * 1024; // 假设每个条目1KB
      if (estimatedMemory > 100 * 1024 * 1024) { // 100MB
        warnings.push('Estimated memory usage exceeds 100MB');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    });
  }

  /**
   * 加载当前配置
   */
  private loadCurrentConfigs(): void {
    const env = process.env.NODE_ENV || 'development';
    const configs = this.getConfigsForEnvironment(env);
    
    Object.entries(configs).forEach(([type, config]) => {
      this.currentConfigs.set(type as CacheInstanceType, config);
    });
  }

  /**
   * 获取指定环境的配置
   */
  private getConfigsForEnvironment(env: string): CacheConfigs {
    // 这里应该从配置文件或环境变量中读取
    // 暂时返回默认配置
    return {
      user: {
        maxSize: parseInt(process.env.CACHE_USER_MAX_SIZE || '1000'),
        defaultTTL: parseInt(process.env.CACHE_USER_TTL || '300000'),
        cleanupInterval: parseInt(process.env.CACHE_USER_CLEANUP || '60000'),
        enabled: process.env.CACHE_USER_ENABLED !== 'false'
      },
      content: {
        maxSize: parseInt(process.env.CACHE_CONTENT_MAX_SIZE || '500'),
        defaultTTL: parseInt(process.env.CACHE_CONTENT_TTL || '600000'),
        cleanupInterval: parseInt(process.env.CACHE_CONTENT_CLEANUP || '120000'),
        enabled: process.env.CACHE_CONTENT_ENABLED !== 'false'
      },
      stats: {
        maxSize: parseInt(process.env.CACHE_STATS_MAX_SIZE || '100'),
        defaultTTL: parseInt(process.env.CACHE_STATS_TTL || '60000'),
        cleanupInterval: parseInt(process.env.CACHE_STATS_CLEANUP || '30000'),
        enabled: process.env.CACHE_STATS_ENABLED !== 'false'
      },
      config: {
        maxSize: parseInt(process.env.CACHE_CONFIG_MAX_SIZE || '50'),
        defaultTTL: parseInt(process.env.CACHE_CONFIG_TTL || '1800000'),
        cleanupInterval: parseInt(process.env.CACHE_CONFIG_CLEANUP || '300000'),
        enabled: process.env.CACHE_CONFIG_ENABLED !== 'false'
      },
      session: {
        maxSize: parseInt(process.env.CACHE_SESSION_MAX_SIZE || '2000'),
        defaultTTL: parseInt(process.env.CACHE_SESSION_TTL || '1800000'),
        cleanupInterval: parseInt(process.env.CACHE_SESSION_CLEANUP || '300000'),
        enabled: process.env.CACHE_SESSION_ENABLED !== 'false'
      },
      api: {
        maxSize: parseInt(process.env.CACHE_API_MAX_SIZE || '1000'),
        defaultTTL: parseInt(process.env.CACHE_API_TTL || '300000'),
        cleanupInterval: parseInt(process.env.CACHE_API_CLEANUP || '60000'),
        enabled: process.env.CACHE_API_ENABLED !== 'false'
      }
    };
  }

  /**
   * 验证配置
   */
  public validateConfig(config: CacheConfig, validatorNames: string[] = ['basic', 'memory']): ConfigValidationResult {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    for (const validatorName of validatorNames) {
      const validator = this.configValidators.get(validatorName);
      if (validator) {
        const result = validator(config);
        allErrors.push(...result.errors);
        allWarnings.push(...result.warnings);
      }
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }

  /**
   * 更新缓存配置
   */
  public async updateConfig(type: CacheInstanceType, newConfig: CacheConfig): Promise<boolean> {
    try {
      // 验证新配置
      const validation = this.validateConfig(newConfig);
      if (!validation.isValid) {
        throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
      }

      const oldConfig = this.currentConfigs.get(type);
      if (!oldConfig) {
        throw new Error(`No existing configuration found for type: ${type}`);
      }

      // 更新配置
      this.currentConfigs.set(type, newConfig);

      // 热重载缓存实例
      await this.reloadCacheInstance(type, newConfig);

      // 发出配置变更事件
      const changeEvent: CacheConfigChangeEvent = {
        type,
        oldConfig,
        newConfig,
        timestamp: Date.now()
      };
      this.emit('configChanged', changeEvent);

      return true;
    } catch (error) {
      console.error(`Failed to update config for ${type}:`, error);
      return false;
    }
  }

  /**
   * 热重载缓存实例
   */
  private async reloadCacheInstance(type: CacheInstanceType, config: CacheConfig): Promise<void> {
    // 获取对应的缓存实例
    const instance = this.getCacheInstance(type);
    if (instance) {
      // 保存当前数据
      const currentData = new Map();
      const keys = instance.keys();
      for (const key of keys) {
        const value = instance.get(key);
        if (value !== undefined) {
          currentData.set(key, value);
        }
      }

      // 销毁旧实例
      instance.destroy();

      // 创建新实例
      const newInstance = new EnhancedCacheService({
        maxSize: config.maxSize,
        defaultTTL: config.defaultTTL,
        cleanupInterval: config.cleanupInterval
      });

      // 恢复数据
      for (const [key, value] of currentData) {
        newInstance.set(key, value);
      }

      // 更新实例引用（这里需要根据实际的缓存实例管理方式来实现）
      this.updateCacheInstanceReference(type, newInstance);
    }
  }

  /**
   * 获取缓存实例
   */
  private getCacheInstance(type: CacheInstanceType): EnhancedCacheService | null {
    // 这里需要根据实际的缓存实例管理方式来实现
    switch (type) {
      case 'user':
        return cacheInstances.userCache;
      case 'content':
        return cacheInstances.contentCache;
      case 'stats':
        return cacheInstances.statsCache;
      case 'config':
        return cacheInstances.configCache;
      case 'session':
        return cacheInstances.sessionCache;
      case 'api':
        return cacheInstances.apiCache;
      default:
        return null;
    }
  }

  /**
   * 更新缓存实例引用
   */
  private updateCacheInstanceReference(type: CacheInstanceType, instance: EnhancedCacheService): void {
    // 这里需要根据实际的缓存实例管理方式来实现
    // 可能需要更新 cacheInstances 模块中的引用
  }

  /**
   * 获取当前配置
   */
  public getConfig(type: CacheInstanceType): CacheConfig | undefined {
    return this.currentConfigs.get(type);
  }

  /**
   * 获取所有配置
   */
  public getAllConfigs(): Map<CacheInstanceType, CacheConfig> {
    return new Map(this.currentConfigs);
  }

  /**
   * 开始性能监控
   */
  public startMonitoring(intervalMs: number = 60000): void {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.collectPerformanceData();
    }, intervalMs);
  }

  /**
   * 停止性能监控
   */
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.isMonitoring = false;
  }

  /**
   * 收集性能数据
   */
  private collectPerformanceData(): void {
    for (const [type] of this.currentConfigs) {
      const instance = this.getCacheInstance(type);
      if (instance) {
        const stats = instance.getStats();
        const report: CachePerformanceReport = {
          instanceType: type,
          hitRate: stats.hitRate,
          memoryUsage: stats.memoryUsage,
          itemCount: stats.itemCount,
          avgResponseTime: stats.avgAccessTime || 0,
          recommendations: this.generateRecommendations(type, stats)
        };

        // 保存性能历史
        if (!this.performanceHistory.has(type)) {
          this.performanceHistory.set(type, []);
        }
        const history = this.performanceHistory.get(type)!;
        history.push(report);

        // 保持最近100条记录
        if (history.length > 100) {
          history.shift();
        }

        // 发出性能报告事件
        this.emit('performanceReport', report);
      }
    }
  }

  /**
   * 生成性能优化建议
   */
  private generateRecommendations(type: CacheInstanceType, stats: any): string[] {
    const recommendations: string[] = [];

    if (stats.hitRate < 0.5) {
      recommendations.push('Hit rate is low, consider increasing TTL or reviewing cache strategy');
    }

    if (stats.memoryUsage > 0.8) {
      recommendations.push('Memory usage is high, consider increasing maxSize or reducing TTL');
    }

    if (stats.itemCount === 0) {
      recommendations.push('Cache is empty, check if caching is working properly');
    }

    return recommendations;
  }

  /**
   * 获取性能报告
   */
  public getPerformanceReport(type: CacheInstanceType): CachePerformanceReport[] {
    return this.performanceHistory.get(type) || [];
  }

  /**
   * 获取所有性能报告
   */
  public getAllPerformanceReports(): Map<CacheInstanceType, CachePerformanceReport[]> {
    return new Map(this.performanceHistory);
  }

  /**
   * 清理性能历史数据
   */
  public clearPerformanceHistory(type?: CacheInstanceType): void {
    if (type) {
      this.performanceHistory.delete(type);
    } else {
      this.performanceHistory.clear();
    }
  }

  /**
   * 添加自定义验证器
   */
  public addValidator(name: string, validator: (config: CacheConfig) => ConfigValidationResult): void {
    this.configValidators.set(name, validator);
  }

  /**
   * 移除验证器
   */
  public removeValidator(name: string): void {
    this.configValidators.delete(name);
  }

  /**
   * 导出配置
   */
  public exportConfigs(): string {
    const configObject: Record<string, CacheConfig> = {};
    for (const [type, config] of this.currentConfigs) {
      configObject[type] = config;
    }
    return JSON.stringify(configObject, null, 2);
  }

  /**
   * 导入配置
   */
  public async importConfigs(configJson: string): Promise<boolean> {
    try {
      const configs = JSON.parse(configJson);
      
      // 验证所有配置
      for (const [type, config] of Object.entries(configs)) {
        const validation = this.validateConfig(config as CacheConfig);
        if (!validation.isValid) {
          throw new Error(`Invalid config for ${type}: ${validation.errors.join(', ')}`);
        }
      }

      // 应用所有配置
      for (const [type, config] of Object.entries(configs)) {
        await this.updateConfig(type as CacheInstanceType, config as CacheConfig);
      }

      return true;
    } catch (error) {
      console.error('Failed to import configs:', error);
      return false;
    }
  }

  /**
   * 销毁管理器
   */
  public destroy(): void {
    this.stopMonitoring();
    this.removeAllListeners();
    this.currentConfigs.clear();
    this.performanceHistory.clear();
    this.configValidators.clear();
  }
}

// 导出单例实例
export const cacheConfigManager = CacheConfigManager.getInstance();