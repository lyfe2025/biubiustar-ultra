/**
 * 缓存管理系统统一导出
 */

// 导出分析模块
export * from './analytics';

// 导出监控模块
export * from './monitoring';

// 导出预热模块
export * from './prewarming';

// 导出主要缓存类（保持向后兼容）
export { CacheAnalytics } from './analytics';
export { CacheMonitor } from './monitoring';
export { CachePrewarmingBatch } from './prewarming';

// 导出默认实例（保持向后兼容）
import { CacheAnalytics } from './analytics';
import { CacheMonitor } from './monitoring';
import { CachePrewarmingBatch } from './prewarming';

export const cacheAnalytics = new CacheAnalytics();
export const cacheMonitor = CacheMonitor.getInstance();
export const cachePrewarmingBatch = new CachePrewarmingBatch();

// 默认导出主要实例
export default {
  analytics: cacheAnalytics,
  monitor: cacheMonitor,
  prewarming: cachePrewarmingBatch
};