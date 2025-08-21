import { CacheConfig, CacheConfigs } from '../config/cache';
import { promises as fs } from 'fs';
import * as path from 'path';

/**
 * 导出格式类型
 */
export type ExportFormat = 'json' | 'yaml' | 'env' | 'typescript';

/**
 * 导入导出选项
 */
export interface ImportExportOptions {
  format: ExportFormat;
  includeDefaults?: boolean;
  includeComments?: boolean;
  minify?: boolean;
  validateOnImport?: boolean;
  backupBeforeImport?: boolean;
  encoding?: BufferEncoding;
}

/**
 * 导出结果
 */
export interface ExportResult {
  success: boolean;
  filePath?: string;
  content?: string;
  size?: number;
  format: ExportFormat;
  timestamp: Date;
  error?: string;
}

/**
 * 导入结果
 */
export interface ImportResult {
  success: boolean;
  config?: CacheConfigs;
  backupPath?: string;
  validationErrors?: string[];
  warnings?: string[];
  timestamp: Date;
  error?: string;
}

/**
 * 配置备份信息
 */
export interface ConfigBackup {
  id: string;
  timestamp: Date;
  filePath: string;
  originalConfig: CacheConfigs;
  description?: string;
  size: number;
}

/**
 * 缓存配置导入导出管理器
 */
export class CacheConfigImportExport {
  private static instance: CacheConfigImportExport;
  private backups: Map<string, ConfigBackup> = new Map();
  private backupDirectory: string;
  private maxBackups: number = 10;

  private constructor() {
    this.backupDirectory = path.join(process.cwd(), 'cache-config-backups');
    this.ensureBackupDirectory();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): CacheConfigImportExport {
    if (!CacheConfigImportExport.instance) {
      CacheConfigImportExport.instance = new CacheConfigImportExport();
    }
    return CacheConfigImportExport.instance;
  }

  /**
   * 确保备份目录存在
   */
  private async ensureBackupDirectory(): Promise<void> {
    try {
      await fs.access(this.backupDirectory);
    } catch {
      await fs.mkdir(this.backupDirectory, { recursive: true });
    }
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
      await this.ensureBackupDirectory();
      
      let content: string;
      const timestamp = new Date();

      switch (options.format) {
        case 'json':
          content = this.exportToJson(config, options);
          break;
        case 'yaml':
          content = this.exportToYaml(config, options);
          break;
        case 'env':
          content = this.exportToEnv(config, options);
          break;
        case 'typescript':
          content = this.exportToTypeScript(config, options);
          break;
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }

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
        const backupResult = await this.createBackup(currentConfig, 'Before import');
        if (backupResult.success) {
          backupPath = backupResult.backup?.filePath;
        }
      }

      // 读取文件
      const content = await fs.readFile(filePath, { encoding: options.encoding || 'utf8' });
      
      let importedConfig: CacheConfigs;

