/**
 * 核心批量请求处理器
 * 负责批量请求的核心处理逻辑，包括请求分组、并行处理和结果聚合
 */

import { 
  BatchRequest, 
  BatchResponse, 
  PerformanceMetrics
} from './types';
import { CacheManager } from './CacheManager';
import { PerformanceMonitor } from './PerformanceMonitor';
import { FallbackHandler } from './FallbackHandler';
import { ActivityService } from '../../lib/activityService';
import { socialService } from '../../lib/socialService/index';

// 验证导入的服务是否可用
if (!ActivityService) {
  console.error('❌ BatchRequestProcessor: ActivityService 导入失败，这可能导致运行时错误');
}

if (!socialService) {
  console.error('❌ BatchRequestProcessor: socialService 导入失败，这可能导致运行时错误');
}

export class BatchRequestProcessor {
  private cacheManager: CacheManager;
  private performanceMonitor: PerformanceMonitor;
  private fallbackHandler: FallbackHandler;

  constructor(
    cacheManager: CacheManager,
    performanceMonitor: PerformanceMonitor,
    fallbackHandler: FallbackHandler
  ) {
    this.cacheManager = cacheManager;
    this.performanceMonitor = performanceMonitor;
    this.fallbackHandler = fallbackHandler;
  }

  /**
   * 批量获取数据的主要方法
   * @param requests 批量请求数组
   * @param options 可选配置
   */
  async batchFetch(requests: BatchRequest[], options?: {
    useCache?: boolean;
    fallbackToIndividual?: boolean;
    timeout?: number;
  }): Promise<BatchResponse[]> {
    const requestId = this.performanceMonitor.generateRequestId();
    const batchStartTime = Date.now();
    const metrics: PerformanceMetrics = {
      requestId,
      requestType: 'batch',
      timestamp: batchStartTime,
      operation: 'batch_fetch',
      method: 'POST',
      startTime: batchStartTime,
      endTime: 0, // 将在完成时设置
      duration: 0, // 将在完成时计算
      cacheHit: false,
      batchSize: requests.length,
      success: false
    };

    try {
      // 检查缓存
      if (options?.useCache !== false) {
        const cachedResults = this.getCachedResults(requests);
        if (cachedResults.length === requests.length) {
          metrics.cacheHit = true;
          metrics.endTime = Date.now();
          metrics.duration = metrics.endTime - batchStartTime;
          metrics.success = true;
          this.performanceMonitor.recordMetrics(metrics);
          return cachedResults;
        }
      }

      // 执行批量请求
      const results = await this.executeBatchRequests(requests, options);
      
      // 缓存结果
      if (options?.useCache !== false) {
        this.cacheResults(requests, results);
      }

      metrics.endTime = Date.now();
      metrics.duration = metrics.endTime - batchStartTime;
      metrics.success = true;
      this.performanceMonitor.recordMetrics(metrics);

      return results;
    } catch (error) {
      metrics.endTime = Date.now();
      metrics.duration = metrics.endTime - batchStartTime;
      metrics.error = error instanceof Error ? error.message : String(error);
      metrics.success = false;
      this.performanceMonitor.recordMetrics(metrics);
      
      // 降级机制：如果批量请求失败，尝试单独请求
      if (this.fallbackHandler.shouldFallback(error) && options?.fallbackToIndividual !== false) {
        console.warn('批量请求失败，启用降级机制:', error);
        return await this.fallbackHandler.fallbackToIndividualRequests(requests, this.executeBatchRequests.bind(this));
      }
      
      throw error;
    }
  }

  /**
   * 执行批量请求的核心逻辑
   */
  async executeBatchRequests(requests: BatchRequest[], options?: any): Promise<BatchResponse[]> {
    const results: BatchResponse[] = [];
    
    // 按类型分组请求，提高批量处理效率
    const groupedRequests = this.groupRequestsByType(requests);
    
    // 并行处理不同类型的请求
    const promises = Object.entries(groupedRequests).map(async ([type, typeRequests]) => {
      try {
        switch (type) {
          case 'posts':
            return await this.batchFetchPosts(typeRequests);
          case 'activities':
            return await this.batchFetchActivities(typeRequests);
          case 'categories':
            return await this.batchFetchCategories(typeRequests);
          case 'post_details':
            return await this.batchFetchPostDetails(typeRequests);
          case 'comments':
            return await this.batchFetchComments(typeRequests);
          default:
            throw new Error(`不支持的批量请求类型: ${type}`);
        }
      } catch (error) {
        // 为每个失败的请求返回错误响应
        return typeRequests.map(req => ({
          id: req.id,
          type: req.type,
          data: null,
          error: error instanceof Error ? error.message : String(error)
        }));
      }
    });

    const batchResults = await Promise.all(promises);
    
    // 合并所有结果
    batchResults.forEach(batch => {
      results.push(...batch);
    });

    return results;
  }

