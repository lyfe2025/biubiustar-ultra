/**
 * Cache Configuration
 * 缓存配置文件，定义不同环境下的缓存策略
 */

export interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  cleanupInterval: number;
  enabled: boolean;
}

export interface CacheConfigs {
  user: CacheConfig;
  content: CacheConfig;
  stats: CacheConfig;
  config: CacheConfig;
  session: CacheConfig;
  api: CacheConfig;
}

/**
 * 缓存实例类型
 */
export type CacheInstanceType = keyof CacheConfigs;

/**
 * 缓存实例类型常量数组
 */
export const CACHE_INSTANCE_TYPES: CacheInstanceType[] = ['user', 'content', 'stats', 'config', 'session', 'api'];

// 获取环境变量
const NODE_ENV = process.env.NODE_ENV || 'development';
const isDevelopment = NODE_ENV === 'development';
const isProduction = NODE_ENV === 'production';
const isTest = NODE_ENV === 'test';

/**
 * 开发环境缓存配置
 * 较小的缓存大小和较短的TTL，便于开发调试
 */
const developmentConfig: CacheConfigs = {
  user: {
    maxSize: 100,
    defaultTTL: 5 * 60 * 1000, // 5分钟
    cleanupInterval: 5 * 60 * 1000,
    enabled: true
  },
  content: {
    maxSize: 200,
    defaultTTL: 2 * 60 * 1000, // 2分钟
    cleanupInterval: 2 * 60 * 1000,
    enabled: true
  },
  stats: {
    maxSize: 50,
    defaultTTL: 30 * 1000, // 30秒
    cleanupInterval: 60 * 1000,
    enabled: true
  },
  config: {
    maxSize: 20,
    defaultTTL: 10 * 60 * 1000, // 10分钟
    cleanupInterval: 10 * 60 * 1000,
    enabled: true
  },
  session: {
    maxSize: 50,
    defaultTTL: 15 * 60 * 1000, // 15分钟
    cleanupInterval: 5 * 60 * 1000,
    enabled: true
  },
  api: {
    maxSize: 100,
    defaultTTL: 60 * 1000, // 1分钟
    cleanupInterval: 2 * 60 * 1000,
    enabled: true
  }
};

/**
 * 生产环境缓存配置
 * 较大的缓存大小和较长的TTL，优化性能
 */
const productionConfig: CacheConfigs = {
  user: {
    maxSize: 1000,
    defaultTTL: 30 * 60 * 1000, // 30分钟
    cleanupInterval: 5 * 60 * 1000,
    enabled: true
  },
  content: {
    maxSize: 2000,
    defaultTTL: 10 * 60 * 1000, // 10分钟
    cleanupInterval: 2 * 60 * 1000,
    enabled: true
  },
  stats: {
    maxSize: 500,
    defaultTTL: 2 * 60 * 1000, // 2分钟
    cleanupInterval: 60 * 1000,
    enabled: true
  },
  config: {
    maxSize: 200,
    defaultTTL: 60 * 60 * 1000, // 1小时
    cleanupInterval: 10 * 60 * 1000,
    enabled: true
  },
  session: {
    maxSize: 500,
    defaultTTL: 15 * 60 * 1000, // 15分钟
    cleanupInterval: 5 * 60 * 1000,
    enabled: true
  },
  api: {
    maxSize: 1000,
    defaultTTL: 5 * 60 * 1000, // 5分钟
    cleanupInterval: 2 * 60 * 1000,
    enabled: true
  }
};

/**
 * 测试环境缓存配置
 * 禁用缓存或使用极短的TTL，确保测试的准确性
 */
const testConfig: CacheConfigs = {
  user: {
    maxSize: 10,
    defaultTTL: 1000, // 1秒
    cleanupInterval: 5000,
    enabled: false
  },
  content: {
    maxSize: 10,
    defaultTTL: 1000, // 1秒
    cleanupInterval: 5000,
    enabled: false
  },
  stats: {
    maxSize: 10,
    defaultTTL: 1000, // 1秒
    cleanupInterval: 5000,
    enabled: false
  },
  config: {
    maxSize: 10,
    defaultTTL: 1000, // 1秒
    cleanupInterval: 5000,
    enabled: false
  },
  session: {
    maxSize: 10,
    defaultTTL: 1000, // 1秒
    cleanupInterval: 5000,
    enabled: false
  },
  api: {
    maxSize: 10,
    defaultTTL: 1000, // 1秒
    cleanupInterval: 5000,
    enabled: false
  }
};

/**
 * 根据环境获取缓存配置
 */
export function getCacheConfig(): CacheConfigs {
  if (isTest) {
    return testConfig;
  }
  if (isProduction) {
    return productionConfig;
  }
  return developmentConfig;
}

/**
 * 缓存键前缀配置
 */
