import { EnvVarMapping, IEnvMappingManager } from './types';

/**
 * 环境变量映射管理器
 * 负责管理环境变量到配置路径的映射关系
 */
export class EnvMappingManager implements IEnvMappingManager {
  private envMappings: Map<string, EnvVarMapping> = new Map();

  /**
   * 添加环境变量映射
   */
  public addMapping(
    envKey: string,
    configPath: string,
    type: 'number' | 'boolean' | 'string' = 'string',
    defaultValue?: any,
    validator?: (value: any) => boolean,
    transformer?: (value: string) => any
  ): void {
    const mapping: EnvVarMapping = {
      envKey,
      configPath,
      type,
      defaultValue,
      validator,
      transformer
    };
    this.envMappings.set(envKey, mapping);
  }

  /**
   * 添加环境变量映射（兼容旧接口）
   */
  private addMappingCompat(mapping: EnvVarMapping): void {
    this.envMappings.set(mapping.envKey, mapping);
  }

  /**
   * 移除环境变量映射
   */
  public removeMapping(envKey: string): boolean {
    return this.envMappings.delete(envKey);
  }

  /**
   * 获取所有映射
   */
  public getMappings(): EnvVarMapping[] {
    return Array.from(this.envMappings.values());
  }

  /**
   * 获取映射Map
   */
  public getMappingMap(): Map<string, EnvVarMapping> {
    return new Map(this.envMappings);
  }

  /**
   * 获取特定映射
   */
  public getMapping(envKey: string): EnvVarMapping | undefined {
    return this.envMappings.get(envKey);
  }

  /**
   * 检查映射是否存在
   */
  public hasMapping(envKey: string): boolean {
    return this.envMappings.has(envKey);
  }

  /**
   * 清除所有映射
   */
  public clearMappings(): void {
    this.envMappings.clear();
  }

  /**
   * 初始化默认环境变量映射
   */
  public initializeDefaultMappings(): void {
    // 通用缓存配置
    this.addMapping(
      'CACHE_ENABLED',
      'enabled',
      'boolean',
      true,
      undefined,
      (value: string) => value.toLowerCase() === 'true'
    );

    // 用户缓存配置
    this.addUserCacheMappings();
    
    // 内容缓存配置
    this.addContentCacheMappings();
    
    // 统计缓存配置
    this.addStatsCacheMappings();
    
    // 配置缓存配置
    this.addConfigCacheMappings();
    
    // 会话缓存配置
    this.addSessionCacheMappings();
    
    // API缓存配置
    this.addApiCacheMappings();
    
    // 全局配置
    this.addGlobalCacheMappings();
  }

  /**
   * 添加用户缓存映射
   */
  private addUserCacheMappings(): void {
    this.addMapping(
      'CACHE_USER_MAX_SIZE',
      'user.maxSize',
      'number',
      1000,
      (value: number) => value > 0 && value <= 100000,
      (value: string) => parseInt(value, 10)
    );

    this.addMapping(
      'CACHE_USER_TTL',
      'user.defaultTTL',
      'number',
      300000, // 5 minutes
      (value: number) => value > 0 && value <= 86400000, // max 24 hours
      (value: string) => parseInt(value, 10)
    );

    this.addMapping(
      'CACHE_USER_CLEANUP_INTERVAL',
      'user.cleanupInterval',
      'number',
      60000, // 1 minute
      (value: number) => value >= 10000 && value <= 3600000, // 10s to 1h
      (value: string) => parseInt(value, 10)
    );

    this.addMapping(
      'CACHE_USER_ENABLED',
      'user.enabled',
      'boolean',
      true,
      undefined,
      (value: string) => value.toLowerCase() === 'true'
    );
  }

  /**
   * 添加内容缓存映射
   */
  private addContentCacheMappings(): void {
    this.addMapping(
      'CACHE_CONTENT_MAX_SIZE',
      'content.maxSize',
      'number',
      5000,
      (value: number) => value > 0 && value <= 100000,
      (value: string) => parseInt(value, 10)
    );

    this.addMapping(
      'CACHE_CONTENT_TTL',
      'content.defaultTTL',
      'number',
      600000, // 10 minutes
      (value: number) => value > 0 && value <= 86400000,
      (value: string) => parseInt(value, 10)
    );

    this.addMapping(
      'CACHE_CONTENT_CLEANUP_INTERVAL',
      'content.cleanupInterval',
      'number',
      120000, // 2 minutes
      (value: number) => value >= 10000 && value <= 3600000,
      (value: string) => parseInt(value, 10)
    );

    this.addMapping(
      'CACHE_CONTENT_ENABLED',
      'content.enabled',
      'boolean',
      true,
      undefined,
      (value: string) => value.toLowerCase() === 'true'
    );
  }

