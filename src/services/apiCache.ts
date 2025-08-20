/**
 * API响应缓存服务
 * 提供内存缓存和localStorage持久化缓存功能
 * 支持TTL（生存时间）、缓存键管理和缓存清理
 */

interface CacheItem {
  data: any
  timestamp: number
  ttl: number // 生存时间（毫秒）
}

interface CacheConfig {
  defaultTTL: number // 默认TTL（毫秒）
  maxMemoryItems: number // 内存缓存最大条目数
  enablePersistent: boolean // 是否启用持久化缓存
}

class ApiCache {
  private memoryCache = new Map<string, CacheItem>()
  private config: CacheConfig
  private readonly STORAGE_PREFIX = 'api_cache_'

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 默认5分钟
      maxMemoryItems: 100,
      enablePersistent: true,
      ...config
    }
  }

  /**
   * 生成缓存键
   */
  private generateKey(prefix: string, params: any = {}): string {
    const paramStr = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|')
    return `${prefix}${paramStr ? `_${paramStr}` : ''}`
  }

  /**
   * 检查缓存项是否过期
   */
  private isExpired(item: CacheItem): boolean {
    return Date.now() - item.timestamp > item.ttl
  }

  /**
   * 从内存缓存获取数据
   */
  private getFromMemory(key: string): any | null {
    const item = this.memoryCache.get(key)
    if (!item) return null
    
    if (this.isExpired(item)) {
      this.memoryCache.delete(key)
      return null
    }
    
    return item.data
  }

  /**
   * 存储到内存缓存
   */
  private setToMemory(key: string, data: any, ttl: number): void {
    // 如果超过最大条目数，删除最旧的条目
    if (this.memoryCache.size >= this.config.maxMemoryItems) {
      const firstKey = this.memoryCache.keys().next().value
      if (firstKey) {
        this.memoryCache.delete(firstKey)
      }
    }

    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  /**
   * 从localStorage获取数据
   */
  private getFromStorage(key: string): any | null {
    if (!this.config.enablePersistent) return null
    
    try {
      const stored = localStorage.getItem(this.STORAGE_PREFIX + key)
      if (!stored) return null
      
      const item: CacheItem = JSON.parse(stored)
      if (this.isExpired(item)) {
        localStorage.removeItem(this.STORAGE_PREFIX + key)
        return null
      }
      
      return item.data
    } catch (error) {
      console.warn('从localStorage读取缓存失败:', error)
      return null
    }
  }

  /**
   * 存储到localStorage
   */
  private setToStorage(key: string, data: any, ttl: number): void {
    if (!this.config.enablePersistent) return
    
    try {
      const item: CacheItem = {
        data,
        timestamp: Date.now(),
        ttl
      }
      localStorage.setItem(this.STORAGE_PREFIX + key, JSON.stringify(item))
    } catch (error) {
      console.warn('存储到localStorage失败:', error)
    }
  }

  /**
   * 获取缓存数据
   */
  get(prefix: string, params: any = {}): any | null {
    const key = this.generateKey(prefix, params)
    
    // 优先从内存缓存获取
    let data = this.getFromMemory(key)
    if (data !== null) {
      return data
    }
    
    // 从localStorage获取
    data = this.getFromStorage(key)
    if (data !== null) {
      // 将数据同步到内存缓存
      this.setToMemory(key, data, this.config.defaultTTL)
      return data
    }
    
    return null
  }

  /**
   * 设置缓存数据
   */
  set(prefix: string, data: any, params: any = {}, ttl?: number): void {
    const key = this.generateKey(prefix, params)
    const cacheTTL = ttl || this.config.defaultTTL
    
    // 存储到内存缓存
    this.setToMemory(key, data, cacheTTL)
    
    // 存储到localStorage
    this.setToStorage(key, data, cacheTTL)
  }

  /**
   * 删除特定缓存
   */
  delete(prefix: string, params: any = {}): void {
    const key = this.generateKey(prefix, params)
    
    // 从内存缓存删除
    this.memoryCache.delete(key)
    
    // 从localStorage删除
    if (this.config.enablePersistent) {
      localStorage.removeItem(this.STORAGE_PREFIX + key)
    }
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    // 清理内存缓存
    for (const [key, item] of this.memoryCache.entries()) {
      if (this.isExpired(item)) {
        this.memoryCache.delete(key)
      }
    }
    
    // 清理localStorage缓存
    if (this.config.enablePersistent) {
      try {
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith(this.STORAGE_PREFIX)) {
            const stored = localStorage.getItem(key)
            if (stored) {
              try {
                const item: CacheItem = JSON.parse(stored)
                if (this.isExpired(item)) {
                  keysToRemove.push(key)
                }
              } catch (error) {
                // 解析失败的项目也删除
                keysToRemove.push(key)
              }
            }
          }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key))
      } catch (error) {
        console.warn('清理localStorage缓存失败:', error)
      }
    }
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    // 清空内存缓存
    this.memoryCache.clear()
    
    // 清空localStorage缓存
    if (this.config.enablePersistent) {
      try {
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith(this.STORAGE_PREFIX)) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
      } catch (error) {
        console.warn('清空localStorage缓存失败:', error)
      }
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): { memoryItems: number; storageItems: number } {
    let storageItems = 0
    
    if (this.config.enablePersistent) {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith(this.STORAGE_PREFIX)) {
            storageItems++
          }
        }
      } catch (error) {
        console.warn('获取localStorage统计失败:', error)
      }
    }
    
    return {
      memoryItems: this.memoryCache.size,
      storageItems
    }
  }

  /**
   * 缓存装饰器 - 用于包装API调用
   */
  async cached<T>(
    prefix: string,
    apiCall: () => Promise<T>,
    params: any = {},
    ttl?: number
  ): Promise<T> {
    // 尝试从缓存获取
    const cached = this.get(prefix, params)
    if (cached !== null) {
      return cached
    }
    
    // 调用API获取数据
    const data = await apiCall()
    
    // 存储到缓存
    this.set(prefix, data, params, ttl)
    
    return data
  }

  /**
   * 失效相关缓存 - 根据前缀模式删除缓存
   */
  invalidatePattern(pattern: string): void {
    // 失效内存缓存
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key)
      }
    }
    
    // 失效localStorage缓存
    if (this.config.enablePersistent) {
      try {
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const storageKey = localStorage.key(i)
          if (storageKey && storageKey.startsWith(this.STORAGE_PREFIX)) {
            const cacheKey = storageKey.replace(this.STORAGE_PREFIX, '')
            if (cacheKey.includes(pattern)) {
              keysToRemove.push(storageKey)
            }
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
      } catch (error) {
        console.warn('失效localStorage缓存失败:', error)
      }
    }
  }
}

// 创建全局缓存实例
export const apiCache = new ApiCache({
  defaultTTL: 5 * 60 * 1000, // 5分钟
  maxMemoryItems: 200,
  enablePersistent: true
})

// 定期清理过期缓存（每10分钟）
setInterval(() => {
  apiCache.cleanup()
}, 10 * 60 * 1000)

export default apiCache