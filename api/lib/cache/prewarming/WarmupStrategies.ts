/**
 * 预热策略实现
 * 
 * 提供不同的缓存预热策略实现
 */

import { PrewarmItem, PrewarmConfig, PrewarmProgress, PrewarmResult, PrewarmStrategy, StrategyConfig } from './types';
import { CacheInstanceType } from '../../../config/cache';
import { cacheEventNotification, CacheEventType, EventSeverity } from '../../CacheEventNotification';

/**
 * 基础预热策略抽象类
 */
export abstract class BaseWarmupStrategy {
  protected config: PrewarmConfig;
  protected strategyConfig: StrategyConfig;

  constructor(config: PrewarmConfig, strategyConfig: StrategyConfig = {}) {
    this.config = config;
    this.strategyConfig = strategyConfig;
  }

  /**
   * 执行预热
   */
  abstract execute(
    cacheInstance: any,
    items: PrewarmItem[]
  ): Promise<PrewarmResult>;

  /**
   * 更新进度
   */
  protected updateProgress(
    total: number,
    completed: number,
    failed: number,
    currentItem?: PrewarmItem
  ): void {
    const progress: PrewarmProgress = {
      total,
      completed,
      failed,
      percentage: total > 0 ? Math.round(((completed + failed) / total) * 100) : 0,
      currentItem
    };

    if (this.config.onProgress) {
      this.config.onProgress(progress);
    }
  }

  /**
   * 处理错误
   */
  protected handleError(item: PrewarmItem, error: Error): void {
    if (this.config.onError) {
      this.config.onError(error, item);
    }

    cacheEventNotification.emitError({
      source: 'WarmupStrategy',
      message: `Failed to prewarm item ${item.key}`,
      error,
      metadata: { key: item.key, strategy: this.config.strategy }
    });
  }

  /**
   * 延迟执行
   */
  protected async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 立即预热策略
 */
export class ImmediateWarmupStrategy extends BaseWarmupStrategy {
  async execute(
    cacheInstance: any,
    items: PrewarmItem[]
  ): Promise<PrewarmResult> {
    const startTime = Date.now();
    const result: PrewarmResult = {
      total: items.length,
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

    const config = this.strategyConfig.immediate || {
      batchSize: 10,
      concurrency: 3,
      delay: 100
    };

    const times: number[] = [];

    // 分批处理
    for (let i = 0; i < items.length; i += config.batchSize) {
      const batch = items.slice(i, i + config.batchSize);
      
      // 并发处理批次
      const promises = batch.map(async (item) => {
        const itemStartTime = Date.now();
        try {
          await cacheInstance.set(item.key, item.value, item.ttl);
          const itemTime = Date.now() - itemStartTime;
          times.push(itemTime);
          result.successful++;
          
          this.updateProgress(result.total, result.successful, result.failed, item);
        } catch (error) {
          result.failed++;
          result.errors.push({ item, error: error as Error });
          this.handleError(item, error as Error);
          
          this.updateProgress(result.total, result.successful, result.failed, item);
        }
      });

      await Promise.all(promises);
      
      // 批次间延迟
      if (config.delay > 0 && i + config.batchSize < items.length) {
        await this.sleep(config.delay);
      }
    }

    // 计算统计信息
    result.duration = Date.now() - startTime;
    if (times.length > 0) {
      result.statistics.averageTime = times.reduce((a, b) => a + b, 0) / times.length;
      result.statistics.maxTime = Math.max(...times);
      result.statistics.minTime = Math.min(...times);
    }
    result.statistics.throughput = result.successful / (result.duration / 1000);

    return result;
  }
}

/**
 * 优先级预热策略
 */
export class PriorityWarmupStrategy extends BaseWarmupStrategy {
  async execute(
    cacheInstance: any,
    items: PrewarmItem[]
  ): Promise<PrewarmResult> {
    const startTime = Date.now();
    const result: PrewarmResult = {
      total: items.length,
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

    const config = this.strategyConfig.priority || {
      batchSize: 5,
      highPriorityFirst: true
    };

    // 按优先级排序
    const sortedItems = [...items].sort((a, b) => {
      const priorityA = a.priority || 0;
      const priorityB = b.priority || 0;
      return config.highPriorityFirst ? priorityB - priorityA : priorityA - priorityB;
    });

    const times: number[] = [];

    // 分批处理
    for (let i = 0; i < sortedItems.length; i += config.batchSize) {
      const batch = sortedItems.slice(i, i + config.batchSize);
      
      for (const item of batch) {
        const itemStartTime = Date.now();
        try {
          await cacheInstance.set(item.key, item.value, item.ttl);
          const itemTime = Date.now() - itemStartTime;
          times.push(itemTime);
          result.successful++;
          
          this.updateProgress(result.total, result.successful, result.failed, item);
        } catch (error) {
          result.failed++;
          result.errors.push({ item, error: error as Error });
          this.handleError(item, error as Error);
          
          this.updateProgress(result.total, result.successful, result.failed, item);
        }
      }
    }

    // 计算统计信息
    result.duration = Date.now() - startTime;
    if (times.length > 0) {
      result.statistics.averageTime = times.reduce((a, b) => a + b, 0) / times.length;
      result.statistics.maxTime = Math.max(...times);
      result.statistics.minTime = Math.min(...times);
    }
    result.statistics.throughput = result.successful / (result.duration / 1000);

    return result;
  }
}

/**
 * 自适应预热策略
 */
export class AdaptiveWarmupStrategy extends BaseWarmupStrategy {
  private performanceHistory: number[] = [];

