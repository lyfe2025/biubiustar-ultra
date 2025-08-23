/**
 * 缓存预热模块类型定义
 */

import { CacheInstanceType } from '../../../config/cache.ts';

/**
 * 预热策略类型
 */
export enum PrewarmStrategy {
  IMMEDIATE = 'immediate',      // 立即预热
  SCHEDULED = 'scheduled',      // 定时预热
  LAZY = 'lazy',               // 懒加载预热
  PRIORITY = 'priority',       // 优先级预热
  ADAPTIVE = 'adaptive'        // 自适应预热
}

/**
 * 预热数据项
 */
export interface PrewarmItem {
  key: string;
  value: any;
  ttl?: number;
  priority?: number;
  tags?: string[];
  dependencies?: string[];
}

/**
 * 预热配置
 */
export interface PrewarmConfig {
  strategy: PrewarmStrategy;
  batchSize?: number;
  concurrency?: number;
  delay?: number;
  retries?: number;
  timeout?: number;
  onProgress?: (progress: PrewarmProgress) => void;
  onComplete?: (result: PrewarmResult) => void;
  onError?: (error: Error, item: PrewarmItem) => void;
}

/**
 * 预热进度
 */
export interface PrewarmProgress {
  total: number;
  completed: number;
  failed: number;
  percentage?: number;
  currentItem?: PrewarmItem;
  estimatedTimeRemaining?: number;
  startTime?: Date;
  endTime?: Date;
  estimatedEndTime?: Date;
}

/**
 * 预热结果
 */
export interface PrewarmResult {
  taskId?: string;
  status?: string;
  itemsCount?: number;
  estimatedDuration?: number;
  total?: number;
  successful?: number;
  failed?: number;
  duration?: number;
  errors?: Array<{ item: PrewarmItem; error: Error }>;
  statistics?: {
    averageTime: number;
    maxTime: number;
    minTime: number;
    throughput: number;
  };
}

/**
 * 批量操作配置
 */
export interface BatchConfig {
  batchSize?: number;
  concurrency?: number;
  continueOnError?: boolean;
  timeout?: number;
  onProgress?: (progress: BatchProgress) => void;
}

/**
 * 批量操作进度
 */
export interface BatchProgress {
  total: number;
  completed: number;
  failed: number;
  percentage: number;
}

/**
 * 批量操作结果
 */
export interface BatchResult<T = any> {
  successful: Array<{ key: string; result: T }>;
  failed: Array<{ key: string; error: Error }>;
  statistics: {
    total: number;
    successCount: number;
    failureCount: number;
    duration: number;
    throughput: number;
  };
}

/**
 * 数据加载器接口
 */
export interface DataLoader {
  load(keys: string[]): Promise<Array<{ key: string; value: any; ttl?: number }>>;
  loadSingle?(key: string): Promise<{ value: any; ttl?: number } | null>;
}

/**
 * 预热任务
 */
export interface PrewarmTask {
  id: string;
  instanceType: CacheInstanceType;
  items: PrewarmItem[];
  config: PrewarmConfig;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'completed_with_errors';
  progress: PrewarmProgress;
  result?: PrewarmResult;
  error?: string;
  startTime?: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 调度配置
 */
export interface ScheduleConfig {
  maxConcurrentTasks: number;
  taskTimeout: number;
  retryAttempts: number;
  retryDelay: number;
}

/**
 * 预热策略配置
 */
export interface StrategyConfig {
  immediate?: {
    batchSize: number;
    concurrency: number;
    delay: number;
  };
  priority?: {
    batchSize: number;
    highPriorityFirst: boolean;
  };
  adaptive?: {
    initialBatchSize: number;
    targetBatchTime: number;
    performanceWindow: number;
    maxBatchSize: number;
    minBatchSize: number;
  };
}

/**
 * 数据加载管理器配置
 */
export interface DataLoaderConfig {
  timeout: number;
  retries: number;
  cacheResults: boolean;
  cacheTTL: number;
}

/**
 * 预热状态（向后兼容）
 */
export type PrewarmStatus = PrewarmTask['status'];