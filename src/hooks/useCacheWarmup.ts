/**
 * 缓存预热 Hook
 * 提供缓存数据的访问和管理功能
 */

import { useState, useEffect, useCallback } from 'react';
import { cacheWarmupService } from '../services/CacheWarmupService';

interface UseCacheWarmupReturn {
  isInitialized: boolean;
  getCache: <T = any>(key: string) => T | null;
  refreshCache: (key: string) => Promise<void>;
  clearCache: () => void;
  cacheStatus: {
    isWarmedUp: boolean;
    cacheSize: number;
    cacheKeys: string[];
  };
}

/**
 * 缓存预热 Hook
 */
export const useCacheWarmup = (): UseCacheWarmupReturn => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [cacheStatus, setCacheStatus] = useState({
    isWarmedUp: false,
    cacheSize: 0,
    cacheKeys: []
  });

  // 初始化缓存预热
  useEffect(() => {
    const initializeCache = async () => {
      try {
        await cacheWarmupService.initialize();
        setIsInitialized(true);
        setCacheStatus(cacheWarmupService.getCacheStatus());
      } catch (error) {
        console.error('缓存预热初始化失败:', error);
      }
    };

    initializeCache();
  }, []);

  // 获取缓存数据
  const getCache = useCallback(<T = any>(key: string): T | null => {
    return cacheWarmupService.getCache<T>(key);
  }, []);

  // 刷新特定缓存
  const refreshCache = useCallback(async (key: string): Promise<void> => {
    await cacheWarmupService.refreshCache(key);
    setCacheStatus(cacheWarmupService.getCacheStatus());
  }, []);

  // 清空所有缓存
  const clearCache = useCallback((): void => {
    cacheWarmupService.clearCache();
    setCacheStatus(cacheWarmupService.getCacheStatus());
  }, []);

  return {
    isInitialized,
    getCache,
    refreshCache,
    clearCache,
    cacheStatus
  };
};

/**
 * 特定缓存数据的 Hook
 */
export const useCachedData = <T = any>(key: string, fallbackFetch?: () => Promise<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { getCache, refreshCache } = useCacheWarmup();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 先尝试从缓存获取
      const cachedData = getCache<T>(key);
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return;
      }

      // 如果缓存中没有且提供了fallback函数，则调用fallback
      if (fallbackFetch) {
        const freshData = await fallbackFetch();
        setData(freshData);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [key, getCache, fallbackFetch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(async () => {
    await refreshCache(key);
    await fetchData();
  }, [key, refreshCache, fetchData]);

  return {
    data,
    loading,
    error,
    refresh
  };
};

/**
 * 分类数据缓存 Hook
 */
export const useCachedCategories = () => {
  return useCachedData('categories');
};

/**
 * 最新帖子缓存 Hook
 */
export const useCachedRecentPosts = () => {
  return useCachedData('recent_posts');
};

/**
 * 最新活动缓存 Hook
 */
export const useCachedRecentActivities = () => {
  return useCachedData('recent_activities');
};

/**
 * 系统设置缓存 Hook
 */
export const useCachedSystemSettings = () => {
  return useCachedData('system_settings');
};

/**
 * 用户统计缓存 Hook
 */
export const useCachedUserStats = () => {
  return useCachedData('user_stats');
};