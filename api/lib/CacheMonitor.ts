/**
 * @fileoverview 缓存监控模块兼容性导出文件
 * @description 此文件已重构为模块化结构，位于 ./cache/monitoring/ 目录下
 * 为保持向后兼容性，此文件重新导出新的模块化缓存监控功能
 * 
 * 新的模块化结构：
 * - ./cache/monitoring/types.ts - 类型定义
 * - ./cache/monitoring/HealthChecker.ts - 健康检查器
 * - ./cache/monitoring/AlertManager.ts - 警报管理器
 * - ./cache/monitoring/PerformanceReporter.ts - 性能报告器
 * - ./cache/monitoring/index.ts - 统一导出
 */

// 重新导出新的模块化缓存监控功能
export * from './cache/monitoring';

// 为保持向后兼容性，导出主要类和实例
export { CacheMonitor, cacheMonitor } from './cache/monitoring';

// 重新导出类型定义（保持向后兼容）
export type {
  CacheMetrics,
  PerformanceReport,
  CacheAlert,
  MonitorConfig,
  HealthCheckResult,
  MonitorStatus
} from './cache/monitoring';

// 获取缓存监控实例的便捷函数（保持向后兼容）
export function getCacheMonitor() {
  const { cacheMonitor } = require('./cache/monitoring');
  return cacheMonitor;
}

// 重置缓存监控实例的便捷函数（保持向后兼容）
export function resetCacheMonitor() {
  // 通过重新创建实例来重置
  const { CacheMonitor } = require('./cache/monitoring');
  return CacheMonitor.getInstance();
}