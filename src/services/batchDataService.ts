import { ActivityService } from '../lib/activityService';
import { socialService } from '../lib/socialService';
import { AdminService } from './AdminService';
import { fallbackService, FallbackResult } from './fallbackService';
import { defaultCache, shortTermCache, longTermCache } from './cacheService';
import { performanceMonitor, createPerformanceMiddleware } from './performanceMonitor';

// 批量数据获取的请求类型定义
export interface BatchRequest {
  id: string;
  type: 'posts' | 'activities' | 'categories' | 'post_details' | 'comments';
  endpoint: string;
  params?: Record<string, any>;
}

// 返回类型接口
interface HomePageDataResult {
  posts: any[];
  activities: any[];
  errors?: {
    posts?: string;
    activities?: string;
  };
}

interface PostDetailDataResult {
  post: any;
  comments: any[];
  likesCount: number;
  isLiked: boolean;
  categories: any[];
  errors?: {
    post?: string;
    comments?: string;
    likes?: string;
    categories?: string;
  };
}

interface ActivitiesPageDataResult {
  activities: any[];
  categories: any[];
  errors?: {
    activities?: string;
    categories?: string;
  };
}

// 批量数据获取的响应类型定义
export interface BatchResponse {
  id?: string;
  type: string;
  data: any;
  error?: string;
  cached?: boolean;
}

// 缓存配置
interface CacheConfig {
  ttl: number; // 缓存时间（毫秒）
  maxSize: number; // 最大缓存条目数
}

// 缓存条目
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

// 性能监控数据
interface PerformanceMetrics {
  requestId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  cacheHit: boolean;
  batchSize: number;
  errors: string[];
}

// 数据类型定义
interface HomePageData {
  posts: any[];
  activities: any[];
}

interface PostDetailData {
  post: any;
  comments: any[];
  categories: any[];
  isLiked: boolean;
  likesCount: number;
}

interface ActivitiesPageData {
  activities: any[];
  categories: any[];
}

class BatchDataService {
  private cache = new Map<string, CacheEntry>();
  private defaultCacheConfig: CacheConfig = {
    ttl: 5 * 60 * 1000, // 5分钟
    maxSize: 100
  };
  private performanceMetrics: PerformanceMetrics[] = [];
  private enableFallback = true; // 降级机制开关
  private performanceMiddleware = createPerformanceMiddleware();

  // 导入服务（在实际使用时需要正确导入）
  private socialService: any;
  private ActivityService: any;

  constructor() {
    // 在构造函数中初始化服务引用
    // 这里使用动态导入避免循环依赖
    this.initializeServices();
  }

