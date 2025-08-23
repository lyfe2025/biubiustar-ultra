/**
 * 帖子详情数据获取器
 * 负责帖子详情页数据（帖子详情 + 评论 + 点赞状态 + 分类）的获取逻辑
 */

import { PostDetailDataResult, PostDetailData } from '../types';
import { shortTermCache } from '../../cacheService';
import { fallbackService, FallbackResult } from '../../fallbackService';

export class PostDetailDataFetcher {
  /**
   * 获取帖子详情页数据（帖子详情 + 评论 + 点赞状态 + 分类）
   * @param postId 帖子ID
   * @param userId 用户ID（可选）
   * @returns 帖子详情数据结果
   */
  async getPostDetailData(postId: string, userId?: string): Promise<PostDetailDataResult> {
    const cacheKey = `post-detail-${postId}-${userId || 'anonymous'}`;
    
    // 检查缓存
    const cached = shortTermCache.get<PostDetailData>(cacheKey);
    if (cached) {
      console.log('🎯 使用缓存的帖子详情数据');
      return cached as PostDetailDataResult;
    }

    const startTime = performance.now();
    
    // 主要操作：批量API
    const primaryOperation = async (): Promise<PostDetailData> => {
      console.log('🚀 开始批量获取帖子详情数据');
      const response = await fetch(`/api/batch/post-detail/${postId}?userId=${userId || ''}`);
      if (!response.ok) {
        throw new Error(`批量API失败: ${response.status}`);
      }
      return await response.json();
    };
    
    // 降级操作：独立API调用
    const fallbackOperation = async (): Promise<PostDetailData> => {
      console.log('🔄 降级到独立API调用');
      const requests = [
        fetch(`/api/posts/${postId}`),
        fetch(`/api/posts/${postId}/comments`),
        fetch(`/api/categories/content`)
      ];
      
      if (userId) {
        requests.push(fetch(`/api/posts/${postId}/likes/${userId}`));
      }
      
      const responses = await Promise.all(requests);
      
      // 检查所有响应是否成功
      for (const response of responses) {
        if (!response.ok) {
          throw new Error(`API调用失败: ${response.status}`);
        }
      }
      
      const [postData, commentsData, categoriesData, likeData] = await Promise.all(
        responses.map(r => r.json())
      );
      
      return {
        post: postData,
        comments: commentsData,
        categories: categoriesData,
        isLiked: likeData?.isLiked || false,
        likesCount: postData?.likes_count || 0
      };
    };

    // 使用降级服务执行操作
    const result: FallbackResult<PostDetailData> = await fallbackService.executeWithFallback(
      primaryOperation,
      fallbackOperation,
      {
        maxRetries: 1,
        retryDelay: 500,
        timeout: 10000
      }
    );
    
    // 记录降级事件
    fallbackService.logFallbackEvent('getPostDetailData', result);
    
    if (result.success && result.data) {
      const endTime = performance.now();
      console.log(`✅ 帖子详情数据获取成功，耗时: ${endTime - startTime}ms，使用降级: ${result.usedFallback}`);
      
      // 缓存结果（降级数据缓存时间较短）
      const cacheTime = result.usedFallback ? 60 * 1000 : 3 * 60 * 1000;
      shortTermCache.set(cacheKey, result.data, { ttl: cacheTime });
      console.log('💾 帖子详情数据已缓存');
      
      return result.data;
    } else {
      const endTime = performance.now();
      console.error(`❌ 帖子详情数据获取失败，耗时: ${endTime - startTime}ms`);
      throw result.error || new Error('帖子详情数据获取失败');
    }
  }

  /**
   * 批量获取帖子详情页数据（旧版本兼容）
   * @param postId 帖子ID
   * @param userId 用户ID（可选）
   * @returns 帖子详情数据结果
   */
  async getPostDetailDataLegacy(postId: string, userId?: string): Promise<{
    post: any;
    comments: any[];
    likesCount: number;
    isLiked: boolean;
    categories: any[];
    errors?: any;
  }> {
    const metricName = 'post_detail_data_legacy';
    const startTime = Date.now();
    
    const cacheKey = `post-detail-${postId}-${userId || 'anonymous'}`;
    
    // 检查缓存
    const cached = shortTermCache.get(cacheKey);
    if (cached) {
      return cached as PostDetailDataResult;
    }

    try {
      const result: PostDetailDataResult = {
        post: null,
        comments: [],
        likesCount: 0,
        isLiked: false,
        categories: [],
        errors: {}
      };
      
      // 缓存结果
      shortTermCache.set(cacheKey, result, { ttl: 300000 });
      
      return result;

    } catch (error) {
      // 降级到单独调用
      return {
        post: null,
        comments: [],
        likesCount: 0,
        isLiked: false,
        categories: [],
        errors: { general: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }
}
