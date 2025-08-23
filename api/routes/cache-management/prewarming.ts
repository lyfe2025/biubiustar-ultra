import { Router, Request, Response } from 'express';
import { CachePrewarmingBatch } from '../../lib/cache/prewarming';
import { CacheInstanceType, CACHE_INSTANCE_TYPES } from '../../config/cache';
import { handleError, validateInstanceType } from './middleware';

const router = Router();
const cachePrewarmingBatch = new CachePrewarmingBatch();

// ==================== 缓存预热 API ====================

/**
 * 预热缓存
 */
router.post('/prewarming/:instanceType', validateInstanceType, async (req: Request, res: Response) => {
  try {
    const { instanceType } = req.params;
    const { items, config } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid items',
        message: 'Items array is required'
      });
    }
    
    const result = await cachePrewarmingBatch.prewarmCache(
      instanceType as CacheInstanceType,
      items,
      config
    );
    
    res.json({
      success: true,
      data: result,
      message: 'Cache prewarming initiated',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * 获取预热任务状态
 */
router.get('/prewarming/tasks/:taskId', async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    
    const task = cachePrewarmingBatch.getPrewarmTask(taskId);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
        message: `No prewarming task found with ID: ${taskId}`
      });
    }
    
    res.json({
      success: true,
      data: task,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * 获取所有预热任务
 */
router.get('/prewarming/tasks', async (req: Request, res: Response) => {
  try {
    const { instanceType, status } = req.query;
    
    const allTasks = cachePrewarmingBatch.getAllPrewarmTasks();
    
    // 根据查询参数过滤任务
    let tasks = allTasks;
    if (instanceType) {
      // 注意：PrewarmTask接口中没有instanceType字段，需要根据实际情况调整
      // 这里暂时返回所有任务
    }
    if (status) {
      tasks = tasks.filter(task => task.status === status);
    }
    
    res.json({
      success: true,
      data: tasks,
      count: tasks.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * 取消预热任务
 */
router.delete('/prewarming/tasks/:taskId', async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    
    const success = await cachePrewarmingBatch.cancelPrewarmTask(taskId);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Task not found or cannot be cancelled',
        message: `Task ${taskId} not found or already completed`
      });
    }
    
    res.json({
      success: true,
      message: 'Prewarming task cancelled',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * 批量操作
 */
router.post('/batch/:operation', async (req: Request, res: Response) => {
  try {
    const { operation } = req.params;
    const { instanceType, keys, values, config } = req.body;
    
    if (!instanceType || !CACHE_INSTANCE_TYPES.includes(instanceType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid instance type',
        message: `Instance type must be one of: ${CACHE_INSTANCE_TYPES.join(', ')}`
      });
    }
    
    let result;
    
    switch (operation) {
      case 'get':
        if (!keys || !Array.isArray(keys)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid keys',
            message: 'Keys array is required for batch get operation'
          });
        }
        // TODO: 实现批量获取操作，该功能已迁移到模块化组件中
        throw new Error('Batch get operation is not available in the current implementation');
        break;
        
      case 'set':
        if (!keys || !values || !Array.isArray(keys) || !Array.isArray(values)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid keys or values',
            message: 'Keys and values arrays are required for batch set operation'
          });
        }
        if (keys.length !== values.length) {
          return res.status(400).json({
            success: false,
            error: 'Mismatched arrays',
            message: 'Keys and values arrays must have the same length'
          });
        }
        const items = keys.map((key: string, index: number) => ({
          key,
          value: values[index],
          ttl: config.ttl
        }));
        // TODO: 实现批量设置操作，该功能已迁移到模块化组件中
        throw new Error('Batch set operation is not available in the current implementation');
        break;
        
      case 'delete':
        if (!keys || !Array.isArray(keys)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid keys',
            message: 'Keys array is required for batch delete operation'
          });
        }
        // TODO: 实现批量删除操作，该功能已迁移到模块化组件中
        throw new Error('Batch delete operation is not available in the current implementation');
        break;
        
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid operation',
          message: 'Operation must be "get", "set", or "delete"'
        });
    }
    
    res.json({
      success: true,
      data: result,
      message: `Batch ${operation} operation completed`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
