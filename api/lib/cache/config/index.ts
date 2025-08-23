// 配置管理模块统一导出
// 保持与原有CacheConfigManager.ts的接口兼容性

// 导出类型定义
export * from './types';

// 导出核心类
export { ConfigManager } from './ConfigManager';
export { ConfigLoader } from './ConfigLoader';
export { ConfigValidator } from './ConfigValidator';
export { PerformanceMonitor } from './PerformanceMonitor';

// 为了保持向后兼容性，重新导出ConfigManager为CacheConfigManager
export { ConfigManager as CacheConfigManager } from './ConfigManager';

// 创建默认实例以保持原有使用方式
import { ConfigManager } from './ConfigManager';

/**
 * 默认的缓存配置管理器实例
 * 保持与原有CacheConfigManager使用方式的兼容性
 */
export const cacheConfigManager = ConfigManager.getInstance();

// 导出便捷方法
export const {
  getConfig,
  getInstanceConfig,
  updateConfig,
  updateInstanceConfig,
  reloadConfig,
  resetToDefault,
  addChangeListener,
  removeChangeListener,
  getPerformanceReport,
  getOptimizationSuggestions,
  validateCurrentConfig,
  getState,
  startPerformanceMonitoring,
  stopPerformanceMonitoring
} = cacheConfigManager;

/**
 * 初始化配置管理器
 * 保持原有的初始化方式
 */
export const initializeCacheConfigManager = async () => {
  return await cacheConfigManager.initialize();
};