  private async initializeServices() {
    try {
      // 动态导入服务以避免循环依赖
      const { socialService } = await import('../lib/socialService');
      const { ActivityService } = await import('../lib/activityService');
      this.socialService = socialService;
      this.ActivityService = ActivityService;
    } catch (error) {
      console.warn('Failed to initialize services for fallback:', error);
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
    const requestId = this.generateRequestId();
    const batchStartTime = Date.now();
    const metrics: PerformanceMetrics = {
      requestId,
      startTime: batchStartTime,
      cacheHit: false,
      batchSize: requests.length,
      errors: []
    };

    try {
      // 检查缓存
      if (options?.useCache !== false) {
        const cachedResults = this.getCachedResults(requests);
        if (cachedResults.length === requests.length) {
          metrics.cacheHit = true;
          metrics.endTime = Date.now();
          metrics.duration = metrics.endTime - batchStartTime;
          this.recordMetrics(metrics);
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
      this.recordMetrics(metrics);

      return results;
    } catch (error) {
      metrics.errors.push(error instanceof Error ? error.message : String(error));
      
      // 降级机制：如果批量请求失败，尝试单独请求
      if (this.enableFallback && options?.fallbackToIndividual !== false) {
        console.warn('批量请求失败，启用降级机制:', error);
        return await this.fallbackToIndividualRequests(requests);
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
    
    for (const req of requests) {
      try {
        let data;
        // 检查endpoint是否包含'upcoming'，而不是检查params.upcoming
        if (req.endpoint?.includes('upcoming') || req.params?.upcoming) {
          data = await ActivityService.getUpcomingActivities(req.params?.limit);
        } else {
          const activityService = new ActivityService();
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
        if (req.params?.type === 'activity') {
          data = await ActivityService.getActivityCategories();
        } else {
          data = await socialService.getContentCategories();
        }
        results.push({ id: req.id, type: req.type, data });
      } catch (error) {
        results.push({ id: req.id, type: req.type, data: null, error: String(error) });
      }
    }
    
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
        console.log('🔍 BatchDataService: 批量获取帖子详情 - 调用 socialService.getPost，帖子ID:', postId)
        const [post, isLiked, commentsCount] = await Promise.all([
          socialService.getPost(postId),
          userId ? socialService.isPostLiked(postId, userId) : Promise.resolve(false),
          socialService.getPostCommentsCount(postId)
        ]);
        console.log('✅ BatchDataService: 批量获取帖子详情 - 获取帖子数据成功，阅读量:', post?.views_count)
        
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
   * 降级机制：单独执行每个请求
   */
  private async fallbackToIndividualRequests(requests: BatchRequest[]): Promise<BatchResponse[]> {
    const results: BatchResponse[] = [];
    
    for (const request of requests) {
      try {
        const batchResult = await this.executeBatchRequests([request]);
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
   * 缓存相关方法
   */
  private getCacheKey(request: BatchRequest): string {
    return `${request.type}_${JSON.stringify(request.params || {})}`;
  }

  private getCachedResults(requests: BatchRequest[]): BatchResponse[] {
    const results: BatchResponse[] = [];
    
    for (const request of requests) {
      const cacheKey = this.getCacheKey(request);
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        results.push({
          id: request.id,
          type: request.type,
          data: cached.data,
          cached: true
        });
      } else {
        // 如果有任何一个请求没有缓存，返回空数组
        return [];
      }
    }
    
    return results;
  }

  private cacheResults(requests: BatchRequest[], results: BatchResponse[]): void {
    // 清理过期缓存
    this.cleanExpiredCache();
    
    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.defaultCacheConfig.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    // 缓存新结果
    requests.forEach((request, index) => {
      const result = results[index];
      if (result && !result.error) {
        const cacheKey = this.getCacheKey(request);
        this.cache.set(cacheKey, {
          data: result.data,
          timestamp: Date.now(),
          ttl: this.defaultCacheConfig.ttl
        });
      }
    });
  }

  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 性能监控相关方法
   */
  private generateRequestId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private recordMetrics(metrics: PerformanceMetrics): void {
    this.performanceMetrics.push(metrics);
    
    // 只保留最近100条记录
    if (this.performanceMetrics.length > 100) {
      this.performanceMetrics.shift();
    }
    
    // 在开发环境下输出性能日志
    if (process.env.NODE_ENV === 'development') {
      console.log('批量数据获取性能:', {
        requestId: metrics.requestId,
        duration: metrics.duration,
        batchSize: metrics.batchSize,
        cacheHit: metrics.cacheHit,
        errors: metrics.errors
      });
    }
  }

  /**
   * 获取性能统计信息
   */
  getPerformanceStats() {
    const recentMetrics = this.performanceMetrics.slice(-50); // 最近50条记录
    
    if (recentMetrics.length === 0) {
      return null;
    }
    
    const totalRequests = recentMetrics.length;
    const cacheHits = recentMetrics.filter(m => m.cacheHit).length;
    const avgDuration = recentMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / totalRequests;
    const errorRate = recentMetrics.filter(m => m.errors.length > 0).length / totalRequests;
    
    return {
      totalRequests,
      cacheHitRate: cacheHits / totalRequests,
      avgDuration,
      errorRate,
      cacheSize: this.cache.size
    };
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 设置降级机制开关
   */
  setFallbackEnabled(enabled: boolean): void {
    this.enableFallback = enabled;
  }

  /**
   * 缓存相关辅助方法
   */
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data as T;
    }
    return null;
  }

  private setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * 获取首页数据（帖子 + 活动）
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
      return cached;
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
    const startTime = this.performanceMiddleware.onRequest(metricName, 'GET');
    
    const cacheKey = `home-data-${options.postsLimit || 3}-${options.activitiesLimit || 2}`;
    
    // 检查缓存
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      this.performanceMiddleware.onResponse(startTime, metricName, 'GET', 200);
      return {
        posts: cached.data.posts || [],
        activities: cached.data.activities || [],
        errors: cached.data.errors || {}
      };
    }

    const requestStartTime = Date.now();
    
    try {
      // 使用新的批量API端点
      const requests: BatchRequest[] = [
        {
          id: 'posts',
          type: 'posts',
          endpoint: '/api/posts',
          params: { limit: options.postsLimit || 3 }
        },
        {
          id: 'activities',
          type: 'activities',
          endpoint: '/api/activities/upcoming',
          params: { upcoming: true, limit: options.activitiesLimit || 2 }
        }
      ];
      
      const batchResults = await this.batchFetch(requests, { useCache: false });
      
      const result: HomePageDataResult = {
        posts: [],
        activities: [],
        errors: {}
      };
      
      // 处理批量结果
      batchResults.forEach(response => {
        if (response.id === 'posts') {
          if (response.error) {
            result.errors.posts = response.error;
          } else {
            result.posts = response.data || [];
          }
        } else if (response.id === 'activities') {
          if (response.error) {
            result.errors.activities = response.error;
          } else {
            result.activities = response.data || [];
          }
        }
      });

      // 缓存结果
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
        ttl: this.defaultCacheConfig.ttl
      });

      this.performanceMiddleware.onResponse(startTime, metricName, 'GET', 200);
      return result;

    } catch (error) {
      this.performanceMiddleware.onResponse(startTime, metricName, 'GET', 500, error instanceof Error ? error.message : 'Unknown error');
      // 降级到单独调用
      return this.fallbackToSeparateCalls(options);
    }
  }

  /**
   * 获取帖子详情页数据（帖子详情 + 评论 + 点赞状态 + 分类）
   */
  async getPostDetailData(postId: string, userId?: string): Promise<PostDetailDataResult> {
    const cacheKey = `post-detail-${postId}-${userId || 'anonymous'}`;
    
    // 检查缓存
    const cached = shortTermCache.get<PostDetailData>(cacheKey);
    if (cached) {
      console.log('🎯 使用缓存的帖子详情数据');
      return cached;
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
    const startTime = this.performanceMiddleware.onRequest(metricName, 'GET');
    
    const cacheKey = `post-detail-${postId}-${userId || 'anonymous'}`;
    
    // 检查缓存
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      this.performanceMiddleware.onResponse(startTime, metricName, 'GET', 200);
      return cached.data;
    }

    try {
      // 使用新的批量API端点
      const requests: BatchRequest[] = [
        {
          id: 'post-details',
          type: 'post_details',
          endpoint: `/api/posts/${postId}`,
          params: { postId, userId }
        },
        {
          id: 'comments',
          type: 'comments',
          endpoint: `/api/posts/${postId}/comments`,
          params: { postId }
        },
        {
          id: 'categories',
          type: 'categories',
          endpoint: '/api/categories/content',
          params: { type: 'content' }
        }
      ];
      
      const batchResults = await this.batchFetch(requests, { useCache: false });
      
      const result: PostDetailDataResult = {
        post: null,
        comments: [],
        likesCount: 0,
        isLiked: false,
        categories: [],
        errors: {}
      };
      
      // 处理批量结果
      batchResults.forEach(response => {
        if (response.id === 'post-details') {
          if (response.error) {
            result.errors.post = response.error;
          } else {
            result.post = response.data?.post || null;
            result.isLiked = response.data?.isLiked || false;
            result.likesCount = response.data?.post?.likes_count || 0;
          }
        } else if (response.id === 'comments') {
          if (response.error) {
            result.errors.comments = response.error;
          } else {
            result.comments = response.data || [];
          }
        } else if (response.id === 'categories') {
          if (response.error) {
            result.errors.categories = response.error;
          } else {
            result.categories = response.data || [];
          }
        }
      });

      // 缓存结果
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
        ttl: this.defaultCacheConfig.ttl
      });

      this.performanceMiddleware.onResponse(startTime, metricName, 'GET', 200);
      return result;

    } catch (error) {
      this.performanceMiddleware.onResponse(startTime, metricName, 'GET', 500, error instanceof Error ? error.message : 'Unknown error');
      // 降级到单独调用
      return this.fallbackToSeparatePostDetailCalls(postId, userId);
    }
  }

  /**
   * 获取活动页面数据（活动列表 + 分类）
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
      return cached;
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
    const startTime = this.performanceMiddleware.onRequest(metricName, 'GET');
    
    const cacheKey = `activities-data-${options.page || 1}-${options.limit || 10}`;
    
    // 检查缓存
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      this.performanceMiddleware.onResponse(startTime, metricName, 'GET', 200);
      return cached.data;
    }

    try {
      // 使用新的批量API端点
      const requests: BatchRequest[] = [
        {
          id: 'activities',
          type: 'activities',
          endpoint: '/api/activities',
          params: { page: options.page || 1, limit: options.limit || 10 }
        },
        {
          id: 'categories',
          type: 'categories',
          endpoint: '/api/categories/activities',
          params: { type: 'activity' }
        }
      ];
      
      const batchResults = await this.batchFetch(requests, { useCache: false });
      
      const result: ActivitiesPageDataResult = {
        activities: [],
        categories: [],
        errors: {}
      };
      
      // 处理批量结果
      batchResults.forEach(response => {
        if (response.id === 'activities') {
          if (response.error) {
            result.errors.activities = response.error;
          } else {
            result.activities = response.data || [];
          }
        } else if (response.id === 'categories') {
          if (response.error) {
            result.errors.categories = response.error;
          } else {
            result.categories = response.data || [];
          }
        }
      });

      // 缓存结果
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
        ttl: this.defaultCacheConfig.ttl
      });

      this.performanceMiddleware.onResponse(startTime, metricName, 'GET', 200);
      return result;

    } catch (error) {
      this.performanceMiddleware.onResponse(startTime, metricName, 'GET', 500, error instanceof Error ? error.message : 'Unknown error');
      // 降级到单独调用
      return this.fallbackToSeparateActivitiesCalls(options);
    }
  }

  /**
   * 降级方案：单独调用首页数据
   */
  private async fallbackToSeparateCalls(options: {
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
    }

    return result;
  }

  /**
   * 降级方案：单独调用帖子详情数据
   */
  private async fallbackToSeparatePostDetailCalls(postId: string, userId?: string): Promise<PostDetailDataResult> {
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
    }

    return result;
  }

  /**
   * 降级方案：单独调用活动页面数据
   */
  private async fallbackToSeparateActivitiesCalls(options: {
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
    }

    return result;
  }
}

// 导出单例实例
export const batchDataService = new BatchDataService();
export default batchDataService;