/**
 * 批量数据服务的降级处理器
 * 负责在批量请求失败时提供降级方案
 */

import { BatchRequest, BatchResponse, HomePageDataResult, PostDetailDataResult, ActivitiesPageDataResult } from './types';

export class FallbackHandler {
  private enableFallback = true; // 降级机制开关

  /**
   * 设置降级机制开关
   * @param enabled 是否启用降级机制
   */
  setFallbackEnabled(enabled: boolean): void {
    this.enableFallback = enabled;
  }

  /**
   * 获取降级机制状态
   * @returns 是否启用降级机制
   */
  isFallbackEnabled(): boolean {
    return this.enableFallback;
  }

  /**
   * 降级到单个请求处理
   * @param requests 批量请求数组
   * @param executeBatchRequests 执行批量请求的方法
   * @returns 批量响应数组
   */
  async fallbackToIndividualRequests(
    requests: BatchRequest[],
    executeBatchRequests: (requests: BatchRequest[]) => Promise<BatchResponse[]>
  ): Promise<BatchResponse[]> {
    const results: BatchResponse[] = [];
    
    for (const request of requests) {
      try {
        const batchResult = await executeBatchRequests([request]);
        results.push(...batchResult);
      } catch (error) {
        results.push({
          id: request.id,
          type: request.type,
          data: null,
          error: `降级请求也失败: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    }
    
    return results;
  }

  /**
   * 降级方案：单独调用首页数据
   * @param options 首页数据选项
   * @returns 首页数据结果
   */
  async fallbackToSeparateCalls(options: {
    postsLimit?: number;
    activitiesLimit?: number;
  }): Promise<HomePageDataResult> {
    const result: HomePageDataResult = {
      posts: [],
      activities: [],
      errors: {}
    };

    try {
      // 使用原生fetch调用作为最终降级方案
      const postsResponse = await fetch(`/api/posts?limit=${options.postsLimit || 3}`);
      if (postsResponse.ok) {
        result.posts = await postsResponse.json();
      } else {
        throw new Error('Posts API failed');
      }
    } catch (error) {
      result.errors.posts = 'Failed to fetch posts';
      console.error('降级获取帖子数据失败:', error);
    }

    try {
      const activitiesResponse = await fetch(`/api/activities/upcoming?limit=${options.activitiesLimit || 2}`);
      if (activitiesResponse.ok) {
        result.activities = await activitiesResponse.json();
      } else {
        throw new Error('Activities API failed');
      }
    } catch (error) {
      result.errors.activities = 'Failed to fetch activities';
      console.error('降级获取活动数据失败:', error);
    }

    return result;
  }

  /**
   * 降级方案：单独调用帖子详情数据
   * @param postId 帖子ID
   * @param userId 用户ID（可选）
   * @returns 帖子详情数据结果
   */
  async fallbackToSeparatePostDetailCalls(postId: string, userId?: string): Promise<PostDetailDataResult> {
    const result: PostDetailDataResult = {
      post: null,
      comments: [],
      likesCount: 0,
      isLiked: false,
      categories: [],
      errors: {}
    };

    try {
      const postResponse = await fetch(`/api/posts/${postId}`);
      if (postResponse.ok) {
        result.post = await postResponse.json();
      } else {
        throw new Error('Post API failed');
      }
    } catch (error) {
      result.errors.post = 'Failed to fetch post';
      console.error('降级获取帖子详情失败:', error);
    }

    try {
      const commentsResponse = await fetch(`/api/posts/${postId}/comments`);
      if (commentsResponse.ok) {
        result.comments = await commentsResponse.json();
      } else {
        throw new Error('Comments API failed');
      }
    } catch (error) {
      result.errors.comments = 'Failed to fetch comments';
      console.error('降级获取评论数据失败:', error);
    }

    try {
      if (userId) {
        const likesResponse = await fetch(`/api/posts/${postId}/likes/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        });
        if (likesResponse.ok) {
          const likesData = await likesResponse.json();
          result.isLiked = likesData.isLiked || false;
        }
      }
    } catch (error) {
      result.errors.likes = 'Failed to fetch likes';
      console.error('降级获取点赞数据失败:', error);
    }

    try {
      const categoriesResponse = await fetch('/api/categories/content');
      if (categoriesResponse.ok) {
        result.categories = await categoriesResponse.json();
      } else {
        throw new Error('Categories API failed');
      }
    } catch (error) {
      result.errors.categories = 'Failed to fetch categories';
      console.error('降级获取分类数据失败:', error);
    }

    return result;
  }

