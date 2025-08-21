/**
 * 缓存失效服务
 * 提供智能的缓存失效策略，支持模式匹配、依赖关系、批量失效等功能
 */

import { cacheInstances, CacheInstanceType } from '../lib/cacheInstances.js';
import { EnhancedCacheService } from '../lib/enhancedCache.js';

/**
 * 失效规则接口
 */
export interface InvalidationRule {
  /** 规则名称 */
  name: string;
  /** 规则描述 */
  description: string;
  /** 匹配模式 */
  pattern: string | RegExp;
  /** 目标缓存实例 */
  targetCaches: CacheInstanceType[];
  /** 是否启用 */
  enabled: boolean;
  /** 优先级 */
  priority: number;
}

/**
 * 失效策略接口
 */
export interface InvalidationStrategy {
  /** 策略名称 */
  name: string;
  /** 触发条件 */
  trigger: string;
  /** 失效规则 */
  rules: InvalidationRule[];
  /** 延迟执行时间（毫秒） */
  delay?: number;
}

/**
 * 失效结果接口
 */
export interface InvalidationResult {
  /** 规则名称 */
  ruleName: string;
  /** 缓存类型 */
  cacheType: CacheInstanceType;
  /** 失效的键数量 */
  invalidatedCount: number;
  /** 是否成功 */
  success: boolean;
  /** 错误信息 */
  error?: string;
  /** 执行时间（毫秒） */
  duration: number;
}

/**
 * 依赖关系接口
 */
export interface CacheDependency {
  /** 主键 */
  key: string;
  /** 依赖的键列表 */
  dependencies: string[];
  /** 缓存类型 */
  cacheType: CacheInstanceType;
}

/**
 * 缓存失效服务类
 */
export class CacheInvalidationService {
  private rules: Map<string, InvalidationRule> = new Map();
  private strategies: Map<string, InvalidationStrategy> = new Map();
  private dependencies: Map<string, CacheDependency> = new Map();
  private pendingInvalidations: Map<string, NodeJS.Timeout> = new Map();

  /**
   * 注册失效规则
   * @param rule 失效规则
   */
  registerRule(rule: InvalidationRule): void {
    this.rules.set(rule.name, rule);
  }

  /**
   * 批量注册失效规则
   * @param rules 失效规则数组
   */
  registerRules(rules: InvalidationRule[]): void {
    rules.forEach(rule => this.registerRule(rule));
  }

  /**
   * 注册失效策略
   * @param strategy 失效策略
   */
  registerStrategy(strategy: InvalidationStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  /**
   * 注册缓存依赖关系
   * @param dependency 依赖关系
   */
  registerDependency(dependency: CacheDependency): void {
    this.dependencies.set(dependency.key, dependency);
  }

  /**
   * 根据模式匹配键
   * @param pattern 匹配模式
   * @param cache 缓存实例
   * @returns 匹配的键列表
   */
  private matchKeys(pattern: string | RegExp, cache: EnhancedCacheService): string[] {
    const allKeys = cache.keys();
    
    if (typeof pattern === 'string') {
      // 支持通配符匹配
      if (pattern.includes('*')) {
        const regexPattern = pattern.replace(/\*/g, '.*');
        const regex = new RegExp(`^${regexPattern}$`);
        return allKeys.filter(key => regex.test(key));
      } else {
        // 精确匹配
        return allKeys.filter(key => key === pattern);
      }
    } else {
      // 正则表达式匹配
      return allKeys.filter(key => pattern.test(key));
    }
  }

  /**
   * 执行单个失效规则
   * @param rule 失效规则
   * @returns 失效结果数组
   */
  private async executeRule(rule: InvalidationRule): Promise<InvalidationResult[]> {
    const results: InvalidationResult[] = [];

    for (const cacheType of rule.targetCaches) {
      const startTime = Date.now();
      const cache = cacheInstances[cacheType];
      
      try {
        const matchedKeys = this.matchKeys(rule.pattern, cache);
        
        // 批量删除匹配的键
        if (matchedKeys.length > 0) {
          await cache.mdel(matchedKeys);
        }
        
        const duration = Date.now() - startTime;
        results.push({
          ruleName: rule.name,
          cacheType,
          invalidatedCount: matchedKeys.length,
          success: true,
          duration
        });
      } catch (error) {
        const duration = Date.now() - startTime;
        results.push({
          ruleName: rule.name,
          cacheType,
          invalidatedCount: 0,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          duration
        });
      }
    }

    return results;
  }

  /**
   * 根据键失效缓存
   * @param key 缓存键
   * @param cacheType 缓存类型，如果不指定则在所有缓存中查找
   * @returns 失效结果
   */
  async invalidateByKey(key: string, cacheType?: CacheInstanceType): Promise<InvalidationResult[]> {
    const results: InvalidationResult[] = [];
    const targetCaches = cacheType ? [cacheType] : Object.keys(cacheInstances) as CacheInstanceType[];

    for (const type of targetCaches) {
      const startTime = Date.now();
      const cache = cacheInstances[type];
      
      try {
        const existed = cache.has(key);
        if (existed) {
          cache.delete(key);
        }
        
        const duration = Date.now() - startTime;
        results.push({
          ruleName: 'direct-key-invalidation',
          cacheType: type,
          invalidatedCount: existed ? 1 : 0,
          success: true,
          duration
        });
      } catch (error) {
        const duration = Date.now() - startTime;
        results.push({
          ruleName: 'direct-key-invalidation',
          cacheType: type,
          invalidatedCount: 0,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          duration
        });
      }
    }

    // 处理依赖关系
    await this.invalidateDependencies(key);

    return results;
  }

  /**
   * 根据模式失效缓存
   * @param pattern 匹配模式
   * @param cacheTypes 目标缓存类型
   * @returns 失效结果
   */
  async invalidateByPattern(pattern: string | RegExp, cacheTypes?: CacheInstanceType[]): Promise<InvalidationResult[]> {
    const targetCaches = cacheTypes || Object.keys(cacheInstances) as CacheInstanceType[];
    const rule: InvalidationRule = {
      name: 'pattern-invalidation',
      description: 'Pattern-based invalidation',
      pattern,
      targetCaches,
      enabled: true,
      priority: 1
    };

    return await this.executeRule(rule);
  }

  /**
   * 根据策略失效缓存
   * @param strategyName 策略名称
   * @returns 失效结果
   */
  async invalidateByStrategy(strategyName: string): Promise<InvalidationResult[]> {
    const strategy = this.strategies.get(strategyName);
    if (!strategy) {
      throw new Error(`Strategy not found: ${strategyName}`);
    }

    const allResults: InvalidationResult[] = [];
    
    // 按优先级排序规则
    const sortedRules = strategy.rules
      .filter(rule => rule.enabled)
      .sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
      const results = await this.executeRule(rule);
      allResults.push(...results);
    }

    return allResults;
  }

