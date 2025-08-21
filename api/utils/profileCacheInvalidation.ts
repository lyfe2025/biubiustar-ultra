/**
 * 个人中心缓存失效机制
 * 提供统一的个人中心相关数据缓存失效服务
 */
import { invalidateUserCache } from '../services/cacheInvalidation.js';

/**
 * 个人中心缓存失效类型枚举
 */
export enum ProfileCacheInvalidationType {
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  AVATAR_CHANGE = 'AVATAR_CHANGE',
  STATS_CHANGE = 'STATS_CHANGE',
  SOCIAL_CHANGE = 'SOCIAL_CHANGE',
  FULL_REFRESH = 'FULL_REFRESH'
}

/**
 * 个人中心缓存失效选项
 */
export interface ProfileCacheInvalidationOptions {
  type: ProfileCacheInvalidationType;
  userId: string;
  invalidateProfile?: boolean;
  invalidatePosts?: boolean;
  invalidateActivities?: boolean;
  invalidateStats?: boolean;
}

/**
 * 个人中心缓存失效服务类
 */
export class ProfileCacheInvalidationService {
  /**
   * 执行个人中心缓存失效
   */
  public async invalidate(options: ProfileCacheInvalidationOptions): Promise<void> {
    const { userId } = options;
    
    // 基础失效：始终失效用户基础缓存
    await invalidateUserCache(userId);
    
    console.log(`个人中心缓存失效完成 - 用户: ${userId}, 类型: ${options.type}`);
  }
}

// 导出服务实例
export const profileCacheInvalidationService = new ProfileCacheInvalidationService();

/**
 * 便捷函数：用户资料更新时的缓存失效
 */
export const invalidateOnProfileUpdate = async (userId: string): Promise<void> => {
  return profileCacheInvalidationService.invalidate({
    type: ProfileCacheInvalidationType.PROFILE_UPDATE,
    userId,
    invalidateProfile: true
  });
};

/**
 * 便捷函数：用户头像更新时的缓存失效
 */
export const invalidateOnAvatarChange = async (userId: string): Promise<void> => {
  return profileCacheInvalidationService.invalidate({
    type: ProfileCacheInvalidationType.AVATAR_CHANGE,
    userId,
    invalidateProfile: true
  });
};

/**
 * 便捷函数：用户统计数据变化时的缓存失效
 */
export const invalidateOnStatsChange = async (userId: string): Promise<void> => {
  return profileCacheInvalidationService.invalidate({
    type: ProfileCacheInvalidationType.STATS_CHANGE,
    userId,
    invalidateStats: true
  });
};

/**
 * 便捷函数：用户社交关系变化时的缓存失效
 */
export const invalidateOnSocialChange = async (userId: string): Promise<void> => {
  return profileCacheInvalidationService.invalidate({
    type: ProfileCacheInvalidationType.SOCIAL_CHANGE,
    userId,
    invalidateStats: true
  });
};

/**
 * 便捷函数：用户获得点赞时的缓存失效（用于统计更新）
 */
export const invalidateOnLikeChange = async (userId: string): Promise<void> => {
  return profileCacheInvalidationService.invalidate({
    type: ProfileCacheInvalidationType.STATS_CHANGE,
    userId,
    invalidateStats: true
  });
};
