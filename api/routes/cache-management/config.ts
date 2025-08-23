import { Router, Request, Response } from 'express';
import { cacheConfigManager } from '../../lib/cache/config';
import { CacheInstanceType } from '../../config/cache';
import { invalidateConfigCache } from '../../services/cacheInvalidation.js';
import { handleError, validateInstanceType } from './middleware';

const router = Router();

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

export default router;
