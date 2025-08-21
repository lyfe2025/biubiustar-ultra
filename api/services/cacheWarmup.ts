/**
 * Cache Warmup Service
 * 缓存预热服务，在应用启动时预加载热门数据
 */

import { userCache, contentCache, statsCache, configCache } from '../lib/cacheInstances.js';
import { CacheKeyGenerator, CACHE_TTL } from '../config/cache.js';
import { supabase } from '../lib/supabase.js';

export interface WarmupConfig {
  enabled: boolean;
  timeout: number; // 预热超时时间（毫秒）
  retryAttempts: number;
  retryDelay: number;
}

export interface WarmupResult {
  success: boolean;
  duration: number;
  itemsWarmed: number;
  errors: string[];
}

export class CacheWarmupService {
  private config: WarmupConfig;
  private isWarming = false;

  constructor(config: Partial<WarmupConfig> = {}) {
    this.config = {
      enabled: process.env.CACHE_WARMUP_ENABLED !== 'false',
      timeout: 30000, // 30秒
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    };
  }

  /**
   * 执行所有缓存预热（别名方法）
   */
  async warmupAll(): Promise<WarmupResult> {
    return this.warmup();
  }

  /**
   * 执行缓存预热
   */
  async warmup(): Promise<WarmupResult> {
    if (!this.config.enabled) {
      console.log('缓存预热已禁用');
      return {
        success: true,
        duration: 0,
        itemsWarmed: 0,
        errors: []
      };
    }

    if (this.isWarming) {
      console.log('缓存预热正在进行中...');
      return {
        success: false,
        duration: 0,
        itemsWarmed: 0,
        errors: ['缓存预热正在进行中']
      };
    }

    this.isWarming = true;
    const startTime = Date.now();
    const errors: string[] = [];
    let itemsWarmed = 0;

    try {
      console.log('开始缓存预热...');

      // 并行执行预热任务
      const warmupTasks = [
        this.warmupGlobalStats(),
        this.warmupHotPosts(),
        this.warmupActiveUsers(),
        this.warmupSystemConfig(),
        this.warmupCategories()
      ];

      const results = await Promise.allSettled(warmupTasks);
      
      // 统计结果
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          itemsWarmed += result.value;
        } else {
          const taskNames = ['全局统计', '热门帖子', '活跃用户', '系统配置', '分类数据'];
          errors.push(`${taskNames[index]}预热失败: ${result.reason}`);
        }
      });

      const duration = Date.now() - startTime;
      const success = errors.length === 0;

      console.log(`缓存预热完成: ${itemsWarmed}项数据, 耗时${duration}ms, 错误${errors.length}个`);

      return {
        success,
        duration,
        itemsWarmed,
        errors
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      errors.push(`缓存预热异常: ${errorMessage}`);
      
      console.error('缓存预热失败:', error);
      
      return {
        success: false,
        duration,
        itemsWarmed,
        errors
      };
    } finally {
      this.isWarming = false;
    }
  }

  /**
   * 预热全局统计数据
   */
  private async warmupGlobalStats(): Promise<number> {
    try {
      // 获取全局统计数据
      const { data: userCount } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true });
      
      const { data: postCount } = await supabase
        .from('posts')
        .select('id', { count: 'exact', head: true });
      
      const { data: activityCount } = await supabase
        .from('activities')
        .select('id', { count: 'exact', head: true });

      const globalStats = {
        userCount: userCount?.length || 0,
        postCount: postCount?.length || 0,
        activityCount: activityCount?.length || 0,
        timestamp: new Date().toISOString()
      };

      // 缓存全局统计
      await statsCache.set(
        CacheKeyGenerator.globalStats(),
        globalStats,
        CACHE_TTL.MEDIUM
      );

      console.log('全局统计数据预热完成');
      return 1;
    } catch (error) {
      console.error('全局统计预热失败:', error);
      throw error;
    }
  }

  /**
   * 预热热门帖子
   */
  private async warmupHotPosts(): Promise<number> {
    try {
      // 获取热门帖子（按点赞数排序）
      const { data: hotPosts } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('likes_count', { ascending: false })
        .limit(20);

      if (!hotPosts) return 0;

      // 缓存热门帖子列表
      await contentCache.set(
        CacheKeyGenerator.postsList(1, 'hot'),
        hotPosts,
        CACHE_TTL.SHORT
      );

      // 缓存单个热门帖子
      const cachePromises = hotPosts.map(post => 
        contentCache.set(
          CacheKeyGenerator.post(post.id),
          post,
          CACHE_TTL.MEDIUM
        )
      );

      await Promise.all(cachePromises);

      console.log(`${hotPosts.length}个热门帖子预热完成`);
      return hotPosts.length + 1; // +1 for the list
    } catch (error) {
      console.error('热门帖子预热失败:', error);
      throw error;
    }
  }

  /**
   * 预热活跃用户
   */
  private async warmupActiveUsers(): Promise<number> {
    try {
      // 获取活跃用户（最近有活动的用户）
      const { data: activeUsers } = await supabase
        .from('users')
        .select('*')
        .order('last_active_at', { ascending: false })
        .limit(50);

      if (!activeUsers) return 0;

      // 缓存活跃用户
      const cachePromises = activeUsers.map(user => 
        userCache.set(
          CacheKeyGenerator.user(user.id),
          user,
          CACHE_TTL.LONG
        )
      );

      await Promise.all(cachePromises);

      console.log(`${activeUsers.length}个活跃用户预热完成`);
      return activeUsers.length;
    } catch (error) {
      console.error('活跃用户预热失败:', error);
      throw error;
    }
  }

  /**
   * 预热系统配置
   */
  private async warmupSystemConfig(): Promise<number> {
    try {
      // 模拟系统配置数据
      const systemConfigs = {
        siteName: 'BiuBiuStar Ultra',
        version: '1.0.0',
        features: {
          enableComments: true,
          enableLikes: true,
          enableActivities: true
        },
        limits: {
          maxPostLength: 5000,
          maxImageSize: 10 * 1024 * 1024, // 10MB
          dailyPostLimit: 10
        }
      };

      // 缓存系统配置
      await configCache.set(
        CacheKeyGenerator.config('system'),
        systemConfigs,
        CACHE_TTL.VERY_LONG
      );

      console.log('系统配置预热完成');
      return 1;
    } catch (error) {
      console.error('系统配置预热失败:', error);
      throw error;
    }
  }

  /**
   * 预热分类数据
   */
  private async warmupCategories(): Promise<number> {
    try {
      // 获取所有分类
      const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 'active')
        .order('sort_order');

      if (!categories) return 0;

      // 缓存分类列表
      await configCache.set(
        CacheKeyGenerator.config('categories'),
        categories,
        CACHE_TTL.LONG
      );

      console.log(`${categories.length}个分类预热完成`);
      return 1;
    } catch (error) {
      console.error('分类数据预热失败:', error);
      throw error;
    }
  }

  /**
   * 检查预热状态
   */
  isWarmingUp(): boolean {
    return this.isWarming;
  }

  /**
   * 获取预热配置
   */
  getConfig(): WarmupConfig {
    return { ...this.config };
  }

  /**
   * 更新预热配置
   */
  updateConfig(config: Partial<WarmupConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// 创建默认实例
export const cacheWarmupService = new CacheWarmupService();

/**
 * 启动时执行缓存预热
 */
export async function startupWarmup(): Promise<WarmupResult> {
  console.log('应用启动 - 开始缓存预热...');
  return await cacheWarmupService.warmup();
}

/**
 * 定期预热（可选）
 */
export function schedulePeriodicWarmup(intervalMs: number = 60 * 60 * 1000): NodeJS.Timeout {
  console.log(`设置定期缓存预热，间隔: ${intervalMs}ms`);
  
  return setInterval(async () => {
    try {
      console.log('执行定期缓存预热...');
      const result = await cacheWarmupService.warmup();
      
      if (result.success) {
        console.log(`定期预热成功: ${result.itemsWarmed}项数据`);
      } else {
        console.warn(`定期预热部分失败: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      console.error('定期预热异常:', error);
    }
  }, intervalMs);
}