  /**
   * 按类型分组请求
   */
  private groupRequestsByType(requests: BatchRequest[]): Record<string, BatchRequest[]> {
    return requests.reduce((groups, request) => {
      if (!groups[request.type]) {
        groups[request.type] = [];
      }
      groups[request.type].push(request);
      return groups;
    }, {} as Record<string, BatchRequest[]>);
  }

  /**
   * 批量获取帖子数据
   */
  private async batchFetchPosts(requests: BatchRequest[]): Promise<BatchResponse[]> {
    // 如果只有一个请求，直接调用现有API
    if (requests.length === 1) {
      const req = requests[0];
      try {
        const page = req.params?.page || 1;
        const limit = req.params?.limit || 10;
        const category = req.params?.category;
        const data = await socialService.getPosts(page, limit, category);
        return [{ id: req.id, type: req.type, data }];
      } catch (error) {
        return [{ id: req.id, type: req.type, data: null, error: String(error) }];
      }
    }

    // 多个请求的批量处理逻辑
    const results: BatchResponse[] = [];
    for (const req of requests) {
      try {
        const page = req.params?.page || 1;
        const limit = req.params?.limit || 10;
        const category = req.params?.category;
        const data = await socialService.getPosts(page, limit, category);
        results.push({ id: req.id, type: req.type, data });
      } catch (error) {
        results.push({ id: req.id, type: req.type, data: null, error: String(error) });
      }
    }
    return results;
  }

  /**
   * 批量获取活动数据
   */
  private async batchFetchActivities(requests: BatchRequest[]): Promise<BatchResponse[]> {
    const results: BatchResponse[] = [];
    
    // 验证 ActivityService 及其方法是否可用
    if (!ActivityService || typeof ActivityService.getUpcomingActivities !== 'function') {
      console.error('❌ BatchRequestProcessor: ActivityService 或相关方法未定义，无法获取活动数据');
      // 返回错误结果而不是抛出异常
      for (const req of requests) {
        results.push({ 
          id: req.id, 
          type: req.type, 
          data: null, 
          error: 'ActivityService 或相关方法未定义，无法获取活动数据' 
        });
      }
      return results;
    }
    
    for (const req of requests) {
      try {
        let data;
        // 检查endpoint是否包含'upcoming'，而不是检查params.upcoming
        if (req.endpoint?.includes('upcoming') || req.params?.upcoming) {
          data = await ActivityService.getUpcomingActivities(req.params?.limit);
        } else {
          // 创建 ActivityService 实例来调用实例方法
          const activityService = new ActivityService();
          data = await activityService.getActivities();
        }
        results.push({ id: req.id, type: req.type, data });
      } catch (error) {
        console.error('❌ BatchRequestProcessor: 获取活动数据失败:', error);
        results.push({ id: req.id, type: req.type, data: null, error: String(error) });
      }
    }
    
    return results;
  }