  /**
   * 延迟失效
   * @param key 缓存键
   * @param delay 延迟时间（毫秒）
   * @param cacheType 缓存类型
   */
  async invalidateWithDelay(key: string, delay: number, cacheType?: CacheInstanceType): Promise<void> {
    // 取消之前的延迟失效
    const existingTimeout = this.pendingInvalidations.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // 设置新的延迟失效
    const timeout = setTimeout(async () => {
      await this.invalidateByKey(key, cacheType);
      this.pendingInvalidations.delete(key);
    }, delay);

    this.pendingInvalidations.set(key, timeout);
  }

  /**
   * 失效依赖的缓存
   * @param key 主键
   */
  private async invalidateDependencies(key: string): Promise<void> {
    const dependency = this.dependencies.get(key);
    if (!dependency) {
      return;
    }

    const cache = cacheInstances[dependency.cacheType];
    for (const depKey of dependency.dependencies) {
      if (cache.has(depKey)) {
        cache.delete(depKey);
      }
      
      // 递归处理依赖的依赖
      await this.invalidateDependencies(depKey);
    }
  }

  /**
   * 批量失效
   * @param keys 键列表
   * @param cacheType 缓存类型
   * @returns 失效结果
   */
  async batchInvalidate(keys: string[], cacheType?: CacheInstanceType): Promise<InvalidationResult[]> {
    const results: InvalidationResult[] = [];
    
    for (const key of keys) {
      const keyResults = await this.invalidateByKey(key, cacheType);
      results.push(...keyResults);
    }
    
    return results;
  }

  /**
   * 清空指定缓存
   * @param cacheTypes 缓存类型列表
   * @returns 失效结果
   */
  async clearCaches(cacheTypes: CacheInstanceType[]): Promise<InvalidationResult[]> {
    const results: InvalidationResult[] = [];
    
    for (const cacheType of cacheTypes) {
      const startTime = Date.now();
      const cache = cacheInstances[cacheType];
      
      try {
        const stats = cache.getStats();
        const itemCount = stats.size;
        
        cache.clear();
        
        const duration = Date.now() - startTime;
        results.push({
          ruleName: 'clear-cache',
          cacheType,
          invalidatedCount: itemCount,
          success: true,
          duration
        });
      } catch (error) {
        const duration = Date.now() - startTime;
        results.push({
          ruleName: 'clear-cache',
          cacheType,
          invalidatedCount: 0,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          duration
        });
      }
    }
    
    return results;
  }

  /**
   * 获取所有规则
   */
  getRules(): InvalidationRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * 获取所有策略
   */
  getStrategies(): InvalidationStrategy[] {
    return Array.from(this.strategies.values());
  }

  /**
   * 获取所有依赖关系
   */
  getDependencies(): CacheDependency[] {
    return Array.from(this.dependencies.values());
  }

