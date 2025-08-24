/**
 * 页面级数据聚合服务
 * 负责整合各个模块，提供高级的页面数据聚合功能
 */

import { 
  BatchRequest, 
  BatchResponse, 
  PerformanceMetrics
} from './types';
import { CacheManager } from './CacheManager';
import { PerformanceMonitor } from './PerformanceMonitor';
import { FallbackHandler } from './FallbackHandler';
import { DataFetchers } from './fetchers';
import { ActivityService } from '../../lib/activityService';
import { socialService } from '../../lib/socialService/index';
import { AdminService } from '../admin';
import { fallbackService, FallbackResult } from '../fallbackService';
import { defaultCache, shortTermCache, longTermCache } from '../cacheService';
import { performanceMonitor, createPerformanceMiddleware } from '../performanceMonitor';

export class PageDataService {
  private cacheManager: CacheManager;
  private performanceMonitor: PerformanceMonitor;
  private fallbackHandler: FallbackHandler;
  private dataFetchers: DataFetchers;
  private performanceMiddleware = createPerformanceMiddleware();

  // 导入服务（在实际使用时需要正确导入）
  private socialService: any;
  private ActivityService: any;

  constructor() {
    // 初始化各个模块
    this.cacheManager = new CacheManager();
    this.performanceMonitor = new PerformanceMonitor();
    this.fallbackHandler = new FallbackHandler();
    this.dataFetchers = new DataFetchers(
      this.cacheManager,
      this.performanceMonitor,
      this.fallbackHandler
    );

    // 在构造函数中初始化服务引用
    // 这里使用动态导入避免循环依赖
    this.initializeServices();
  }

  private async initializeServices() {
    try {
      // 动态导入服务以避免循环依赖
      const { socialService } = await import('../../lib/socialService/index');
      const { ActivityService } = await import('../../lib/activityService');
      this.socialService = socialService;
      this.ActivityService = ActivityService;
    } catch (error) {
      console.warn('Failed to initialize services for fallback:', error);
    }
  }

