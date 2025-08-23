/**
 * Cache Invalidation Service
 * 缓存失效服务，智能管理缓存的失效和更新
 */

import { userCache, contentCache, statsCache, configCache, sessionCache, apiCache } from '../lib/cacheInstances.js';
import { CacheKeyGenerator } from '../config/cache.js';
import { EnhancedCacheService } from '../lib/enhancedCache.js';
import { cacheHealthMonitor } from '../lib/CacheHealthMonitor.js';

export interface InvalidationRule {
  pattern: string | RegExp;
  cacheType: 'user' | 'content' | 'stats' | 'config' | 'session' | 'api' | 'all';
  cascade?: boolean; // 是否级联失效相关缓存
}

export interface InvalidationResult {
  success: boolean;
  invalidatedKeys: string[];
  errors: string[];
  duration: number;
}

export class CacheInvalidationService {
  private invalidationRules: Map<string, InvalidationRule[]> = new Map();
  private isInvalidating = false;

  constructor() {
    this.setupDefaultRules();
  }

  /**
   * 设置默认失效规则
   */
  private setupDefaultRules(): void {
    // 用户相关失效规则
    this.addRule('user:update', {
      pattern: /^user:/,
      cacheType: 'user',
      cascade: true
    });

    this.addRule('user:delete', {
      pattern: /^user:/,
      cacheType: 'all',
      cascade: true
    });

    // 帖子相关失效规则
    this.addRule('post:create', {
      pattern: /^(posts:|stats:)/,
      cacheType: 'content',
      cascade: true
    });

    this.addRule('post:update', {
      pattern: /^posts:/,
      cacheType: 'content',
      cascade: false
    });

    this.addRule('post:delete', {
      pattern: /^(posts:|stats:)/,
      cacheType: 'content',
      cascade: true
    });

    // 活动相关失效规则
    this.addRule('activity:create', {
      pattern: /^(activities:|stats:)/,
      cacheType: 'content',
      cascade: true
    });

    this.addRule('activity:update', {
      pattern: /^activities:/,
      cacheType: 'content',
      cascade: false
    });

    // 统计相关失效规则
    this.addRule('stats:update', {
      pattern: /^stats:/,
      cacheType: 'stats',
      cascade: false
    });

    // 配置相关失效规则
    this.addRule('config:update', {
      pattern: /^config:/,
      cacheType: 'config',
      cascade: false
    });

    // 联系合作相关失效规则
    this.addRule('contact:create', {
      pattern: /^(contact:|admin_contact)/,
      cacheType: 'api',
      cascade: false
    });

    this.addRule('contact:update', {
      pattern: /^(contact:|admin_contact)/,
      cacheType: 'api',
      cascade: false
    });

    this.addRule('contact:delete', {
      pattern: /^(contact:|admin_contact)/,
      cacheType: 'api',
      cascade: false
    });
  }

  /**
   * 添加失效规则
   */
  addRule(event: string, rule: InvalidationRule): void {
    if (!this.invalidationRules.has(event)) {
      this.invalidationRules.set(event, []);
    }
    this.invalidationRules.get(event)!.push(rule);
  }

  /**
   * 移除失效规则
   */
  removeRule(event: string): void {
    this.invalidationRules.delete(event);
  }

