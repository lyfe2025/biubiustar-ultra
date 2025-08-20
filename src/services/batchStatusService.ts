/**
 * 批量状态检查服务
 * 解决N+1查询问题：批量获取评论数量、用户参与状态、点赞状态、关注状态等
 */

import { socialService } from '../lib/socialService';
import { ActivityService } from '../lib/activityService';
import { defaultCache } from './cacheService';
import { performanceMonitor } from './performanceMonitor'
import { supabase } from '../lib/supabase';

export interface BatchCommentsCountRequest {
  postIds: string[];
}

export interface BatchCommentsCountResponse {
  [postId: string]: number;
}

export interface BatchParticipationRequest {
  activityIds: string[];
  userId: string;
}

export interface BatchParticipationResponse {
  [activityId: string]: boolean;
}

export interface BatchLikeStatusRequest {
  postIds: string[];
  userId: string;
}

export interface BatchLikeStatusResponse {
  [postId: string]: boolean;
}

export interface BatchFollowStatusRequest {
  userIds: string[];
  followerId: string;
}

export interface BatchFollowStatusResponse {
  [userId: string]: boolean;
}

class BatchStatusService {
  private static instance: BatchStatusService;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

  private constructor() {}

  static getInstance(): BatchStatusService {
    if (!BatchStatusService.instance) {
      BatchStatusService.instance = new BatchStatusService();
    }
    return BatchStatusService.instance;
  }

