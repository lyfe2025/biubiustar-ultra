import { Router, Request, Response } from 'express';
import * as path from 'path';
import { cacheConfigManager } from '../lib/CacheConfigManager';
import { cacheAnalytics } from '../lib/CacheAnalytics';
import { cacheMonitor } from '../lib/CacheMonitor';
import { cacheEventNotification } from '../lib/CacheEventNotification';
import { cachePrewarmingBatch } from '../lib/CachePrewarmingBatch';
import { CacheConfigImportExport, ExportFormat } from '../lib/CacheConfigImportExport';
import { cacheEnvConfig } from '../lib/CacheEnvConfig';
import { CacheInstanceType, CACHE_INSTANCE_TYPES } from '../config/cache';
import { TimeRange, MetricType } from '../lib/CacheAnalytics';
import multer from 'multer';
import { invalidateConfigCache } from '../services/cacheInvalidation.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * 错误处理中间件
 */
const handleError = (error: any, res: Response) => {
  console.error('Cache Management API Error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: error.message,
      details: error.details || []
    });
  }
  
  if (error.name === 'NotFoundError') {
    return res.status(404).json({
      success: false,
      error: 'Not Found',
      message: error.message
    });
  }
  
  return res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: error.message || 'An unexpected error occurred'
  });
};

/**
 * 参数验证中间件
 */
const validateInstanceType = (req: Request, res: Response, next: any) => {
  const { instanceType } = req.params;
  
  if (instanceType && !CACHE_INSTANCE_TYPES.includes(instanceType as CacheInstanceType)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid instance type',
      message: `Instance type must be one of: ${CACHE_INSTANCE_TYPES.join(', ')}`
    });
  }
  
  next();
};

// ==================== 配置管理 API ====================

/**
 * 获取所有缓存配置
 */
