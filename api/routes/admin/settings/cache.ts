/**
 * 缓存配置管理 API
 * 支持动态调整缓存参数，配置持久化到数据库
 */
import { Router, Request, Response } from 'express';
import asyncHandler from '../../../middleware/asyncHandler.js';
import { requireAdmin } from '../../../middleware/auth.js';
import { 
  userCache, 
  contentCache, 
  statsCache, 
  configCache, 
  sessionCache, 
  apiCache,
  getAllCacheStats
} from '../../../lib/cacheInstances.js';
import { EnhancedCacheService } from '../../../lib/enhancedCache.js';
import { invalidateConfigCache } from '../../../services/cacheInvalidation.js';
// 移除了 Supabase 相关导入，不再使用数据库

const router = Router();

// 对所有路由应用管理员权限验证
router.use(requireAdmin);

// 默认缓存配置
const defaultCacheConfig = {
  user: { maxSize: 500, defaultTTL: 30 * 60 * 1000, cleanupInterval: 5 * 60 * 1000 },
  content: { maxSize: 1000, defaultTTL: 10 * 60 * 1000, cleanupInterval: 2 * 60 * 1000 },
  stats: { maxSize: 200, defaultTTL: 2 * 60 * 1000, cleanupInterval: 60 * 1000 },
  config: { maxSize: 100, defaultTTL: 60 * 60 * 1000, cleanupInterval: 10 * 60 * 1000 },
  session: { maxSize: 300, defaultTTL: 15 * 60 * 1000, cleanupInterval: 5 * 60 * 1000 },
  api: { maxSize: 500, defaultTTL: 5 * 60 * 1000, cleanupInterval: 2 * 60 * 1000 }
};

// 缓存实例映射
const cacheInstances = {
  user: userCache,
  content: contentCache,
  stats: statsCache,
  config: configCache,
  session: sessionCache,
  api: apiCache
};

// 移除了 loadCacheConfigFromDB 函数，现在直接使用默认配置

// 移除了 saveCacheConfigToDB 函数，不再保存配置到数据库

/**
 * 获取当前缓存配置
 * GET /api/admin/settings/cache
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('=== 缓存配置API调试开始 ===');
    
    // 直接使用默认配置，不从数据库加载
    const cacheConfig = defaultCacheConfig;
    console.log('使用默认配置:', JSON.stringify(cacheConfig, null, 2));
    
    const currentStats = getAllCacheStats();
    console.log('getAllCacheStats 返回值:', JSON.stringify(currentStats, null, 2));
    
    // 处理配置数据：将默认配置转换为数组格式
    const cacheTypes = Object.entries(cacheConfig).map(([type, config]) => {
      console.log('处理缓存类型:', type, '配置:', config);
      const configData = config as Record<string, any> || {};
      const stats = currentStats[type] || null;
      
      return {
        type,
        name: `${type.charAt(0).toUpperCase()}${type.slice(1)} Cache`,
        config: {
          maxSize: configData.maxSize || 0,
          defaultTTL: configData.defaultTTL || 0,
          cleanupInterval: configData.cleanupInterval || 0
        },
        stats: stats ? {
          size: stats.size || 0,
          hits: stats.hits || 0,
          misses: stats.misses || 0,
          hitRate: stats.hits && stats.misses ? 
            ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(2) + '%' : '0%'
        } : {
          size: 0,
          hits: 0,
          misses: 0,
          hitRate: '0%'
        }
      };
    });
    
    console.log('处理后的 cacheTypes:', JSON.stringify(cacheTypes, null, 2));
    
    const responseData = {
      cacheTypes,
      totalMemoryUsage: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    };
    console.log('最终 responseData:', JSON.stringify(responseData, null, 2));

    const finalResponse = {
      success: true,
      data: responseData,
      timestamp: new Date().toISOString(),
      _cacheInfo: {
        cached: false,
        timestamp: new Date().toISOString()
      }
    };
    console.log('最终响应:', JSON.stringify(finalResponse, null, 2));
    console.log('=== 缓存配置API调试结束 ===');

    res.json(finalResponse);
  } catch (error) {
    console.error('Error in cache API:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}));

/**
 * 更新缓存配置
 * PUT /api/admin/settings/cache
 */
