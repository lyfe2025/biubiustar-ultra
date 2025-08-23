import { Router, Request, Response } from 'express';
import { cacheEventNotification } from '../../lib/CacheEventNotification';
import { handleError } from './middleware';

const router = Router();

// ==================== 事件和通知 API ====================

/**
 * 获取事件历史
 */
router.get('/events', async (req: Request, res: Response) => {
  try {
    const { eventType, severity, limit = 100, offset = 0 } = req.query;
    
    const events = cacheEventNotification.getEventHistory(
      parseInt(limit as string)
    );
    
    res.json({
      success: true,
      data: events,
      count: events.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * 获取事件统计
 */
router.get('/events/statistics', async (req: Request, res: Response) => {
  try {
    const { timeRange = '24h' } = req.query;
    
    const statistics = cacheEventNotification.getStatistics();
    
    res.json({
      success: true,
      data: statistics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * 添加事件监听器
 */
router.post('/events/listeners', async (req: Request, res: Response) => {
  try {
    const { listenerId, config } = req.body;
    
    if (!listenerId || !config) {
      return res.status(400).json({
        success: false,
        error: 'Missing parameters',
        message: 'listenerId and config are required'
      });
    }
    
    cacheEventNotification.addEventListener(listenerId, config);
    
    res.json({
      success: true,
      message: 'Event listener added successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * 移除事件监听器
 */
router.delete('/events/listeners/:listenerId', async (req: Request, res: Response) => {
  try {
    const { listenerId } = req.params;
    
    cacheEventNotification.removeEventListener(listenerId);
    
    res.json({
      success: true,
      message: 'Event listener removed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