  /**
   * 根据事件触发缓存失效
   */
  async invalidateByEvent(event: string, context?: Record<string, any>): Promise<InvalidationResult> {
    const startTime = Date.now();
    const invalidatedKeys: string[] = [];
    const errors: string[] = [];

    try {
      const rules = this.invalidationRules.get(event);
      if (!rules || rules.length === 0) {
        console.log(`没有找到事件 ${event} 的失效规则`);
        return {
          success: true,
          invalidatedKeys: [],
          errors: [],
          duration: Date.now() - startTime
        };
      }

      console.log(`执行事件 ${event} 的缓存失效，规则数量: ${rules.length}`);

      // 并行执行所有规则
      const rulePromises = rules.map(rule => this.executeRule(rule, context));
      const results = await Promise.allSettled(rulePromises);

      // 收集结果
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          invalidatedKeys.push(...result.value.invalidatedKeys);
          errors.push(...result.value.errors);
        } else {
          errors.push(`规则 ${index} 执行失败: ${result.reason}`);
        }
      });

      const duration = Date.now() - startTime;
      const success = errors.length === 0;

      console.log(`事件 ${event} 缓存失效完成: ${invalidatedKeys.length}个键失效, 耗时${duration}ms`);

      // 自动记录到健康监控系统
      if (invalidatedKeys.length > 0) {
        try {
          // 为每个失效的缓存键记录健康监控数据
          for (const key of invalidatedKeys) {
            const reason = this.generateInvalidationReason(event, context);
            cacheHealthMonitor.recordInvalidation(key, reason);
          }
          
          // 记录整体失效事件到健康监控
          const eventReason = `event:${event}`;
          cacheHealthMonitor.recordInvalidation(`bulk:${event}`, eventReason);
          
          console.log(`已记录 ${invalidatedKeys.length} 个缓存失效事件到健康监控系统`);
        } catch (healthError) {
          console.warn('记录健康监控数据失败:', healthError);
          // 不影响主流程，只记录警告
        }
      }

      return {
        success,
        invalidatedKeys,
        errors,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      errors.push(`缓存失效异常: ${errorMessage}`);
      
      console.error(`事件 ${event} 缓存失效失败:`, error);
      
      return {
        success: false,
        invalidatedKeys,
        errors,
        duration
      };
    }
  }

  /**
   * 执行单个失效规则
   */
  private async executeRule(rule: InvalidationRule, context?: Record<string, any>): Promise<InvalidationResult> {
    const invalidatedKeys: string[] = [];
    const errors: string[] = [];

    try {
      const caches = this.getCachesByType(rule.cacheType);
      
      for (const cache of caches) {
        const keys = cache.keys();
        const matchingKeys = keys.filter(key => this.matchesPattern(key, rule.pattern));
        
        for (const key of matchingKeys) {
          try {
            await cache.delete(key);
            invalidatedKeys.push(key);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            errors.push(`删除缓存键 ${key} 失败: ${errorMessage}`);
          }
        }
      }

      // 级联失效
      if (rule.cascade && context) {
        const cascadeResult = await this.executeCascadeInvalidation(rule, context);
        invalidatedKeys.push(...cascadeResult.invalidatedKeys);
        errors.push(...cascadeResult.errors);
      }

      // 记录规则执行结果到健康监控
      if (invalidatedKeys.length > 0) {
        try {
          for (const key of invalidatedKeys) {
            const reason = `rule_execution:${rule.cacheType}`;
            cacheHealthMonitor.recordInvalidation(key, reason);
          }
        } catch (healthError) {
          console.warn('记录规则执行健康监控数据失败:', healthError);
        }
      }

      return {
        success: errors.length === 0,
        invalidatedKeys,
        errors,
        duration: 0
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      errors.push(`规则执行失败: ${errorMessage}`);
      
      return {
        success: false,
        invalidatedKeys,
        errors,
        duration: 0
      };
    }
  }

  /**
   * 执行级联失效
   */
  private async executeCascadeInvalidation(rule: InvalidationRule, context: Record<string, any>): Promise<InvalidationResult> {
    const invalidatedKeys: string[] = [];
    const errors: string[] = [];

    try {
      // 根据上下文执行级联失效
      if (context.userId) {
        // 用户相关的级联失效
        const userRelatedKeys = [
          CacheKeyGenerator.userPosts(context.userId),
          CacheKeyGenerator.userActivities(context.userId),
          CacheKeyGenerator.userStats(context.userId)
        ];

        for (const key of userRelatedKeys) {
          await this.invalidateKey(key);
          invalidatedKeys.push(key);
        }
      }

      if (context.postId) {
        // 帖子相关的级联失效
        const postRelatedKeys = [
          CacheKeyGenerator.postsList(),
          CacheKeyGenerator.globalStats(),
          CacheKeyGenerator.stats('posts')
        ];

        for (const key of postRelatedKeys) {
          await this.invalidateKey(key);
          invalidatedKeys.push(key);
        }
      }

      if (context.activityId) {
        // 活动相关的级联失效
        const activityRelatedKeys = [
          CacheKeyGenerator.activitiesList(),
          CacheKeyGenerator.globalStats(),
          CacheKeyGenerator.stats('activities')
        ];

        for (const key of activityRelatedKeys) {
          await this.invalidateKey(key);
          invalidatedKeys.push(key);
        }
      }

      return {
        success: true,
        invalidatedKeys,
        errors,
        duration: 0
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      errors.push(`级联失效失败: ${errorMessage}`);
      
      return {
        success: false,
        invalidatedKeys,
        errors,
        duration: 0
      };
    }
  }

  /**
   * 失效单个缓存键
   */
  private async invalidateKey(key: string): Promise<void> {
    const caches = [userCache, contentCache, statsCache, configCache, sessionCache, apiCache];
    
    for (const cache of caches) {
      if (cache.has(key)) {
        await cache.delete(key);
        
        // 记录单个键失效到健康监控
        try {
          cacheHealthMonitor.recordInvalidation(key, 'direct_invalidation');
        } catch (healthError) {
          console.warn(`记录键 ${key} 失效健康监控数据失败:`, healthError);
        }
        
        break;
      }
    }
  }

  /**
   * 根据类型获取缓存实例
   */
  private getCachesByType(cacheType: string): EnhancedCacheService[] {
    switch (cacheType) {
      case 'user':
        return [userCache];
      case 'content':
        return [contentCache];
      case 'stats':
        return [statsCache];
      case 'config':
        return [configCache];
      case 'session':
        return [sessionCache];
      case 'api':
        return [apiCache];
      case 'all':
        return [userCache, contentCache, statsCache, configCache, sessionCache, apiCache];
      default:
        return [];
    }
  }

  /**
   * 检查键是否匹配模式
   */
  private matchesPattern(key: string, pattern: string | RegExp): boolean {
    if (typeof pattern === 'string') {
      return key.includes(pattern);
    }
    return pattern.test(key);
  }

  /**
   * 批量失效缓存键
   */
  async invalidateKeys(keys: string[]): Promise<InvalidationResult> {
    const startTime = Date.now();
    const invalidatedKeys: string[] = [];
    const errors: string[] = [];

    try {
      const promises = keys.map(async (key) => {
        try {
          await this.invalidateKey(key);
          invalidatedKeys.push(key);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '未知错误';
          errors.push(`删除缓存键 ${key} 失败: ${errorMessage}`);
        }
      });

      await Promise.all(promises);

      const duration = Date.now() - startTime;
      const success = errors.length === 0;

      console.log(`批量失效完成: ${invalidatedKeys.length}个键失效, 耗时${duration}ms`);

      // 记录批量失效结果到健康监控
      if (invalidatedKeys.length > 0) {
        try {
          for (const key of invalidatedKeys) {
            cacheHealthMonitor.recordInvalidation(key, 'batch_invalidation');
          }
          
          // 记录批量失效事件
          cacheHealthMonitor.recordInvalidation(`batch:${invalidatedKeys.length}`, 'batch_invalidation_event');
          
          console.log(`已记录 ${invalidatedKeys.length} 个批量失效事件到健康监控系统`);
        } catch (healthError) {
          console.warn('记录批量失效健康监控数据失败:', healthError);
        }
      }

      return {
        success,
        invalidatedKeys,
        errors,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      errors.push(`批量失效异常: ${errorMessage}`);
      
      return {
        success: false,
        invalidatedKeys,
        errors,
        duration
      };
    }
  }

  /**
   * 清空所有缓存
   */
  async clearAll(): Promise<InvalidationResult> {
    const startTime = Date.now();
    const invalidatedKeys: string[] = [];
    const errors: string[] = [];

    try {
      const caches = [userCache, contentCache, statsCache, configCache, sessionCache, apiCache];
      const cacheNames = ['用户缓存', '内容缓存', '统计缓存', '配置缓存', '会话缓存', 'API缓存'];
      
      for (let i = 0; i < caches.length; i++) {
        try {
          const keys = caches[i].keys();
          invalidatedKeys.push(...keys);
          caches[i].clear();
          console.log(`${cacheNames[i]}已清空`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '未知错误';
          errors.push(`清空${cacheNames[i]}失败: ${errorMessage}`);
        }
      }

      const duration = Date.now() - startTime;
      const success = errors.length === 0;

      console.log(`所有缓存清空完成: ${invalidatedKeys.length}个键失效, 耗时${duration}ms`);

      // 记录清空所有缓存事件到健康监控
      if (invalidatedKeys.length > 0) {
        try {
          // 记录清空事件
          cacheHealthMonitor.recordInvalidation('clear_all_cache', 'clear_all_event');
          
          // 记录清空的键数量
          cacheHealthMonitor.recordInvalidation(`clear_all_count:${invalidatedKeys.length}`, 'clear_all_count');
          
          console.log(`已记录清空所有缓存事件到健康监控系统，共 ${invalidatedKeys.length} 个键`);
        } catch (healthError) {
          console.warn('记录清空所有缓存健康监控数据失败:', healthError);
        }
      }

      return {
        success,
        invalidatedKeys,
        errors,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      errors.push(`清空所有缓存异常: ${errorMessage}`);
      
      return {
        success: false,
        invalidatedKeys,
        errors,
        duration
      };
    }
  }

  /**
   * 获取失效规则
   */
  getRules(): Map<string, InvalidationRule[]> {
    return new Map(this.invalidationRules);
  }

  /**
   * 检查是否正在执行失效操作
   */
  isInvalidatingCache(): boolean {
    return this.isInvalidating;
  }

  /**
   * 失效用户缓存
   */
  async invalidateUserCache(userId: string): Promise<InvalidationResult> {
    return this.invalidateByEvent('user:update', { userId });
  }

  /**
   * 失效帖子缓存
   */
  async invalidatePostCache(postId: string, userId?: string): Promise<InvalidationResult> {
    return this.invalidateByEvent('post:update', { postId, userId });
  }

  /**
   * 失效活动缓存
   */
  async invalidateActivityCache(activityId: string, userId?: string): Promise<InvalidationResult> {
    return this.invalidateByEvent('activity:update', { activityId, userId });
  }

  /**
   * 失效统计缓存
   */
  async invalidateStatsCache(): Promise<InvalidationResult> {
    return this.invalidateByEvent('stats:update');
  }

  /**
   * 失效配置缓存
   */
  async invalidateConfigCache(): Promise<InvalidationResult> {
    return this.invalidateByEvent('config:update');
  }

  /**
   * 失效内容缓存
   */
  async invalidateContentCache(): Promise<InvalidationResult> {
    return this.invalidateByEvent('content:update');
  }

  /**
   * 失效联系合作缓存
   */
  async invalidateContactCache(contactId?: string): Promise<InvalidationResult> {
    return this.invalidateByEvent('contact:update', { contactId });
  }

  /**
   * 生成失效原因描述
   */
  private generateInvalidationReason(event: string, context?: Record<string, any>): string {
    const baseReason = event.replace(':', '_');
    
    if (!context) {
      return baseReason;
    }

    const contextParts: string[] = [];
    
    if (context.userId) {
      contextParts.push(`user_${context.userId}`);
    }
    
    if (context.postId) {
      contextParts.push(`post_${context.postId}`);
    }
    
    if (context.activityId) {
      contextParts.push(`activity_${context.activityId}`);
    }
    
    if (context.contactId) {
      contextParts.push(`contact_${context.contactId}`);
    }
    
    if (context.reason) {
      contextParts.push(context.reason);
    }
    
    return contextParts.length > 0 
      ? `${baseReason}:${contextParts.join('_')}`
      : baseReason;
  }
}

// 创建默认实例
export const cacheInvalidationService = new CacheInvalidationService();

// 便捷方法
export const invalidateUserCache = (userId: string) => 
  cacheInvalidationService.invalidateByEvent('user:update', { userId });

export const invalidatePostCache = (postId: string, userId?: string) => 
  cacheInvalidationService.invalidateByEvent('post:update', { postId, userId });

export const invalidateActivityCache = (activityId: string, userId?: string) => 
  cacheInvalidationService.invalidateByEvent('activity:update', { activityId, userId });

export const invalidateStatsCache = () => 
  cacheInvalidationService.invalidateByEvent('stats:update');

export const invalidateConfigCache = () => 
  cacheInvalidationService.invalidateByEvent('config:update');

export const invalidateContentCache = () => 
  cacheInvalidationService.invalidateByEvent('content:update');

export const invalidateContactCache = (contactId?: string) => 
  cacheInvalidationService.invalidateByEvent('contact:update', { contactId });