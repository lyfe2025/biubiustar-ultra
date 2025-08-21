import { EnhancedCacheService } from './enhancedCache';
import { CacheInstanceType } from '../config/cache';
import { cacheEventNotification, CacheEventType, EventSeverity } from './CacheEventNotification';

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
  percentage: number;
  currentItem?: PrewarmItem;
  estimatedTimeRemaining?: number;
}

/**
 * 预热结果
 */
export interface PrewarmResult {
  total: number;
  successful: number;
  failed: number;
  duration: number;
  errors: Array<{ item: PrewarmItem; error: Error }>;
  statistics: {
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
interface PrewarmTask {
  id: string;
  items: PrewarmItem[];
  config: PrewarmConfig;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: PrewarmProgress;
  result?: PrewarmResult;
  startTime?: Date;
  endTime?: Date;
}

/**
 * 缓存预热和批量操作管理器
 */
export class CachePrewarmingBatch {
  private cacheInstances: Map<CacheInstanceType, EnhancedCacheService> = new Map();
  private prewarmTasks: Map<string, PrewarmTask> = new Map();
  private dataLoaders: Map<string, DataLoader> = new Map();
  private isRunning: boolean = false;
  private taskQueue: string[] = [];
  private maxConcurrentTasks: number = 3;
  private runningTasks: Set<string> = new Set();

  constructor() {
    this.initializeEventListeners();
  }

  /**
   * 初始化事件监听器
   */
  private initializeEventListeners(): void {
    cacheEventNotification.addEventListener('prewarming-batch-listener', {
      eventTypes: [
        CacheEventType.CACHE_INSTANCE_CREATED,
        CacheEventType.CACHE_INSTANCE_DESTROYED
      ],
      callback: async (eventType, data) => {
        if (eventType === CacheEventType.CACHE_INSTANCE_CREATED) {
          // 缓存实例创建时可能需要预热
          await this.handleCacheInstanceCreated(data);
        }
      }
    });
  }

  /**
   * 注册缓存实例
   */
  public registerCacheInstance(
    type: CacheInstanceType,
    instance: EnhancedCacheService
  ): void {
    this.cacheInstances.set(type, instance);
  }

  /**
   * 注册数据加载器
   */
  public registerDataLoader(name: string, loader: DataLoader): void {
    this.dataLoaders.set(name, loader);
  }

  /**
   * 预热缓存
   */
  public async prewarmCache(
    instanceType: CacheInstanceType,
    items: PrewarmItem[],
    config: PrewarmConfig = { strategy: PrewarmStrategy.IMMEDIATE }
  ): Promise<PrewarmResult> {
    const taskId = this.generateTaskId();
    const task: PrewarmTask = {
      id: taskId,
      items,
      config,
      status: 'pending',
      progress: {
        total: items.length,
        completed: 0,
        failed: 0,
        percentage: 0
      }
    };

    this.prewarmTasks.set(taskId, task);

    try {
      const result = await this.executePrewarmTask(instanceType, task);
      task.status = 'completed';
      task.result = result;
      task.endTime = new Date();

      // 发送完成事件
      await cacheEventNotification.emitEvent(CacheEventType.CACHE_CLEANUP_COMPLETED, {
        timestamp: new Date(),
        severity: EventSeverity.INFO,
        source: 'CachePrewarmingBatch',
        message: `Prewarming completed for ${instanceType}: ${result.successful}/${result.total} items`,
        metadata: { taskId, instanceType, result }
      });

      return result;
    } catch (error) {
      task.status = 'failed';
      task.endTime = new Date();

      await cacheEventNotification.emitError({
        source: 'CachePrewarmingBatch',
        message: `Prewarming failed for ${instanceType}`,
        error: error as Error,
        metadata: { taskId, instanceType }
      });

      throw error;
    }
  }

  /**
   * 使用数据加载器预热
   */
  public async prewarmWithLoader(
    instanceType: CacheInstanceType,
    loaderName: string,
    keys: string[],
    config: PrewarmConfig = { strategy: PrewarmStrategy.IMMEDIATE }
  ): Promise<PrewarmResult> {
    const loader = this.dataLoaders.get(loaderName);
    if (!loader) {
      throw new Error(`Data loader '${loaderName}' not found`);
    }

    const loadedData = await loader.load(keys);
    const items: PrewarmItem[] = loadedData.map(data => ({
      key: data.key,
      value: data.value,
      ttl: data.ttl
    }));

    return this.prewarmCache(instanceType, items, config);
  }

  /**
   * 执行预热任务
   */
  private async executePrewarmTask(
    instanceType: CacheInstanceType,
    task: PrewarmTask
  ): Promise<PrewarmResult> {
    const cache = this.cacheInstances.get(instanceType);
    if (!cache) {
      throw new Error(`Cache instance '${instanceType}' not found`);
    }

    task.status = 'running';
    task.startTime = new Date();

    const result: PrewarmResult = {
      total: task.items.length,
      successful: 0,
      failed: 0,
      duration: 0,
      errors: [],
      statistics: {
        averageTime: 0,
        maxTime: 0,
        minTime: Infinity,
        throughput: 0
      }
    };

    const times: number[] = [];
    const startTime = Date.now();

    switch (task.config.strategy) {
      case PrewarmStrategy.IMMEDIATE:
        await this.executeImmediatePrewarm(cache, task, result, times);
        break;
      case PrewarmStrategy.PRIORITY:
        await this.executePriorityPrewarm(cache, task, result, times);
        break;
      case PrewarmStrategy.ADAPTIVE:
        await this.executeAdaptivePrewarm(cache, task, result, times);
        break;
      default:
        await this.executeImmediatePrewarm(cache, task, result, times);
    }

    const endTime = Date.now();
    result.duration = endTime - startTime;

    // 计算统计信息
    if (times.length > 0) {
      result.statistics.averageTime = times.reduce((a, b) => a + b, 0) / times.length;
      result.statistics.maxTime = Math.max(...times);
      result.statistics.minTime = Math.min(...times);
      result.statistics.throughput = (result.successful * 1000) / result.duration;
    }

    return result;
  }

  /**
   * 立即预热策略
   */
  private async executeImmediatePrewarm(
    cache: EnhancedCacheService,
    task: PrewarmTask,
    result: PrewarmResult,
    times: number[]
  ): Promise<void> {
    const batchSize = task.config.batchSize || 10;
    const concurrency = task.config.concurrency || 3;

    for (let i = 0; i < task.items.length; i += batchSize) {
      const batch = task.items.slice(i, i + batchSize);
      const promises = [];

      for (let j = 0; j < batch.length; j += Math.ceil(batch.length / concurrency)) {
        const chunk = batch.slice(j, j + Math.ceil(batch.length / concurrency));
        promises.push(this.processBatch(cache, chunk, task, result, times));
      }

      await Promise.allSettled(promises);

      // 更新进度
      task.progress.completed = Math.min(i + batchSize, task.items.length);
      task.progress.percentage = (task.progress.completed / task.progress.total) * 100;

      if (task.config.onProgress) {
        task.config.onProgress(task.progress);
      }

      // 批次间延迟
      if (task.config.delay && i + batchSize < task.items.length) {
        await this.sleep(task.config.delay);
      }
    }
  }

  /**
   * 优先级预热策略
   */
  private async executePriorityPrewarm(
    cache: EnhancedCacheService,
    task: PrewarmTask,
    result: PrewarmResult,
    times: number[]
  ): Promise<void> {
    // 按优先级排序
    const sortedItems = [...task.items].sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    const batchSize = task.config.batchSize || 5;
    
    for (let i = 0; i < sortedItems.length; i += batchSize) {
      const batch = sortedItems.slice(i, i + batchSize);
      await this.processBatch(cache, batch, task, result, times);
      
      // 更新进度
      task.progress.completed = Math.min(i + batchSize, sortedItems.length);
      task.progress.percentage = (task.progress.completed / task.progress.total) * 100;
      
      if (task.config.onProgress) {
        task.config.onProgress(task.progress);
      }
    }
  }

  /**
   * 自适应预热策略
   */
  private async executeAdaptivePrewarm(
    cache: EnhancedCacheService,
    task: PrewarmTask,
    result: PrewarmResult,
    times: number[]
  ): Promise<void> {
    let batchSize = task.config.batchSize || 10;
    let concurrency = task.config.concurrency || 3;
    
    const performanceWindow = 10; // 性能监控窗口
    const recentTimes: number[] = [];
    
    for (let i = 0; i < task.items.length; i += batchSize) {
      const batch = task.items.slice(i, i + batchSize);
      const batchStartTime = Date.now();
      
      await this.processBatch(cache, batch, task, result, times);
      
      const batchTime = Date.now() - batchStartTime;
      recentTimes.push(batchTime);
      
      // 保持性能监控窗口大小
      if (recentTimes.length > performanceWindow) {
        recentTimes.shift();
      }
      
      // 自适应调整
      if (recentTimes.length >= 3) {
        const avgTime = recentTimes.reduce((a, b) => a + b, 0) / recentTimes.length;
        const targetTime = 1000; // 目标批次时间 1秒
        
        if (avgTime > targetTime * 1.5) {
          // 太慢，减少批次大小
          batchSize = Math.max(1, Math.floor(batchSize * 0.8));
          concurrency = Math.max(1, concurrency - 1);
        } else if (avgTime < targetTime * 0.5) {
          // 太快，增加批次大小
          batchSize = Math.min(50, Math.floor(batchSize * 1.2));
          concurrency = Math.min(10, concurrency + 1);
        }
      }
      
      // 更新进度
      task.progress.completed = Math.min(i + batchSize, task.items.length);
      task.progress.percentage = (task.progress.completed / task.progress.total) * 100;
      
      if (task.config.onProgress) {
        task.config.onProgress(task.progress);
      }
    }
  }

  /**
   * 处理批次
   */
  private async processBatch(
    cache: EnhancedCacheService,
    batch: PrewarmItem[],
    task: PrewarmTask,
    result: PrewarmResult,
    times: number[]
  ): Promise<void> {
    const promises = batch.map(async (item) => {
      const itemStartTime = Date.now();
      
      try {
        await cache.set(item.key, item.value, item.ttl);
        
        const itemTime = Date.now() - itemStartTime;
        times.push(itemTime);
        result.successful++;
        
      } catch (error) {
        result.failed++;
        result.errors.push({ item, error: error as Error });
        
        if (task.config.onError) {
          task.config.onError(error as Error, item);
        }
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * 批量获取
   */
  public async batchGet<T = any>(
    instanceType: CacheInstanceType,
    keys: string[],
    config: BatchConfig = {}
  ): Promise<BatchResult<T>> {
    const cache = this.cacheInstances.get(instanceType);
    if (!cache) {
      throw new Error(`Cache instance '${instanceType}' not found`);
    }

    const result: BatchResult<T> = {
      successful: [],
      failed: [],
      statistics: {
        total: keys.length,
        successCount: 0,
        failureCount: 0,
        duration: 0,
        throughput: 0
      }
    };

    const startTime = Date.now();
    const batchSize = config.batchSize || 20;

    for (let i = 0; i < keys.length; i += batchSize) {
      const batch = keys.slice(i, i + batchSize);
      
      try {
        const batchResult = await cache.mget(batch);
        
        for (const [key, value] of Object.entries(batchResult)) {
          if (value !== undefined) {
            result.successful.push({ key, result: value as T });
            result.statistics.successCount++;
          } else {
            result.failed.push({ key, error: new Error('Key not found') });
            result.statistics.failureCount++;
          }
        }
      } catch (error) {
        // 批次失败，逐个尝试
        for (const key of batch) {
          try {
            const value = await cache.get(key);
            if (value !== undefined) {
              result.successful.push({ key, result: value as T });
              result.statistics.successCount++;
            } else {
              result.failed.push({ key, error: new Error('Key not found') });
              result.statistics.failureCount++;
            }
          } catch (itemError) {
            result.failed.push({ key, error: itemError as Error });
            result.statistics.failureCount++;
          }
        }
      }

      // 更新进度
      if (config.onProgress) {
        config.onProgress({
          total: keys.length,
          completed: Math.min(i + batchSize, keys.length),
          failed: result.statistics.failureCount,
          percentage: (Math.min(i + batchSize, keys.length) / keys.length) * 100
        });
      }
    }

    const endTime = Date.now();
    result.statistics.duration = endTime - startTime;
    result.statistics.throughput = (result.statistics.successCount * 1000) / result.statistics.duration;

    return result;
  }

  /**
   * 批量设置
   */
  public async batchSet(
    instanceType: CacheInstanceType,
    items: Array<{ key: string; value: any; ttl?: number }>,
    config: BatchConfig = {}
  ): Promise<BatchResult<void>> {
    const cache = this.cacheInstances.get(instanceType);
    if (!cache) {
      throw new Error(`Cache instance '${instanceType}' not found`);
    }

    const result: BatchResult<void> = {
      successful: [],
      failed: [],
      statistics: {
        total: items.length,
        successCount: 0,
        failureCount: 0,
        duration: 0,
        throughput: 0
      }
    };

    const startTime = Date.now();
    const batchSize = config.batchSize || 20;

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      // 准备批量设置数据
      const batchData: Record<string, any> = {};
      const batchTTLs: Record<string, number> = {};
      
      for (const item of batch) {
        batchData[item.key] = item.value;
        if (item.ttl !== undefined) {
          batchTTLs[item.key] = item.ttl;
        }
      }

      try {
        // 构建mset所需的entries数组
        const entries = batch.map(item => ({
          key: item.key,
          data: item.value,
          ttl: item.ttl
        }));
        await cache.mset(entries);
        
        // 所有项目成功
        for (const item of batch) {
          result.successful.push({ key: item.key, result: undefined });
          result.statistics.successCount++;
        }
      } catch (error) {
        // 批次失败，逐个尝试
        for (const item of batch) {
          try {
            await cache.set(item.key, item.value, item.ttl);
            result.successful.push({ key: item.key, result: undefined });
            result.statistics.successCount++;
          } catch (itemError) {
            result.failed.push({ key: item.key, error: itemError as Error });
            result.statistics.failureCount++;
          }
        }
      }

      // 更新进度
      if (config.onProgress) {
        config.onProgress({
          total: items.length,
          completed: Math.min(i + batchSize, items.length),
          failed: result.statistics.failureCount,
          percentage: (Math.min(i + batchSize, items.length) / items.length) * 100
        });
      }
    }

    const endTime = Date.now();
    result.statistics.duration = endTime - startTime;
    result.statistics.throughput = (result.statistics.successCount * 1000) / result.statistics.duration;

    return result;
  }

  /**
   * 批量删除
   */
  public async batchDelete(
    instanceType: CacheInstanceType,
    keys: string[],
    config: BatchConfig = {}
  ): Promise<BatchResult<boolean>> {
    const cache = this.cacheInstances.get(instanceType);
    if (!cache) {
      throw new Error(`Cache instance '${instanceType}' not found`);
    }

    const result: BatchResult<boolean> = {
      successful: [],
      failed: [],
      statistics: {
        total: keys.length,
        successCount: 0,
        failureCount: 0,
        duration: 0,
        throughput: 0
      }
    };

    const startTime = Date.now();
    const batchSize = config.batchSize || 20;

    for (let i = 0; i < keys.length; i += batchSize) {
      const batch = keys.slice(i, i + batchSize);
      
      try {
        const deleteResult = await cache.mdel(batch);
        
        for (const key of batch) {
          const success = deleteResult[key] || false;
          if (success) {
            result.successful.push({ key, result: true });
            result.statistics.successCount++;
          } else {
            result.failed.push({ key, error: new Error('Key not found or delete failed') });
            result.statistics.failureCount++;
          }
        }
      } catch (error) {
        // 批次失败，逐个尝试
        for (const key of batch) {
          try {
            const success = await cache.delete(key);
            result.successful.push({ key, result: success });
            result.statistics.successCount++;
          } catch (itemError) {
            result.failed.push({ key, error: itemError as Error });
            result.statistics.failureCount++;
          }
        }
      }

      // 更新进度
      if (config.onProgress) {
        config.onProgress({
          total: keys.length,
          completed: Math.min(i + batchSize, keys.length),
          failed: result.statistics.failureCount,
          percentage: (Math.min(i + batchSize, keys.length) / keys.length) * 100
        });
      }
    }

    const endTime = Date.now();
    result.statistics.duration = endTime - startTime;
    result.statistics.throughput = (result.statistics.successCount * 1000) / result.statistics.duration;

    return result;
  }

  /**
   * 获取预热任务状态
   */
  public getPrewarmTask(taskId: string): PrewarmTask | undefined {
    return this.prewarmTasks.get(taskId);
  }

  /**
   * 获取所有预热任务
   */
  public getAllPrewarmTasks(): PrewarmTask[] {
    return Array.from(this.prewarmTasks.values());
  }

  /**
   * 取消预热任务
   */
  public cancelPrewarmTask(taskId: string): boolean {
    const task = this.prewarmTasks.get(taskId);
    if (task && task.status === 'running') {
      task.status = 'cancelled';
      return true;
    }
    return false;
  }

  /**
   * 清理已完成的任务
   */
  public cleanupCompletedTasks(): number {
    let cleaned = 0;
    for (const [taskId, task] of this.prewarmTasks) {
      if (task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled') {
        this.prewarmTasks.delete(taskId);
        cleaned++;
      }
    }
    return cleaned;
  }

  /**
   * 处理缓存实例创建事件
   */
  private async handleCacheInstanceCreated(data: any): Promise<void> {
    // 可以在这里实现自动预热逻辑
    // 例如：根据配置自动预热常用数据
  }

  /**
   * 生成任务ID
   */
  private generateTaskId(): string {
    return `prewarm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 睡眠函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取统计信息
   */
  public getStatistics(): {
    totalTasks: number;
    runningTasks: number;
    completedTasks: number;
    failedTasks: number;
    registeredCaches: number;
    registeredLoaders: number;
  } {
    const tasks = Array.from(this.prewarmTasks.values());
    
    return {
      totalTasks: tasks.length,
      runningTasks: tasks.filter(t => t.status === 'running').length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      failedTasks: tasks.filter(t => t.status === 'failed').length,
      registeredCaches: this.cacheInstances.size,
      registeredLoaders: this.dataLoaders.size
    };
  }

  /**
   * 销毁实例
   */
  public destroy(): void {
    // 取消所有运行中的任务
    for (const [taskId, task] of this.prewarmTasks) {
      if (task.status === 'running') {
        task.status = 'cancelled';
      }
    }
    
    this.prewarmTasks.clear();
    this.cacheInstances.clear();
    this.dataLoaders.clear();
    this.taskQueue = [];
    this.runningTasks.clear();
  }
}

// 导出默认实例
export const cachePrewarmingBatch = new CachePrewarmingBatch();