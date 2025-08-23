import { apiCache } from '../../services/apiCache'

// 获取认证token的工具函数
export const getAuthToken = (): string | null => {
  try {
    const sessionData = localStorage.getItem('supabase.auth.token');
    if (!sessionData) {
      return null;
    }
    
    const session = JSON.parse(sessionData);
    return session.access_token || null;
  } catch (error) {
    console.log('获取认证token失败:', error);
    return null;
  }
};

// 验证用户登录状态的工具函数
export const validateUserLogin = (): string => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('用户未登录，请先登录');
  }
  return token;
};

// 清除相关缓存的工具函数
export const clearPostCache = (postId: string) => {
  apiCache.invalidatePattern(`post_liked_status:*:${postId}:*`);
  apiCache.invalidatePattern(`post_likes_count:*:${postId}:*`);
  apiCache.invalidatePattern(`post_comments_count:*:${postId}:*`);
};

export const clearUserCache = (followerId: string, followingId: string) => {
  apiCache.invalidatePattern(`user_followed_status:*:${followerId}:*`);
  apiCache.invalidatePattern(`user_following_count:*:${followerId}:*`);
  apiCache.invalidatePattern(`user_followers_count:*:${followingId}:*`);
  apiCache.invalidatePattern(`user_stats:*:${followerId}:*`);
  apiCache.invalidatePattern(`user_stats:*:${followingId}:*`);
};
