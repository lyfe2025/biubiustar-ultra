/**
 * Health Check API routes
 * 健康检查和缓存监控端点
 */
import { Router, Request, Response } from 'express';
import { getAllCacheStats, getCacheHealth } from '../lib/cacheInstances.js';
import { getCacheMetrics } from '../middleware/cacheMonitor.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = Router();

/**
 * 基础健康检查
 * GET /api/health
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
      external: Math.round(memoryUsage.external / 1024 / 1024) // MB
    },
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  });
}));

/**
 * 缓存健康检查
 * GET /api/health/cache
 */
router.get('/cache', asyncHandler(async (req: Request, res: Response) => {
  try {
    const cacheHealth = getCacheHealth();
    const allStats = getAllCacheStats();
    
    // 检查缓存是否健康
    const isHealthy = Object.values(allStats).every(stats => {
      // 检查缓存大小是否在合理范围内
      const sizeRatio = stats.size / stats.maxSize;
      return sizeRatio < 0.9; // 使用率低于90%认为健康
    });
    
    res.status(isHealthy ? 200 : 503).json({
      success: true,
      healthy: isHealthy,
      data: {
        ...cacheHealth,
        detailed: allStats
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache health check failed:', error);
    res.status(500).json({
      success: false,
      healthy: false,
      error: 'Failed to check cache health',
      timestamp: new Date().toISOString()
    });
  }
}));

/**
 * 缓存统计信息
 * GET /api/health/cache/stats
 */
router.get('/cache/stats', asyncHandler(async (req: Request, res: Response) => {
  try {
    const stats = getAllCacheStats();
    const metrics = getCacheMetrics();
    const memoryUsage = process.memoryUsage();
    
    res.json({
      success: true,
      data: {
        caches: stats,
        metrics: metrics,
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          external: Math.round(memoryUsage.external / 1024 / 1024)
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to get cache stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cache statistics',
      timestamp: new Date().toISOString()
    });
  }
}));

/**
 * 缓存性能测试
 * POST /api/health/cache/test
 */
router.post('/test', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { testSize = 100, testData = 'test-data' } = req.body;
    
    if (testSize > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Test size too large (max: 1000)'
      });
    }
    
    const { userCache } = await import('../lib/cacheInstances.js');
    
    // 性能测试
    const startTime = Date.now();
    const testResults = {
      writes: 0,
      reads: 0,
      hits: 0,
      misses: 0
    };
    
    // 写入测试
    const writeStart = Date.now();
    for (let i = 0; i < testSize; i++) {
      userCache.set(`test:${i}`, { id: i, data: testData }, 60000); // 1分钟TTL
      testResults.writes++;
    }
    const writeTime = Date.now() - writeStart;
    
    // 读取测试
    const readStart = Date.now();
    for (let i = 0; i < testSize; i++) {
      const result = await userCache.get(`test:${i}`);
      testResults.reads++;
      if (result) {
        testResults.hits++;
      } else {
        testResults.misses++;
      }
    }
    const readTime = Date.now() - readStart;
    
    // 清理测试数据
    for (let i = 0; i < testSize; i++) {
      userCache.delete(`test:${i}`);
    }
    
    const totalTime = Date.now() - startTime;
    
    res.json({
      success: true,
      data: {
        testSize,
        results: testResults,
        performance: {
          totalTime: `${totalTime}ms`,
          writeTime: `${writeTime}ms`,
          readTime: `${readTime}ms`,
          avgWriteTime: `${(writeTime / testSize).toFixed(2)}ms`,
          avgReadTime: `${(readTime / testSize).toFixed(2)}ms`,
          hitRate: `${((testResults.hits / testResults.reads) * 100).toFixed(2)}%`
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Cache performance test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Cache performance test failed',
      timestamp: new Date().toISOString()
    });
  }
}));

/**
 * 清理缓存
 * DELETE /api/health/cache/clear
 */
router.delete('/cache/clear', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { cacheType } = req.query;
    const { userCache, contentCache, statsCache, configCache, sessionCache } = await import('../lib/cacheInstances.js');
    
    if (cacheType) {
      // 清理指定类型的缓存
      switch (cacheType) {
        case 'user':
          userCache.clear();
          break;
        case 'content':
          contentCache.clear();
          break;
        case 'stats':
          statsCache.clear();
          break;
        case 'config':
          configCache.clear();
          break;
        case 'session':
          sessionCache.clear();
          break;
        default:
          return res.status(400).json({
            success: false,
            error: 'Invalid cache type'
          });
      }
    } else {
      // 清理所有缓存
      userCache.clear();
      contentCache.clear();
      statsCache.clear();
      configCache.clear();
      sessionCache.clear();
    }
    
    res.json({
      success: true,
      message: cacheType ? `${cacheType} cache cleared` : 'All caches cleared',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to clear cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache',
      timestamp: new Date().toISOString()
    });
  }
}));

export default router;