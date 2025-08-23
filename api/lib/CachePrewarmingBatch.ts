/**
 * @fileoverview 缓存预热批处理模块兼容性导出文件
 * @description 此文件已重构为模块化结构，位于 ./cache/prewarming/ 目录下
 * 为保持向后兼容性，此文件重新导出新的模块化缓存预热功能
 * 
 * 新的模块化结构：
 * - ./cache/prewarming/types.ts - 类型定义
 * - ./cache/prewarming/BatchScheduler.ts - 批处理调度器
 * - ./cache/prewarming/DataLoaderManager.ts - 数据加载管理器
 * - ./cache/prewarming/index.ts - 统一导出
 */

// 重新导出新的模块化缓存预热功能
export * from './cache/prewarming';

// 为保持向后兼容性，导出主要类和实例
export { CachePrewarmingBatch, cachePrewarmingBatch } from './cache/prewarming';

// 重新导出类型定义（保持向后兼容）
export type {
  PrewarmStrategy,
  PrewarmItem,
  PrewarmConfig,
  PrewarmResult,
  BatchConfig,
  PrewarmProgress,
  PrewarmStatus
} from './cache/prewarming';

// 获取缓存预热实例的便捷函数（保持向后兼容）
export function getCachePrewarmingBatch() {
  const { cachePrewarmingBatch } = require('./cache/prewarming');
  return cachePrewarmingBatch;
}

// 重置缓存预热实例的便捷函数（保持向后兼容）
export function resetCachePrewarmingBatch() {
  // 通过重新创建实例来重置
  const { CachePrewarmingBatch } = require('./cache/prewarming');
  return CachePrewarmingBatch.getInstance();
}

// 创建预热任务的便捷函数（保持向后兼容）
export function createPrewarmTask(items: any[], config?: any) {
  const { cachePrewarmingBatch } = require('./cache/prewarming');
  return cachePrewarmingBatch.prewarm(items, config);
}