/**
 * 活动缓存失效工具
 * 统一管理活动相关的缓存失效操作
 */

import { contentCache, statsCache, apiCache } from '../lib/cacheInstances.js';
import { CacheKeyGenerator } from '../config/cache.js';
import { defaultInvalidationService, InvalidationResult } from './cacheInvalidation.js';
import { CacheInstanceType } from '../lib/cacheInstances.js';

/**
 * 活动缓存失效类型
 */
export enum ActivityCacheInvalidationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  STATUS_CHANGE = 'status_change',
  BATCH_DELETE = 'batch_delete',
  CATEGORY_CHANGE = 'category_change',
  PARTICIPANT_CHANGE = 'participant_change'
}

/**
 * 活动缓存失效选项
 */
export interface ActivityCacheInvalidationOptions {
  /** 活动ID（单个活动操作） */
  activityId?: string;
  /** 活动ID列表（批量操作） */
  activityIds?: string[];
  /** 失效类型 */
  type: ActivityCacheInvalidationType;
  /** 是否失效统计数据 */
  invalidateStats?: boolean;
  /** 是否失效列表数据 */
  invalidateList?: boolean;
  /** 是否失效分类缓存 */
  invalidateCategories?: boolean;
  /** 额外的缓存键模式 */
  additionalPatterns?: string[];
  /** 是否延迟失效（毫秒） */
  delay?: number;
}

/**
 * 活动缓存失效服务
 */
export class ActivityCacheInvalidationService {
  
  /**
   * 智能活动缓存失效
   * @param options 失效选项
   * @returns 失效结果
   */
  async invalidate(options: ActivityCacheInvalidationOptions): Promise<InvalidationResult[]> {
    const results: InvalidationResult[] = [];
    const { 
      type, 
      activityId, 
      activityIds, 
      invalidateStats = true, 
      invalidateList = true,
      invalidateCategories = false 
    } = options;

    try {
      // 根据失效类型执行不同策略
      switch (type) {
        case ActivityCacheInvalidationType.CREATE:
          results.push(...await this.handleActivityCreate());
          break;

        case ActivityCacheInvalidationType.UPDATE:
          if (activityId) {
            results.push(...await this.handleActivityUpdate(activityId));
          }
          break;

        case ActivityCacheInvalidationType.DELETE:
          if (activityId) {
            results.push(...await this.handleActivityDelete(activityId));
          }
          break;

        case ActivityCacheInvalidationType.BATCH_DELETE:
          if (activityIds && activityIds.length > 0) {
            results.push(...await this.handleBatchActivityDelete(activityIds));
          }
          break;

        case ActivityCacheInvalidationType.STATUS_CHANGE:
          if (activityId) {
            results.push(...await this.handleActivityStatusChange(activityId));
          }
          break;

        case ActivityCacheInvalidationType.CATEGORY_CHANGE:
          if (activityId) {
            results.push(...await this.handleActivityCategoryChange(activityId));
          }
          break;

        case ActivityCacheInvalidationType.PARTICIPANT_CHANGE:
          if (activityId) {
            results.push(...await this.handleActivityParticipantChange(activityId));
          }
          break;
      }

      // 失效统计数据
      if (invalidateStats) {
        results.push(...await this.invalidateActivityStats());
      }

      // 失效列表缓存
      if (invalidateList) {
        results.push(...await this.invalidateActivityLists());
      }

      // 失效分类缓存
      if (invalidateCategories) {
        results.push(...await this.invalidateActivityCategories());
      }

      // 处理额外的失效模式
      if (options.additionalPatterns && options.additionalPatterns.length > 0) {
        for (const pattern of options.additionalPatterns) {
          results.push(...await defaultInvalidationService.invalidateByPattern(pattern));
        }
      }

      // 延迟失效
      if (options.delay && options.delay > 0) {
        setTimeout(() => {
          this.invalidateDelayedCaches(options);
        }, options.delay);
      }

      console.log(`活动缓存失效完成: ${type}`, {
        totalOperations: results.length,
        successCount: results.filter(r => r.success).length,
        failedCount: results.filter(r => !r.success).length
      });

    } catch (error) {
      console.error('活动缓存失效失败:', error);
      throw error;
    }

    return results;
  }

  /**
   * 处理活动创建的缓存失效
   */
  private async handleActivityCreate(): Promise<InvalidationResult[]> {
    const results: InvalidationResult[] = [];
    
    // 新活动创建影响的缓存：活动列表、统计数据
    console.log('处理活动创建缓存失效');
    
    return results;
  }

