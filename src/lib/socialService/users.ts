import { apiCache } from '../../services/apiCache'
import { validateUserLogin } from './utils'
import type { User } from './types'

export class UserService {
  // 更新用户资料
  async updateUserProfile(userId: string, profile: {
    username?: string;
    full_name?: string;
    bio?: string;
    avatar_url?: string;
  }): Promise<User> {
    try {
      const accessToken = validateUserLogin();
      
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(profile),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async getUserStats(userId: string): Promise<{
    postsCount: number;
    followersCount: number;
    followingCount: number;
  }> {
    return apiCache.cached(
      'user_stats',
      async () => {
        try {
          const response = await fetch(`/api/users/${userId}/stats`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          return {
            postsCount: data.postsCount || 0,
            followersCount: data.followersCount || 0,
            followingCount: data.followingCount || 0
          };
        } catch (error) {
          console.error('Error fetching user stats:', error);
          throw error;
        }
      },
      { userId },
      5 * 60 * 1000 // 5分钟缓存
    );
  }

  // 获取用户资料
  async getUserProfile(userId: string): Promise<User | null> {
    return apiCache.cached(
      `user_profile_${userId}`, // 修复缓存键冲突问题
      async () => {
        try {
          const response = await fetch(`/api/users/${userId}`);
          if (!response.ok) {
            if (response.status === 404) {
              return null;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          return data;
        } catch (error) {
          console.error('Error fetching user profile:', error);
          throw error;
        }
      },
      { userId },
      10 * 60 * 1000 // 10分钟缓存
    );
  }

  // 获取内容分类
  async getContentCategories(language?: string): Promise<any[]> {
    try {
      const langParam = language ? language.toLowerCase() : 'zh';
      const url = `/api/categories/content?lang=${langParam}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success && data.data && data.data.categories) {
        return data.data.categories;
      }
      return data.categories || [];
    } catch (error) {
      console.error('Error fetching content categories:', error);
      return [];
    }
  }
}