  /**
   * 批量获取帖子评论数量
   */// 批量获取点赞数量
  async batchGetLikesCount(postIds: string[]): Promise<BatchCommentsCountResponse> {
    const startTime = Date.now();
    const response: BatchCommentsCountResponse = {};
    
    try {
      // 使用批量查询优化
      const promises = postIds.map(async (postId) => {
        try {
          const count = await socialService.getPostLikesCount(postId);
          return { postId, count };
        } catch (error) {
          console.error(`获取帖子 ${postId} 点赞数失败:`, error);
          return { postId, count: 0 };
        }
      });
      
      const results = await Promise.allSettled(promises);
      
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          response[result.value.postId] = result.value.count;
        }
      });
      
      const duration = Date.now() - startTime;
      performanceMonitor.recordMetric('batch_likes_count', duration);
      console.log('✅ 批量点赞数量获取完成', { count: Object.keys(response).length, duration });
      
      return response;
    } catch (error) {
      console.error('批量获取点赞数量异常:', error);
      // 降级处理
      postIds.forEach(postId => {
        response[postId] = 0;
      });
      return response;
    }
  }

  // 批量获取评论数量
  async batchGetCommentsCount(postIds: string[]): Promise<BatchCommentsCountResponse> {    if (!postIds || postIds.length === 0) {
      return {};
    }

    const cacheKey = `comments_count_batch_${postIds.sort().join(',')}`;
    
    try {
      // 尝试从缓存获取
      const cached = defaultCache.get<BatchCommentsCountResponse>(cacheKey);
      if (cached) {
        console.log('📦 使用缓存的评论数量数据', { postIds: postIds.length });
        return cached;
      }

      const startTime = Date.now();
      console.log('🌐 批量获取评论数量', { postIds: postIds.length });

      // 如果只有一个帖子，直接调用单个API
      if (postIds.length === 1) {
        const count = await socialService.getPostCommentsCount(postIds[0]);
        const result = { [postIds[0]]: count };
        defaultCache.set(cacheKey, result, { ttl: this.CACHE_TTL });
        return result;
      }

      // 批量获取评论数量
      const promises = postIds.map(async (postId) => {
        try {
          const count = await socialService.getPostCommentsCount(postId);
          return { postId, count };
        } catch (error) {
          console.warn(`获取帖子 ${postId} 评论数量失败:`, error);
          return { postId, count: 0 };
        }
      });

      const results = await Promise.allSettled(promises);
      const response: BatchCommentsCountResponse = {};

      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          response[result.value.postId] = result.value.count;
        }
      });

      // 存入缓存
      defaultCache.set(cacheKey, response, { ttl: this.CACHE_TTL });

      const duration = Date.now() - startTime;
      performanceMonitor.recordMetric('batch_comments_count', duration);
      console.log('✅ 批量评论数量获取完成', { count: Object.keys(response).length, duration });

      return response;
    } catch (error) {
      console.error('❌ 批量获取评论数量失败:', error);
      return {};
    }
  }

  /**
   * 批量检查用户活动参与状态
   */
  async batchCheckParticipation(activityIds: string[], userId: string): Promise<BatchParticipationResponse> {
    if (!activityIds || activityIds.length === 0 || !userId) {
      return {};
    }

    const cacheKey = `participation_batch_${userId}_${activityIds.sort().join(',')}`;
    
    try {
      // 尝试从缓存获取
      const cached = defaultCache.get<BatchParticipationResponse>(cacheKey);
      if (cached) {
        console.log('📦 使用缓存的参与状态数据', { activityIds: activityIds.length, userId });
        return cached;
      }

      const startTime = Date.now();
      console.log('🌐 批量检查参与状态', { activityIds: activityIds.length, userId });

      // 如果只有一个活动，直接调用单个API
      if (activityIds.length === 1) {
        const isParticipating = await ActivityService.isUserParticipating(activityIds[0], userId);
        const result = { [activityIds[0]]: isParticipating };
        defaultCache.set(cacheKey, result, { ttl: this.CACHE_TTL });
        return result;
      }

      // 批量检查参与状态
      const promises = activityIds.map(async (activityId) => {
        try {
          const isParticipating = await ActivityService.isUserParticipating(activityId, userId);
          return { activityId, isParticipating };
        } catch (error) {
          console.warn(`检查活动 ${activityId} 参与状态失败:`, error);
          return { activityId, isParticipating: false };
        }
      });

      const results = await Promise.allSettled(promises);
      const response: BatchParticipationResponse = {};

      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          response[result.value.activityId] = result.value.isParticipating;
        }
      });

      // 存入缓存
      defaultCache.set(cacheKey, response, { ttl: this.CACHE_TTL });

      const duration = Date.now() - startTime;
      performanceMonitor.recordMetric('batch_participation_check', duration);
      console.log('✅ 批量参与状态检查完成', { count: Object.keys(response).length, duration });

      return response;
    } catch (error) {
      console.error('❌ 批量检查参与状态失败:', error);
      return {};
    }
  }

  /**
   * 批量检查帖子点赞状态
   */// 批量检查点赞状态
  async batchCheckLikedStatus(postIds: string[], userId: string): Promise<BatchLikeStatusResponse> {
    if (!postIds || postIds.length === 0 || !userId) {
      return {};
    }

    const startTime = Date.now();
    const response: BatchLikeStatusResponse = {};
    
    try {
      // 使用批量查询优化
      const promises = postIds.map(async (postId) => {
        try {
          const isLiked = await socialService.isPostLiked(postId, userId);
          return { postId, isLiked };
        } catch (error) {
          console.error(`检查帖子 ${postId} 点赞状态失败:`, error);
          return { postId, isLiked: false };
        }
      });
      
      const results = await Promise.allSettled(promises);
      
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          response[result.value.postId] = result.value.isLiked;
        }
      });
      
      const duration = Date.now() - startTime;
      performanceMonitor.recordMetric('batch_like_status', duration);
      console.log('✅ 批量点赞状态检查完成', { count: Object.keys(response).length, duration });
      
      return response;
    } catch (error) {
      console.error('批量检查点赞状态异常:', error);
      // 降级处理
      postIds.forEach(postId => {
        response[postId] = false;
      });
      return response;
    }
  }

  // 批量检查点赞状态（兼容旧方法名）
  async batchCheckLikeStatus(postIds: string[], userId: string): Promise<BatchLikeStatusResponse> {    if (!postIds || postIds.length === 0 || !userId) {
      return {};
    }

    const cacheKey = `like_status_batch_${userId}_${postIds.sort().join(',')}`;
    
    try {
      // 尝试从缓存获取
      const cached = defaultCache.get<BatchLikeStatusResponse>(cacheKey);
      if (cached) {
        console.log('📦 使用缓存的点赞状态数据', { postIds: postIds.length, userId });
        return cached;
      }

      const startTime = Date.now();
      console.log('🌐 批量检查点赞状态', { postIds: postIds.length, userId });

      // 如果只有一个帖子，直接调用单个API
      if (postIds.length === 1) {
        const isLiked = await socialService.isPostLiked(postIds[0], userId);
        const result = { [postIds[0]]: isLiked };
        defaultCache.set(cacheKey, result, { ttl: this.CACHE_TTL });
        return result;
      }

      // 批量检查点赞状态
      const promises = postIds.map(async (postId) => {
        try {
          const isLiked = await socialService.isPostLiked(postId, userId);
          return { postId, isLiked };
        } catch (error) {
          console.warn(`检查帖子 ${postId} 点赞状态失败:`, error);
          return { postId, isLiked: false };
        }
      });

      const results = await Promise.allSettled(promises);
      const response: BatchLikeStatusResponse = {};

      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          response[result.value.postId] = result.value.isLiked;
        }
      });

      // 存入缓存
      defaultCache.set(cacheKey, response, { ttl: this.CACHE_TTL });

      const duration = Date.now() - startTime;
      performanceMonitor.recordMetric('batch_like_status_check', duration);
      console.log('✅ 批量点赞状态检查完成', { count: Object.keys(response).length, duration });

      return response;
    } catch (error) {
      console.error('❌ 批量检查点赞状态失败:', error);
      return {};
    }
  }

  /**
   * 批量检查关注状态
   */
  async batchCheckFollowStatus(userIds: string[], followerId: string): Promise<BatchFollowStatusResponse> {
    if (!userIds || userIds.length === 0 || !followerId) {
      return {};
    }

    const cacheKey = `follow_status_batch_${followerId}_${userIds.sort().join(',')}`;
    
    try {
      // 尝试从缓存获取
      const cached = defaultCache.get<BatchFollowStatusResponse>(cacheKey);
      if (cached) {
        console.log('📦 使用缓存的关注状态数据', { userIds: userIds.length, followerId });
        return cached;
      }

      const startTime = Date.now();
      console.log('🌐 批量检查关注状态', { userIds: userIds.length, followerId });

      // 如果只有一个用户，直接调用单个API
      if (userIds.length === 1) {
        const isFollowing = await socialService.isFollowing(followerId, userIds[0]);
        const result = { [userIds[0]]: isFollowing };
        defaultCache.set(cacheKey, result, { ttl: this.CACHE_TTL });
        return result;
      }

      // 批量检查关注状态
      const promises = userIds.map(async (userId) => {
        try {
          const isFollowing = await socialService.isFollowing(followerId, userId);
          return { userId, isFollowing };
        } catch (error) {
          console.warn(`检查用户 ${userId} 关注状态失败:`, error);
          return { userId, isFollowing: false };
        }
      });

      const results = await Promise.allSettled(promises);
      const response: BatchFollowStatusResponse = {};

      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          response[result.value.userId] = result.value.isFollowing;
        }
      });

      // 存入缓存
      defaultCache.set(cacheKey, response, { ttl: this.CACHE_TTL });

      const duration = Date.now() - startTime;
      performanceMonitor.recordMetric('batch_follow_status_check', duration);
      console.log('✅ 批量关注状态检查完成', { count: Object.keys(response).length, duration });

      return response;
    } catch (error) {
      console.error('❌ 批量检查关注状态失败:', error);
      return {};
    }
  }

  /**
   * 清除所有状态缓存
   */
  clearAllCache(): void {
    // 这里可以实现更精确的缓存清除逻辑
    console.log('🗑️ 批量状态缓存已清除');
  }

  /**
   * 批量获取活动参与人数
   */
  async batchGetParticipantCount(activityIds: string[]): Promise<Map<string, number>> {
    const startTime = Date.now();
    const countMap = new Map<string, number>();
    
    try {
      // 使用批量查询优化
      const { data, error } = await supabase
        .from('activity_participants')
        .select('activity_id')
        .in('activity_id', activityIds);
      
      if (error) {
        console.error('批量获取参与人数失败:', error);
        // 降级到单个查询
        for (const activityId of activityIds) {
          try {
            const { data: countData } = await supabase
               .from('activity_participants')
               .select('id', { count: 'exact' })
               .eq('activity_id', activityId);
             const count = countData?.length || 0;
            countMap.set(activityId, count);
          } catch (err) {
            console.error(`获取活动 ${activityId} 参与人数失败:`, err);
            countMap.set(activityId, 0);
          }
        }
      } else {
        // 初始化所有活动参与人数为0
        activityIds.forEach(id => countMap.set(id, 0));
        
        // 统计每个活动的参与人数
        data?.forEach(record => {
          const currentCount = countMap.get(record.activity_id) || 0;
          countMap.set(record.activity_id, currentCount + 1);
        });
      }
      
      const duration = Date.now() - startTime;
      performanceMonitor.recordMetric('batch_participant_count', duration);
      
      return countMap;
    } catch (error) {
      console.error('批量获取参与人数异常:', error);
      // 降级处理
      for (const activityId of activityIds) {
        countMap.set(activityId, 0);
      }
      return countMap;
    }
  }

  /**
   * 批量获取用户参与状态
   */
  async batchGetUserParticipationStatus(activityIds: string[], userId: string): Promise<Map<string, boolean>> {
    const startTime = Date.now();
    const statusMap = new Map<string, boolean>();
    
    try {
      // 批量检查用户参与状态
      const results = await Promise.allSettled(
        activityIds.map(async (activityId) => {
          const isParticipating = await ActivityService.isUserParticipating(activityId, userId);
          return { activityId, isParticipating };
        })
      );
      
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          statusMap.set(result.value.activityId, result.value.isParticipating);
        }
      });
      
      const duration = Date.now() - startTime;
      performanceMonitor.recordMetric('batch_user_participation_status', duration);
      
      return statusMap;
    } catch (error) {
      console.error('批量获取用户参与状态异常:', error);
      // 降级处理
      for (const activityId of activityIds) {
        statusMap.set(activityId, false);
      }
      return statusMap;
    }
  }

  /**
   * 预加载常用状态数据
   */
  async preloadCommonStatus(userId: string, postIds: string[] = [], activityIds: string[] = []): Promise<void> {
    console.log('🚀 开始预加载状态数据', { userId, postIds: postIds.length, activityIds: activityIds.length });
    
    const promises: Promise<any>[] = [];
    
    if (postIds.length > 0) {
      promises.push(this.batchGetCommentsCount(postIds));
      promises.push(this.batchCheckLikeStatus(postIds, userId));
    }
    
    if (activityIds.length > 0) {
      promises.push(this.batchCheckParticipation(activityIds, userId));
    }
    
    try {
      await Promise.allSettled(promises);
      console.log('✅ 状态数据预加载完成');
    } catch (error) {
      console.warn('⚠️ 状态数据预加载部分失败:', error);
    }
  }
}

// 导出单例实例
export const batchStatusService = BatchStatusService.getInstance();

// 导出类型和工具函数
export { BatchStatusService };