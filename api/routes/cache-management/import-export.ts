import { Router, Request, Response } from 'express';
import * as path from 'path';
import { cacheConfigManager } from '../../lib/cache/config';
import { CacheConfigImportExport, ExportFormat } from '../../lib/CacheConfigImportExport';
import { invalidateConfigCache } from '../../services/cacheInvalidation.js';
import { CacheInstanceType } from '../../config/cache';
import { handleError } from './middleware';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

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

export default router;
