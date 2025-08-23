/**
 * 基础数据获取器
 * 负责通用的数据获取方法和批量处理逻辑
 */

import { CacheManager } from '../CacheManager';

export class BaseDataFetcher {
  constructor(private cacheManager: CacheManager) {}

  /**
   * 通用数据获取方法
   * @param endpoint API端点
   * @param options 请求选项
   * @returns 数据结果
   */
  async fetchData<T>(endpoint: string, options?: {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    cache?: boolean;
    cacheKey?: string;
    cacheTtl?: number;
  }): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      cache = true,
      cacheKey,
      cacheTtl = 5 * 60 * 1000 // 5分钟默认缓存
    } = options || {};

    const finalCacheKey = cacheKey || `fetch-${endpoint}-${JSON.stringify(options)}`;

    // 检查缓存
    if (cache) {
      const cached = this.cacheManager.getFromCache(finalCacheKey);
      if (cached) {
        console.log(`🎯 使用缓存数据: ${endpoint}`);
        return cached as T;
      }
    }

    const startTime = performance.now();
    
    try {
      console.log(`🚀 开始获取数据: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: body ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        throw new Error(`API调用失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const endTime = performance.now();
      
      console.log(`✅ 数据获取成功: ${endpoint}，耗时: ${endTime - startTime}ms`);

      // 缓存结果
      if (cache) {
        this.cacheManager.setCache(finalCacheKey, data, cacheTtl);
        console.log(`💾 数据已缓存: ${endpoint}`);
      }

      return data;
    } catch (error) {
      const endTime = performance.now();
      console.error(`❌ 数据获取失败: ${endpoint}，耗时: ${endTime - startTime}ms`, error);
      throw error;
    }
  }

  /**
   * 批量数据获取方法
   * @param requests 批量请求数组
   * @param options 批量请求选项
   * @returns 批量响应数组
   */
  async batchFetchData(requests: {
    id: string;
    endpoint: string;
    options?: any;
  }[], options?: {
    useCache?: boolean;
    parallel?: boolean;
    timeout?: number;
  }): Promise<{ id: string; data?: any; error?: string }[]> {
    const {
      useCache = true,
      parallel = true,
      timeout = 10000
    } = options || {};

    const results: { id: string; data?: any; error?: string }[] = [];

    if (parallel) {
      // 并行执行
      const promises = requests.map(async (request) => {
        try {
          const data = await Promise.race([
            this.fetchData(request.endpoint, {
              ...request.options,
              cache: useCache
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('请求超时')), timeout)
            )
          ]);
          return { id: request.id, data };
        } catch (error) {
          return {
            id: request.id,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      });

      return await Promise.all(promises);
    } else {
      // 串行执行
      for (const request of requests) {
        try {
          const data = await this.fetchData(request.endpoint, {
            ...request.options,
            cache: useCache
          });
          results.push({ id: request.id, data });
        } catch (error) {
          results.push({
            id: request.id,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
      return results;
    }
  }
}
