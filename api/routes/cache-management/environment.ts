import { Router, Request, Response } from 'express';
import { cacheEnvConfig } from '../../lib/CacheEnvConfig';
import { handleError } from './middleware';

const router = Router();

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
    
    // 确保环境配置已初始化
    cacheEnvConfig.initialize();
    
    // 获取环境变量映射
    const envMappings = cacheEnvConfig.getMappingManager().getMappingMap();
    
    // 生成模板
    const template = cacheEnvConfig.generateEnvTemplate(
      envMappings,
      includeComments === 'true' || includeComments === true
    );
    
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

export default router;
