import { CacheConfig, CacheConfigs, CacheInstanceType } from '../../../config/cache';

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
 * 备份操作结果
 */
export interface BackupResult {
  success: boolean;
  backup?: ConfigBackup;
  error?: string;
}

/**
 * 恢复操作结果
 */
export interface RestoreResult {
  success: boolean;
  config?: CacheConfigs;
  error?: string;
}

/**
 * 删除操作结果
 */
export interface DeleteResult {
  success: boolean;
  error?: string;
}

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 格式化器接口
 */
export interface IFormatter {
  export(config: CacheConfigs, options: ImportExportOptions): string;
  import(content: string, currentConfig?: CacheConfigs): CacheConfigs;
  validate(content: string): boolean;
  getFileExtension(): string;
}

/**
 * 备份管理器接口
 */
export interface IBackupManager {
  createBackup(config: CacheConfigs, description?: string): Promise<BackupResult>;
  restoreBackup(backupId: string): Promise<RestoreResult>;
  deleteBackup(backupId: string): Promise<DeleteResult>;
  getBackups(): ConfigBackup[];
  cleanupOldBackups(): Promise<void>;
  setMaxBackups(max: number): void;
  getBackupDirectory(): string;
  setBackupDirectory(directory: string): Promise<void>;
}

/**
 * 导入导出管理器接口
 */
export interface IImportExportManager {
  exportConfig(config: CacheConfigs, filePath: string, options: ImportExportOptions): Promise<ExportResult>;
  importConfig(filePath: string, currentConfig: CacheConfigs, options: ImportExportOptions): Promise<ImportResult>;
  validateConfig(config: CacheConfigs): ValidationResult;
}