/**
 * 缓存健康状态API路由
 * 提供缓存失效频率监控和健康报告接口
 */

import { Router, Request, Response } from 'express';
import asyncHandler from '../../../middleware/asyncHandler.js';
import { cacheHealthMonitor } from '../../../lib/CacheHealthMonitor.js';
import { requireAdmin } from '../../../middleware/auth.js';

const router = Router();

// 应用管理员认证中间件
router.use(requireAdmin);

/**
 * 获取缓存健康状态报告
 * GET /api/admin/cache/health
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  try {
    const healthReport = cacheHealthMonitor.getHealthReport();
    
    return res.json({
      success: true,
      data: healthReport,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('获取缓存健康状态失败:', error);
    return res.status(500).json({
      success: false,
      error: '获取缓存健康状态失败',
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
}));

/**
 * 记录缓存失效事件
 * POST /api/admin/cache/health/invalidation
 */
router.post('/invalidation', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { cacheKey, reason } = req.body;
    
    // 参数验证
    if (!cacheKey || typeof cacheKey !== 'string') {
      return res.status(400).json({
        success: false,
        error: '缓存键不能为空且必须是字符串'
      });
    }
    
    if (!reason || typeof reason !== 'string') {
      return res.status(400).json({
        success: false,
        error: '失效原因不能为空且必须是字符串'
      });
    }
    
    // 记录失效事件
    cacheHealthMonitor.recordInvalidation(cacheKey, reason);
    
    return res.json({
      success: true,
      message: '失效事件记录成功',
      data: {
        cacheKey,
        reason,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('记录失效事件失败:', error);
    return res.status(500).json({
      success: false,
      error: '记录失效事件失败',
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
}));

/**
 * 获取特定缓存键的统计信息
 * GET /api/admin/cache/health/key/:cacheKey
 */
router.get('/key/:cacheKey', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { cacheKey } = req.params;
    
    if (!cacheKey) {
      return res.status(400).json({
        success: false,
        error: '缓存键不能为空'
      });
    }
    
    const keyStats = cacheHealthMonitor.getKeyStats(decodeURIComponent(cacheKey));
    
    if (!keyStats) {
      return res.status(404).json({
        success: false,
        error: '未找到该缓存键的统计信息'
      });
    }
    
    return res.json({
      success: true,
      data: {
        cacheKey: decodeURIComponent(cacheKey),
        stats: keyStats
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('获取缓存键统计信息失败:', error);
    return res.status(500).json({
      success: false,
      error: '获取缓存键统计信息失败',
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
}));

/**
 * 获取统计概览
 * GET /api/admin/cache/health/overview
 */
router.get('/overview', asyncHandler(async (req: Request, res: Response) => {
  try {
    const overview = cacheHealthMonitor.getStatsOverview();
    
    return res.json({
      success: true,
      data: overview,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('获取统计概览失败:', error);
    return res.status(500).json({
      success: false,
      error: '获取统计概览失败',
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
}));

/**
 * 获取实时健康状态
 * GET /api/admin/cache/health/realtime
 */
router.get('/realtime', asyncHandler(async (req: Request, res: Response) => {
  try {
    const realtimeStatus = cacheHealthMonitor.getRealTimeHealthStatus();
    
    return res.json({
      success: true,
      data: realtimeStatus,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('获取实时健康状态失败:', error);
    return res.status(500).json({
      success: false,
      error: '获取实时健康状态失败',
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
}));

/**
 * 重置健康监控统计数据
 * POST /api/admin/cache/health/reset
 */
router.post('/reset', asyncHandler(async (req: Request, res: Response) => {
  try {
    cacheHealthMonitor.reset();
    
    return res.json({
      success: true,
      message: '健康监控统计数据已重置',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('重置统计数据失败:', error);
    return res.status(500).json({
      success: false,
      error: '重置统计数据失败',
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
}));

/**
 * 批量记录缓存失效事件
 * POST /api/admin/cache/health/batch-invalidation
 */
router.post('/batch-invalidation', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { invalidations } = req.body;
    
    // 参数验证
    if (!Array.isArray(invalidations)) {
      return res.status(400).json({
        success: false,
        error: 'invalidations必须是数组'
      });
    }
    
    if (invalidations.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'invalidations数组不能为空'
      });
    }
    
    // 验证每个失效事件的格式
    for (let i = 0; i < invalidations.length; i++) {
      const item = invalidations[i];
      if (!item.cacheKey || typeof item.cacheKey !== 'string') {
        return res.status(400).json({
          success: false,
          error: `第${i + 1}个失效事件的cacheKey无效`
        });
      }
      if (!item.reason || typeof item.reason !== 'string') {
        return res.status(400).json({
          success: false,
          error: `第${i + 1}个失效事件的reason无效`
        });
      }
    }
    
    // 批量记录失效事件
    let successCount = 0;
    const errors: string[] = [];
    
    for (const { cacheKey, reason } of invalidations) {
      try {
        cacheHealthMonitor.recordInvalidation(cacheKey, reason);
        successCount++;
      } catch (error) {
        errors.push(`${cacheKey}: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    }
    
    return res.json({
      success: errors.length === 0,
      message: `成功记录${successCount}个失效事件${errors.length > 0 ? `，${errors.length}个失败` : ''}`,
      data: {
        total: invalidations.length,
        success: successCount,
        failed: errors.length,
        errors: errors.length > 0 ? errors : undefined
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('批量记录失效事件失败:', error);
    return res.status(500).json({
      success: false,
      error: '批量记录失效事件失败',
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
}));

export default router;