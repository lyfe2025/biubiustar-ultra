/**
 * Cache Instances
 * 专用缓存实例，为不同类型的数据提供优化的缓存策略
 */

import { EnhancedCacheService } from './enhancedCache.js';

// 获取环境配置
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * 缓存实例类型枚举
 */
export enum CacheInstanceType {
  USER = 'user',
  CONTENT = 'content',
  STATS = 'stats',
  CONFIG = 'config',
  SESSION = 'session',
  API = 'api'
}

/**
 * 缓存实例映射
 */
export const cacheInstances = {
  [CacheInstanceType.USER]: null as EnhancedCacheService | null,
  [CacheInstanceType.CONTENT]: null as EnhancedCacheService | null,
  [CacheInstanceType.STATS]: null as EnhancedCacheService | null,
  [CacheInstanceType.CONFIG]: null as EnhancedCacheService | null,
  [CacheInstanceType.SESSION]: null as EnhancedCacheService | null,
  [CacheInstanceType.API]: null as EnhancedCacheService | null
};

/**
 * 用户数据缓存 - 长期缓存
 * 用于缓存用户信息、权限、设置等相对稳定的数据
 */
export const userCache = new EnhancedCacheService({
  maxSize: isDevelopment ? 100 : 500,
  defaultTTL: isDevelopment ? 5 * 60 * 1000 : 30 * 60 * 1000, // 开发环境5分钟，生产环境30分钟
  cleanupInterval: 5 * 60 * 1000 // 5分钟清理一次
});
cacheInstances[CacheInstanceType.USER] = userCache;

/**
 * 内容缓存 - 中期缓存
 * 用于缓存帖子、活动、评论等内容数据
 */
export const contentCache = new EnhancedCacheService({
  maxSize: isDevelopment ? 200 : 1000,
  defaultTTL: isDevelopment ? 2 * 60 * 1000 : 10 * 60 * 1000, // 开发环境2分钟，生产环境10分钟
  cleanupInterval: 2 * 60 * 1000 // 2分钟清理一次
});
cacheInstances[CacheInstanceType.CONTENT] = contentCache;

/**
 * 统计缓存 - 短期缓存
 * 用于缓存计数、排行榜、热门内容等统计数据
 */
export const statsCache = new EnhancedCacheService({
  maxSize: isDevelopment ? 50 : 200,
  defaultTTL: isDevelopment ? 30 * 1000 : 2 * 60 * 1000, // 开发环境30秒，生产环境2分钟
  cleanupInterval: 60 * 1000 // 1分钟清理一次
});
cacheInstances[CacheInstanceType.STATS] = statsCache;

/**
 * 配置缓存 - 长期缓存
 * 用于缓存系统设置、多语言配置等不经常变化的配置数据
 */
export const configCache = new EnhancedCacheService({
  maxSize: isDevelopment ? 20 : 100,
  defaultTTL: isDevelopment ? 10 * 60 * 1000 : 60 * 60 * 1000, // 开发环境10分钟，生产环境1小时
  cleanupInterval: 10 * 60 * 1000 // 10分钟清理一次
});
cacheInstances[CacheInstanceType.CONFIG] = configCache;

/**
 * 会话缓存 - 短期缓存
 * 用于缓存用户会话、临时状态等短期数据
 */
export const sessionCache = new EnhancedCacheService({
  maxSize: isDevelopment ? 50 : 300,
  defaultTTL: 15 * 60 * 1000, // 15分钟
  cleanupInterval: 5 * 60 * 1000 // 5分钟清理一次
});
cacheInstances[CacheInstanceType.SESSION] = sessionCache;

/**
 * API响应缓存 - 中短期缓存
 * 用于缓存API响应结果
 */
export const apiCache = new EnhancedCacheService({
  maxSize: isDevelopment ? 100 : 500,
  defaultTTL: isDevelopment ? 60 * 1000 : 5 * 60 * 1000, // 开发环境1分钟，生产环境5分钟
  cleanupInterval: 2 * 60 * 1000 // 2分钟清理一次
});
cacheInstances[CacheInstanceType.API] = apiCache;

/**
 * 获取所有缓存实例的统计信息
 */
export function getAllCacheStats() {
  return {
    user: userCache.getStats(),
    content: contentCache.getStats(),
    stats: statsCache.getStats(),
    config: configCache.getStats(),
    session: sessionCache.getStats(),
    api: apiCache.getStats()
  };
}

/**
 * 清空所有缓存
 */
export function clearAllCaches() {
  userCache.clear();
  contentCache.clear();
  statsCache.clear();
  configCache.clear();
  sessionCache.clear();
  apiCache.clear();
  console.log('所有缓存已清空');
}

/**
 * 销毁所有缓存实例
 */
export function destroyAllCaches() {
  userCache.destroy();
  contentCache.destroy();
  statsCache.destroy();
  configCache.destroy();
  sessionCache.destroy();
  apiCache.destroy();
  console.log('所有缓存实例已销毁');
}

/**
 * 缓存健康检查
 */
export function getCacheHealth() {
  const stats = getAllCacheStats();
  const memoryUsage = process.memoryUsage();
  
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    caches: stats,
    totalMemory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
      external: Math.round(memoryUsage.external / 1024 / 1024) // MB
    },
    environment: process.env.NODE_ENV || 'development'
  };
}

// 优雅关闭处理
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，正在清理缓存...');
  destroyAllCaches();
});

process.on('SIGINT', () => {
  console.log('收到 SIGINT 信号，正在清理缓存...');
  destroyAllCaches();
  process.exit(0);
});