/**
 * 缓存工具函数
 * 提供缓存清理和管理的便捷方法
 */

import { contentCache, apiCache, statsCache } from './cacheInstances.js';

/**
 * 清理活动相关的缓存
 * 当活动数据发生变化时调用此函数
 */
export function clearActivityCaches(): void {
  try {
    // 获取所有缓存键
    const contentKeys = contentCache.keys();
    const apiKeys = apiCache.keys();
    const statsKeys = statsCache.keys();
    
    // 清理内容缓存中的活动相关数据
    const activityContentKeys = contentKeys.filter(key => 
      key.includes('activity') || 
      key.includes('activities') ||
      key.includes('upcoming')
    );
    
    // 清理API缓存中的活动相关数据
    const activityApiKeys = apiKeys.filter(key => 
      key.includes('activity') || 
      key.includes('activities') ||
      key.includes('upcoming')
    );
    
    // 清理统计缓存中的活动相关数据
    const activityStatsKeys = statsKeys.filter(key => 
      key.includes('activity') || 
      key.includes('activities') ||
      key.includes('upcoming')
    );
    
    // 执行清理
    activityContentKeys.forEach(key => contentCache.delete(key));
    activityApiKeys.forEach(key => apiCache.delete(key));
    activityStatsKeys.forEach(key => statsCache.delete(key));
    
    console.log(`已清理活动相关缓存: ${activityContentKeys.length + activityApiKeys.length + activityStatsKeys.length} 个缓存项`);
  } catch (error) {
    console.error('清理活动缓存时发生错误:', error);
  }
}

/**
 * 清理特定模式的缓存
 * @param pattern 缓存键的匹配模式
 */
export function clearCacheByPattern(pattern: string): void {
  try {
    const contentKeys = contentCache.keys();
    const apiKeys = apiCache.keys();
    const statsKeys = statsCache.keys();
    
    const matchingContentKeys = contentKeys.filter(key => key.includes(pattern));
    const matchingApiKeys = apiKeys.filter(key => key.includes(pattern));
    const matchingStatsKeys = statsKeys.filter(key => key.includes(pattern));
    
    matchingContentKeys.forEach(key => contentCache.delete(key));
    matchingApiKeys.forEach(key => apiCache.delete(key));
    matchingStatsKeys.forEach(key => statsCache.delete(key));
    
    console.log(`已清理模式 "${pattern}" 的缓存: ${matchingContentKeys.length + matchingApiKeys.length + matchingStatsKeys.length} 个缓存项`);
  } catch (error) {
    console.error(`清理模式 "${pattern}" 的缓存时发生错误:`, error);
  }
}

/**
 * 获取活动相关缓存的统计信息
 */
export function getActivityCacheStats() {
  try {
    const contentKeys = contentCache.keys();
    const apiKeys = apiCache.keys();
    const statsKeys = statsCache.keys();
    
    const activityContentKeys = contentKeys.filter(key => 
      key.includes('activity') || 
      key.includes('activities') ||
      key.includes('upcoming')
    );
    
    const activityApiKeys = apiKeys.filter(key => 
      key.includes('activity') || 
      key.includes('activities') ||
      key.includes('upcoming')
    );
    
    const activityStatsKeys = statsKeys.filter(key => 
      key.includes('activity') || 
      key.includes('activities') ||
      key.includes('upcoming')
    );
    
    return {
      contentCache: {
        total: contentKeys.length,
        activityRelated: activityContentKeys.length,
        keys: activityContentKeys
      },
      apiCache: {
        total: apiKeys.length,
        activityRelated: activityApiKeys.length,
        keys: activityApiKeys
      },
      statsCache: {
        total: statsKeys.length,
        activityRelated: activityStatsKeys.length,
        keys: activityStatsKeys
      },
      totalActivityCaches: activityContentKeys.length + activityApiKeys.length + activityStatsKeys.length
    };
  } catch (error) {
    console.error('获取活动缓存统计时发生错误:', error);
    return null;
  }
}