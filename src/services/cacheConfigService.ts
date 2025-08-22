/**
 * 缓存配置服务
 * 统一的API调用、错误处理和数据格式化
 */

export interface CacheConfig {
  type: string;
  maxSize: number;
  defaultTTL: number;
  cleanupInterval: number;
  currentStats?: {
    size: number;
    hitRate: number;
    missRate: number;
    hits: number;
    misses: number;
    evictions: number;
  };
}

export interface CacheConfigResponse {
  success: boolean;
  data: {
    cacheTypes: CacheConfig[];
    totalMemoryUsage: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    environment: string;
  };
  timestamp: string;
}

export interface UpdateCacheConfigRequest {
  cacheType: string;
  maxSize: number;
  defaultTTL: number;
  cleanupInterval?: number;
}

export interface UpdateCacheConfigResponse {
  success: boolean;
  data: {
    cacheType: string;
    config: {
      maxSize: number;
      defaultTTL: number;
      cleanupInterval: number;
    };
    stats: any;
    restoredItems: number;
    droppedItems: number;
  };
}

export interface ClearCacheResponse {
  success: boolean;
  data: {
    cacheType: string;
    clearedItems: number;
    stats: any;
  };
}

class CacheConfigService {
  private baseUrl = '/api/admin/settings/cache';

  /**
   * 获取认证token
   */
  private async getAuthToken(): Promise<string> {
    // 首先尝试从localStorage获取管理员token
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken && adminToken.length > 10) {
      return adminToken;
    }

    // 如果没有管理员token，尝试获取普通用户的Supabase session token
    const sessionData = localStorage.getItem('supabase.auth.token');
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        if (session.access_token && session.access_token.length > 10) {
          return session.access_token;
        }
      } catch (error) {
        console.error('解析session数据失败:', error);
      }
    }

    throw new Error('未找到有效的认证token，请重新登录');
  }

  /**
   * 获取所有缓存配置
   */
  async getCacheConfigs(): Promise<CacheConfigResponse> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch cache configs');
      }

      return data;
    } catch (error) {
      console.error('Error fetching cache configs:', error);
      throw this.formatError(error);
    }
  }

  /**
   * 更新缓存配置
   */
  async updateCacheConfig(config: UpdateCacheConfigRequest): Promise<UpdateCacheConfigResponse> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(this.baseUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update cache config');
      }

      return data;
    } catch (error) {
      console.error('Error updating cache config:', error);
      throw this.formatError(error);
    }
  }

  /**
   * 重置缓存配置到默认值
   */
  async resetCacheConfig(cacheType: string): Promise<UpdateCacheConfigResponse> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.baseUrl}/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ cacheType }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to reset cache config');
      }

      return data;
    } catch (error) {
      console.error('Error resetting cache config:', error);
      throw this.formatError(error);
    }
  }

  /**
   * 清理指定缓存
   */
  async clearCache(cacheType: string): Promise<ClearCacheResponse> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.baseUrl}/clear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ cacheType }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to clear cache');
      }

      return data;
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw this.formatError(error);
    }
  }

  /**
   * 格式化错误信息
   */
  private formatError(error: any): Error {
    if (error instanceof Error) {
      return error;
    }
    
    if (typeof error === 'string') {
      return new Error(error);
    }
    
    return new Error('An unknown error occurred');
  }

  /**
   * 验证缓存配置参数
   */
  validateCacheConfig(config: Partial<UpdateCacheConfigRequest>): string[] {
    const errors: string[] = [];

    if (!config.cacheType) {
      errors.push('缓存类型不能为空');
    }

    if (config.maxSize !== undefined) {
      if (typeof config.maxSize !== 'number' || config.maxSize < 10 || config.maxSize > 10000) {
        errors.push('maxSize 必须在 10 到 10000 之间');
      }
    }

    if (config.defaultTTL !== undefined) {
      if (typeof config.defaultTTL !== 'number' || config.defaultTTL < 1000 || config.defaultTTL > 24 * 60 * 60 * 1000) {
        errors.push('defaultTTL 必须在 1 秒到 24 小时之间');
      }
    }

    if (config.cleanupInterval !== undefined) {
      if (typeof config.cleanupInterval !== 'number' || config.cleanupInterval < 1000) {
        errors.push('cleanupInterval 必须大于等于 1 秒');
      }
    }

    return errors;
  }

  /**
   * 格式化TTL显示
   */
  formatTTL(ttl: number): string {
    if (ttl < 60 * 1000) {
      return `${Math.round(ttl / 1000)}秒`;
    } else if (ttl < 60 * 60 * 1000) {
      return `${Math.round(ttl / (60 * 1000))}分钟`;
    } else {
      return `${Math.round(ttl / (60 * 60 * 1000))}小时`;
    }
  }

  /**
   * 格式化内存大小
   */
  formatMemorySize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes}B`;
    } else if (bytes < 1024 * 1024) {
      return `${Math.round(bytes / 1024)}KB`;
    } else {
      return `${Math.round(bytes / (1024 * 1024))}MB`;
    }
  }
}

// 导出单例实例
export const cacheConfigService = new CacheConfigService();
export default cacheConfigService;