/**
 * 活动页面数据获取器
 * 负责活动页面数据（活动列表 + 分类）的获取逻辑
 */

import { ActivitiesPageDataResult, ActivitiesPageData } from '../types';
import { defaultCache } from '../../cacheService';
import { fallbackService, FallbackResult } from '../../fallbackService';

export class ActivitiesDataFetcher {
  /**
   * 获取活动页面数据（活动列表 + 分类）
   * @param options 活动页面选项
   * @returns 活动页面数据结果
   */
  async getActivitiesPageData(options: {
    page?: number;
    limit?: number;
  } = {}): Promise<ActivitiesPageDataResult> {
    const cacheKey = `activities-page-data-${options.page || 1}-${options.limit || 10}`;
    
    // 检查缓存
    const cached = defaultCache.get<ActivitiesPageData>(cacheKey);
    if (cached) {
      console.log('🎯 使用缓存的活动页面数据');
      return cached as ActivitiesPageDataResult;
    }

    const startTime = performance.now();
    
    // 主要操作：批量API
    const primaryOperation = async (): Promise<ActivitiesPageData> => {
      console.log('🚀 开始批量获取活动页面数据');
      const response = await fetch('/api/batch/activities-data');
      if (!response.ok) {
        throw new Error(`批量API失败: ${response.status}`);
      }
      return await response.json();
    };
    
    // 降级操作：独立API调用
    const fallbackOperation = async (): Promise<ActivitiesPageData> => {
      console.log('🔄 降级到独立API调用');
      const [activitiesResponse, categoriesResponse] = await Promise.all([
        fetch('/api/activities'),
        fetch('/api/categories/activities')
      ]);
      
      if (!activitiesResponse.ok || !categoriesResponse.ok) {
        throw new Error('独立API调用失败');
      }
      
      const [activitiesData, categoriesData] = await Promise.all([
        activitiesResponse.json(),
        categoriesResponse.json()
      ]);
      
      return {
        activities: activitiesData,
        categories: categoriesData
      };
    };

    // 使用降级服务执行操作
    const result: FallbackResult<ActivitiesPageData> = await fallbackService.executeWithFallback(
      primaryOperation,
      fallbackOperation,
      {
        maxRetries: 1,
        retryDelay: 500,
        timeout: 8000
      }
    );
    
    // 记录降级事件
    fallbackService.logFallbackEvent('getActivitiesPageData', result);
    
    if (result.success && result.data) {
      const endTime = performance.now();
      console.log(`✅ 活动页面数据获取成功，耗时: ${endTime - startTime}ms，使用降级: ${result.usedFallback}`);
      
      // 缓存结果（降级数据缓存时间较短）
      const cacheTime = result.usedFallback ? 2 * 60 * 1000 : 5 * 60 * 1000;
      defaultCache.set(cacheKey, result.data, { ttl: cacheTime });
      console.log('💾 活动页面数据已缓存');
      
      return result.data;
    } else {
      const endTime = performance.now();
      console.error(`❌ 活动页面数据获取失败，耗时: ${endTime - startTime}ms`);
      throw result.error || new Error('活动页面数据获取失败');
    }
  }

  /**
   * 批量获取活动页面数据（旧版本兼容）
   * @param options 活动页面选项
   * @returns 活动页面数据结果
   */
  async getActivitiesPageDataLegacy(options: {
    page?: number;
    limit?: number;
  } = {}): Promise<{
    activities: any[];
    categories: any[];
    errors?: any;
  }> {
    const metricName = 'activities_page_data_legacy';
    const startTime = Date.now();
    
    const cacheKey = `activities-data-${options.page || 1}-${options.limit || 10}`;
    
    // 检查缓存
    const cached = defaultCache.get(cacheKey);
    if (cached) {
      return cached as ActivitiesPageDataResult;
    }

    try {
      const result: ActivitiesPageDataResult = {
        activities: [],
        categories: [],
        errors: {}
      };
      
      // 缓存结果
      defaultCache.set(cacheKey, result, { ttl: 300000 });
      
      return result;

    } catch (error) {
      // 降级到单独调用
      return {
        activities: [],
        categories: [],
        errors: { general: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }
}
