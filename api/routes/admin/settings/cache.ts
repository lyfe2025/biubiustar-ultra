/**
 * 缓存配置管理 API
 * 支持动态调整缓存参数
 */
import { Router, Request, Response } from 'express';
import asyncHandler from '../../../middleware/asyncHandler.js';
import { requireAdmin } from '../auth.js';
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

const router = Router();

// 对所有路由应用管理员权限验证
router.use(requireAdmin);

// 缓存配置存储（可以后续改为数据库存储）
let cacheConfig = {
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

/**
 * 获取当前缓存配置
 * GET /api/admin/settings/cache
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const currentStats = getAllCacheStats();
  
  // 合并配置和当前状态
  const configWithStats = Object.entries(cacheConfig).map(([type, config]) => ({
    type,
    ...config,
    currentStats: currentStats[type] || null
  }));

  res.json({
    success: true,
    data: {
      cacheTypes: configWithStats,
      totalMemoryUsage: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    }
  });
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
    // 更新配置
    cacheConfig[cacheType as keyof typeof cacheConfig] = {
      maxSize,
      defaultTTL,
      cleanupInterval: cleanupInterval || 60000
    };

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
          ttl: defaultTTL // 使用新的TTL
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

    console.log(`Cache ${cacheType} configuration updated:`, {
      maxSize,
      defaultTTL,
      cleanupInterval,
      restoredItems: dataToRestore.length,
      droppedItems: oldData.length - dataToRestore.length
    });

    res.json({
      success: true,
      data: {
        cacheType,
        config: cacheConfig[cacheType as keyof typeof cacheConfig],
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
    // 默认配置
    const defaultConfigs = {
      user: { maxSize: 500, defaultTTL: 30 * 60 * 1000, cleanupInterval: 5 * 60 * 1000 },
      content: { maxSize: 1000, defaultTTL: 10 * 60 * 1000, cleanupInterval: 2 * 60 * 1000 },
      stats: { maxSize: 200, defaultTTL: 2 * 60 * 1000, cleanupInterval: 60 * 1000 },
      config: { maxSize: 100, defaultTTL: 60 * 60 * 1000, cleanupInterval: 10 * 60 * 1000 },
      session: { maxSize: 300, defaultTTL: 15 * 60 * 1000, cleanupInterval: 5 * 60 * 1000 },
      api: { maxSize: 500, defaultTTL: 5 * 60 * 1000, cleanupInterval: 2 * 60 * 1000 }
    };

    const defaultConfig = defaultConfigs[cacheType as keyof typeof defaultConfigs];

    // 使用PUT接口的逻辑来重置
    const resetResponse = await new Promise((resolve) => {
      const mockReq = {
        body: {
          cacheType,
          ...defaultConfig
        }
      } as Request;
      
      const mockRes = {
        json: (data: any) => resolve(data),
        status: () => mockRes
      } as any;

      // 重新调用更新逻辑
      cacheConfig[cacheType as keyof typeof cacheConfig] = defaultConfig;
    });

    res.json({
      success: true,
      data: {
        cacheType,
        config: defaultConfig,
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
 * 获取缓存配置建议
 * GET /api/admin/settings/cache/recommendations
 */
router.get('/recommendations', asyncHandler(async (req: Request, res: Response) => {
  const currentStats = getAllCacheStats();
  const memoryUsage = process.memoryUsage();
  
  const recommendations: Array<{
    cacheType: string;
    type: 'info' | 'warning' | 'error';
    message: string;
    suggestedValue?: number;
  }> = [];

  // 分析每个缓存的使用情况并给出建议
  Object.entries(currentStats).forEach(([cacheType, stats]: [string, any]) => {
    const config = cacheConfig[cacheType as keyof typeof cacheConfig];
    if (!config) return;

    const utilizationRate = (stats.size || 0) / (config.maxSize || 1);
    const hitRate = stats.hitRate || 0;

    // 容量利用率建议
    if (utilizationRate > 0.9) {
      recommendations.push({
        cacheType,
        type: 'warning',
        message: `${cacheType}缓存利用率过高(${Math.round(utilizationRate * 100)}%)，建议增加maxSize`,
        suggestedValue: Math.ceil(config.maxSize * 1.5)
      });
    } else if (utilizationRate < 0.3 && config.maxSize > 50) {
      recommendations.push({
        cacheType,
        type: 'info',
        message: `${cacheType}缓存利用率较低(${Math.round(utilizationRate * 100)}%)，可以考虑减少maxSize以节省内存`,
        suggestedValue: Math.max(50, Math.ceil(config.maxSize * 0.7))
      });
    }

    // 命中率建议
    if (hitRate < 0.7) {
      recommendations.push({
        cacheType,
        type: 'warning',
        message: `${cacheType}缓存命中率偏低(${Math.round(hitRate * 100)}%)，建议增加TTL时间或检查缓存策略`,
        suggestedValue: Math.min(config.defaultTTL * 2, 60 * 60 * 1000) // 最大不超过1小时
      });
    }
  });

  // 内存使用建议
  const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  if (heapUsedMB > 500) {
    recommendations.push({
      cacheType: 'global',
      type: 'warning',
      message: `系统内存使用较高(${heapUsedMB}MB)，建议优化缓存配置或考虑使用外部缓存`
    });
  }

  res.json({
    success: true,
    data: {
      recommendations,
      totalRecommendations: recommendations.length,
      memoryUsage: {
        heapUsed: heapUsedMB,
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024)
      }
    }
  });
}));

export default router;