  /**
   * 降级方案：单独调用活动页面数据
   * @param options 活动页面选项
   * @returns 活动页面数据结果
   */
  async fallbackToSeparateActivitiesCalls(options: {
    page?: number;
    limit?: number;
  }): Promise<ActivitiesPageDataResult> {
    const result: ActivitiesPageDataResult = {
      activities: [],
      categories: [],
      errors: {}
    };

    try {
      const activitiesResponse = await fetch(`/api/activities?page=${options.page || 1}&limit=${options.limit || 10}`);
      if (activitiesResponse.ok) {
        result.activities = await activitiesResponse.json();
      } else {
        throw new Error('Activities API failed');
      }
    } catch (error) {
      result.errors.activities = 'Failed to fetch activities';
      console.error('降级获取活动列表失败:', error);
    }

    try {
      const categoriesResponse = await fetch('/api/categories/activities');
      if (categoriesResponse.ok) {
        result.categories = await categoriesResponse.json();
      } else {
        throw new Error('Categories API failed');
      }
    } catch (error) {
      result.errors.categories = 'Failed to fetch categories';
      console.error('降级获取活动分类失败:', error);
    }

    return result;
  }

  /**
   * 通用降级处理方法
   * @param primaryOperation 主要操作
   * @param fallbackOperation 降级操作
   * @param operationName 操作名称（用于日志）
   * @returns 操作结果
   */
  async executeWithFallback<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>,
    operationName: string = 'unknown'
  ): Promise<T> {
    try {
      console.log(`🚀 开始执行主要操作: ${operationName}`);
      return await primaryOperation();
    } catch (primaryError) {
      console.warn(`⚠️ 主要操作失败，准备降级: ${operationName}`, primaryError);
      
      if (!this.enableFallback) {
        console.error(`❌ 降级机制已禁用，操作失败: ${operationName}`);
        throw primaryError;
      }

      try {
        console.log(`🔄 开始执行降级操作: ${operationName}`);
        const result = await fallbackOperation();
        console.log(`✅ 降级操作成功: ${operationName}`);
        return result;
      } catch (fallbackError) {
        console.error(`❌ 降级操作也失败: ${operationName}`, fallbackError);
        throw fallbackError;
      }
    }
  }

  /**
   * 检查是否应该使用降级机制
   * @param error 错误对象
   * @param options 选项
   * @returns 是否应该降级
   */
  shouldFallback(error: Error, options?: {
    fallbackToIndividual?: boolean;
  }): boolean {
    if (!this.enableFallback) {
      return false;
    }

    if (options?.fallbackToIndividual === false) {
      return false;
    }

    // 检查错误类型，决定是否降级
    const errorMessage = error.message.toLowerCase();
    
    // 网络错误或服务器错误时降级
    if (errorMessage.includes('network') || 
        errorMessage.includes('timeout') ||
        errorMessage.includes('500') ||
        errorMessage.includes('502') ||
        errorMessage.includes('503') ||
        errorMessage.includes('504')) {
      return true;
    }

    // 批量API特定错误时降级
    if (errorMessage.includes('batch') && 
        (errorMessage.includes('failed') || errorMessage.includes('error'))) {
      return true;
    }

    return true; // 默认降级
  }

  /**
   * 记录降级事件
   * @param operationName 操作名称
   * @param error 错误信息
   * @param fallbackUsed 是否使用了降级
   */
  logFallbackEvent(operationName: string, error?: Error, fallbackUsed: boolean = true): void {
    const logData = {
      operation: operationName,
      timestamp: new Date().toISOString(),
      fallbackUsed,
      error: error ? {
        message: error.message,
        stack: error.stack
      } : null
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('降级事件记录:', logData);
    }

    // 这里可以添加更多的日志记录逻辑，比如发送到监控系统
  }

  /**
   * 获取降级统计信息
   * @returns 降级统计对象
   */
  getFallbackStats() {
    return {
      enabled: this.enableFallback,
      // 这里可以添加更多统计信息，比如降级次数、成功率等
    };
  }
}