  /**
   * 批量获取分类数据
   */
  private async batchFetchCategories(requests: BatchRequest[]): Promise<BatchResponse[]> {
    const results: BatchResponse[] = [];
    
    for (const req of requests) {
      try {
        let data;
        const requestType = req.params?.type;
        
        console.log(`[BatchRequestProcessor] Processing categories request: ${req.id}, type: ${requestType}`);
        
        // 严格检查请求类型并分别处理
        if (requestType === 'activity') {
          // 活动分类请求 - 多重检查确保ActivityService可用
          if (
            typeof ActivityService !== 'undefined' && 
            ActivityService !== null &&
            typeof ActivityService.getActivityCategories === 'function'
          ) {
            console.log(`[BatchRequestProcessor] Using ActivityService.getActivityCategories for request ${req.id}`);
            data = await ActivityService.getActivityCategories(req.params?.language);
          } else {
            console.warn(`[BatchRequestProcessor] ActivityService.getActivityCategories not available for request ${req.id}, using fallback`);
            // 降级到内容分类
            if (
              typeof socialService !== 'undefined' && 
              socialService !== null &&
              typeof socialService.getContentCategories === 'function'
            ) {
              data = await socialService.getContentCategories(req.params?.language);
            } else {
              throw new Error('Both ActivityService and socialService are unavailable');
            }
          }
        } else {
          // 内容分类请求（默认）
          console.log(`[BatchRequestProcessor] Using socialService.getContentCategories for request ${req.id}`);
          if (
            typeof socialService !== 'undefined' && 
            socialService !== null &&
            typeof socialService.getContentCategories === 'function'
          ) {
            data = await socialService.getContentCategories(req.params?.language);
          } else {
            throw new Error('socialService.getContentCategories is not available');
          }
        }
        
        console.log(`[BatchRequestProcessor] Successfully fetched categories for request ${req.id}:`, data?.length || 0, 'items');
        
        results.push({
          id: req.id,
          type: req.type,
          data: data || []
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[BatchRequestProcessor] Failed to fetch categories for request ${req.id}:`, errorMessage, error);
        
        results.push({
          id: req.id,
          type: req.type,
          data: [], // 提供空数组作为降级数据
          error: errorMessage
        });
      }
    }
    
    console.log(`[BatchRequestProcessor] Completed ${results.length} category requests`);
    return results;
  }

  /**
   * 批量获取帖子详情
   */
  private async batchFetchPostDetails(requests: BatchRequest[]): Promise<BatchResponse[]> {
    const results: BatchResponse[] = [];
    
    for (const req of requests) {
      try {
        const postId = req.params?.postId;
        const userId = req.params?.userId;
        
        // 并行获取帖子相关的所有数据
        console.log('🔍 BatchRequestProcessor: 批量获取帖子详情 - 调用 socialService.getPost，帖子ID:', postId);
        const [post, isLiked, commentsCount] = await Promise.all([
          socialService.getPost(postId),
          userId ? socialService.isPostLiked(postId, userId) : Promise.resolve(false),
          socialService.getPostCommentsCount(postId)
        ]);
        console.log('✅ BatchRequestProcessor: 批量获取帖子详情 - 获取帖子数据成功，阅读量:', post?.views_count);
        
        const data = {
          post,
          isLiked,
          commentsCount
        };
        
        results.push({ id: req.id, type: req.type, data });
      } catch (error) {
        results.push({ id: req.id, type: req.type, data: null, error: String(error) });
      }
    }
    
    return results;
  }

  /**
   * 批量获取评论数据
   */
  private async batchFetchComments(requests: BatchRequest[]): Promise<BatchResponse[]> {
    const results: BatchResponse[] = [];
    
    for (const req of requests) {
      try {
        const data = await socialService.getPostComments(req.params?.postId);
        results.push({ id: req.id, type: req.type, data });
      } catch (error) {
        results.push({ id: req.id, type: req.type, data: null, error: String(error) });
      }
    }
    
    return results;
  }

  /**
   * 获取缓存结果
   */
  private getCachedResults(requests: BatchRequest[]): BatchResponse[] {
    const results: BatchResponse[] = [];
    
    for (const request of requests) {
      const cacheKey = this.cacheManager.getCacheKey(request);
      const cached = this.cacheManager.getFromCache(cacheKey);
      
      if (cached) {
        results.push({
          id: request.id,
          type: request.type,
          data: cached,
          cached: true
        });
      } else {
        // 如果有任何一个请求没有缓存，返回空数组
        return [];
      }
    }
    
    return results;
  }

  /**
   * 缓存结果
   */
  private cacheResults(requests: BatchRequest[], results: BatchResponse[]): void {
    const requestMap = new Map(requests.map(req => [req.id, req]));
    
    for (const result of results) {
      if (result.id && result.data && !result.error) {
        const request = requestMap.get(result.id);
        if (request) {
          const cacheKey = this.cacheManager.getCacheKey(request);
          this.cacheManager.setCache(cacheKey, result.data, 300000); // 5分钟缓存
        }
      }
    }
  }

  /**
   * 获取处理器统计信息
   */
  getProcessorStats(): {
    performanceStats: any;
    cacheStats: any;
    fallbackStats: any;
  } {
    return {
      performanceStats: this.performanceMonitor.getPerformanceStats(),
      cacheStats: this.cacheManager.getCacheStats(),
      fallbackStats: this.fallbackHandler.getFallbackStats()
    };
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.cacheManager.cleanExpiredCache();
    this.performanceMonitor.clearMetrics();
  }
}

export default BatchRequestProcessor;