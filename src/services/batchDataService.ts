/**
 * 批量数据服务 - 向后兼容性导出文件
 * 
 * 该文件已被重构为模块化架构，原有功能已分离到 src/services/batch/ 目录下的多个文件中：
 * - types.ts - 所有接口和类型定义
 * - CacheManager.ts - 缓存相关功能
 * - PerformanceMonitor.ts - 性能监控和指标收集
 * - FallbackHandler.ts - 降级处理机制
 * - DataFetchers.ts - 各种数据获取方法
 * - BatchRequestProcessor.ts - 核心批量请求处理逻辑
 * - PageDataService.ts - 页面级数据聚合服务
 * - index.ts - 统一导出文件
 * 
 * 为了保持向后兼容性，此文件重新导出所有原有的接口和实例。
 */

// 重新导出所有类型定义和服务
export * from './batch';

// 重新导出默认实例以保持向后兼容性
export { batchDataService as default } from './batch';