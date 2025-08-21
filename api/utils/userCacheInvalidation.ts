/**
 * 用户缓存失效工具
 * 统一管理用户相关的缓存失效操作
 */

import { userCache, statsCache, apiCache, sessionCache, CacheInstanceType } from '../lib/cacheInstances.js';
import { CacheKeyGenerator } from '../config/cache.js';
import { defaultInvalidationService, InvalidationResult } from './cacheInvalidation.js';
import { clearAuthUsersCache } from '../routes/admin/users/cache.js';

/**
 * 用户缓存失效类型
 */
export enum UserCacheInvalidationType {
  CREATE = 'create',
  UPDATE = 'update', 
  DELETE = 'delete',
  STATUS_CHANGE = 'status_change',
  ROLE_CHANGE = 'role_change',
  BATCH_DELETE = 'batch_delete',
  PROFILE_UPDATE = 'profile_update'
}

/**
 * 用户缓存失效选项
 */
export interface UserCacheInvalidationOptions {
  /** 用户ID（单个用户操作） */
  userId?: string;
  /** 用户ID列表（批量操作） */
  userIds?: string[];
  /** 失效类型 */
  type: UserCacheInvalidationType;
  /** 是否失效统计数据 */
  invalidateStats?: boolean;
  /** 是否失效列表数据 */
  invalidateList?: boolean;
  /** 额外的缓存键模式 */
  additionalPatterns?: string[];
  /** 是否延迟失效（毫秒） */
  delay?: number;
}

/**
 * 用户缓存失效服务
 */
export class UserCacheInvalidationService {
  
  /**
   * 智能用户缓存失效
   * @param options 失效选项
   * @returns 失效结果
   */
  async invalidate(options: UserCacheInvalidationOptions): Promise<InvalidationResult[]> {
    const results: InvalidationResult[] = [];
    const { type, userId, userIds, invalidateStats = true, invalidateList = true } = options;

    try {
      // 1. 清除认证用户缓存（旧缓存机制）
      clearAuthUsersCache();

      // 2. 根据失效类型执行不同策略
      switch (type) {
        case UserCacheInvalidationType.CREATE:
          results.push(...await this.handleUserCreate());
          break;

        case UserCacheInvalidationType.UPDATE:
        case UserCacheInvalidationType.PROFILE_UPDATE:
          if (userId) {
            results.push(...await this.handleUserUpdate(userId));
          }
          break;

        case UserCacheInvalidationType.DELETE:
          if (userId) {
            results.push(...await this.handleUserDelete(userId));
          }
          break;

        case UserCacheInvalidationType.BATCH_DELETE:
          if (userIds && userIds.length > 0) {
            results.push(...await this.handleBatchUserDelete(userIds));
          }
          break;

        case UserCacheInvalidationType.STATUS_CHANGE:
        case UserCacheInvalidationType.ROLE_CHANGE:
          if (userId) {
            results.push(...await this.handleUserStatusOrRoleChange(userId));
          }
          break;
      }

      // 3. 失效统计数据
      if (invalidateStats) {
        results.push(...await this.invalidateUserStats());
      }

      // 4. 失效列表缓存
      if (invalidateList) {
        results.push(...await this.invalidateUserLists());
      }

      // 5. 处理额外的失效模式
      if (options.additionalPatterns && options.additionalPatterns.length > 0) {
        for (const pattern of options.additionalPatterns) {
          results.push(...await defaultInvalidationService.invalidateByPattern(pattern));
        }
      }

      // 6. 延迟失效
      if (options.delay && options.delay > 0) {
        setTimeout(() => {
          this.invalidateDelayedCaches(options);
        }, options.delay);
      }

      console.log(`用户缓存失效完成: ${type}`, {
        totalOperations: results.length,
        successCount: results.filter(r => r.success).length,
        failedCount: results.filter(r => !r.success).length
      });

    } catch (error) {
      console.error('用户缓存失效失败:', error);
      throw error;
    }

    return results;
  }

  /**
   * 处理用户创建的缓存失效
   */
  private async handleUserCreate(): Promise<InvalidationResult[]> {
    const results: InvalidationResult[] = [];
    
    // 新用户创建影响的缓存：用户列表、统计数据
    console.log('处理用户创建缓存失效');
    
    return results;
  }

  /**
   * 处理用户更新的缓存失效
   */
  private async handleUserUpdate(userId: string): Promise<InvalidationResult[]> {
    const results: InvalidationResult[] = [];

    // 失效用户详情缓存
    const userDetailKey = CacheKeyGenerator.adminUserDetail(userId);
    results.push(...await defaultInvalidationService.invalidateByKey(userDetailKey, CacheInstanceType.USER));

    // 失效用户相关的API缓存
    const userApiPattern = `api:*${userId}*`;
    results.push(...await defaultInvalidationService.invalidateByPattern(userApiPattern, [CacheInstanceType.API]));

    console.log(`处理用户更新缓存失效: ${userId}`);
    
    return results;
  }

  /**
   * 处理用户删除的缓存失效
   */
  private async handleUserDelete(userId: string): Promise<InvalidationResult[]> {
    const results: InvalidationResult[] = [];

    // 失效该用户的所有缓存
    const userPatterns = [
      `user:${userId}:*`,
      `api:*${userId}*`,
      `session:*${userId}*`
    ];

    for (const pattern of userPatterns) {
      results.push(...await defaultInvalidationService.invalidateByPattern(pattern));
    }

    console.log(`处理用户删除缓存失效: ${userId}`);
    
    return results;
  }