  /**
   * 确保服务已初始化
   */
  private async ensureServicesInitialized(): Promise<void> {
    if (!this.socialService || !this.ActivityService) {
      console.log('🔄 服务未初始化，正在初始化...');
      await this.initializeServices();
      
      // 如果仍然没有初始化成功，使用静态导入作为备选方案
      if (!this.socialService) {
        try {
          const { socialService } = await import('../../lib/socialService/index');
          this.socialService = socialService;
          console.log('✅ socialService 初始化成功');
        } catch (error) {
          console.error('❌ socialService 初始化失败:', error);
        }
      }
      
      if (!this.ActivityService) {
        try {
          const { ActivityService } = await import('../../lib/activityService');
          this.ActivityService = ActivityService;
          console.log('✅ ActivityService 初始化成功');
        } catch (error) {
          console.error('❌ ActivityService 初始化失败:', error);
        }
      }
    }
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
    // 确保服务已初始化
    await this.ensureServicesInitialized();
    
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
  private async executeBatchRequests(requests: BatchRequest[], options?: any): Promise<BatchResponse[]> {
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
        const data = await this.socialService.getPosts(page, limit, category);
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
        const data = await this.socialService.getPosts(page, limit, category);
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
    
    for (const req of requests) {
      try {
        let data;
        // 检查endpoint是否包含'upcoming'，而不是检查params.upcoming
        if (req.endpoint?.includes('upcoming') || req.params?.upcoming) {
          data = await this.ActivityService.getUpcomingActivities(req.params?.limit);
        } else {
          const activityService = new this.ActivityService();
          data = await activityService.getActivities();
        }
        results.push({ id: req.id, type: req.type, data });
      } catch (error) {
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
        
        if (req.params?.type === 'content') {
          // 获取内容分类 - 使用 socialService 直接获取，避免分页数据格式问题
          if (this.socialService && typeof this.socialService.getContentCategories === 'function') {
            const language = req.params?.language || 'zh';
            data = await this.socialService.getContentCategories(language);
          } else {
            // 降级方案：使用 AdminService
            const adminService = new AdminService();
            const adminResult = await adminService.getCategories('content');
            // 提取分页数据中的分类数组
            data = (adminResult as any)?.data || [];
          }
        } else if (req.params?.type === 'activity') {
          // 获取活动分类
          if (this.ActivityService && typeof this.ActivityService.getActivityCategories === 'function') {
            const language = req.params?.language || 'zh';
            data = await this.ActivityService.getActivityCategories(language);
          } else {
            // 降级方案：使用 AdminService
            const adminService = new AdminService();
            const adminResult = await adminService.getCategories('activity');
            // 提取分页数据中的分类数组
            data = (adminResult as any)?.data || [];
          }
        } else {
          // 默认获取所有分类
          const adminService = new AdminService();
          const adminResult = await adminService.getCategories();
          if (adminResult && typeof adminResult === 'object' && 'activity' in adminResult && 'content' in adminResult) {
            // 合并活动和内容分类
            const activityCategories = (adminResult as any).activity?.data || [];
            const contentCategories = (adminResult as any).content?.data || [];
            data = [...activityCategories, ...contentCategories];
          } else {
            data = (adminResult as any)?.data || [];
          }
        }
        
        results.push({ id: req.id, type: req.type, data });
      } catch (error) {
        console.error('批量获取分类数据失败:', error);
        results.push({ id: req.id, type: req.type, data: null, error: String(error) });
      }
    }
    return results;
  }

  /**
   * 批量获取帖子详情数据
   */
  private async batchFetchPostDetails(requests: BatchRequest[]): Promise<BatchResponse[]> {
    const results: BatchResponse[] = [];
    
    for (const req of requests) {
      try {
        const postId = req.params?.postId;
        const userId = req.params?.userId;
        
        if (!postId) {
          throw new Error('缺少必需的 postId 参数');
        }
        
        // 并行获取帖子详情和点赞状态
        const [postData, likeData] = await Promise.all([
          this.socialService.getPost(postId),
          userId ? this.socialService.isPostLiked(postId, userId) : Promise.resolve(false)
        ]);
        
        const data = {
          post: postData,
          isLiked: likeData || false
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
        const postId = req.params?.postId;
        
        if (!postId) {
          throw new Error('缺少必需的 postId 参数');
        }
        
        const data = await this.socialService.getPostComments(postId);
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
   * 获取首页数据（帖子 + 活动）
   * @param options 首页数据选项
   * @returns 首页数据结果
   */
  async getHomePageData(options: {
    postsLimit?: number;
    activitiesLimit?: number;
  } = {}): Promise<any> { // HomePageDataResult is not defined, assuming any for now
    return this.dataFetchers.getHomePageData(options);
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
    return this.dataFetchers.getHomePageDataLegacy(options);
  }

  /**
   * 获取帖子详情页数据（帖子详情 + 评论 + 点赞状态 + 分类）
   * @param postId 帖子ID
   * @param userId 用户ID（可选）
   * @returns 帖子详情数据结果
   */
  async getPostDetailData(postId: string, userId?: string): Promise<any> { // PostDetailDataResult is not defined, assuming any for now
    return this.dataFetchers.getPostDetailData(postId, userId);
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
    return this.dataFetchers.getPostDetailDataLegacy(postId, userId);
  }

  /**
   * 获取活动页面数据（活动列表 + 分类）
   * @param options 活动页面选项
   * @returns 活动页面数据结果
   */
  async getActivitiesPageData(options: {
    page?: number;
    limit?: number;
  } = {}): Promise<any> { // ActivitiesPageDataResult is not defined, assuming any for now
    return this.dataFetchers.getActivitiesPageData(options);
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
    return this.dataFetchers.getActivitiesPageDataLegacy(options);
  }

  /**
   * 清理过期缓存
   */
  cleanExpiredCache(): void {
    this.cacheManager.cleanExpiredCache();
  }

  /**
   * 清空所有缓存
   */
  clearCache(): void {
    this.cacheManager.clearCache();
  }

  /**
   * 设置降级机制开关
   * @param enabled 是否启用降级机制
   */
  setFallbackEnabled(enabled: boolean): void {
    this.fallbackHandler.setFallbackEnabled(enabled);
  }

  /**
   * 获取性能统计信息
   * @returns 性能统计数据
   */
  getPerformanceStats(): any {
    return this.performanceMonitor.getPerformanceStats();
  }

  /**
   * 获取缓存统计信息
   * @returns 缓存统计数据
   */
  getCacheStats(): any {
    return this.cacheManager.getCacheStats();
  }

  /**
   * 获取降级统计信息
   * @returns 降级统计数据
   */
  getFallbackStats(): any {
    return this.fallbackHandler.getFallbackStats();
  }

  /**
   * 更新缓存配置
   * @param config 新的缓存配置
   */
  updateCacheConfig(config: Partial<any>): void {
    this.cacheManager.updateCacheConfig(config);
  }

  /**
   * 获取当前缓存配置
   * @returns 当前缓存配置
   */
  getCacheConfig(): any {
    return this.cacheManager.getCacheConfig();
  }
}

// 创建单例实例
const pageDataService = new PageDataService();

// 导出单例实例
export default pageDataService;