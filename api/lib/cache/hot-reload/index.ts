// 热重载模块统一导出

// 类型定义
export * from './types';

// 核心组件
// 核心组件
export { FileWatcher, createFileWatcher } from './FileWatcher';
export { ConfigLoader, createConfigLoader } from './ConfigLoader';
export { ConfigApplier, createConfigApplier } from './ConfigApplier';
export { BackupManager, createBackupManager } from './BackupManager';
export { HotReloadManager, createHotReloadManager } from './HotReloadManager';

// 默认配置
import { HotReloadOptions } from './types';
import { HotReloadManager, createHotReloadManager } from './HotReloadManager';
import { join } from 'path';

/**
 * 默认热重载选项
 */
export const defaultHotReloadOptions: HotReloadOptions = {
  configDir: join(process.cwd(), 'config', 'cache'),
  enabled: true,
  debounceDelay: 300,
  watchExtensions: ['.json', '.js', '.ts', '.yaml', '.yml'],
  ignorePatterns: ['*.tmp', '*.bak', '.*', 'node_modules/**'],
  maxBackups: 10,
  autoBackup: true,
  restoreOnError: true
};

/**
 * 创建默认热重载管理器
 */
export function createDefaultHotReloadManager(configManager: any, options?: Partial<HotReloadOptions>): HotReloadManager {
  const mergedOptions = { ...defaultHotReloadOptions, ...options };
  return createHotReloadManager(mergedOptions, configManager);
}

// 为了向后兼容性，重新导出为原始名称
export { HotReloadManager as CacheConfigHotReload };
export { createDefaultHotReloadManager as createCacheConfigHotReload };