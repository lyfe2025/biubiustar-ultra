import { promises as fs } from 'fs';
import * as path from 'path';
import { CacheConfig, CacheConfigs } from '../../../config/cache';
import {
  IImportExportManager,
  IFormatter,
  ImportExportOptions,
  ExportResult,
  ImportResult,
  ValidationResult,
  ExportFormat
} from './types';
import { JsonFormatter } from './JsonFormatter';
import { YamlFormatter } from './YamlFormatter';
import { EnvFormatter } from './EnvFormatter';
import { TypeScriptFormatter } from './TypeScriptFormatter';
import { BackupManager } from './BackupManager';

/**
 * 导入导出管理器
 * 负责协调各种格式的导入导出操作
 */
export class ImportExportManager implements IImportExportManager {
  private static instance: ImportExportManager;
  private formatters: Map<ExportFormat, IFormatter> = new Map();
  private backupManager: BackupManager;

  private constructor() {
    this.backupManager = BackupManager.getInstance();
    this.initializeFormatters();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): ImportExportManager {
    if (!ImportExportManager.instance) {
      ImportExportManager.instance = new ImportExportManager();
    }
    return ImportExportManager.instance;
  }

  /**
   * 初始化格式化器
   */
  private initializeFormatters(): void {
    this.formatters.set('json', new JsonFormatter());
    this.formatters.set('yaml', new YamlFormatter());
    this.formatters.set('env', new EnvFormatter());
    this.formatters.set('typescript', new TypeScriptFormatter());
  }

  /**
   * 导出配置
   */
  public async exportConfig(
    config: CacheConfigs,
    filePath: string,
    options: ImportExportOptions
  ): Promise<ExportResult> {
    try {
      const formatter = this.formatters.get(options.format);
      if (!formatter) {
        throw new Error(`Unsupported export format: ${options.format}`);
      }

      const timestamp = new Date();
      const content = formatter.export(config, options);

      // 确保目录存在
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });

      // 写入文件
      await fs.writeFile(filePath, content, { encoding: options.encoding || 'utf8' });

      // 获取文件大小
      const stats = await fs.stat(filePath);

      return {
        success: true,
        filePath,
        content,
        size: stats.size,
        format: options.format,
        timestamp
      };
    } catch (error) {
      return {
        success: false,
        format: options.format,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 导入配置
   */
  public async importConfig(
    filePath: string,
    currentConfig: CacheConfigs,
    options: ImportExportOptions
  ): Promise<ImportResult> {
    try {
      const timestamp = new Date();
      let backupPath: string | undefined;

      // 创建备份
      if (options.backupBeforeImport) {
        const backupResult = await this.backupManager.createBackup(currentConfig, 'Before import');
        if (backupResult.success) {
          backupPath = backupResult.backup?.filePath;
        }
      }

      // 读取文件
      const content = await fs.readFile(filePath, { encoding: options.encoding || 'utf8' });
      
      const formatter = this.formatters.get(options.format);
      if (!formatter) {
        throw new Error(`Unsupported import format: ${options.format}`);
      }

      const importedConfig = formatter.import(content, currentConfig);

      const result: ImportResult = {
        success: true,
        config: importedConfig,
        backupPath,
        timestamp
      };

      // 验证配置
      if (options.validateOnImport) {
        const validation = this.validateConfig(importedConfig);
        if (!validation.valid) {
          result.validationErrors = validation.errors;
          if (validation.errors.length > 0) {
            result.success = false;
          }
        }
        result.warnings = validation.warnings;
      }

      return result;
    } catch (error) {
      return {
        success: false,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 验证配置
   */
  public validateConfig(config: CacheConfigs): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // 基本结构验证
    if (!this.isValidCacheConfig(config)) {
      errors.push('Invalid cache configuration structure');
    }
    
    // 验证各个缓存类型
    const cacheTypes = ['user', 'content', 'stats', 'config', 'session', 'api'];
    
    for (const type of cacheTypes) {
      if (config[type as keyof CacheConfigs]) {
        const cacheConfig = config[type as keyof CacheConfigs] as CacheConfig;
        
        if (typeof cacheConfig.maxSize !== 'number' || cacheConfig.maxSize <= 0) {
          errors.push(`Invalid maxSize for ${type} cache`);
        }
        
        if (typeof cacheConfig.defaultTTL !== 'number' || cacheConfig.defaultTTL <= 0) {
          errors.push(`Invalid defaultTTL for ${type} cache`);
        }
        
        if (typeof cacheConfig.cleanupInterval !== 'number' || cacheConfig.cleanupInterval <= 0) {
          errors.push(`Invalid cleanupInterval for ${type} cache`);
        }
        
        if (typeof cacheConfig.enabled !== 'boolean') {
          errors.push(`Invalid enabled flag for ${type} cache`);
        }
        
        // 警告检查
        if (cacheConfig.maxSize > 50000) {
          warnings.push(`Large maxSize (${cacheConfig.maxSize}) for ${type} cache may impact performance`);
        }
        
        if (cacheConfig.defaultTTL > 86400000) { // 24 hours
          warnings.push(`Long TTL (${cacheConfig.defaultTTL}ms) for ${type} cache`);
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 获取支持的格式
   */
  public getSupportedFormats(): ExportFormat[] {
    return Array.from(this.formatters.keys());
  }

  /**
   * 获取格式化器
   */
  public getFormatter(format: ExportFormat): IFormatter | undefined {
    return this.formatters.get(format);
  }

  /**
   * 注册自定义格式化器
   */
  public registerFormatter(format: ExportFormat, formatter: IFormatter): void {
    this.formatters.set(format, formatter);
  }

  /**
   * 获取备份管理器
   */
  public getBackupManager(): BackupManager {
    return this.backupManager;
  }

  /**
   * 恢复备份
   */
  public async restoreBackup(backupId: string): Promise<{ success: boolean; config?: CacheConfigs; error?: string }> {
    try {
      const result = await this.backupManager.restoreBackup(backupId);
      return {
        success: result.success,
        config: result.config,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 创建备份
   */
  public async createBackup(config: CacheConfigs, description?: string): Promise<{ success: boolean; backupId?: string; error?: string }> {
    try {
      const result = await this.backupManager.createBackup(config, description);
      return {
        success: result.success,
        backupId: result.backup?.id,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 获取所有备份
   */
  public getBackups(): Array<{ id: string; timestamp: Date; description?: string }> {
    try {
      const backups = this.backupManager.getBackups();
      return backups.map(backup => ({
        id: backup.id,
        timestamp: backup.timestamp,
        description: backup.description
      }));
    } catch (error) {
      console.error('Failed to get backups:', error);
      return [];
    }
  }

  /**
   * 检查是否为有效的缓存配置
   */
  private isValidCacheConfig(obj: any): obj is CacheConfigs {
    return obj && typeof obj === 'object' && (
      obj.user || obj.content || obj.stats || obj.config || obj.session || obj.api
    );
  }

  /**
   * 销毁实例
   */
  public destroy(): void {
    this.formatters.clear();
    this.backupManager.destroy();
    ImportExportManager.instance = undefined as any;
  }
}

// 导出默认实例
export const importExportManager = ImportExportManager.getInstance();