  /**
   * 添加统计缓存映射
   */
  private addStatsCacheMappings(): void {
    this.addMapping(
      'CACHE_STATS_MAX_SIZE',
      'stats.maxSize',
      'number',
      2000,
      (value: number) => value > 0 && value <= 50000,
      (value: string) => parseInt(value, 10)
    );

    this.addMapping(
      'CACHE_STATS_TTL',
      'stats.defaultTTL',
      'number',
      1800000, // 30 minutes
      (value: number) => value > 0 && value <= 86400000,
      (value: string) => parseInt(value, 10)
    );

    this.addMapping(
      'CACHE_STATS_CLEANUP_INTERVAL',
      'stats.cleanupInterval',
      'number',
      300000, // 5 minutes
      (value: number) => value >= 10000 && value <= 3600000,
      (value: string) => parseInt(value, 10)
    );

    this.addMapping(
      'CACHE_STATS_ENABLED',
      'stats.enabled',
      'boolean',
      true,
      undefined,
      (value: string) => value.toLowerCase() === 'true'
    );
  }

  /**
   * 添加配置缓存映射
   */
  private addConfigCacheMappings(): void {
    this.addMapping(
      'CACHE_CONFIG_MAX_SIZE',
      'config.maxSize',
      'number',
      500,
      (value: number) => value > 0 && value <= 10000,
      (value: string) => parseInt(value, 10)
    );

    this.addMapping(
      'CACHE_CONFIG_TTL',
      'config.defaultTTL',
      'number',
      3600000, // 1 hour
      (value: number) => value > 0 && value <= 86400000,
      (value: string) => parseInt(value, 10)
    );

    this.addMapping(
      'CACHE_CONFIG_CLEANUP_INTERVAL',
      'config.cleanupInterval',
      'number',
      600000, // 10 minutes
      (value: number) => value >= 10000 && value <= 3600000,
      (value: string) => parseInt(value, 10)
    );

    this.addMapping(
      'CACHE_CONFIG_ENABLED',
      'config.enabled',
      'boolean',
      true,
      undefined,
      (value: string) => value.toLowerCase() === 'true'
    );
  }

  /**
   * 添加会话缓存映射
   */
  private addSessionCacheMappings(): void {
    this.addMapping(
      'CACHE_SESSION_MAX_SIZE',
      'session.maxSize',
      'number',
      10000,
      (value: number) => value > 0 && value <= 100000,
      (value: string) => parseInt(value, 10)
    );

    this.addMapping(
      'CACHE_SESSION_TTL',
      'session.defaultTTL',
      'number',
      1800000, // 30 minutes
      (value: number) => value > 0 && value <= 86400000,
      (value: string) => parseInt(value, 10)
    );

    this.addMapping(
      'CACHE_SESSION_CLEANUP_INTERVAL',
      'session.cleanupInterval',
      'number',
      300000, // 5 minutes
      (value: number) => value >= 10000 && value <= 3600000,
      (value: string) => parseInt(value, 10)
    );

    this.addMapping(
      'CACHE_SESSION_ENABLED',
      'session.enabled',
      'boolean',
      true,
      undefined,
      (value: string) => value.toLowerCase() === 'true'
    );
  }

  /**
   * 添加API缓存映射
   */
  private addApiCacheMappings(): void {
    this.addMapping(
      'CACHE_API_MAX_SIZE',
      'api.maxSize',
      'number',
      3000,
      (value: number) => value > 0 && value <= 50000,
      (value: string) => parseInt(value, 10)
    );

    this.addMapping(
      'CACHE_API_TTL',
      'api.defaultTTL',
      'number',
      300000, // 5 minutes
      (value: number) => value > 0 && value <= 86400000,
      (value: string) => parseInt(value, 10)
    );

    this.addMapping(
      'CACHE_API_CLEANUP_INTERVAL',
      'api.cleanupInterval',
      'number',
      120000, // 2 minutes
      (value: number) => value >= 10000 && value <= 3600000,
      (value: string) => parseInt(value, 10)
    );

    this.addMapping(
      'CACHE_API_ENABLED',
      'api.enabled',
      'boolean',
      true,
      undefined,
      (value: string) => value.toLowerCase() === 'true'
    );
  }

  /**
   * 添加全局缓存映射
   */
  private addGlobalCacheMappings(): void {
    this.addMapping(
      'CACHE_GLOBAL_MAX_MEMORY_MB',
      'global.maxMemoryMB',
      'number',
      1024, // 1GB
      (value: number) => value > 0 && value <= 8192, // max 8GB
      (value: string) => parseInt(value, 10)
    );

    this.addMapping(
      'CACHE_GLOBAL_MONITORING_ENABLED',
      'global.monitoringEnabled',
      'boolean',
      true,
      undefined,
      (value: string) => value.toLowerCase() === 'true'
    );

    this.addMapping(
      'CACHE_GLOBAL_MONITORING_INTERVAL',
      'global.monitoringInterval',
      'number',
      30000, // 30 seconds
      (value: number) => value >= 5000 && value <= 300000, // 5s to 5min
      (value: string) => parseInt(value, 10)
    );
  }
}

// 导出默认实例
export const envMappingManager = new EnvMappingManager();