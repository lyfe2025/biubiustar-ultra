/**
 * 批量数据服务的缓存管理器
 * 负责缓存的存储、检索、清理和配置管理
 */

import { BatchRequest, BatchResponse, CacheConfig, CacheEntry } from './types';

export class CacheManager {
  private cache = new Map<string, CacheEntry>();
  private defaultCacheConfig: CacheConfig = {
    ttl: 5 * 60 * 1000, // 5分钟
    maxSize: 100
  };

  /**
   * 生成缓存键
   * @param request 批量请求对象
   * @returns 缓存键字符串
   */
  getCacheKey(request: BatchRequest): string {
    return `${request.type}_${JSON.stringify(request.params || {})}`;
  }

  /**
   * 获取缓存的结果
   * @param requests 批量请求数组
   * @returns 缓存的响应数组，如果有任何请求未缓存则返回空数组
   */
  getCachedResults(requests: BatchRequest[]): BatchResponse[] {
    const results: BatchResponse[] = [];
    
    for (const request of requests) {
      const cacheKey = this.getCacheKey(request);
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        results.push({
          id: request.id,
          type: request.type,
          data: cached.data,
          cached: true
        });
      } else {
        // 如果有任何一个请求没有缓存，返回空数组
        return [];
      }
    }
    
    return results;
  }

  /**
   * 缓存批量请求的结果
   * @param requests 批量请求数组
   * @param results 批量响应数组
   */
  cacheResults(requests: BatchRequest[], results: BatchResponse[]): void {
    // 清理过期缓存
    this.cleanExpiredCache();
    
    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.defaultCacheConfig.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    // 缓存新结果
    requests.forEach((request, index) => {
      const result = results[index];
      if (result && !result.error) {
        const cacheKey = this.getCacheKey(request);
        this.cache.set(cacheKey, {
          data: result.data,
          timestamp: Date.now(),
          ttl: this.defaultCacheConfig.ttl
        });
      }
    });
  }

  /**
   * 清理过期的缓存条目
   */
  cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 从缓存中获取数据
   * @param key 缓存键
   * @returns 缓存的数据或null
   */
  getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data as T;
    }
    return null;
  }

  /**
   * 设置缓存数据
   * @param key 缓存键
   * @param data 要缓存的数据
   * @param ttl 缓存时间（毫秒）
   */
  setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * 清除所有缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存统计信息
   * @returns 缓存统计对象
   */
  getCacheStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const entry of this.cache.values()) {
      if (now - entry.timestamp < entry.ttl) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      maxSize: this.defaultCacheConfig.maxSize,
      utilizationRate: this.cache.size / this.defaultCacheConfig.maxSize
    };
  }

  /**
   * 更新缓存配置
   * @param config 新的缓存配置
   */
  updateCacheConfig(config: Partial<CacheConfig>): void {
    this.defaultCacheConfig = {
      ...this.defaultCacheConfig,
      ...config
    };
  }

  /**
   * 获取当前缓存配置
   * @returns 当前缓存配置
   */
  getCacheConfig(): CacheConfig {
    return { ...this.defaultCacheConfig };
  }
}