      switch (options.format) {
        case 'json':
          importedConfig = this.importFromJson(content);
          break;
        case 'yaml':
          importedConfig = this.importFromYaml(content);
          break;
        case 'env':
          importedConfig = this.importFromEnv(content, currentConfig);
          break;
        case 'typescript':
          importedConfig = this.importFromTypeScript(content);
          break;
        default:
          throw new Error(`Unsupported import format: ${options.format}`);
      }

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
   * 导出为JSON格式
   */
  private exportToJson(config: CacheConfigs, options: ImportExportOptions): string {
    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        format: 'json'
      },
      config
    };

    if (options.minify) {
      return JSON.stringify(exportData);
    } else {
      return JSON.stringify(exportData, null, 2);
    }
  }

  /**
   * 导出为YAML格式
   */
  private exportToYaml(config: CacheConfigs, options: ImportExportOptions): string {
    // 简化的YAML导出实现
    const lines: string[] = [];
    
    if (options.includeComments) {
      lines.push('# Cache Configuration Export');
      lines.push(`# Exported at: ${new Date().toISOString()}`);
      lines.push('# Format: YAML');
      lines.push('');
    }
    
    lines.push('metadata:');
    lines.push(`  exportedAt: "${new Date().toISOString()}"`);
    lines.push('  version: "1.0.0"');
    lines.push('  format: "yaml"');
    lines.push('');
    lines.push('config:');
    
    this.configToYaml(config, lines, 1);
    
    return lines.join('\n');
  }

  /**
   * 配置转YAML辅助方法
   */
  private configToYaml(obj: any, lines: string[], indent: number): void {
    const spaces = '  '.repeat(indent);
    
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        lines.push(`${spaces}${key}:`);
        this.configToYaml(value, lines, indent + 1);
      } else {
        lines.push(`${spaces}${key}: ${JSON.stringify(value)}`);
      }
    }
  }

  /**
   * 导出为环境变量格式
   */
  private exportToEnv(config: CacheConfigs, options: ImportExportOptions): string {
    const lines: string[] = [];
    
    if (options.includeComments) {
      lines.push('# Cache Configuration Environment Variables');
      lines.push(`# Exported at: ${new Date().toISOString()}`);
      lines.push('# Format: Environment Variables');
      lines.push('');
    }
    
    this.configToEnv(config, lines, '');
    
    return lines.join('\n');
  }

  /**
   * 配置转环境变量辅助方法
   */
  private configToEnv(obj: any, lines: string[], prefix: string): void {
    for (const [key, value] of Object.entries(obj)) {
      const envKey = prefix ? `${prefix}_${key.toUpperCase()}` : `CACHE_${key.toUpperCase()}`;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        this.configToEnv(value, lines, envKey);
      } else {
        lines.push(`${envKey}=${value}`);
      }
    }
  }

  /**
   * 导出为TypeScript格式
   */
  private exportToTypeScript(config: CacheConfigs, options: ImportExportOptions): string {
    const lines: string[] = [];
    
    if (options.includeComments) {
      lines.push('/**');
      lines.push(' * Cache Configuration Export');
      lines.push(` * Exported at: ${new Date().toISOString()}`);
      lines.push(' * Format: TypeScript');
      lines.push(' */');
      lines.push('');
    }
    
    lines.push('import { CacheConfigs } from \'../config/cache\';');
    lines.push('');
    lines.push('export const cacheConfig: CacheConfigs = {');
    
    this.configToTypeScript(config, lines, 1);
    
    lines.push('};');
    lines.push('');
    lines.push('export default cacheConfig;');
    
    return lines.join('\n');
  }

  /**
   * 配置转TypeScript辅助方法
   */
  private configToTypeScript(obj: any, lines: string[], indent: number): void {
    const spaces = '  '.repeat(indent);
    const entries = Object.entries(obj);
    
    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];
      const isLast = i === entries.length - 1;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        lines.push(`${spaces}${key}: {`);
        this.configToTypeScript(value, lines, indent + 1);
        lines.push(`${spaces}}${isLast ? '' : ','}`);
      } else {
        lines.push(`${spaces}${key}: ${JSON.stringify(value)}${isLast ? '' : ','}`);
      }
    }
  }

  /**
   * 从JSON导入
   */
  private importFromJson(content: string): CacheConfigs {
    const data = JSON.parse(content);
    
    if (data.config) {
      return data.config;
    } else if (this.isValidCacheConfig(data)) {
      return data;
    } else {
      throw new Error('Invalid JSON format: missing config property');
    }
  }

  /**
   * 从YAML导入（简化实现）
   */
  private importFromYaml(content: string): CacheConfigs {
    // 简化的YAML解析实现
    // 在实际项目中应该使用专门的YAML解析库
    throw new Error('YAML import not implemented. Please use JSON format.');
  }

  /**
   * 从环境变量导入
   */
  private importFromEnv(content: string, currentConfig: CacheConfigs): CacheConfigs {
    const lines = content.split('\n');
    const envVars: Record<string, string> = {};
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key] = valueParts.join('=');
        }
      }
    }
    
    // 应用环境变量到配置
    const newConfig = JSON.parse(JSON.stringify(currentConfig));
    this.applyEnvVarsToConfig(envVars, newConfig);
    
    return newConfig;
  }

  /**
   * 从TypeScript导入
   */
  private importFromTypeScript(content: string): CacheConfigs {
    // 简化的TypeScript解析实现
    // 在实际项目中应该使用专门的TypeScript解析器
    throw new Error('TypeScript import not implemented. Please use JSON format.');
  }

  /**
   * 应用环境变量到配置
   */
  private applyEnvVarsToConfig(envVars: Record<string, string>, config: any): void {
    for (const [key, value] of Object.entries(envVars)) {
      if (key.startsWith('CACHE_')) {
        const configPath = this.envKeyToConfigPath(key);
        this.setConfigValue(config, configPath, this.parseEnvValue(value));
      }
    }
  }

  /**
   * 环境变量键转配置路径
   */
  private envKeyToConfigPath(envKey: string): string {
    return envKey
      .replace(/^CACHE_/, '')
      .toLowerCase()
      .replace(/_/g, '.');
  }

  /**
   * 解析环境变量值
   */
  private parseEnvValue(value: string): any {
    // 尝试解析为数字
    const num = Number(value);
    if (!isNaN(num)) {
      return num;
    }
    
    // 尝试解析为布尔值
    const lower = value.toLowerCase();
    if (lower === 'true') return true;
    if (lower === 'false') return false;
    
    // 返回字符串
    return value;
  }

  /**
   * 设置配置值
   */
  private setConfigValue(config: any, path: string, value: any): void {
    const parts = path.split('.');
    let current = config;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    
    current[parts[parts.length - 1]] = value;
  }

  /**
   * 验证配置
   */
  private validateConfig(config: CacheConfigs): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
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
   * 检查是否为有效的缓存配置
   */
  private isValidCacheConfig(obj: any): obj is CacheConfigs {
    return obj && typeof obj === 'object' && (
      obj.user || obj.content || obj.stats || obj.config || obj.session || obj.api
    );
  }

  /**
   * 创建配置备份
   */
  public async createBackup(
    config: CacheConfigs,
    description?: string
  ): Promise<{
    success: boolean;
    backup?: ConfigBackup;
    error?: string;
  }> {
    try {
      await this.ensureBackupDirectory();
      
      const id = this.generateBackupId();
      const timestamp = new Date();
      const fileName = `cache-config-backup-${id}.json`;
      const filePath = path.join(this.backupDirectory, fileName);
      
      const backupData = {
        metadata: {
          id,
          timestamp: timestamp.toISOString(),
          description: description || 'Manual backup',
          version: '1.0.0'
        },
        config
      };
      
      const content = JSON.stringify(backupData, null, 2);
      await fs.writeFile(filePath, content, 'utf8');
      
      const stats = await fs.stat(filePath);
      
      const backup: ConfigBackup = {
        id,
        timestamp,
        filePath,
        originalConfig: config,
        description,
        size: stats.size
      };
      
      this.backups.set(id, backup);
      
      // 清理旧备份
      await this.cleanupOldBackups();
      
      return {
        success: true,
        backup
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 恢复配置备份
   */
  public async restoreBackup(backupId: string): Promise<{
    success: boolean;
    config?: CacheConfigs;
    error?: string;
  }> {
    try {
      const backup = this.backups.get(backupId);
      if (!backup) {
        throw new Error(`Backup with ID ${backupId} not found`);
      }
      
      // 从文件读取备份
      const content = await fs.readFile(backup.filePath, 'utf8');
      const backupData = JSON.parse(content);
      
      if (!backupData.config) {
        throw new Error('Invalid backup file: missing config');
      }
      
      return {
        success: true,
        config: backupData.config
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
  public getBackups(): ConfigBackup[] {
    return Array.from(this.backups.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * 删除备份
   */
  public async deleteBackup(backupId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const backup = this.backups.get(backupId);
      if (!backup) {
        throw new Error(`Backup with ID ${backupId} not found`);
      }
      
      await fs.unlink(backup.filePath);
      this.backups.delete(backupId);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 生成备份ID
   */
  private generateBackupId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}`;
  }

  /**
   * 清理旧备份
   */
  private async cleanupOldBackups(): Promise<void> {
    const backups = this.getBackups();
    
    if (backups.length > this.maxBackups) {
      const toDelete = backups.slice(this.maxBackups);
      
      for (const backup of toDelete) {
        try {
          await fs.unlink(backup.filePath);
          this.backups.delete(backup.id);
        } catch (error) {
          console.warn(`Failed to delete backup ${backup.id}:`, error);
        }
      }
    }
  }

  /**
   * 设置最大备份数量
   */
  public setMaxBackups(max: number): void {
    this.maxBackups = Math.max(1, max);
  }

  /**
   * 获取备份目录
   */
  public getBackupDirectory(): string {
    return this.backupDirectory;
  }

  /**
   * 设置备份目录
   */
  public async setBackupDirectory(directory: string): Promise<void> {
    this.backupDirectory = directory;
    await this.ensureBackupDirectory();
  }

  /**
   * 销毁实例
   */
  public destroy(): void {
    this.backups.clear();
    CacheConfigImportExport.instance = undefined as any;
  }
}

// 导出默认实例
export const cacheConfigImportExport = CacheConfigImportExport.getInstance();