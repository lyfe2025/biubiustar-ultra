/**
 * 全局用户数据缓存管理器
 * 在应用层面缓存用户数据，避免重复加载
 */

import { socialService } from '../lib/socialService/index';
import { ActivityService } from '../lib/activityService';
import type { Post } from '../pages/admin/content/types';
import type { Activity } from '../types';
import type { UserProfile, UserStats } from '../pages/profile/types';

interface CachedUserData {
  profile: UserProfile | null;
  stats: UserStats;
  posts: Post[];
  activities: Activity[];
  timestamp: number;
  isLoading: boolean;
}

class UserDataCacheManager {
  private cache = new Map<string, CachedUserData>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存，更频繁自动刷新

  /**
   * 检查缓存是否有效
   */
  private isCacheValid(cachedData: CachedUserData): boolean {
    return Date.now() - cachedData.timestamp < this.CACHE_TTL;
  }

  /**
   * 获取缓存数据
   */
  getCachedData(userId: string): CachedUserData | null {
    const cached = this.cache.get(userId);
    if (cached && this.isCacheValid(cached)) {
      console.log(`🔄 使用缓存的用户数据 (用户ID: ${userId})`);
      return cached;
    }
    return null;
  }

  /**
   * 设置缓存数据
   */
  setCachedData(userId: string, data: Omit<CachedUserData, 'timestamp' | 'isLoading'>): void {
    this.cache.set(userId, {
      ...data,
      timestamp: Date.now(),
      isLoading: false
    });
    console.log(`💾 缓存用户数据 (用户ID: ${userId})`);
  }

  /**
   * 设置加载状态
   */
  setLoadingState(userId: string, isLoading: boolean): void {
    const existing = this.cache.get(userId);
    if (existing) {
      existing.isLoading = isLoading;
    } else {
      this.cache.set(userId, {
        profile: null,
        stats: { postsCount: 0, followersCount: 0, followingCount: 0, likes: 0 },
        posts: [],
        activities: [],
        timestamp: Date.now(),
        isLoading
      });
    }
  }

  /**
   * 加载用户数据（带缓存）
   */
  async loadUserData(userId: string, forceRefresh = false): Promise<CachedUserData> {
    // 检查缓存
    if (!forceRefresh) {
      const cached = this.getCachedData(userId);
      if (cached) {
        return cached;
      }
    }

    // 防止重复加载
    const existing = this.cache.get(userId);
    if (existing && existing.isLoading) {
      console.log(`⏳ 用户数据正在加载中 (用户ID: ${userId})`);
      // 返回现有数据或等待
      return existing;
    }

    try {
      // 设置加载状态
      this.setLoadingState(userId, true);
      console.log(`📡 开始加载用户数据 (用户ID: ${userId}${forceRefresh ? ', 强制刷新' : ''})`);

      // 并行获取数据
      const [profile, postsResponse, activities, stats] = await Promise.all([
        socialService.getUserProfile(userId),
        socialService.getUserPosts(userId),
        ActivityService.getUserActivities(userId),
        fetch(`/api/users/${userId}/stats`).then(r => r.json())
      ]);

      const posts = Array.isArray(postsResponse) ? postsResponse : postsResponse.posts || [];
      const userStats = {
        postsCount: stats.posts_count || 0,
        followersCount: stats.followers_count || 0,
        followingCount: stats.following_count || 0,
        likes: stats.total_likes || 0
      };

      const userData: Omit<CachedUserData, 'timestamp' | 'isLoading'> = {
        profile,
        stats: userStats,
        posts,
        activities
      };

      // 缓存数据
      this.setCachedData(userId, userData);

      return {
        ...userData,
        timestamp: Date.now(),
        isLoading: false
      };

    } catch (error) {
      console.error('加载用户数据失败:', error);
      // 清除加载状态
      this.setLoadingState(userId, false);
      throw error;
    }
  }

  /**
   * 检查并自动刷新过期的缓存数据
   */
  async checkAndRefresh(userId: string): Promise<CachedUserData> {
    const cached = this.cache.get(userId);
    if (cached && !this.isCacheValid(cached)) {
      console.log(`🔄 缓存已过期，自动刷新用户数据 (用户ID: ${userId})`);
      return this.loadUserData(userId, true);
    }
    return this.loadUserData(userId, false);
  }

  /**
   * 失效特定用户的缓存
   */
  invalidateCache(userId: string): void {
    this.cache.delete(userId);
    console.log(`🗑️ 清除用户缓存 (用户ID: ${userId})`);
  }

  /**
   * 失效所有缓存
   */
  invalidateAllCache(): void {
    this.cache.clear();
    console.log('🗑️ 清除所有用户数据缓存');
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): { 
    totalCached: number; 
    validCached: number; 
    users: string[] 
  } {
    const now = Date.now();
    let validCount = 0;
    const users: string[] = [];

    for (const [userId, data] of this.cache.entries()) {
      users.push(userId);
      if (this.isCacheValid(data)) {
        validCount++;
      }
    }

    return {
      totalCached: this.cache.size,
      validCached: validCount,
      users
    };
  }

  /**
   * 更新用户资料缓存
   */
  updateProfileInCache(userId: string, profile: UserProfile): void {
    const existing = this.cache.get(userId);
    if (existing) {
      existing.profile = profile;
      existing.timestamp = Date.now();
      console.log(`🔄 更新缓存中的用户资料 (用户ID: ${userId})`);
    }
  }

  /**
   * 当用户数据发生重要变更时，标记缓存需要刷新
   */
  markForRefresh(userId: string): void {
    const existing = this.cache.get(userId);
    if (existing) {
      // 将时间戳设为过期，触发下次访问时自动刷新
      existing.timestamp = Date.now() - this.CACHE_TTL - 1000;
      console.log(`⏰ 标记用户缓存需要刷新 (用户ID: ${userId})`);
    }
  }

  /**
   * 更新用户统计缓存
   */
  updateStatsInCache(userId: string, stats: Partial<UserStats>): void {
    const existing = this.cache.get(userId);
    if (existing) {
      existing.stats = { ...existing.stats, ...stats };
      existing.timestamp = Date.now();
      console.log(`📊 更新缓存中的用户统计 (用户ID: ${userId})`);
    }
  }

  /**
   * 在缓存中添加帖子
   */
  addPostToCache(userId: string, post: Post): void {
    const existing = this.cache.get(userId);
    if (existing) {
      existing.posts.unshift(post);
      existing.stats.postsCount++;
      existing.timestamp = Date.now();
      console.log(`📝 在缓存中添加帖子 (用户ID: ${userId})`);
    }
  }

  /**
   * 从缓存中删除帖子
   */
  removePostFromCache(userId: string, postId: string): void {
    const existing = this.cache.get(userId);
    if (existing) {
      const index = existing.posts.findIndex(p => p.id === postId);
      if (index > -1) {
        existing.posts.splice(index, 1);
        existing.stats.postsCount = Math.max(0, existing.stats.postsCount - 1);
        existing.timestamp = Date.now();
        console.log(`🗑️ 从缓存中删除帖子 (用户ID: ${userId})`);
      }
    }
  }
}

// 创建全局实例
export const userDataCache = new UserDataCacheManager();
export default userDataCache;
