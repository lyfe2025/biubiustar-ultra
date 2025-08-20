import { useState, useEffect, useCallback, useRef } from 'react';
import { batchDataService, BatchRequest, BatchResponse } from '../services/batchDataService';
import { prefetchService } from '../services/prefetchService';

// Hook配置选项
interface UseOptimizedDataOptions {
  enableCache?: boolean;
  enablePrefetch?: boolean;
  fallbackToIndividual?: boolean;
  dependencies?: any[];
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

// Hook返回值类型
interface UseOptimizedDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  prefetch: () => Promise<void>;
}

/**
 * 优化的数据获取Hook
 * 支持批量获取、缓存和预取策略
 */
export function useOptimizedData<T = any>(
  requests: BatchRequest[],
  options: UseOptimizedDataOptions = {}
): UseOptimizedDataReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestsRef = useRef<BatchRequest[]>(requests);
  const optionsRef = useRef(options);

  // 更新refs
  requestsRef.current = requests;
  optionsRef.current = options;

  /**
   * 执行数据获取
   */
  const fetchData = useCallback(async () => {
    if (!requestsRef.current || requestsRef.current.length === 0) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await batchDataService.batchFetch(requestsRef.current, {
        useCache: optionsRef.current.enableCache !== false,
        fallbackToIndividual: optionsRef.current.fallbackToIndividual !== false
      });

      // 检查是否有错误
      const errors = results.filter(r => r.error).map(r => r.error);
      if (errors.length > 0) {
        const errorMessage = `部分请求失败: ${errors.join(', ')}`;
        setError(errorMessage);
        optionsRef.current.onError?.(errorMessage);
      }

      // 处理成功的结果
      const successResults = results.filter(r => !r.error);
      if (successResults.length > 0) {
        // 如果只有一个请求，直接返回数据
        if (requestsRef.current.length === 1) {
          const resultData = successResults[0]?.data;
          setData(resultData);
          optionsRef.current.onSuccess?.(resultData);
        } else {
          // 多个请求，返回按ID组织的数据对象
          const dataMap = successResults.reduce((acc, result) => {
            if (result.id) {
              acc[result.id] = result.data;
            }
            return acc;
          }, {} as Record<string, any>);
          setData(dataMap as T);
          optionsRef.current.onSuccess?.(dataMap);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      optionsRef.current.onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 预取数据
   */
  const prefetch = useCallback(async () => {
    if (!optionsRef.current.enablePrefetch || !requestsRef.current) {
      return;
    }

    try {
      await batchDataService.batchFetch(requestsRef.current, {
        useCache: true,
        fallbackToIndividual: true
      });
    } catch (err) {
      console.warn('预取数据失败:', err);
    }
  }, []);

  // 依赖变化时重新获取数据
  useEffect(() => {
    fetchData();
  }, options.dependencies || []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    prefetch
  };
}

/**
 * 专门用于首页数据的Hook
 */
export function useHomePageData() {
  const requests: BatchRequest[] = [
    {
      type: 'posts',
      endpoint: '/api/posts',
      params: { page: 1, limit: 3 },
      id: 'home_posts'
    },
    {
      type: 'activities',
      endpoint: '/api/activities/upcoming',
      params: { limit: 2 },
      id: 'home_activities'
    }
  ];

  const optimizedData = useOptimizedData<{
    home_posts: any[];
    home_activities: any[];
  }>(requests, {
    enableCache: true,
    enablePrefetch: true
  });

  // 将嵌套结构转换为扁平结构，以匹配Home页面的期望
  return {
    posts: optimizedData.data?.home_posts || [],
    activities: optimizedData.data?.home_activities || [],
    isLoading: optimizedData.loading,
    isActivitiesLoading: optimizedData.loading, // 统一加载状态
    error: optimizedData.error,
    refetch: optimizedData.refetch
  };
}

/**
 * 专门用于活动页面数据的Hook
 */
export function useActivitiesPageData() {
  const requests: BatchRequest[] = [
    {
      type: 'activities',
      endpoint: '/api/activities',
      params: {},
      id: 'all_activities'
    },
    {
      type: 'categories',
      endpoint: '/api/categories/activities',
      params: { type: 'activity' },
      id: 'activity_categories'
    }
  ];

  const optimizedData = useOptimizedData<{
    all_activities: any[];
    activity_categories: any[];
  }>(requests, {
    enableCache: true,
    enablePrefetch: true
  });

  // 将嵌套结构转换为扁平结构，以匹配Activities页面的期望
  return {
    activities: optimizedData.data?.all_activities || [],
    categories: optimizedData.data?.activity_categories || [],
    isLoading: optimizedData.loading,
    error: optimizedData.error,
    refetch: optimizedData.refetch
  };
}

/**
 * 专门用于帖子详情数据的Hook
 */
export function usePostDetailData(postId: string, userId?: string) {
  const requests: BatchRequest[] = [
    {
      type: 'post_details',
      endpoint: `/api/posts/${postId}`,
      params: { postId, userId },
      id: 'post_details'
    },
    {
      type: 'categories',
      endpoint: '/api/categories/content',
      params: { type: 'content' },
      id: 'content_categories'
    },
    {
      type: 'comments',
      endpoint: `/api/posts/${postId}/comments`,
      params: { postId },
      id: 'post_comments'
    }
  ];

  return useOptimizedData<{
    post_details: {
      post: any;
      isLiked: boolean;
      commentsCount: number;
    };
    content_categories: any[];
    post_comments: any[];
  }>(requests, {
    enableCache: true,
    enablePrefetch: true,
    dependencies: [postId, userId]
  });
}

/**
 * 智能预取Hook - 基于用户行为触发预取
 */
export function useSmartPrefetch() {
  const [isInitialized, setIsInitialized] = useState(false);
  const userActionsRef = useRef<string[]>([]);
  const pageStartTimeRef = useRef<number>(Date.now());

  // 初始化预取服务
  useEffect(() => {
    if (!isInitialized) {
      prefetchService.initialize();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // 监听路由变化
  useEffect(() => {
    const handleRouteChange = () => {
      const currentPath = window.location.pathname;
      pageStartTimeRef.current = Date.now();
      userActionsRef.current = [];
      
      // 触发基于路由的预取
      prefetchService.triggerByRoute(currentPath);
    };

    // 监听popstate事件（浏览器前进后退）
    window.addEventListener('popstate', handleRouteChange);
    
    // 初始触发
    handleRouteChange();

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // 记录用户行为
  const recordUserAction = useCallback((action: string) => {
    userActionsRef.current.push(action);
    
    // 触发智能预取
    const timeOnPage = Date.now() - pageStartTimeRef.current;
    prefetchService.smartPrefetch({
      currentPage: window.location.pathname,
      userActions: userActionsRef.current,
      timeOnPage
    });
  }, []);

  // 预取特定帖子详情
  const prefetchPostDetails = useCallback((postId: string, userId?: string) => {
    prefetchService.prefetchPostDetails(postId, userId);
  }, []);

  return {
    recordUserAction,
    prefetchPostDetails,
    isInitialized
  };
}

/**
 * 性能监控Hook
 */
export function useDataPerformance() {
  const [stats, setStats] = useState<any>(null);

  const refreshStats = useCallback(() => {
    const batchStats = batchDataService.getPerformanceStats();
    const prefetchStats = prefetchService.getStats();
    
    setStats({
      batch: batchStats,
      prefetch: prefetchStats,
      timestamp: Date.now()
    });
  }, []);

  // 定期刷新统计信息
  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 10000); // 每10秒刷新一次
    
    return () => clearInterval(interval);
  }, [refreshStats]);

  return {
    stats,
    refreshStats,
    clearCache: () => {
      batchDataService.clearCache();
      prefetchService.clearCache();
      refreshStats();
    }
  };
}

/**
 * 降级机制Hook - 提供原始API调用的备用方案
 */
export function useFallbackData<T>(
  fallbackFn: () => Promise<T>,
  optimizedRequests: BatchRequest[],
  options: UseOptimizedDataOptions = {}
) {
  const [useFallback, setUseFallback] = useState(false);
  const optimizedResult = useOptimizedData<T>(optimizedRequests, {
    ...options,
    onError: (error) => {
      console.warn('优化数据获取失败，启用降级机制:', error);
      setUseFallback(true);
      options.onError?.(error);
    }
  });

  const [fallbackData, setFallbackData] = useState<T | null>(null);
  const [fallbackLoading, setFallbackLoading] = useState(false);
  const [fallbackError, setFallbackError] = useState<string | null>(null);

  // 执行降级数据获取
  useEffect(() => {
    if (!useFallback) return;

    const fetchFallbackData = async () => {
      setFallbackLoading(true);
      setFallbackError(null);
      
      try {
        const data = await fallbackFn();
        setFallbackData(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setFallbackError(errorMessage);
      } finally {
        setFallbackLoading(false);
      }
    };

    fetchFallbackData();
  }, [useFallback, fallbackFn]);

  // 返回优化结果或降级结果
  if (useFallback) {
    return {
      data: fallbackData,
      loading: fallbackLoading,
      error: fallbackError,
      refetch: async () => {
        setUseFallback(false);
        await optimizedResult.refetch();
      },
      prefetch: optimizedResult.prefetch,
      isFallback: true
    };
  }

  return {
    ...optimizedResult,
    isFallback: false
  };
}