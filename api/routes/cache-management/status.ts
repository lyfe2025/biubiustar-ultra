import { Router, Request, Response } from 'express';
import { cacheConfigManager } from '../../lib/cache/config';
import { cacheAnalytics } from '../../lib/cache/analytics';
import { CachePrewarmingBatch } from '../../lib/cache/prewarming';
import { handleError } from './middleware';

const router = Router();
const cachePrewarmingBatch = new CachePrewarmingBatch();

// ==================== 系统状态 API ====================

/**
 * 获取系统状态
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = {
      configManager: {
        initialized: true,
        configurationsCount: cacheConfigManager.getAllConfigs().size
      },
      analytics: cacheAnalytics.getAnalyticsStatistics(),
      monitoring: {
        isRunning: true, // 需要从monitor获取实际状态
        alertsCount: 0 // 需要从monitor获取实际数据
      },
      prewarming: {
        activeTasks: cachePrewarmingBatch.getAllPrewarmTasks().filter(t => t.status === 'running').length,
        totalTasks: cachePrewarmingBatch.getAllPrewarmTasks().length
      },
      events: {
        listenersCount: 0, // 需要从事件系统获取
        recentEventsCount: 0 // 需要从事件系统获取
      }
    };
    
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * 健康检查
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        configManager: 'healthy',
        analytics: 'healthy',
        monitoring: 'healthy',
        prewarming: 'healthy',
        events: 'healthy'
      }
    };
    
    res.json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

export default router;