  /**
   * 处理活动更新的缓存失效
   */
  private async handleActivityUpdate(activityId: string): Promise<InvalidationResult[]> {
    const results: InvalidationResult[] = [];

    // 失效活动详情缓存
    const activityDetailKey = CacheKeyGenerator.adminActivityDetail(activityId);
    results.push(...await defaultInvalidationService.invalidateByKey(activityDetailKey, CacheInstanceType.CONTENT));

    // 失效活动相关的API缓存
    const activityApiPattern = `api:*${activityId}*`;
    results.push(...await defaultInvalidationService.invalidateByPattern(activityApiPattern, [CacheInstanceType.API]));

    console.log(`处理活动更新缓存失效: ${activityId}`);
    
    return results;
  }

  /**
   * 处理活动删除的缓存失效
   */
  private async handleActivityDelete(activityId: string): Promise<InvalidationResult[]> {
    const results: InvalidationResult[] = [];

    // 失效该活动的所有缓存
    const activityPatterns = [
      `content:*${activityId}*`,
      `api:*${activityId}*`
    ];

    for (const pattern of activityPatterns) {
      results.push(...await defaultInvalidationService.invalidateByPattern(pattern));
    }

    console.log(`处理活动删除缓存失效: ${activityId}`);
    
    return results;
  }

  /**
   * 处理批量活动删除的缓存失效
   */
  private async handleBatchActivityDelete(activityIds: string[]): Promise<InvalidationResult[]> {
    const results: InvalidationResult[] = [];

    // 并行处理所有活动的缓存失效
    const deletePromises = activityIds.map(activityId => this.handleActivityDelete(activityId));
    const deleteResults = await Promise.all(deletePromises);
    
    deleteResults.forEach(activityResults => {
      results.push(...activityResults);
    });

    console.log(`处理批量活动删除缓存失效: ${activityIds.length} 个活动`);
    
    return results;
  }

  /**
   * 处理活动状态变更的缓存失效
   */
  private async handleActivityStatusChange(activityId: string): Promise<InvalidationResult[]> {
    const results: InvalidationResult[] = [];

    // 状态变更会影响活动显示，需要失效相关缓存
    results.push(...await this.handleActivityUpdate(activityId));

    console.log(`处理活动状态变更缓存失效: ${activityId}`);
    
    return results;
  }

  /**
   * 处理活动分类变更的缓存失效
   */
  private async handleActivityCategoryChange(activityId: string): Promise<InvalidationResult[]> {
    const results: InvalidationResult[] = [];

    // 分类变更会影响活动分类统计
    results.push(...await this.handleActivityUpdate(activityId));
    results.push(...await this.invalidateActivityCategories());

    console.log(`处理活动分类变更缓存失效: ${activityId}`);
    
    return results;
  }

  /**
   * 处理活动参与者变更的缓存失效
   */
  private async handleActivityParticipantChange(activityId: string): Promise<InvalidationResult[]> {
    const results: InvalidationResult[] = [];

    // 参与者变更会影响参与人数统计
    results.push(...await this.handleActivityUpdate(activityId));

    console.log(`处理活动参与者变更缓存失效: ${activityId}`);
    
    return results;
  }

  /**
   * 失效活动统计缓存
   */
  private async invalidateActivityStats(): Promise<InvalidationResult[]> {
    const results: InvalidationResult[] = [];
    
    // 失效活动统计数据
    const statsKey = CacheKeyGenerator.adminActivityStats();
    results.push(...await defaultInvalidationService.invalidateByKey(statsKey, CacheInstanceType.STATS));

    // 失效系统统计数据（因为活动数变化会影响系统统计）
    const systemStatsPattern = 'stats:*';
    results.push(...await defaultInvalidationService.invalidateByPattern(systemStatsPattern, [CacheInstanceType.STATS]));

    console.log('失效活动统计缓存');
    
    return results;
  }

  /**
   * 失效活动列表缓存
   */
  private async invalidateActivityLists(): Promise<InvalidationResult[]> {
    const results: InvalidationResult[] = [];

    // 失效所有活动列表查询缓存（不同的分页组合）
    const activityListPattern = 'content:admin:activities:list:*';
    results.push(...await defaultInvalidationService.invalidateByPattern(activityListPattern, [CacheInstanceType.CONTENT]));

    console.log('失效活动列表缓存');
    
    return results;
  }

