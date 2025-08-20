/**
 * 缓存服务 - 提供内存缓存和本地存储缓存功能
 * 支持TTL（生存时间）和自动清理过期数据
 */

export interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // 生存时间（毫秒）
}

export interface CacheOptions {
  ttl?: number; // 默认TTL（毫秒）
  maxSize?: number; // 最大缓存条目数
  storage?: 'memory' | 'localStorage' | 'both'; // 缓存存储类型
}

class CacheService {
  private memoryCache = new Map<string, CacheItem>();
  private defaultTTL = 5 * 60 * 1000; // 默认5分钟
  private maxSize = 100; // 默认最大100个条目
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(options: CacheOptions = {}) {
    this.defaultTTL = options.ttl || this.defaultTTL;
    this.maxSize = options.maxSize || this.maxSize;
    
    // 启动定期清理过期缓存
    this.startCleanup();
  }

  /**
   * 设置缓存
   */
  set<T>(key: string, data: T, options: { ttl?: number; storage?: 'memory' | 'localStorage' | 'both' } = {}): void {
    const ttl = options.ttl || this.defaultTTL;
    const storage = options.storage || 'memory';
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };

    // 内存缓存
    if (storage === 'memory' || storage === 'both') {
      this.memoryCache.set(key, cacheItem);
      this.enforceMaxSize();
    }

    // 本地存储缓存
    if (storage === 'localStorage' || storage === 'both') {
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
      } catch (error) {
        console.warn('Failed to set localStorage cache:', error);
      }
    }
  }

  /**
   * 获取缓存
   */
  get<T>(key: string, storage: 'memory' | 'localStorage' | 'both' = 'memory'): T | null {
    // 优先从内存缓存获取
    if (storage === 'memory' || storage === 'both') {
      const memoryItem = this.memoryCache.get(key);
      if (memoryItem && this.isValid(memoryItem)) {
        return memoryItem.data as T;
      }
      if (memoryItem && !this.isValid(memoryItem)) {
        this.memoryCache.delete(key);
      }
    }

    // 从本地存储获取
    if (storage === 'localStorage' || storage === 'both') {
      try {
        const stored = localStorage.getItem(`cache_${key}`);
        if (stored) {
          const cacheItem: CacheItem<T> = JSON.parse(stored);
          if (this.isValid(cacheItem)) {
            // 如果内存缓存中没有，则同步到内存缓存
            if (storage === 'both' && !this.memoryCache.has(key)) {
              this.memoryCache.set(key, cacheItem);
            }
            return cacheItem.data;
          } else {
            localStorage.removeItem(`cache_${key}`);
          }
        }
      } catch (error) {
        console.warn('Failed to get localStorage cache:', error);
      }
    }

    return null;
  }

  /**
   * 删除缓存
   */
  delete(key: string, storage: 'memory' | 'localStorage' | 'both' = 'both'): void {
    if (storage === 'memory' || storage === 'both') {
      this.memoryCache.delete(key);
    }

    if (storage === 'localStorage' || storage === 'both') {
      try {
        localStorage.removeItem(`cache_${key}`);
      } catch (error) {
        console.warn('Failed to delete localStorage cache:', error);
      }
    }
  }

  /**
   * 清空所有缓存
   */
  clear(storage: 'memory' | 'localStorage' | 'both' = 'both'): void {
    if (storage === 'memory' || storage === 'both') {
      this.memoryCache.clear();
    }

    if (storage === 'localStorage' || storage === 'both') {
      try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('cache_')) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.warn('Failed to clear localStorage cache:', error);
      }
    }
  }

  /**
   * 获取或设置缓存（如果不存在则执行获取函数）
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: { ttl?: number; storage?: 'memory' | 'localStorage' | 'both' } = {}
  ): Promise<T> {
    const cached = this.get<T>(key, options.storage);
    if (cached !== null) {
      return cached;
    }

    const data = await fetchFn();
    this.set(key, data, options);
    return data;
  }

  /**
   * 检查缓存项是否有效（未过期）
   */
  private isValid(item: CacheItem): boolean {
    return Date.now() - item.timestamp < item.ttl;
  }

  /**
   * 强制执行最大缓存大小限制
   */
  private enforceMaxSize(): void {
    if (this.memoryCache.size > this.maxSize) {
      // 删除最旧的缓存项
      const oldestKey = this.memoryCache.keys().next().value;
      if (oldestKey) {
        this.memoryCache.delete(oldestKey);
      }
    }
  }

  /**
   * 启动定期清理过期缓存
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 60000); // 每分钟清理一次
  }

  /**
   * 清理过期的缓存项
   */
  private cleanupExpired(): void {
    // 清理内存缓存
    for (const [key, item] of this.memoryCache.entries()) {
      if (!this.isValid(item)) {
        this.memoryCache.delete(key);
      }
    }

    // 清理本地存储缓存
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          try {
            const stored = localStorage.getItem(key);
            if (stored) {
              const cacheItem: CacheItem = JSON.parse(stored);
              if (!this.isValid(cacheItem)) {
                localStorage.removeItem(key);
              }
            }
          } catch (error) {
            // 如果解析失败，删除该项
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('Failed to cleanup localStorage cache:', error);
    }
  }

  /**
   * 销毁缓存服务
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.memoryCache.clear();
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    memorySize: number;
    localStorageSize: number;
    memoryKeys: string[];
    localStorageKeys: string[];
  } {
    const localStorageKeys: string[] = [];
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          localStorageKeys.push(key.replace('cache_', ''));
        }
      });
    } catch (error) {
      console.warn('Failed to get localStorage stats:', error);
    }

    return {
      memorySize: this.memoryCache.size,
      localStorageSize: localStorageKeys.length,
      memoryKeys: Array.from(this.memoryCache.keys()),
      localStorageKeys
    };
  }
}

// 创建默认缓存实例
export const defaultCache = new CacheService({
  ttl: 5 * 60 * 1000, // 5分钟
  maxSize: 100,
  storage: 'both'
});

// 创建短期缓存实例（用于频繁变化的数据）
export const shortTermCache = new CacheService({
  ttl: 30 * 1000, // 30秒
  maxSize: 50,
  storage: 'memory'
});

// 创建长期缓存实例（用于相对稳定的数据）
export const longTermCache = new CacheService({
  ttl: 30 * 60 * 1000, // 30分钟
  maxSize: 200,
  storage: 'both'
});

export { CacheService };