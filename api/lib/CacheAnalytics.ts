/**
 * @fileoverview 缓存分析模块兼容性导出文件
 * @description 此文件已重构为模块化结构，位于 ./cache/analytics/ 目录下
 * 为保持向后兼容性，此文件重新导出新的模块化缓存分析功能
 * 
 * 新的模块化结构：
 * - ./cache/analytics/types.ts - 类型定义
 * - ./cache/analytics/MetricsCollector.ts - 指标收集器
 * - ./cache/analytics/AnomalyDetector.ts - 异常检测器
 * - ./cache/analytics/TrendAnalyzer.ts - 趋势分析器
 * - ./cache/analytics/EfficiencyAnalyzer.ts - 效率分析器
 * - ./cache/analytics/ComparisonEngine.ts - 比较分析引擎
 * - ./cache/analytics/ReportGenerator.ts - 报告生成器
 * - ./cache/analytics/AnalyticsManager.ts - 分析管理器
 * - ./cache/analytics/index.ts - 统一导出
 */

// 重新导出新的模块化缓存分析功能
export * from './cache/analytics';

// 为保持向后兼容性，导出主要类和实例
export { CacheAnalytics, cacheAnalytics } from './cache/analytics';

// 重新导出类型定义（保持向后兼容）
export type {
  TimeRange,
  AnalyticsDimension,
  MetricType,
  DataPoint,
  TimeSeries,
  StatisticsSummary,
  AnomalyDetection,
  PerformanceTrend,
  CacheEfficiencyAnalysis,
  ComparisonAnalysis
} from './cache/analytics';

// 获取缓存分析实例的便捷函数（保持向后兼容）
export function getCacheAnalytics() {
  const { cacheAnalytics } = require('./cache/analytics');
  return cacheAnalytics;
}

// 重置缓存分析实例的便捷函数（保持向后兼容）
export function resetCacheAnalytics() {
  // 通过重新创建实例来重置
  const { CacheAnalytics } = require('./cache/analytics');
  return new CacheAnalytics();
}