  /**
   * 处理批量用户删除的缓存失效
   */
  private async handleBatchUserDelete(userIds: string[]): Promise<InvalidationResult[]> {
    const results: InvalidationResult[] = [];

    // 并行处理所有用户的缓存失效
    const deletePromises = userIds.map(userId => this.handleUserDelete(userId));
    const deleteResults = await Promise.all(deletePromises);
    
    deleteResults.forEach(userResults => {
      results.push(...userResults);
    });

    console.log(`处理批量用户删除缓存失效: ${userIds.length} 个用户`);
    
    return results;
  }

  /**
   * 处理用户状态或角色变更的缓存失效
   */
  private async handleUserStatusOrRoleChange(userId: string): Promise<InvalidationResult[]> {
    const results: InvalidationResult[] = [];

    // 状态或角色变更会影响权限，需要失效会话缓存
    const sessionPattern = `session:*${userId}*`;
    results.push(...await defaultInvalidationService.invalidateByPattern(sessionPattern, [CacheInstanceType.SESSION]));

    // 同时失效用户详情和API缓存
    results.push(...await this.handleUserUpdate(userId));

    console.log(`处理用户状态/角色变更缓存失效: ${userId}`);
    
    return results;
  }

  /**
   * 失效用户统计缓存
   */
  private async invalidateUserStats(): Promise<InvalidationResult[]> {
    const results: InvalidationResult[] = [];
    
    // 失效用户统计数据
    const statsKey = CacheKeyGenerator.adminUserStats();
    results.push(...await defaultInvalidationService.invalidateByKey(statsKey, CacheInstanceType.STATS));

    // 失效系统统计数据（因为用户数变化会影响系统统计）
    const systemStatsPattern = 'stats:*';
    results.push(...await defaultInvalidationService.invalidateByPattern(systemStatsPattern, [CacheInstanceType.STATS]));

    console.log('失效用户统计缓存');
    
    return results;
  }

  /**
   * 失效用户列表缓存
   */
  private async invalidateUserLists(): Promise<InvalidationResult[]> {
    const results: InvalidationResult[] = [];

    // 失效所有用户列表查询缓存（不同的分页、搜索、筛选组合）
    const userListPattern = 'user:admin:list:*';
    results.push(...await defaultInvalidationService.invalidateByPattern(userListPattern, [CacheInstanceType.USER]));

    console.log('失效用户列表缓存');
    
    return results;
  }

  /**
   * 延迟失效相关缓存
   */
  private async invalidateDelayedCaches(options: UserCacheInvalidationOptions): Promise<void> {
    // 延迟失效一些不太重要的缓存，避免影响用户体验
    try {
      console.log('执行延迟缓存失效');
      
      // 延迟失效API缓存中的聚合数据
      await defaultInvalidationService.invalidateByPattern('api:aggregate:*', [CacheInstanceType.API]);
      
    } catch (error) {
      console.error('延迟缓存失效失败:', error);
    }
  }

  /**
   * 预热相关缓存
   */
  async warmupCaches(options?: { userId?: string }): Promise<void> {
    try {
      console.log('开始预热用户相关缓存');
      
      // 可以在这里实现缓存预热逻辑
      // 比如预加载常用的用户列表、统计数据等
      
    } catch (error) {
      console.error('缓存预热失败:', error);
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
      pendingInvalidations: 0 // 这里可以从 defaultInvalidationService 获取待处理数量
    };
  }
}

/**
 * 默认用户缓存失效服务实例
 */
export const userCacheInvalidationService = new UserCacheInvalidationService();

/**
 * 便捷函数：用户创建时的缓存失效
 */
export async function invalidateOnUserCreate(): Promise<InvalidationResult[]> {
  return await userCacheInvalidationService.invalidate({
    type: UserCacheInvalidationType.CREATE,
    invalidateStats: true,
    invalidateList: true
  });
}

/**
 * 便捷函数：用户更新时的缓存失效
 */
export async function invalidateOnUserUpdate(userId: string): Promise<InvalidationResult[]> {
  return await userCacheInvalidationService.invalidate({
    type: UserCacheInvalidationType.UPDATE,
    userId,
    invalidateStats: true,
    invalidateList: true
  });
}

/**
 * 便捷函数：用户删除时的缓存失效
 */
export async function invalidateOnUserDelete(userId: string): Promise<InvalidationResult[]> {
  return await userCacheInvalidationService.invalidate({
    type: UserCacheInvalidationType.DELETE,
    userId,
    invalidateStats: true,
    invalidateList: true
  });
}

/**
 * 便捷函数：批量用户删除时的缓存失效
 */
export async function invalidateOnBatchUserDelete(userIds: string[]): Promise<InvalidationResult[]> {
  return await userCacheInvalidationService.invalidate({
    type: UserCacheInvalidationType.BATCH_DELETE,
    userIds,
    invalidateStats: true,
    invalidateList: true
  });
}

/**
 * 便捷函数：用户状态变更时的缓存失效
 */
export async function invalidateOnUserStatusChange(userId: string): Promise<InvalidationResult[]> {
  return await userCacheInvalidationService.invalidate({
    type: UserCacheInvalidationType.STATUS_CHANGE,
    userId,
    invalidateStats: true,
    invalidateList: true
  });
}

/**
 * 便捷函数：用户角色变更时的缓存失效
 */
export async function invalidateOnUserRoleChange(userId: string): Promise<InvalidationResult[]> {
  return await userCacheInvalidationService.invalidate({
    type: UserCacheInvalidationType.ROLE_CHANGE,
    userId,
    invalidateStats: true,
    invalidateList: true
  });
}