  async execute(
    cacheInstance: any,
    items: PrewarmItem[]
  ): Promise<PrewarmResult> {
    const startTime = Date.now();
    const result: PrewarmResult = {
      total: items.length,
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

    const config = this.strategyConfig.adaptive || {
      initialBatchSize: 5,
      targetBatchTime: 1000, // 1秒
      performanceWindow: 5,
      maxBatchSize: 50,
      minBatchSize: 1
    };

    let currentBatchSize = config.initialBatchSize;
    const times: number[] = [];

    // 自适应批处理
    for (let i = 0; i < items.length; i += currentBatchSize) {
      const batch = items.slice(i, i + currentBatchSize);
      const batchStartTime = Date.now();
      
      // 处理当前批次
      for (const item of batch) {
        const itemStartTime = Date.now();
        try {
          await cacheInstance.set(item.key, item.value, item.ttl);
          const itemTime = Date.now() - itemStartTime;
          times.push(itemTime);
          result.successful++;
          
          this.updateProgress(result.total, result.successful, result.failed, item);
        } catch (error) {
          result.failed++;
          result.errors.push({ item, error: error as Error });
          this.handleError(item, error as Error);
          
          this.updateProgress(result.total, result.successful, result.failed, item);
        }
      }

      const batchTime = Date.now() - batchStartTime;
      this.performanceHistory.push(batchTime);
      
      // 保持性能历史窗口大小
      if (this.performanceHistory.length > config.performanceWindow) {
        this.performanceHistory.shift();
      }

      // 调整批次大小
      if (this.performanceHistory.length >= 2) {
        const avgBatchTime = this.performanceHistory.reduce((a, b) => a + b, 0) / this.performanceHistory.length;
        
        if (avgBatchTime < config.targetBatchTime * 0.8) {
          // 性能良好，增加批次大小
          currentBatchSize = Math.min(currentBatchSize + 1, config.maxBatchSize);
        } else if (avgBatchTime > config.targetBatchTime * 1.2) {
          // 性能不佳，减少批次大小
          currentBatchSize = Math.max(currentBatchSize - 1, config.minBatchSize);
        }
      }
    }

    // 计算统计信息
    result.duration = Date.now() - startTime;
    if (times.length > 0) {
      result.statistics.averageTime = times.reduce((a, b) => a + b, 0) / times.length;
      result.statistics.maxTime = Math.max(...times);
      result.statistics.minTime = Math.min(...times);
    }
    result.statistics.throughput = result.successful / (result.duration / 1000);

    return result;
  }
}

/**
 * 策略工厂
 */
export class WarmupStrategyFactory {
  /**
   * 创建预热策略实例
   */
  static createStrategy(
    strategy: PrewarmStrategy,
    config: PrewarmConfig,
    strategyConfig: StrategyConfig = {}
  ): BaseWarmupStrategy {
    switch (strategy) {
      case PrewarmStrategy.IMMEDIATE:
        return new ImmediateWarmupStrategy(config, strategyConfig);
      
      case PrewarmStrategy.PRIORITY:
        return new PriorityWarmupStrategy(config, strategyConfig);
      
      case PrewarmStrategy.ADAPTIVE:
        return new AdaptiveWarmupStrategy(config, strategyConfig);
      
      default:
        throw new Error(`Unsupported warmup strategy: ${strategy}`);
    }
  }

  /**
   * 获取所有支持的策略
   */
  static getSupportedStrategies(): PrewarmStrategy[] {
    return [
      PrewarmStrategy.IMMEDIATE,
      PrewarmStrategy.PRIORITY,
      PrewarmStrategy.ADAPTIVE
    ];
  }

  /**
   * 获取策略描述
   */
  static getStrategyDescription(strategy: PrewarmStrategy): string {
    const descriptions = {
      [PrewarmStrategy.IMMEDIATE]: '立即预热所有数据，适用于小量数据快速预热',
      [PrewarmStrategy.PRIORITY]: '按优先级顺序预热，适用于有明确优先级的数据',
      [PrewarmStrategy.ADAPTIVE]: '自适应调整批次大小，适用于大量数据的高效预热',
      [PrewarmStrategy.SCHEDULED]: '定时预热，适用于定期数据更新场景',
      [PrewarmStrategy.LAZY]: '懒加载预热，适用于按需预热场景'
    };

    return descriptions[strategy] || '未知策略';
  }

  /**
   * 推荐策略
   */
  static recommendStrategy(itemCount: number, hasePriority: boolean): PrewarmStrategy {
    if (itemCount < 100) {
      return PrewarmStrategy.IMMEDIATE;
    }
    
    if (hasePriority) {
      return PrewarmStrategy.PRIORITY;
    }
    
    return PrewarmStrategy.ADAPTIVE;
  }
}