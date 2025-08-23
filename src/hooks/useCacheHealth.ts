/**
 * 缓存健康监控Hook
 * 提供缓存健康数据获取、自动刷新和状态管理功能
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AdminBaseService } from '../services/admin/AdminBaseService';

class CacheHealthService extends AdminBaseService {
  async getHealthData(): Promise<HealthReport> {
    return this.request('/admin/cache/health');
  }

  async getOverview(): Promise<StatsOverview> {
    return this.request('/admin/cache/health/overview');
  }

  async recordInvalidation(cacheKey: string, reason: string): Promise<void> {
    return this.request('/admin/cache/health/invalidation', {
      method: 'POST',
      body: JSON.stringify({ cacheKey, reason })
    });
  }

  async resetHealth(): Promise<void> {
    return this.request('/admin/cache/health/reset', {
      method: 'POST'
    });
  }
}

const cacheHealthService = new CacheHealthService();

// 健康报告数据类型
export interface HealthRecommendation {
  type: 'warning' | 'info' | 'success';
  message: string;
  keys?: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface HealthReport {
  totalInvalidations: number;
  highImpactKeys: Array<{
    key: string;
    frequency: number;
    count: number;
    lastInvalidation: number;
    impact: string;
  }>;
  averageFrequency: number;
  recommendations: HealthRecommendation[];
  timestamp: string;
  healthScore: number;
}

export interface StatsOverview {
  totalKeys: number;
  highImpactCount: number;
  mediumImpactCount: number;
  lowImpactCount: number;
}

export interface CacheHealthHookReturn {
  // 数据状态
  healthData: HealthReport | null;
  overview: StatsOverview | null;
  loading: boolean;
  error: string | null;
  
  // 操作方法
  refresh: () => Promise<void>;
  reset: () => Promise<void>;
  recordInvalidation: (cacheKey: string, reason: string) => Promise<void>;
  
  // 控制方法
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;
  isAutoRefreshEnabled: boolean;
}

interface UseCacheHealthOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // 毫秒
  enableOverview?: boolean;
}

const DEFAULT_OPTIONS: Required<UseCacheHealthOptions> = {
  autoRefresh: true,
  refreshInterval: 30000, // 30秒
  enableOverview: true
};

export const useCacheHealth = (options: UseCacheHealthOptions = {}): CacheHealthHookReturn => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // 状态管理
  const [healthData, setHealthData] = useState<HealthReport | null>(null);
  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(opts.autoRefresh);
  
  // 引用管理
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * 获取缓存健康数据
   */
  const fetchHealthData = useCallback(async (): Promise<void> => {
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 [useCacheHealth] 开始获取缓存健康数据...');
      
      // 检查认证token状态
      const adminToken = localStorage.getItem('adminToken');
      const sessionData = localStorage.getItem('supabase.auth.token');
      console.log('🔑 [useCacheHealth] 认证状态检查:', {
        hasAdminToken: !!adminToken,
        adminTokenLength: adminToken?.length || 0,
        hasSessionData: !!sessionData,
        sessionDataLength: sessionData?.length || 0
      });
      
      // 记录请求URL
      console.log('🌐 [useCacheHealth] 请求URL: /api/admin/cache/health');
      
      const data = await cacheHealthService.getHealthData();
      
      console.log('✅ [useCacheHealth] 缓存健康数据获取成功:', {
        dataType: typeof data,
        dataKeys: data ? Object.keys(data) : [],
        totalInvalidations: data?.totalInvalidations,
        highImpactKeysCount: data?.highImpactKeys?.length || 0,
        healthScore: data?.healthScore,
        hasRecommendations: !!data?.recommendations?.length,
        fullData: data
      });
      
      setHealthData(data);
      
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // 请求被取消，不设置错误状态
        console.log('⚠️ [useCacheHealth] 请求被取消');
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : '获取缓存健康数据失败';
      console.error('❌ [useCacheHealth] 获取缓存健康数据失败:', {
        errorMessage,
        errorName: err instanceof Error ? err.name : 'Unknown',
        errorStack: err instanceof Error ? err.stack : undefined,
        fullError: err
      });
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * 获取统计概览
   */
  const fetchOverview = useCallback(async (): Promise<void> => {
    if (!opts.enableOverview) {
      console.log('📊 [useCacheHealth] 统计概览已禁用，跳过获取');
      return;
    }
    
    try {
      console.log('📊 [useCacheHealth] 开始获取统计概览...');
      console.log('🌐 [useCacheHealth] 概览请求URL: /api/admin/cache/health/overview');
      
      const data = await cacheHealthService.getOverview();
      
      console.log('✅ [useCacheHealth] 统计概览获取成功:', {
        dataType: typeof data,
        dataKeys: data ? Object.keys(data) : [],
        totalKeys: data?.totalKeys,
        highImpactCount: data?.highImpactCount,
        fullData: data
      });
      
      setOverview(data);
      
    } catch (err) {
      console.error('❌ [useCacheHealth] 获取统计概览失败:', {
        errorMessage: err instanceof Error ? err.message : '未知错误',
        errorName: err instanceof Error ? err.name : 'Unknown',
        fullError: err
      });
    }
  }, [opts.enableOverview]);

  /**
   * 刷新所有数据
   */
  const refresh = useCallback(async (): Promise<void> => {
    await Promise.all([
      fetchHealthData(),
      fetchOverview()
    ]);
  }, [fetchHealthData, fetchOverview]);

  /**
   * 重置健康监控数据
   */
  const reset = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await cacheHealthService.resetHealth();
      // 重置成功后刷新数据
      await refresh();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '重置失败';
      setError(errorMessage);
      console.error('重置健康监控数据失败:', err);
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  /**
   * 记录缓存失效事件
   */
  const recordInvalidation = useCallback(async (cacheKey: string, reason: string): Promise<void> => {
    try {
      await cacheHealthService.recordInvalidation(cacheKey, reason);
      
    } catch (err) {
      console.error('记录缓存失效事件失败:', err);
      throw err;
    }
  }, []);

  /**
   * 启动自动刷新
   */
  const startAutoRefresh = useCallback((): void => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setIsAutoRefreshEnabled(true);
    intervalRef.current = setInterval(() => {
      refresh().catch(err => {
        console.error('自动刷新失败:', err);
      });
    }, opts.refreshInterval);
  }, [refresh, opts.refreshInterval]);

  /**
   * 停止自动刷新
   */
  const stopAutoRefresh = useCallback((): void => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsAutoRefreshEnabled(false);
  }, []);

  // 初始化和清理
  useEffect(() => {
    console.log('🚀 [useCacheHealth] Hook初始化，开始加载数据...');
    
    // 初始加载数据
    refresh();
    
    // 启动自动刷新
    if (opts.autoRefresh) {
      startAutoRefresh();
    }
    
    // 清理函数
    return () => {
      console.log('🔄 [useCacheHealth] Hook清理，停止所有请求...');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [refresh, startAutoRefresh, opts.autoRefresh]);

  // 监听自动刷新选项变化
  useEffect(() => {
    if (isAutoRefreshEnabled && !intervalRef.current) {
      startAutoRefresh();
    } else if (!isAutoRefreshEnabled && intervalRef.current) {
      stopAutoRefresh();
    }
  }, [isAutoRefreshEnabled, startAutoRefresh, stopAutoRefresh]);

  return {
    healthData,
    overview,
    loading,
    error,
    refresh,
    reset,
    recordInvalidation,
    startAutoRefresh,
    stopAutoRefresh,
    isAutoRefreshEnabled
  };
};