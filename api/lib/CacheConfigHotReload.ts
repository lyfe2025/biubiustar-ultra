// 重新导出模块化的热重载功能
export * from './cache/hot-reload';

// 为了向后兼容性，创建默认实例
import { createDefaultHotReloadManager, HotReloadManager } from './cache/hot-reload';

// 单例实例
let defaultInstance: HotReloadManager | null = null;

/**
 * 获取默认的热重载管理器实例（单例模式）
 * @param options 热重载选项
 * @param configManager 配置管理器实例
 * @returns 热重载管理器实例
 */
export function getCacheConfigHotReload(options?: any, configManager?: any): HotReloadManager {
  if (!defaultInstance && configManager) {
    defaultInstance = createDefaultHotReloadManager(configManager, options);
  }
  
  if (!defaultInstance) {
    throw new Error('CacheConfigHotReload instance not initialized. Please provide configManager.');
  }
  
  return defaultInstance;
}

/**
 * 重置默认实例（主要用于测试）
 */
export function resetCacheConfigHotReload(): void {
  if (defaultInstance) {
    defaultInstance.destroy();
    defaultInstance = null;
  }
}