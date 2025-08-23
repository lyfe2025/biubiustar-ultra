/**
 * 首页数据获取器
 * 负责首页数据（帖子 + 活动）的获取逻辑
 */

import { HomePageDataResult, HomePageData } from '../types';
import { shortTermCache } from '../../cacheService';
import { fallbackService, FallbackResult } from '../../fallbackService';

export class HomePageDataFetcher {
  /**
   * 获取首页数据（帖子 + 活动）
   * @param options 首页数据选项
   * @returns 首页数据结果
   */
  async getHomePageData(options: {
    postsLimit?: number;
    activitiesLimit?: number;
  } = {}): Promise<HomePageDataResult> {
    const cacheKey = `home-page-data-${options.postsLimit || 3}-${options.activitiesLimit || 2}`;
    
    // 检查缓存
    const cached = shortTermCache.get<HomePageData>(cacheKey);
    if (cached) {
      console.log('🎯 使用缓存的首页数据');
      return cached as HomePageDataResult;
    }

    const startTime = performance.now();
    
    // 主要操作：批量API
    const primaryOperation = async (): Promise<HomePageData> => {
      console.log('🚀 开始批量获取首页数据');
      const response = await fetch('/api/batch/home-data');
      if (!response.ok) {
        throw new Error(`批量API失败: ${response.status}`);
      }
      return await response.json();
    };
    
    // 降级操作：独立API调用
    const fallbackOperation = async (): Promise<HomePageData> => {
      console.log('🔄 降级到独立API调用');
      const [postsResponse, activitiesResponse] = await Promise.all([
        fetch('/api/posts?page=1&limit=3'),
        fetch('/api/activities/upcoming?limit=2')
      ]);
      
      if (!postsResponse.ok || !activitiesResponse.ok) {
        throw new Error('独立API调用失败');
      }
      
      const [postsData, activitiesData] = await Promise.all([
        postsResponse.json(),
        activitiesResponse.json()
      ]);
      
      return {
        posts: postsData.posts || postsData,
        activities: activitiesData
      };
    };

    // 使用降级服务执行操作
    const result: FallbackResult<HomePageData> = await fallbackService.executeWithFallback(
      primaryOperation,
      fallbackOperation,
      {
        maxRetries: 1,
        retryDelay: 500,
        timeout: 8000
      }
    );
    
    // 记录降级事件
    fallbackService.logFallbackEvent('getHomePageData', result);
    
    if (result.success && result.data) {
      const endTime = performance.now();
      console.log(`✅ 首页数据获取成功，耗时: ${endTime - startTime}ms，使用降级: ${result.usedFallback}`);
      
      // 缓存结果（降级数据缓存时间较短）
      const cacheTime = result.usedFallback ? 30 * 1000 : 2 * 60 * 1000;
      shortTermCache.set(cacheKey, result.data, { ttl: cacheTime });
      console.log('💾 首页数据已缓存');
      
      return result.data;
    } else {
      const endTime = performance.now();
      console.error(`❌ 首页数据获取失败，耗时: ${endTime - startTime}ms`);
      throw result.error || new Error('首页数据获取失败');
    }
  }

  /**
   * 批量获取首页数据（旧版本兼容）
   * @param options 首页数据选项
   * @returns 首页数据结果
   */
  async getHomePageDataLegacy(options: {
    postsLimit?: number;
    activitiesLimit?: number;
  } = {}): Promise<{
    posts: any[];
    activities: any[];
    errors?: any;
  }> {
    const metricName = 'home_page_data_legacy';
    const startTime = Date.now();
    
    const cacheKey = `home-data-${options.postsLimit || 3}-${options.activitiesLimit || 2}`;
    
    // 检查缓存
    const cached = shortTermCache.get(cacheKey) as HomePageData | undefined;
    if (cached) {
      return {
        posts: cached.posts || [],
        activities: cached.activities || [],
        errors: {}
      };
    }

    try {
      const result: HomePageDataResult = {
        posts: [],
        activities: [],
        errors: {}
      };
      
      // 缓存结果
      shortTermCache.set(cacheKey, result, { ttl: 300000 });
      
      return result;

    } catch (error) {
      // 降级到单独调用
      return {
        posts: [],
        activities: [],
        errors: { general: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }
}