  /**
   * 取消所有待执行的延迟失效
   */
  cancelPendingInvalidations(): void {
    for (const timeout of this.pendingInvalidations.values()) {
      clearTimeout(timeout);
    }
    this.pendingInvalidations.clear();
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.cancelPendingInvalidations();
    this.rules.clear();
    this.strategies.clear();
    this.dependencies.clear();
  }
}

/**
 * 预定义的失效规则
 */

/**
 * 用户相关数据失效规则
 */
export const userInvalidationRules: InvalidationRule[] = [
  {
    name: 'user-profile-update',
    description: '用户资料更新时失效相关缓存',
    pattern: /^user:(\d+):.*/,
    targetCaches: [CacheInstanceType.USER, CacheInstanceType.API],
    enabled: true,
    priority: 10
  },
  {
    name: 'user-permission-change',
    description: '用户权限变更时失效权限缓存',
    pattern: /^(user|permission):(\d+):.*/,
    targetCaches: [CacheInstanceType.USER, CacheInstanceType.SESSION],
    enabled: true,
    priority: 9
  }
];

/**
 * 内容相关数据失效规则
 */
export const contentInvalidationRules: InvalidationRule[] = [
  {
    name: 'content-update',
    description: '内容更新时失效相关缓存',
    pattern: /^content:(\d+):.*/,
    targetCaches: [CacheInstanceType.CONTENT, CacheInstanceType.API, CacheInstanceType.STATS],
    enabled: true,
    priority: 8
  },
  {
    name: 'content-list-update',
    description: '内容列表更新时失效列表缓存',
    pattern: 'content:list:*',
    targetCaches: [CacheInstanceType.CONTENT, CacheInstanceType.API],
    enabled: true,
    priority: 7
  }
];

/**
 * 统计数据失效规则
 */
export const statsInvalidationRules: InvalidationRule[] = [
  {
    name: 'stats-update',
    description: '统计数据更新',
    pattern: 'stats:*',
    targetCaches: [CacheInstanceType.STATS],
    enabled: true,
    priority: 5
  }
];

/**
 * 预定义的失效策略
 */

/**
 * 用户操作失效策略
 */
export const userActionStrategy: InvalidationStrategy = {
  name: 'user-action',
  trigger: 'user-related-action',
  rules: userInvalidationRules
};

/**
 * 内容操作失效策略
 */
export const contentActionStrategy: InvalidationStrategy = {
  name: 'content-action',
  trigger: 'content-related-action',
  rules: contentInvalidationRules
};

/**
 * 系统维护失效策略
 */
export const systemMaintenanceStrategy: InvalidationStrategy = {
  name: 'system-maintenance',
  trigger: 'system-maintenance',
  rules: [...userInvalidationRules, ...contentInvalidationRules, ...statsInvalidationRules],
  delay: 1000 // 延迟1秒执行
};

/**
 * 创建默认的缓存失效服务
 */
export function createDefaultInvalidationService(): CacheInvalidationService {
  const service = new CacheInvalidationService();
  
  // 注册默认规则
  service.registerRules([
    ...userInvalidationRules,
    ...contentInvalidationRules,
    ...statsInvalidationRules
  ]);
  
  // 注册默认策略
  service.registerStrategy(userActionStrategy);
  service.registerStrategy(contentActionStrategy);
  service.registerStrategy(systemMaintenanceStrategy);
  
  return service;
}

/**
 * 默认失效服务实例
 */
export const defaultInvalidationService = createDefaultInvalidationService();

/**
 * 便捷的失效函数
 */

/**
 * 失效用户相关缓存
 * @param userId 用户ID
 */
export async function invalidateUserCache(userId: string | number): Promise<InvalidationResult[]> {
  const pattern = `user:${userId}:*`;
  return await defaultInvalidationService.invalidateByPattern(pattern, [CacheInstanceType.USER, CacheInstanceType.SESSION, CacheInstanceType.API]);
}

/**
 * 失效内容相关缓存
 * @param contentId 内容ID
 */
export async function invalidateContentCache(contentId: string | number): Promise<InvalidationResult[]> {
  const pattern = `content:${contentId}:*`;
  return await defaultInvalidationService.invalidateByPattern(pattern, [CacheInstanceType.CONTENT, CacheInstanceType.API, CacheInstanceType.STATS]);
}

/**
 * 失效统计缓存
 */
export async function invalidateStatsCache(): Promise<InvalidationResult[]> {
  return await defaultInvalidationService.invalidateByPattern('stats:*', [CacheInstanceType.STATS]);
}

/**
 * 失效API缓存
 * @param apiPath API路径模式
 */
export async function invalidateApiCache(apiPath: string): Promise<InvalidationResult[]> {
  const pattern = `api:${apiPath}*`;
  return await defaultInvalidationService.invalidateByPattern(pattern, [CacheInstanceType.API]);
}

/**
 * 紧急清空所有缓存
 */
export async function emergencyClearAll(): Promise<InvalidationResult[]> {
  const allCacheTypes = Object.keys(cacheInstances) as CacheInstanceType[];
  return await defaultInvalidationService.clearCaches(allCacheTypes);
}