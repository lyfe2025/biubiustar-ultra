/**
 * 缓存失效测试API
 * 用于测试和验证缓存失效机制
 */

import { Router, Request, Response } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { 
  userCacheInvalidationService,
  UserCacheInvalidationType,
  invalidateOnUserCreate,
  invalidateOnUserUpdate,
  invalidateOnUserDelete
} from '../utils/userCacheInvalidation.js';
import { userCache, statsCache, apiCache, sessionCache } from '../lib/cacheInstances.js';

const router = Router();

// 对所有路由应用权限验证
router.use(requireAdmin);

/**
 * 获取缓存失效服务状态
 */
router.get('/status', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const stats = userCacheInvalidationService.getInvalidationStats();
    
    // 获取各个缓存实例的状态
    const cacheStatus = {
      user: userCache.getStats(),
      stats: statsCache.getStats(),
      api: apiCache.getStats(),
      session: sessionCache.getStats()
    };

    res.json({
      success: true,
      data: {
        invalidationService: stats,
        cacheInstances: cacheStatus,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('获取缓存失效状态失败:', error);
    res.status(500).json({
      success: false,
      error: '获取缓存失效状态失败'
    });
  }
}));

/**
 * 手动触发用户创建缓存失效
 */
router.post('/user/create', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const results = await invalidateOnUserCreate();
    
    res.json({
      success: true,
      message: '用户创建缓存失效已触发',
      data: {
        results,
        timestamp: new Date().toISOString(),
        totalOperations: results.length,
        successCount: results.filter(r => r.success).length,
        failedCount: results.filter(r => !r.success).length
      }
    });
  } catch (error) {
    console.error('触发用户创建缓存失效失败:', error);
    res.status(500).json({
      success: false,
      error: '触发用户创建缓存失效失败'
    });
  }
}));

/**
 * 手动触发用户更新缓存失效
 */
router.post('/user/update/:userId', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: '用户ID为必填项'
      });
    }
    
    const results = await invalidateOnUserUpdate(userId);
    
    res.json({
      success: true,
      message: `用户 ${userId} 更新缓存失效已触发`,
      data: {
        userId,
        results,
        timestamp: new Date().toISOString(),
        totalOperations: results.length,
        successCount: results.filter(r => r.success).length,
        failedCount: results.filter(r => !r.success).length
      }
    });
  } catch (error) {
    console.error('触发用户更新缓存失效失败:', error);
    res.status(500).json({
      success: false,
      error: '触发用户更新缓存失效失败'
    });
  }
}));

/**
 * 手动触发用户删除缓存失效
 */
router.post('/user/delete/:userId', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: '用户ID为必填项'
      });
    }
    
    const results = await invalidateOnUserDelete(userId);
    
    res.json({
      success: true,
      message: `用户 ${userId} 删除缓存失效已触发`,
      data: {
        userId,
        results,
        timestamp: new Date().toISOString(),
        totalOperations: results.length,
        successCount: results.filter(r => r.success).length,
        failedCount: results.filter(r => !r.success).length
      }
    });
  } catch (error) {
    console.error('触发用户删除缓存失效失败:', error);
    res.status(500).json({
      success: false,
      error: '触发用户删除缓存失效失败'
    });
  }
}));

/**
 * 批量缓存失效测试
 */
router.post('/user/batch', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { userIds, type = 'update' } = req.body;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: '用户ID列表不能为空'
      });
    }
    
    const invalidationType = type === 'delete' 
      ? UserCacheInvalidationType.BATCH_DELETE 
      : UserCacheInvalidationType.STATUS_CHANGE;
    
    const results = await userCacheInvalidationService.invalidate({
      type: invalidationType,
      userIds,
      invalidateStats: true,
      invalidateList: true
    });
    
    res.json({
      success: true,
      message: `批量用户缓存失效已触发（${type}）`,
      data: {
        userIds,
        type: invalidationType,
        results,
        timestamp: new Date().toISOString(),
        totalOperations: results.length,
        successCount: results.filter(r => r.success).length,
        failedCount: results.filter(r => !r.success).length
      }
    });
  } catch (error) {
    console.error('批量缓存失效失败:', error);
    res.status(500).json({
      success: false,
      error: '批量缓存失效失败'
    });
  }
}));

/**
 * 自定义缓存失效测试
 */
router.post('/custom', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { 
      type, 
      userId, 
      userIds, 
      invalidateStats = true, 
      invalidateList = true, 
      delay = 0,
      additionalPatterns = [] 
    } = req.body;
    
    if (!Object.values(UserCacheInvalidationType).includes(type)) {
      return res.status(400).json({
        success: false,
        error: '无效的失效类型'
      });
    }
    
    const results = await userCacheInvalidationService.invalidate({
      type,
      userId,
      userIds,
      invalidateStats,
      invalidateList,
      delay,
      additionalPatterns
    });
    
    res.json({
      success: true,
      message: '自定义缓存失效已触发',
      data: {
        options: {
          type,
          userId,
          userIds,
          invalidateStats,
          invalidateList,
          delay,
          additionalPatterns
        },
        results,
        timestamp: new Date().toISOString(),
        totalOperations: results.length,
        successCount: results.filter(r => r.success).length,
        failedCount: results.filter(r => !r.success).length
      }
    });
  } catch (error) {
    console.error('自定义缓存失效失败:', error);
    res.status(500).json({
      success: false,
      error: '自定义缓存失效失败'
    });
  }
}));

/**
 * 预热缓存测试
 */
router.post('/warmup', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { userId } = req.body;
    
    await userCacheInvalidationService.warmupCaches({ userId });
    
    res.json({
      success: true,
      message: '缓存预热已完成',
      data: {
        userId,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('缓存预热失败:', error);
    res.status(500).json({
      success: false,
      error: '缓存预热失败'
    });
  }
}));

export default router;
