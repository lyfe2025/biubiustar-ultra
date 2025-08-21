/**
 * 缓存预热服务
 * 在应用启动时预热关键数据，提升用户体验
 */

import { supabase } from '../lib/supabase';

interface CacheItem {
  key: string;
  data: any;
  timestamp: number;
  ttl: number; // 生存时间（毫秒）
}

class CacheWarmupService {
  private cache = new Map<string, CacheItem>();
  private readonly CACHE_PREFIX = 'biubiustar_cache_';
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5分钟
  private isWarmedUp = false;

  /**
   * 初始化缓存预热
   */
  async initialize(): Promise<void> {
    if (this.isWarmedUp) return;

    console.log('🔥 开始缓存预热...');
    const startTime = performance.now();

    try {
      // 设置超时控制，避免长时间阻塞
      const warmupPromise = Promise.allSettled([
        this.warmupCategories(),
        this.warmupRecentPosts(),
        this.warmupRecentActivities(),
        this.warmupSystemSettings(),
        this.warmupUserStats()
      ]);

      // 10秒超时
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('缓存预热超时')), 10000);
      });

      await Promise.race([warmupPromise, timeoutPromise]);

      this.isWarmedUp = true;
      const endTime = performance.now();
      console.log(`✅ 缓存预热完成，耗时: ${(endTime - startTime).toFixed(2)}ms`);
    } catch (error) {
      console.error('❌ 缓存预热失败:', error);
      // 即使预热失败，也标记为已预热，避免重复尝试
      this.isWarmedUp = true;
    }
  }

  /**
   * 预热分类数据
   */
  private async warmupCategories(): Promise<void> {
    try {
      const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (categories) {
        this.setCache('categories', categories);
        console.log('📂 分类数据预热完成');
      }
    } catch (error) {
      console.error('分类数据预热失败:', error);
    }
  }

  /**
   * 预热最新帖子
   */
  private async warmupRecentPosts(): Promise<void> {
    try {
      const { data: posts } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          content,
          created_at,
          status,
          categories(name, color),
          profiles(username, avatar_url)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(5);

      if (posts) {
        this.setCache('recent_posts', posts);
        console.log('📝 最新帖子预热完成');
      }
    } catch (error) {
      console.error('最新帖子预热失败:', error);
    }
  }

  /**
   * 预热最新活动
   */
  private async warmupRecentActivities(): Promise<void> {
    try {
      const { data: activities } = await supabase
        .from('activities')
        .select(`
          id,
          title,
          description,
          event_date,
          status,
          categories(name, color),
          profiles(username, avatar_url)
        `)
        .eq('status', 'published')
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(3);

      if (activities) {
        this.setCache('recent_activities', activities);
        console.log('🎯 最新活动预热完成');
      }
    } catch (error) {
      console.error('最新活动预热失败:', error);
    }
  }

  /**
   * 预热系统设置
   */
  private async warmupSystemSettings(): Promise<void> {
    try {
      const { data: settings } = await supabase
        .from('system_settings')
        .select('*');

      if (settings) {
        const settingsMap = settings.reduce((acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {} as Record<string, any>);
        
        this.setCache('system_settings', settingsMap);
        console.log('⚙️ 系统设置预热完成');
      }
    } catch (error) {
      console.error('系统设置预热失败:', error);
    }
  }

  /**
   * 预热用户统计数据
   * 使用轻量级查询避免网络请求被中止
   */
  private async warmupUserStats(): Promise<void> {
    try {
      // 使用轻量级查询检查表是否有数据，而不是获取精确计数
      const [postsCheck, activitiesCheck, usersCheck] = await Promise.allSettled([
        supabase.from('posts').select('id').limit(1).single(),
        supabase.from('activities').select('id').limit(1).single(),
        supabase.from('profiles').select('id').limit(1).single()
      ]);

      const stats = {
        posts_count: postsCheck.status === 'fulfilled' && postsCheck.value.data ? '有数据' : '暂无数据',
        activities_count: activitiesCheck.status === 'fulfilled' && activitiesCheck.value.data ? '有数据' : '暂无数据',
        users_count: usersCheck.status === 'fulfilled' && usersCheck.value.data ? '有数据' : '暂无数据',
        last_updated: new Date().toISOString()
      };

      this.setCache('user_stats', stats);
      console.log('📊 用户统计预热完成');
    } catch (error) {
      console.error('用户统计预热失败:', error);
      // 即使失败也设置一个默认状态，避免影响其他功能
      const fallbackStats = {
        posts_count: '检查失败',
        activities_count: '检查失败',
        users_count: '检查失败',
        last_updated: new Date().toISOString(),
        error: true
      };
      this.setCache('user_stats', fallbackStats);
    }
  }

  /**
   * 设置缓存
   */
  private setCache(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    const cacheItem: CacheItem = {
      key,
      data,
      timestamp: Date.now(),
      ttl
    };

    this.cache.set(key, cacheItem);
    
    // 同时存储到 localStorage（可选）
    try {
      localStorage.setItem(
        this.CACHE_PREFIX + key,
        JSON.stringify(cacheItem)
      );
    } catch (error) {
      console.warn('localStorage 存储失败:', error);
    }
  }

  /**
   * 获取缓存
   */
  getCache<T = any>(key: string): T | null {
    // 先从内存缓存获取
    let cacheItem = this.cache.get(key);

    // 如果内存中没有，尝试从 localStorage 获取
    if (!cacheItem) {
      try {
        const stored = localStorage.getItem(this.CACHE_PREFIX + key);
        if (stored) {
          cacheItem = JSON.parse(stored);
          if (cacheItem) {
            this.cache.set(key, cacheItem);
          }
        }
      } catch (error) {
        console.warn('localStorage 读取失败:', error);
      }
    }

    if (!cacheItem) return null;

    // 检查是否过期
    if (Date.now() - cacheItem.timestamp > cacheItem.ttl) {
      this.removeCache(key);
      return null;
    }

    return cacheItem.data as T;
  }

  /**
   * 移除缓存
   */
  removeCache(key: string): void {
    this.cache.delete(key);
    try {
      localStorage.removeItem(this.CACHE_PREFIX + key);
    } catch (error) {
      console.warn('localStorage 删除失败:', error);
    }
  }

  /**
   * 清空所有缓存
   */
  clearCache(): void {
    this.cache.clear();
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.CACHE_PREFIX))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('localStorage 清空失败:', error);
    }
  }

  /**
   * 刷新特定缓存
   */
  async refreshCache(key: string): Promise<void> {
    this.removeCache(key);
    
    switch (key) {
      case 'categories':
        await this.warmupCategories();
        break;
      case 'recent_posts':
        await this.warmupRecentPosts();
        break;
      case 'recent_activities':
        await this.warmupRecentActivities();
        break;
      case 'system_settings':
        await this.warmupSystemSettings();
        break;
      case 'user_stats':
        await this.warmupUserStats();
        break;
      default:
        console.warn(`未知的缓存键: ${key}`);
    }
  }

  /**
   * 获取缓存状态
   */
  getCacheStatus(): {
    isWarmedUp: boolean;
    cacheSize: number;
    cacheKeys: string[];
  } {
    return {
      isWarmedUp: this.isWarmedUp,
      cacheSize: this.cache.size,
      cacheKeys: Array.from(this.cache.keys())
    };
  }
}

// 导出单例实例
export const cacheWarmupService = new CacheWarmupService();
export default cacheWarmupService;