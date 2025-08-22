/**
 * Cache Middleware
 * 缓存中间件，提供请求缓存和响应缓存功能
 */

import { Request, Response, NextFunction } from 'express';
import { userCache, contentCache, statsCache, configCache, sessionCache, apiCache } from '../lib/cacheInstances.js';
import { CacheKeyGenerator, CACHE_TTL } from '../config/cache.js';
import { EnhancedCacheService } from '../lib/enhancedCache.js';
import { cacheInvalidationService } from '../services/cacheInvalidation';

interface CacheOptions {
  cacheService: EnhancedCacheService;
  ttl?: number;
  keyGenerator?: string | ((req: Request) => string);
  condition?: (req: Request) => boolean;
  skipCache?: boolean;
}

/**
 * 创建缓存中间件
 * 在请求处理前检查缓存，如果命中则直接返回缓存结果
 */
export function createCacheMiddleware(options: CacheOptions) {
  const { cacheService, ttl = 300, keyGenerator, condition, skipCache = false } = options;
    
    return async (req: Request, res: Response, next: NextFunction) => {
      // 跳过缓存的情况
      if (skipCache || req.method !== 'GET') {
        return next();
      }
      
      // 条件检查
      if (condition && !condition(req)) {
        return next();
      }
      
      // 生成缓存键
      const cacheKey = typeof keyGenerator === 'function' 
        ? keyGenerator(req) 
        : keyGenerator || `api:${req.originalUrl}:${JSON.stringify(req.query)}`;
      
      try {
        // 尝试从缓存获取
        const cached = await cacheService.get(cacheKey);
        if (cached) {
          return res.json({
            data: cached,
            cached: true,
            timestamp: new Date().toISOString()
          });
        }
        
        // 缓存未命中，继续处理
        next();
      } catch (error) {
        console.error('缓存中间件错误:', error);
        next();
      }
    };
}

/**
 * 创建缓存响应中间件
 * 在响应发送时将结果存入缓存
 */
export function createCacheResponseMiddleware(options: { cacheService: EnhancedCacheService; ttl?: number }) {
  const { cacheService, ttl = 300 } = options;
  return (req: Request, res: Response, next: NextFunction) => {
      // 只缓存 GET 请求
      if (req.method !== 'GET') {
        return next();
      }
      
      const originalSend = res.json;
      
      res.json = function(data: any) {
        // 只缓存成功的响应
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            // 生成缓存键
            const cacheKey = `api:${req.originalUrl}:${JSON.stringify(req.query)}`;
            
            // 缓存响应数据
            cacheService.set(cacheKey, data, ttl * 1000);
          } catch (error) {
            console.error('缓存响应中间件错误:', error);
          }
        }
        
        // 调用原始方法
        return originalSend.call(this, data);
      };
      
    next();
  };
}

/**
 * 创建条件缓存中间件
 * 根据条件决定是否使用缓存
 */
export function createConditionalCacheMiddleware(
  options: CacheOptions & { condition: (req: Request) => boolean }
) {
  return createCacheMiddleware(options);
}

/**
 * 创建用户特定缓存中间件
 * 为不同用户创建独立的缓存空间
 */
export function createUserSpecificCacheMiddleware(options: Omit<CacheOptions, 'keyGenerator'> & { keyGenerator?: (req: Request) => string }) {
  const userKeyGenerator = options.keyGenerator || ((req: Request) => {
    const userId = req.user?.id || 'anonymous';
    const baseKey = `user:${userId}:${req.originalUrl}:${JSON.stringify(req.query)}`;
    return baseKey;
  });
  
  return createCacheMiddleware({
    ...options,
    keyGenerator: userKeyGenerator
  });
}

/**
 * 缓存失效中间件
 * 在特定操作后清除相关缓存
 */
export function createCacheInvalidationMiddleware(
  options: {
    cacheService: EnhancedCacheService;
    patterns: string[] | ((req: Request) => string[]);
  }
) {
  const { cacheService, patterns } = options;
  return (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.json;
    
    res.json = function(data: any) {
      // 只在成功响应后清除缓存
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const invalidationPatterns = typeof patterns === 'function' 
            ? patterns(req) 
            : patterns;
          
          // 获取所有缓存键
          const allKeys = cacheService.keys();
          
          // 找到匹配的键并删除
          invalidationPatterns.forEach(pattern => {
            const keysToDelete = allKeys.filter(key => 
              key.includes(pattern) || new RegExp(pattern).test(key)
            );
            keysToDelete.forEach(key => cacheService.delete(key));
          });
        } catch (error) {
          console.error('缓存失效中间件错误:', error);
        }
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
}

/**
 * 缓存预热中间件
 * 在应用启动时预热常用缓存
 */
export function createCacheWarmupMiddleware(
  options: {
    cacheService: EnhancedCacheService;
    warmupFunctions: Array<() => Promise<void>>;
  }
) {
  const { cacheService, warmupFunctions } = options;
  let isWarmedUp = false;
  
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!isWarmedUp) {
      try {
        await Promise.all(warmupFunctions.map(fn => fn()));
        isWarmedUp = true;
        console.log('缓存预热完成');
      } catch (error) {
        console.error('缓存预热失败:', error);
      }
    }
    
    next();
  };
}

/**
 * 自动缓存失效中间件
 * 在响应完成后自动失效相关缓存
 */
export function createAutoInvalidationMiddleware(options: {
  cacheType: 'user' | 'content' | 'stats' | 'config' | 'session' | 'api' | 'all';
  patterns: string[];
  cascade?: boolean;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(data: any) {
      // 如果响应成功且包含数据，自动失效相关缓存
      if (res.statusCode >= 200 && res.statusCode < 300 && data) {
        // 异步执行缓存失效，不阻塞响应
        setImmediate(async () => {
          try {
            const result = await cacheInvalidationService.invalidateByEvent(
              'cache:invalidate',
              { patterns: options.patterns, cacheType: options.cacheType, cascade: options.cascade }
            );
            
            if (result.success) {
              console.log(`自动缓存失效完成: ${result.invalidatedKeys.length}个键失效`);
            } else {
              console.warn('自动缓存失效失败:', result.errors);
            }
          } catch (error) {
            console.error('自动缓存失效异常:', error);
          }
        });
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
}

/**
 * 用户相关操作的自动缓存失效中间件
 */
export const userOperationInvalidation = createAutoInvalidationMiddleware({
  cacheType: 'user',
  patterns: ['^user:', '^stats:user'],
  cascade: true
});

/**
 * 内容相关操作的自动缓存失效中间件
 */
export const contentOperationInvalidation = createAutoInvalidationMiddleware({
  cacheType: 'content',
  patterns: ['^posts:', '^activities:', '^comments:', '^categories:'],
  cascade: true
});

/**
 * 统计相关操作的自动缓存失效中间件
 */
export const statsOperationInvalidation = createAutoInvalidationMiddleware({
  cacheType: 'stats',
  patterns: ['^stats:'],
  cascade: false
});

/**
 * 配置相关操作的自动缓存失效中间件
 */
export const configOperationInvalidation = createAutoInvalidationMiddleware({
  cacheType: 'config',
  patterns: ['^config:', '^settings:'],
  cascade: false
});