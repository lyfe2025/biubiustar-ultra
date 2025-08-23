/**
 * 批量数据服务统一导出文件
 * 
 * 该文件负责统一导出所有批量数据处理相关的模块，
 * 保持原有的导出接口不变，确保现有代码无需修改。
 */

// 导出所有类型定义
export * from './types';

// 导出核心服务类
export { CacheManager } from './CacheManager';
export { PerformanceMonitor } from './PerformanceMonitor';
export { FallbackHandler } from './FallbackHandler';
export { DataFetchers } from './fetchers';
export { BatchRequestProcessor } from './BatchRequestProcessor';
export { PageDataService } from './PageDataService';

// 为了保持向后兼容性，重新导出 PageDataService 作为 BatchDataService
export { PageDataService as BatchDataService } from './PageDataService';

// 创建默认实例并导出（保持原有使用方式）
import { PageDataService } from './PageDataService';

/**
 * 默认的批量数据服务实例
 * 保持与原有 batchDataService 相同的使用方式
 */
export const batchDataService = new PageDataService();

// 导出默认实例作为默认导出
export default batchDataService;