  /**
   * 失效活动分类缓存
   */
  private async invalidateActivityCategories(): Promise<InvalidationResult[]> {
    const results: InvalidationResult[] = [];

    // 失效活动分类缓存
    const categoriesKey = CacheKeyGenerator.adminActivityCategories();
    results.push(...await defaultInvalidationService.invalidateByKey(categoriesKey, CacheInstanceType.CONTENT));

    console.log('失效活动分类缓存');
    
    return results;
  }

  /**
   * 延迟失效相关缓存
   */
  private async invalidateDelayedCaches(options: ActivityCacheInvalidationOptions): Promise<void> {
    // 延迟失效一些不太重要的缓存，避免影响用户体验
    try {
      console.log('执行延迟活动缓存失效');
      
      // 延迟失效API缓存中的聚合数据
      await defaultInvalidationService.invalidateByPattern('api:aggregate:activities:*', [CacheInstanceType.API]);
      
    } catch (error) {
      console.error('延迟活动缓存失效失败:', error);
    }
  }

  /**
   * 预热相关缓存
   */
  async warmupCaches(options?: { activityId?: string }): Promise<void> {
    try {
      console.log('开始预热活动相关缓存');
      
      // 可以在这里实现缓存预热逻辑
      // 比如预加载常用的活动列表、分类数据等
      
    } catch (error) {
      console.error('活动缓存预热失败:', error);
    }
  }

  /**
   * 获取缓存失效统计
   */
  getInvalidationStats(): {
    totalRules: number;
    enabledRules: number;
    pendingInvalidations: number;
  } {
    const rules = defaultInvalidationService.getRules();
    return {
      totalRules: rules.length,
      enabledRules: rules.filter(rule => rule.enabled).length,
      pendingInvalidations: 0
    };
  }
}

/**
 * 默认活动缓存失效服务实例
 */
export const activityCacheInvalidationService = new ActivityCacheInvalidationService();

/**
 * 便捷函数：活动创建时的缓存失效
 */
export async function invalidateOnActivityCreate(): Promise<InvalidationResult[]> {
  return await activityCacheInvalidationService.invalidate({
    type: ActivityCacheInvalidationType.CREATE,
    invalidateStats: true,
    invalidateList: true
  });
}

/**
 * 便捷函数：活动更新时的缓存失效
 */
export async function invalidateOnActivityUpdate(activityId: string): Promise<InvalidationResult[]> {
  return await activityCacheInvalidationService.invalidate({
    type: ActivityCacheInvalidationType.UPDATE,
    activityId,
    invalidateStats: true,
    invalidateList: true
  });
}

/**
 * 便捷函数：活动删除时的缓存失效
 */
export async function invalidateOnActivityDelete(activityId: string): Promise<InvalidationResult[]> {
  return await activityCacheInvalidationService.invalidate({
    type: ActivityCacheInvalidationType.DELETE,
    activityId,
    invalidateStats: true,
    invalidateList: true
  });
}

/**
 * 便捷函数：活动状态变更时的缓存失效
 */
export async function invalidateOnActivityStatusChange(activityId: string): Promise<InvalidationResult[]> {
  return await activityCacheInvalidationService.invalidate({
    type: ActivityCacheInvalidationType.STATUS_CHANGE,
    activityId,
    invalidateStats: true,
    invalidateList: true
  });
}

/**
 * 便捷函数：活动分类变更时的缓存失效
 */
export async function invalidateOnActivityCategoryChange(activityId: string): Promise<InvalidationResult[]> {
  return await activityCacheInvalidationService.invalidate({
    type: ActivityCacheInvalidationType.CATEGORY_CHANGE,
    activityId,
    invalidateStats: true,
    invalidateList: true,
    invalidateCategories: true
  });
}

/**
 * 便捷函数：分类数据变更时的缓存失效（用于分类CRUD操作）
 */
export async function invalidateOnCategoryDataChange(): Promise<InvalidationResult[]> {
  return await activityCacheInvalidationService.invalidate({
    type: ActivityCacheInvalidationType.CATEGORY_CHANGE,
    invalidateStats: false, // 分类CRUD不影响活动统计
    invalidateList: false,  // 分类CRUD不影响活动列表
    invalidateCategories: true // 只失效分类缓存
  });
}
