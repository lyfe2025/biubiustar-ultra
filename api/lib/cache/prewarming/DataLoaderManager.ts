/**
 * 数据加载管理器
 * 
 * 负责管理和协调各种数据加载器
 */

import { DataLoader, DataLoaderConfig } from './types';
import { cacheEventNotification, CacheEventType, EventSeverity } from '../../CacheEventNotification';

/**
 * 数据加载器包装器
 */
interface LoaderWrapper {
  loader: DataLoader;
  name: string;
  config: DataLoaderConfig;
  stats: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    lastUsed: Date;
  };
}

/**
 * 加载结果缓存项
 */
interface CacheItem {
  data: { key: string; value: any; ttl?: number }[];
  timestamp: number;
  ttl: number;
}

export class DataLoaderManager {
  private loaders: Map<string, LoaderWrapper> = new Map();
  private resultCache: Map<string, CacheItem> = new Map();
  private config: DataLoaderConfig;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: Partial<DataLoaderConfig> = {}) {
    this.config = {
      timeout: 30000, // 30秒
      retries: 3,
      cacheResults: true,
      cacheTTL: 300000, // 5分钟
      ...config
    };

    // 定期清理过期缓存
    if (this.config.cacheResults) {
      this.cleanupTimer = setInterval(() => {
        this.cleanupExpiredCache();
      }, 60000); // 每分钟清理一次
    }
  }

  /**
   * 注册数据加载器
   */
  public registerLoader(name: string, loader: DataLoader, config?: Partial<DataLoaderConfig>): void {
    const loaderConfig = { ...this.config, ...config };
    
    this.loaders.set(name, {
      loader,
      name,
      config: loaderConfig,
      stats: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        lastUsed: new Date()
      }
    });

    cacheEventNotification.emitEvent(CacheEventType.CACHE_CLEANUP_STARTED, {
      timestamp: new Date(),
      severity: EventSeverity.INFO,
      source: 'DataLoaderManager',
      message: `Registered data loader: ${name}`,
      metadata: { loaderName: name }
    });
  }

  /**
   * 注销数据加载器
   */
  public unregisterLoader(name: string): boolean {
    const removed = this.loaders.delete(name);
    
    if (removed) {
      // 清理相关缓存
      for (const [key, _] of this.resultCache) {
        if (key.startsWith(`${name}:`)) {
          this.resultCache.delete(key);
        }
      }

      cacheEventNotification.emitEvent(CacheEventType.CACHE_CLEANUP_COMPLETED, {
        timestamp: new Date(),
        severity: EventSeverity.INFO,
        source: 'DataLoaderManager',
        message: `Unregistered data loader: ${name}`,
        metadata: { loaderName: name }
      });
    }
    
    return removed;
  }

  /**
   * 批量加载数据
   */
  public async loadData(
    loaderName: string,
    keys: string[]
  ): Promise<Array<{ key: string; value: any; ttl?: number }>> {
    const wrapper = this.loaders.get(loaderName);
    if (!wrapper) {
      throw new Error(`Data loader '${loaderName}' not found`);
    }

    const cacheKey = `${loaderName}:${keys.sort().join(',')}`;
    
    // 检查缓存
    if (wrapper.config.cacheResults) {
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const startTime = Date.now();
    wrapper.stats.totalRequests++;
    wrapper.stats.lastUsed = new Date();

    try {
      const result = await this.executeWithRetry(
        () => wrapper.loader.load(keys),
        wrapper.config.retries,
        wrapper.config.timeout
      );

      // 更新统计信息
      const responseTime = Date.now() - startTime;
      wrapper.stats.successfulRequests++;
      wrapper.stats.averageResponseTime = 
        (wrapper.stats.averageResponseTime * (wrapper.stats.successfulRequests - 1) + responseTime) / 
        wrapper.stats.successfulRequests;

      // 缓存结果
      if (wrapper.config.cacheResults) {
        this.cacheResult(cacheKey, result, wrapper.config.cacheTTL);
      }

      return result;
    } catch (error) {
      wrapper.stats.failedRequests++;
      
      await cacheEventNotification.emitError({
        source: 'DataLoaderManager',
        message: `Failed to load data using loader '${loaderName}'`,
        error: error as Error,
        metadata: { loaderName, keys, retries: wrapper.config.retries }
      });
      
      throw error;
    }
  }

  /**
   * 加载单个数据项
   */
  public async loadSingle(
    loaderName: string,
    key: string
  ): Promise<{ value: any; ttl?: number } | null> {
    const wrapper = this.loaders.get(loaderName);
    if (!wrapper) {
      throw new Error(`Data loader '${loaderName}' not found`);
    }

    // 如果加载器支持单项加载，直接使用
    if (wrapper.loader.loadSingle) {
      const startTime = Date.now();
      wrapper.stats.totalRequests++;
      wrapper.stats.lastUsed = new Date();

      try {
        const result = await this.executeWithRetry(
          () => wrapper.loader.loadSingle!(key),
          wrapper.config.retries,
          wrapper.config.timeout
        );

        // 更新统计信息
        const responseTime = Date.now() - startTime;
        wrapper.stats.successfulRequests++;
        wrapper.stats.averageResponseTime = 
          (wrapper.stats.averageResponseTime * (wrapper.stats.successfulRequests - 1) + responseTime) / 
          wrapper.stats.successfulRequests;

        return result;
      } catch (error) {
        wrapper.stats.failedRequests++;
        throw error;
      }
    }

    // 否则使用批量加载
    const results = await this.loadData(loaderName, [key]);
    const result = results.find(r => r.key === key);
    return result ? { value: result.value, ttl: result.ttl } : null;
  }

  /**
   * 预加载数据
   */
  public async preloadData(
    loaderName: string,
    keys: string[]
  ): Promise<void> {
    try {
      await this.loadData(loaderName, keys);
    } catch (error) {
      // 预加载失败不抛出错误，只记录日志
      await cacheEventNotification.emitError({
        source: 'DataLoaderManager',
        message: `Failed to preload data using loader '${loaderName}'`,
        error: error as Error,
        metadata: { loaderName, keys }
      });
    }
  }

  /**
   * 获取加载器列表
   */
  public getLoaders(): string[] {
    return Array.from(this.loaders.keys());
  }

  /**
   * 获取加载器统计信息
   */
  public getLoaderStats(loaderName: string): LoaderWrapper['stats'] | null {
    const wrapper = this.loaders.get(loaderName);
    return wrapper ? { ...wrapper.stats } : null;
  }

  /**
   * 获取所有加载器统计信息
   */
  public getAllStats(): Record<string, LoaderWrapper['stats']> {
    const stats: Record<string, LoaderWrapper['stats']> = {};
    
    for (const [name, wrapper] of this.loaders) {
      stats[name] = { ...wrapper.stats };
    }
    
    return stats;
  }

  /**
   * 清理缓存
   */
  public clearCache(loaderName?: string): void {
    if (loaderName) {
      // 清理特定加载器的缓存
      for (const [key, _] of this.resultCache) {
        if (key.startsWith(`${loaderName}:`)) {
          this.resultCache.delete(key);
        }
      }
    } else {
      // 清理所有缓存
      this.resultCache.clear();
    }
  }

  /**
   * 获取缓存统计
   */
  public getCacheStats(): {
    totalEntries: number;
    totalSize: number;
    hitRate: number;
  } {
    // 这里简化实现，实际应该跟踪缓存命中率
    return {
      totalEntries: this.resultCache.size,
      totalSize: 0, // 需要实际计算
      hitRate: 0 // 需要跟踪命中率
    };
  }

  /**
   * 更新配置
   */
  public updateConfig(newConfig: Partial<DataLoaderConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // 更新所有加载器的配置
    for (const wrapper of this.loaders.values()) {
      wrapper.config = { ...wrapper.config, ...newConfig };
    }
  }

  /**
   * 带重试的执行
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    retries: number,
    timeout: number
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await Promise.race([
          operation(),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Operation timeout')), timeout)
          )
        ]);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < retries) {
          // 指数退避
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  }

  /**
   * 获取缓存结果
   */
  private getCachedResult(key: string): Array<{ key: string; value: any; ttl?: number }> | null {
    const cached = this.resultCache.get(key);
    if (!cached) {
      return null;
    }
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.resultCache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  /**
   * 缓存结果
   */
  private cacheResult(
    key: string,
    data: Array<{ key: string; value: any; ttl?: number }>,
    ttl: number
  ): void {
    this.resultCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * 清理过期缓存
   */
  private cleanupExpiredCache(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, cached] of this.resultCache) {
      if (now - cached.timestamp > cached.ttl) {
        this.resultCache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      cacheEventNotification.emitEvent(CacheEventType.CACHE_CLEANUP_COMPLETED, {
        timestamp: new Date(),
        severity: EventSeverity.INFO,
        source: 'DataLoaderManager',
        message: `Cleaned up ${cleaned} expired cache entries`,
        metadata: { cleanedCount: cleaned }
      });
    }
  }

  /**
   * 获取统计信息
   */
  public getStatistics() {
    return { 
      totalLoaders: this.loaders.size,
      activeLoaders: Array.from(this.loaders.values()).filter(loader => {
        const timeSinceLastUsed = Date.now() - loader.stats.lastUsed.getTime();
        return timeSinceLastUsed < 300000; // 5分钟内使用过的认为是活跃的
      }).length,
      totalRequests: 0, // TODO: 实现统计逻辑
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0
    };
  }

  /**
   * 销毁管理器
   */
  public destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    
    this.loaders.clear();
    this.resultCache.clear();
  }
}