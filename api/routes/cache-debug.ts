/**
 * Cache Debug API routes
 * 缓存调试和分析工具端点
 */
import { Router, Request, Response } from 'express';
import { getAllCacheStats, getCacheHealth } from '../lib/cacheInstances.js';
import { getCacheMetrics } from '../middleware/cacheMonitor.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = Router();

/**
 * 缓存内容查看器
 * GET /api/cache-debug/inspect/:cacheType
 */
router.get('/inspect/:cacheType', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { cacheType } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    
    const { userCache, contentCache, statsCache, configCache, sessionCache } = await import('../lib/cacheInstances.js');
    
    let targetCache;
    switch (cacheType) {
      case 'user':
        targetCache = userCache;
        break;
      case 'content':
        targetCache = contentCache;
        break;
      case 'stats':
        targetCache = statsCache;
        break;
      case 'config':
        targetCache = configCache;
        break;
      case 'session':
        targetCache = sessionCache;
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid cache type. Valid types: user, content, stats, config, session'
        });
    }
    
    // 获取缓存内容（注意：这是内部调试方法，实际实现需要在EnhancedCacheService中添加）
    const cacheEntries = targetCache.getAllEntries ? 
      targetCache.getAllEntries(Number(limit), Number(offset)) : 
      { entries: [], total: 0, message: 'Cache inspection not supported for this cache type' };
    
    res.json({
      success: true,
      data: {
        cacheType,
        ...cacheEntries,
        stats: targetCache.getStats()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache inspection failed:', error);
    res.status(500).json({
      success: false,
      error: 'Cache inspection failed',
      timestamp: new Date().toISOString()
    });
  }
}));

/**
 * 缓存热点分析
 * GET /api/cache-debug/hotkeys/:cacheType
 */
router.get('/hotkeys/:cacheType', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { cacheType } = req.params;
    const { limit = 20 } = req.query;
    
    const { userCache, contentCache, statsCache, configCache, sessionCache } = await import('../lib/cacheInstances.js');
    
    let targetCache;
    switch (cacheType) {
      case 'user':
        targetCache = userCache;
        break;
      case 'content':
        targetCache = contentCache;
        break;
      case 'stats':
        targetCache = statsCache;
        break;
      case 'config':
        targetCache = configCache;
        break;
      case 'session':
        targetCache = sessionCache;
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid cache type'
        });
    }
    
    // 获取热点键（需要在EnhancedCacheService中实现访问统计）
    const hotKeys = targetCache.getHotKeys ? 
      targetCache.getHotKeys(Number(limit)) : 
      { keys: [], message: 'Hot key analysis not supported for this cache type' };
    
    res.json({
      success: true,
      data: {
        cacheType,
        hotKeys,
        stats: targetCache.getStats()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Hot key analysis failed:', error);
    res.status(500).json({
      success: false,
      error: 'Hot key analysis failed',
      timestamp: new Date().toISOString()
    });
  }
}));

/**
 * 缓存内存分析
 * GET /api/cache-debug/memory-analysis
 */
