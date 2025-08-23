// 重新导出新的模块化导入导出功能
export * from './cache/import-export';

// 为了保持向后兼容性，重新导出主要的类和实例
export { 
  ImportExportManager as CacheConfigImportExport,
  importExportManager as cacheConfigImportExport 
} from './cache/import-export';

// 重新导出类型定义
export type {
  ExportFormat,
  ImportExportOptions,
  ExportResult,
  ImportResult,
  ConfigBackup,
  BackupResult,
  RestoreResult,
  DeleteResult,
  ValidationResult,
  IFormatter,
  IBackupManager,
  IImportExportManager
} from './cache/import-export/types';