router.put('/', asyncHandler(async (req: Request, res: Response) => {
  const { cacheType, maxSize, defaultTTL, cleanupInterval } = req.body;

  // 验证参数
  if (!cacheType || !cacheInstances[cacheType as keyof typeof cacheInstances]) {
    return res.status(400).json({
      success: false,
      error: 'Invalid cache type'
    });
  }

  if (typeof maxSize !== 'number' || maxSize < 10 || maxSize > 10000) {
    return res.status(400).json({
      success: false,
      error: 'maxSize must be between 10 and 10000'
    });
  }

  if (typeof defaultTTL !== 'number' || defaultTTL < 1000 || defaultTTL > 24 * 60 * 60 * 1000) {
    return res.status(400).json({
      success: false,
      error: 'defaultTTL must be between 1 second and 24 hours'
    });
  }

  try {
    // 准备新配置
    const newConfig = {
      maxSize,
      defaultTTL,
      cleanupInterval: cleanupInterval || 60000
    };

    // 注意：配置不再保存到数据库，仅在内存中生效

    // 动态重新创建缓存实例
    const oldCache = cacheInstances[cacheType as keyof typeof cacheInstances];
    
    // 获取旧缓存的数据
    const oldData: Array<{key: string, data: any, ttl: number}> = [];
    const keys = oldCache.keys();
    
    for (const key of keys) {
      const data = await oldCache.get(key);
      if (data) {
        oldData.push({
          key,
          data,
          ttl: defaultTTL
        });
      }
    }

    // 销毁旧缓存
    oldCache.destroy();

    // 创建新缓存实例
    const newCache = new EnhancedCacheService({
      maxSize,
      defaultTTL,
      cleanupInterval: cleanupInterval || 60000
    });

    // 恢复数据（只保留新maxSize允许的数量）
    const dataToRestore = oldData.slice(0, maxSize);
    for (const item of dataToRestore) {
      newCache.set(item.key, item.data, item.ttl);
    }

    // 更新实例引用
    cacheInstances[cacheType as keyof typeof cacheInstances] = newCache;

    // 失效配置缓存
    await invalidateConfigCache();

    res.json({
      success: true,
      data: {
        cacheType,
        config: newConfig,
        stats: newCache.getStats(),
        restoredItems: dataToRestore.length,
        droppedItems: oldData.length - dataToRestore.length
      }
    });
  } catch (error) {
    console.error('Failed to update cache configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update cache configuration'
    });
  }
}));

/**
 * 重置缓存配置到默认值
 * POST /api/admin/settings/cache/reset
 */
router.post('/reset', asyncHandler(async (req: Request, res: Response) => {
  const { cacheType } = req.body;

  if (!cacheType || !cacheInstances[cacheType as keyof typeof cacheInstances]) {
    return res.status(400).json({
      success: false,
      error: 'Invalid cache type'
    });
  }

  try {
    // 获取默认配置
    const defaultConfig = defaultCacheConfig[cacheType as keyof typeof defaultCacheConfig];
    
    if (!defaultConfig) {
      return res.status(400).json({
        success: false,
        error: 'Invalid cache type'
      });
    }

    // 注意：配置不再保存到数据库，仅在内存中生效

    // 重新创建缓存实例
    const oldCache = cacheInstances[cacheType as keyof typeof cacheInstances];
    oldCache.destroy();

    const newCache = new EnhancedCacheService(defaultConfig);
    cacheInstances[cacheType as keyof typeof cacheInstances] = newCache;

    // 失效配置缓存
    await invalidateConfigCache();

    res.json({
      success: true,
      data: {
        cacheType,
        config: defaultConfig,
        stats: newCache.getStats(),
        message: `${cacheType} cache configuration reset to defaults`
      }
    });
  } catch (error) {
    console.error('Failed to reset cache configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset cache configuration'
    });
  }
}));

/**
 * 清理指定缓存
 * POST /api/admin/settings/cache/clear
 */
router.post('/clear', asyncHandler(async (req: Request, res: Response) => {
  const { cacheType } = req.body;

  if (!cacheType || !cacheInstances[cacheType as keyof typeof cacheInstances]) {
    return res.status(400).json({
      success: false,
      error: 'Invalid cache type'
    });
  }

  try {
    const cache = cacheInstances[cacheType as keyof typeof cacheInstances];
    const beforeStats = cache.getStats();
    
    cache.clear();
    
    const afterStats = cache.getStats();

    res.json({
      success: true,
      data: {
        cacheType,
        clearedItems: beforeStats.size || 0,
        stats: afterStats
      }
    });
  } catch (error) {
    console.error('Failed to clear cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache'
    });
  }
}));

export default router;
