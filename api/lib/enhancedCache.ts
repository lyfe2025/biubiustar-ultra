/**
 * Enhanced Cache Service
 * 增强版缓存服务，支持 LRU、TTL、访问统计等高级功能
 */

interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccess: number;
}

interface CacheOptions {
  maxSize?: number;
  defaultTTL?: number;
  cleanupInterval?: number;
}

interface CacheStats {
  size: number;
  maxSize: number;
  hitRate: number;
  memoryUsage: number;
  totalHits: number;
  totalMisses: number;
  hits: number;
  misses: number;
  gets?: number;
  sets?: number;
  deletes?: number;
  clears?: number;
  expired?: number;
  evicted?: number;
  errors?: number;
  lastError?: string;
  missRate?: number;
  itemCount?: number;
  avgAccessTime?: number;
  ttl?: number;
}

export class EnhancedCacheService {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize: number;
  private defaultTTL: number;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private totalHits = 0;
  private totalMisses = 0;
  private totalGets = 0;
  private totalSets = 0;
  private totalDeletes = 0;
  private totalClears = 0;
  private totalExpired = 0;
  private totalEvicted = 0;
  private totalErrors = 0;
  private lastError?: string;
  
  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 1000;
    this.defaultTTL = options.defaultTTL || 5 * 60 * 1000; // 5分钟
    
    // 启动清理任务
    this.startCleanup(options.cleanupInterval || 60000);
  }
  
  /**
   * 智能缓存获取
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      this.totalGets++;
      const item = this.cache.get(key);
      if (!item) {
        this.totalMisses++;
        return null;
      }
      
      if (this.isExpired(item)) {
        this.cache.delete(key);
        this.totalExpired++;
        this.totalMisses++;
        return null;
      }
      
      // 更新访问统计
      item.accessCount++;
      item.lastAccess = Date.now();
      this.totalHits++;
      
      return item.data as T;
    } catch (error) {
      this.totalErrors++;
      this.lastError = error instanceof Error ? error.message : String(error);
      return null;
    }
  }
  
  /**
   * 批量获取
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    return Promise.all(keys.map(key => this.get<T>(key)));
  }
  
  /**
   * 设置缓存
   */
  set<T>(key: string, data: T, ttl?: number): void {
    this.totalSets++;
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      accessCount: 0,
      lastAccess: Date.now()
    };
    
    this.cache.set(key, item);
    this.enforceMaxSize();
  }
  
  /**
   * 批量设置
   */
  async mset<T>(entries: Array<{ key: string; data: T; ttl?: number }>): Promise<void> {
    entries.forEach(({ key, data, ttl }) => {
      this.set(key, data, ttl);
    });
  }
  
  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    const result = this.cache.delete(key);
    if (result) {
      this.totalDeletes++;
    }
    return result;
  }
  
  /**
   * 批量删除
   */
  async mdel(keys: string[]): Promise<number> {
    let deletedCount = 0;
    keys.forEach(key => {
      if (this.cache.delete(key)) {
        deletedCount++;
      }
    });
    return deletedCount;
  }
  
  /**
   * 清空所有缓存
   */
  clear(): void {
    this.totalClears++;
    this.cache.clear();
  }
  
  /**
   * 检查键是否存在
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (this.isExpired(item)) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
  
  /**
   * 获取所有键
   */
  keys(): string[] {
    const validKeys: string[] = [];
    for (const [key, item] of this.cache.entries()) {
      if (!this.isExpired(item)) {
        validKeys.push(key);
      } else {
        this.cache.delete(key);
      }
    }
    return validKeys;
  }
  
  /**
   * 获取缓存统计
   */
  getStats(): CacheStats {
    const hitRate = this.calculateHitRate();
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate,
      memoryUsage: this.getMemoryUsage(),
      totalHits: this.totalHits,
      totalMisses: this.totalMisses,
      hits: this.totalHits,
      misses: this.totalMisses,
      gets: this.totalGets,
      sets: this.totalSets,
      deletes: this.totalDeletes,
      clears: this.totalClears,
      expired: this.totalExpired,
      evicted: this.totalEvicted,
      errors: this.totalErrors,
      lastError: this.lastError,
      missRate: 1 - hitRate,
      itemCount: this.cache.size,
      avgAccessTime: this.calculateAvgAccessTime(),
      ttl: this.defaultTTL
    };
  }
  
  /**
   * 获取或设置缓存（如果不存在则执行回调函数）
   */
  async getOrSet<T>(
    key: string, 
    factory: () => Promise<T> | T, 
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    
    const data = await factory();
    this.set(key, data, ttl);
    return data;
  }
  
  /**
   * 销毁缓存服务
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.cache.clear();
  }
  
  /**
   * 检查缓存项是否过期
   */
  private isExpired(item: CacheItem): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }
  
  /**
   * 强制执行最大大小限制（LRU策略）
   */
  private enforceMaxSize(): void {
    if (this.cache.size <= this.maxSize) return;
    
    // LRU策略：删除最久未访问的缓存
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].lastAccess - b[1].lastAccess);
    
    const toDelete = entries.slice(0, this.cache.size - this.maxSize);
    toDelete.forEach(([key]) => {
      this.cache.delete(key);
      this.totalEvicted++;
    });
  }
  
  /**
   * 启动清理任务
   */
  private startCleanup(interval: number): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpired();
    }, interval);
  }
  
  /**
   * 清理过期缓存
   */
  private cleanupExpired(): void {
    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        this.cache.delete(key);
        this.totalExpired++;
      }
    }
  }
  
  /**
   * 计算命中率
   */
  private calculateHitRate(): number {
    const total = this.totalHits + this.totalMisses;
    return total === 0 ? 0 : this.totalHits / total;
  }
  
  /**
   * 获取内存使用量
   */
  private getMemoryUsage(): number {
    return process.memoryUsage().heapUsed;
  }

  /**
   * 计算平均访问时间
   */
  private calculateAvgAccessTime(): number {
    if (this.cache.size === 0) return 0;
    
    let totalAccessTime = 0;
    let accessCount = 0;
    
    for (const item of this.cache.values()) {
      if (item.accessCount > 0) {
        totalAccessTime += (Date.now() - item.lastAccess) / item.accessCount;
        accessCount++;
      }
    }
    
    return accessCount === 0 ? 0 : totalAccessTime / accessCount;
  }
}