export const CACHE_PREFIXES = {
  USER: 'user:',
  CONTENT: 'content:',
  STATS: 'stats:',
  CONFIG: 'config:',
  SESSION: 'session:',
  API: 'api:',
  POSTS: 'posts:',
  ACTIVITIES: 'activities:',
  COMMENTS: 'comments:',
  LIKES: 'likes:',
  FOLLOWS: 'follows:',
  CATEGORIES: 'categories:'
} as const;

/**
 * 缓存键生成器
 */
export class CacheKeyGenerator {
  static user(userId: string): string {
    return `${CACHE_PREFIXES.USER}${userId}`;
  }

  static userProfile(userId: string): string {
    return `${CACHE_PREFIXES.USER}profile:${userId}`;
  }

  static userPosts(userId: string, page: number = 1): string {
    return `${CACHE_PREFIXES.USER}posts:${userId}:page:${page}`;
  }

  static post(postId: string): string {
    return `${CACHE_PREFIXES.POSTS}${postId}`;
  }

  static postsList(page: number = 1, category?: string): string {
    const categoryPart = category ? `:category:${category}` : '';
    return `${CACHE_PREFIXES.POSTS}list:page:${page}${categoryPart}`;
  }

  static activity(activityId: string): string {
    return `${CACHE_PREFIXES.ACTIVITIES}${activityId}`;
  }

  static activitiesList(page: number = 1): string {
    return `${CACHE_PREFIXES.ACTIVITIES}list:page:${page}`;
  }

  static userActivities(userId: string, page: number = 1): string {
    return `${CACHE_PREFIXES.ACTIVITIES}user:${userId}:page:${page}`;
  }

  static stats(type: string): string {
    return `${CACHE_PREFIXES.STATS}${type}`;
  }

  static globalStats(): string {
    return `${CACHE_PREFIXES.STATS}global`;
  }

  static userStats(userId: string): string {
    return `${CACHE_PREFIXES.STATS}user:${userId}`;
  }

  static config(key: string): string {
    return `${CACHE_PREFIXES.CONFIG}${key}`;
  }

  static session(sessionId: string): string {
    return `${CACHE_PREFIXES.SESSION}${sessionId}`;
  }

  static apiResponse(endpoint: string, params?: Record<string, any>): string {
    const paramString = params ? `:${JSON.stringify(params)}` : '';
    return `${CACHE_PREFIXES.API}${endpoint}${paramString}`;
  }

  // 管理后台用户相关缓存键
  static adminUsersList(page: number, limit: number, search: string, status: string, role: string): string {
    const params = JSON.stringify({ page, limit, search, status, role })
    return `${CACHE_PREFIXES.USER}admin:list:${params}`
  }
  
  static adminUserDetail(userId: string): string {
    return `${CACHE_PREFIXES.USER}admin:detail:${userId}`
  }
  
  static adminUserStats(): string {
    return `${CACHE_PREFIXES.STATS}admin:users`
  }

  // 管理后台活动相关缓存键
  static adminActivitiesList(page: number, limit: number): string {
    const params = JSON.stringify({ page, limit })
    return `${CACHE_PREFIXES.CONTENT}admin:activities:list:${params}`
  }
  
  static adminActivityDetail(activityId: string): string {
    return `${CACHE_PREFIXES.CONTENT}admin:activity:detail:${activityId}`
  }
  
  static adminActivityStats(): string {
    return `${CACHE_PREFIXES.STATS}admin:activities`
  }

  static adminActivityCategories(): string {
    return `${CACHE_PREFIXES.CONTENT}admin:activity:categories`
  }

  // 系统设置相关缓存键
  static systemSettings(category?: string): string {
    if (category) {
      return `${CACHE_PREFIXES.CONFIG}system:settings:${category}`
    }
    return `${CACHE_PREFIXES.CONFIG}system:settings:all`
  }

  static publicSettings(category?: string): string {
    if (category) {
      return `${CACHE_PREFIXES.CONFIG}public:settings:${category}`
    }
    return `${CACHE_PREFIXES.CONFIG}public:settings:all`
  }
}

/**
 * 缓存TTL配置
 */
export const CACHE_TTL = {
  VERY_SHORT: 30 * 1000,      // 30秒
  SHORT: 2 * 60 * 1000,       // 2分钟
  MEDIUM: 10 * 60 * 1000,     // 10分钟
  LONG: 30 * 60 * 1000,       // 30分钟
  VERY_LONG: 60 * 60 * 1000,  // 1小时
  DAILY: 24 * 60 * 60 * 1000  // 24小时
} as const;

/**
 * 环境配置
 */
export const CACHE_ENV = {
  NODE_ENV,
  isDevelopment,
  isProduction,
  isTest,
  enableCache: process.env.ENABLE_CACHE !== 'false',
  enableCacheLogging: process.env.ENABLE_CACHE_LOGGING === 'true' || isDevelopment
} as const;