router.get('/memory-analysis', asyncHandler(async (req: Request, res: Response) => {
  try {
    const memoryUsage = process.memoryUsage();
    const allStats = getAllCacheStats();
    
    // 计算每个缓存的内存占用估算
    const cacheMemoryAnalysis = Object.entries(allStats).map(([cacheName, stats]: [string, any]) => {
      // 简单估算：每个缓存项平均占用内存
      const avgItemSize = stats.size > 0 ? (stats.memoryUsage || 0) / stats.size : 0;
      const memoryEfficiency = stats.maxSize > 0 ? (stats.size / stats.maxSize) * 100 : 0;
      
      return {
        cacheName,
        size: stats.size,
        maxSize: stats.maxSize,
        memoryUsage: stats.memoryUsage || 0,
        avgItemSize: Math.round(avgItemSize),
        memoryEfficiency: Math.round(memoryEfficiency * 100) / 100,
        hitRate: stats.hitRate
      };
    });
    
    // 总体内存分析
    const totalCacheMemory = cacheMemoryAnalysis.reduce((sum, cache) => sum + cache.memoryUsage, 0);
    const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const cacheMemoryPercentage = heapUsedMB > 0 ? (totalCacheMemory / (heapUsedMB * 1024 * 1024)) * 100 : 0;
    
    res.json({
      success: true,
      data: {
        processMemory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          heapUsed: heapUsedMB,
          external: Math.round(memoryUsage.external / 1024 / 1024)
        },
        cacheAnalysis: cacheMemoryAnalysis,
        summary: {
          totalCacheMemory: Math.round(totalCacheMemory / 1024),
          cacheMemoryPercentage: Math.round(cacheMemoryPercentage * 100) / 100,
          totalCaches: cacheMemoryAnalysis.length,
          avgHitRate: Math.round((cacheMemoryAnalysis.reduce((sum, cache) => sum + cache.hitRate, 0) / cacheMemoryAnalysis.length) * 100) / 100
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Memory analysis failed:', error);
    res.status(500).json({
      success: false,
      error: 'Memory analysis failed',
      timestamp: new Date().toISOString()
    });
  }
}));

/**
 * 缓存性能基准测试
 * POST /api/cache-debug/benchmark
 */
router.post('/benchmark', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { 
      cacheType = 'user', 
      testSize = 1000, 
      iterations = 3,
      dataSize = 'small' // small, medium, large
    } = req.body;
    
    if (testSize > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Test size too large (max: 5000)'
      });
    }
    
    const { userCache, contentCache, statsCache } = await import('../lib/cacheInstances.js');
    
    let targetCache;
    switch (cacheType) {
      case 'user':
        targetCache = userCache;
        break;
      case 'content':
        targetCache = contentCache;
        break;
      case 'stats':
        targetCache = statsCache;
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid cache type for benchmark'
        });
    }
    
    // 生成测试数据
    const generateTestData = (size: string) => {
      const baseData = { id: Math.random(), timestamp: Date.now() };
      switch (size) {
        case 'small':
          return { ...baseData, data: 'small test data' };
        case 'medium':
          return { ...baseData, data: 'medium test data'.repeat(50) };
        case 'large':
          return { ...baseData, data: 'large test data'.repeat(200) };
        default:
          return baseData;
      }
    };
    
    const results = [];
    
    for (let iter = 0; iter < iterations; iter++) {
      const iterationStart = Date.now();
      
      // 写入测试
      const writeStart = Date.now();
      for (let i = 0; i < testSize; i++) {
        const testData = generateTestData(dataSize);
        targetCache.set(`benchmark:${iter}:${i}`, testData, 60000);
      }
      const writeTime = Date.now() - writeStart;
      
      // 读取测试
      const readStart = Date.now();
      let hits = 0;
      for (let i = 0; i < testSize; i++) {
        const result = await targetCache.get(`benchmark:${iter}:${i}`);
        if (result) hits++;
      }
      const readTime = Date.now() - readStart;
      
      // 删除测试
      const deleteStart = Date.now();
      for (let i = 0; i < testSize; i++) {
        targetCache.delete(`benchmark:${iter}:${i}`);
      }
      const deleteTime = Date.now() - deleteStart;
      
      const totalTime = Date.now() - iterationStart;
      
      results.push({
        iteration: iter + 1,
        writeTime,
        readTime,
        deleteTime,
        totalTime,
        hitRate: (hits / testSize) * 100,
        opsPerSecond: Math.round((testSize * 3) / (totalTime / 1000)) // 3 operations per item
      });
    }
    
    // 计算平均值
    const avgResults = {
      avgWriteTime: Math.round(results.reduce((sum, r) => sum + r.writeTime, 0) / iterations),
      avgReadTime: Math.round(results.reduce((sum, r) => sum + r.readTime, 0) / iterations),
      avgDeleteTime: Math.round(results.reduce((sum, r) => sum + r.deleteTime, 0) / iterations),
      avgTotalTime: Math.round(results.reduce((sum, r) => sum + r.totalTime, 0) / iterations),
      avgHitRate: Math.round((results.reduce((sum, r) => sum + r.hitRate, 0) / iterations) * 100) / 100,
      avgOpsPerSecond: Math.round(results.reduce((sum, r) => sum + r.opsPerSecond, 0) / iterations)
    };
    
    res.json({
      success: true,
      data: {
        testConfig: {
          cacheType,
          testSize,
          iterations,
          dataSize
        },
        results,
        averages: avgResults,
        cacheStats: targetCache.getStats()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache benchmark failed:', error);
    res.status(500).json({
      success: false,
      error: 'Cache benchmark failed',
      timestamp: new Date().toISOString()
    });
  }
}));

export default router;