router.get('/configs', async (req: Request, res: Response) => {
  try {
    const configs = cacheConfigManager.getAllConfigs();
    
    res.json({
      success: true,
      data: configs,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * 获取特定实例的配置
 */
router.get('/configs/:instanceType', validateInstanceType, async (req: Request, res: Response) => {
  try {
    const { instanceType } = req.params;
    const config = cacheConfigManager.getConfig(instanceType as CacheInstanceType);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'Configuration not found',
        message: `No configuration found for instance type: ${instanceType}`
      });
    }
    
    res.json({
      success: true,
      data: config,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * 更新缓存配置
 */
router.put('/configs/:instanceType', validateInstanceType, async (req: Request, res: Response) => {
  try {
    const { instanceType } = req.params;
    const { config, reason } = req.body;
    
    if (!config) {
      return res.status(400).json({
        success: false,
        error: 'Missing configuration',
        message: 'Configuration object is required'
      });
    }
    
    const result = await cacheConfigManager.updateConfig(
      instanceType as CacheInstanceType,
      config
    );
    
    // 失效配置缓存
    await invalidateConfigCache();
    
    res.json({
      success: true,
      data: result,
      message: 'Configuration updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * 验证配置
 */
router.post('/configs/:instanceType/validate', validateInstanceType, async (req: Request, res: Response) => {
  try {
    const { instanceType } = req.params;
    const { config } = req.body;
    
    if (!config) {
      return res.status(400).json({
        success: false,
        error: 'Missing configuration',
        message: 'Configuration object is required'
      });
    }
    
    const validation = cacheConfigManager.validateConfig(
      config
    );
    
    res.json({
      success: true,
      data: validation,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * 重载缓存实例
 */
router.post('/configs/:instanceType/reload', validateInstanceType, async (req: Request, res: Response) => {
  try {
    const { instanceType } = req.params;
    
    const currentConfig = cacheConfigManager.getConfig(instanceType as CacheInstanceType);
    if (!currentConfig) {
      return res.status(404).json({
        success: false,
        error: 'Configuration not found',
        message: `No configuration found for instance type: ${instanceType}`
      });
    }
    
    await cacheConfigManager.updateConfig(instanceType as CacheInstanceType, currentConfig);
    
    res.json({
      success: true,
      message: 'Cache instance reloaded successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, res);
  }
});

// ==================== 监控和统计 API ====================

/**
 * 获取性能报告
 */
router.get('/monitoring/performance', async (req: Request, res: Response) => {
  try {
    const { instanceType, timeRange } = req.query;
    
    const report = await cacheMonitor.generatePerformanceReport();
    
    res.json({
      success: true,
      data: report,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * 获取统计摘要
 */
router.get('/analytics/summary/:instanceType', validateInstanceType, async (req: Request, res: Response) => {
  try {
    const { instanceType } = req.params;
    const { timeRange = TimeRange.LAST_DAY } = req.query;
    
    const summary = cacheAnalytics.getStatisticsSummary(
      instanceType as CacheInstanceType,
      timeRange as TimeRange
    );
    
    res.json({
      success: true,
      data: summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * 获取时间序列数据
 */
router.get('/analytics/timeseries/:instanceType/:metric', validateInstanceType, async (req: Request, res: Response) => {
  try {
    const { instanceType, metric } = req.params;
    const { timeRange = TimeRange.LAST_DAY } = req.query;
    
    if (!Object.values(MetricType).includes(metric as MetricType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid metric type',
        message: `Metric must be one of: ${Object.values(MetricType).join(', ')}`
      });
    }
    
    const timeSeries = cacheAnalytics.getTimeSeries(
      metric as MetricType,
      instanceType as CacheInstanceType,
      timeRange as TimeRange
    );
    
    if (!timeSeries) {
      return res.status(404).json({
        success: false,
        error: 'Time series not found',
        message: `No time series data found for ${metric} on ${instanceType}`
      });
    }
    
    res.json({
      success: true,
      data: timeSeries,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * 获取性能趋势
 */
router.get('/analytics/trends/:instanceType/:metric', validateInstanceType, async (req: Request, res: Response) => {
  try {
    const { instanceType, metric } = req.params;
    const { timeRange = TimeRange.LAST_DAY } = req.query;
    
    if (!Object.values(MetricType).includes(metric as MetricType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid metric type',
        message: `Metric must be one of: ${Object.values(MetricType).join(', ')}`
      });
    }
    
    const trend = cacheAnalytics.getPerformanceTrend(
      metric as MetricType,
      instanceType as CacheInstanceType,
      timeRange as TimeRange
    );
    
    res.json({
      success: true,
      data: trend,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * 获取异常检测结果
 */
router.get('/analytics/anomalies', async (req: Request, res: Response) => {
  try {
    const { instanceType, timeRange = TimeRange.LAST_DAY } = req.query;
    
    const anomalies = cacheAnalytics.getAnomalies(
      instanceType as CacheInstanceType,
      timeRange as TimeRange
    );
    
    res.json({
      success: true,
      data: anomalies,
      count: anomalies.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * 开始/停止分析数据收集
 */
router.post('/analytics/collection/:action', async (req: Request, res: Response) => {
  try {
    const { action } = req.params;
    const { intervalMs = 60000 } = req.body;
    
    if (action === 'start') {
      cacheAnalytics.startCollection(intervalMs);
      res.json({
        success: true,
        message: 'Analytics collection started',
        intervalMs,
        timestamp: new Date().toISOString()
      });
    } else if (action === 'stop') {
      cacheAnalytics.stopCollection();
      res.json({
        success: true,
        message: 'Analytics collection stopped',
        timestamp: new Date().toISOString()
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid action',
        message: 'Action must be "start" or "stop"'
      });
    }
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * 获取分析统计信息
 */
router.get('/analytics/statistics', async (req: Request, res: Response) => {
  try {
    const statistics = cacheAnalytics.getAnalyticsStatistics();
    
    res.json({
      success: true,
      data: statistics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, res);
  }
});

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
        result = await cachePrewarmingBatch.batchGet(instanceType, keys, config);
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
        result = await cachePrewarmingBatch.batchSet(instanceType, items, config);
        break;
        
      case 'delete':
        if (!keys || !Array.isArray(keys)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid keys',
            message: 'Keys array is required for batch delete operation'
          });
        }
        result = await cachePrewarmingBatch.batchDelete(instanceType, keys, config);
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

// ==================== 配置导入导出 API ====================

/**
 * 导出配置
 */
router.get('/configs/export/:format', async (req: Request, res: Response) => {
  try {
    const { format } = req.params;
    const { instanceTypes, includeStats = false } = req.query;
    
    const validFormats = ['json', 'yaml', 'env', 'typescript'];
    if (!validFormats.includes(format)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid format',
        message: `Format must be one of: ${validFormats.join(', ')}`
      });
    }
    
    const types = instanceTypes 
      ? (instanceTypes as string).split(',').map(t => t.trim() as CacheInstanceType)
      : undefined;
    
    // 获取当前配置
    const currentConfigs = cacheConfigManager.getAllConfigs();
    const config = Object.fromEntries(currentConfigs) as any;
    
    // 生成文件路径
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `cache-config-export-${timestamp}.${format}`;
    const filePath = path.join(process.cwd(), 'exports', fileName);
    
    const options = {
      format: format as ExportFormat,
      includeDefaults: true,
      includeComments: true,
      minify: false,
      encoding: 'utf8' as BufferEncoding
    };
    
    const exported = await CacheConfigImportExport.getInstance().exportConfig(
      config,
      filePath,
      options
    );
    
    // 设置适当的Content-Type
    const contentTypes = {
      json: 'application/json',
      yaml: 'application/x-yaml',
      env: 'text/plain',
      typescript: 'text/typescript'
    };
    
    res.setHeader('Content-Type', contentTypes[format as keyof typeof contentTypes]);
    res.setHeader('Content-Disposition', `attachment; filename="cache-config.${format}"`);
    
    if (format === 'json') {
      res.json(exported);
    } else {
      res.send(exported);
    }
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * 导入配置
 */
router.post('/configs/import/:format', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { format } = req.params;
    const { content, merge = true, validate = true } = req.body;
    
    const validFormats = ['json', 'yaml', 'env', 'typescript'];
    if (!validFormats.includes(format)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid format',
        message: `Format must be one of: ${validFormats.join(', ')}`
      });
    }
    
    let configContent: string;
    
    if (req.file) {
      configContent = req.file.buffer.toString('utf-8');
    } else if (content) {
      configContent = content;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Missing content',
        message: 'Either file upload or content string is required'
      });
    }
    
    // 获取当前配置作为基础
    const currentConfigs = cacheConfigManager.getAllConfigs();
    const currentConfig = Object.fromEntries(currentConfigs) as any;
    
    // 创建临时文件
    const tempFileName = `temp-import-${Date.now()}.${format}`;
    const tempFilePath = path.join(process.cwd(), 'temp', tempFileName);
    
    // 写入临时文件
    await require('fs').promises.mkdir(path.dirname(tempFilePath), { recursive: true });
    await require('fs').promises.writeFile(tempFilePath, configContent, 'utf8');
    
    const options = {
      format: format as ExportFormat,
      validateOnImport: validate,
      backupBeforeImport: true,
      encoding: 'utf8' as BufferEncoding
    };
    
    const result = await CacheConfigImportExport.getInstance().importConfig(
      tempFilePath,
      currentConfig,
      options
    );
    
    // 清理临时文件
    try {
      await require('fs').promises.unlink(tempFilePath);
    } catch (error) {
      console.warn('Failed to cleanup temp file:', error);
    }
    
    res.json({
      success: true,
      data: result,
      message: 'Configuration imported successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * 备份配置
 */
router.post('/configs/backup', async (req: Request, res: Response) => {
  try {
    const { description, includeStats = false } = req.body;
    
    // 获取当前配置
    const currentConfigs = cacheConfigManager.getAllConfigs();
    const config = Object.fromEntries(currentConfigs) as any;
    
    const backup = await CacheConfigImportExport.getInstance().createBackup(
      config,
      description || `Backup created at ${new Date().toISOString()}`
    );
    
    res.json({
      success: true,
      data: backup,
      message: 'Configuration backup created',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * 获取备份列表
 */
router.get('/configs/backups', async (req: Request, res: Response) => {
  try {
    const backups = CacheConfigImportExport.getInstance().getBackups();
    
    res.json({
      success: true,
      data: backups,
      count: backups.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * 恢复配置
 */
router.post('/configs/restore/:backupId', async (req: Request, res: Response) => {
  try {
    const { backupId } = req.params;
    const { validate = true } = req.body;
    
    const result = await CacheConfigImportExport.getInstance().restoreBackup(backupId);
    
    // 失效配置缓存
    await invalidateConfigCache();
    
    res.json({
      success: true,
      data: result,
      message: 'Configuration restored successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, res);
  }
});

// ==================== 环境变量配置 API ====================

/**
 * 获取环境变量配置
 */
router.get('/configs/environment', async (req: Request, res: Response) => {
  try {
    const envValues = cacheEnvConfig.getCurrentEnvValues();
    
    res.json({
      success: true,
      data: envValues,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * 生成环境变量模板
 */
router.get('/configs/environment/template', async (req: Request, res: Response) => {
  try {
    const { format = 'env', includeComments = true } = req.query;
    
    const template = cacheEnvConfig.generateEnvTemplate();
    
    const contentTypes = {
      env: 'text/plain',
      json: 'application/json',
      yaml: 'application/x-yaml'
    };
    
    res.setHeader('Content-Type', contentTypes[format as keyof typeof contentTypes]);
    res.setHeader('Content-Disposition', `attachment; filename="cache-env-template.${format}"`);
    
    if (format === 'json') {
      res.json(template);
    } else {
      res.send(template);
    }
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * 获取环境覆盖历史
 */
router.get('/configs/environment/history', async (req: Request, res: Response) => {
  try {
    const history = cacheEnvConfig.getOverrideHistory();
    
    res.json({
      success: true,
      data: history,
      count: history.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, res);
  }
});

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