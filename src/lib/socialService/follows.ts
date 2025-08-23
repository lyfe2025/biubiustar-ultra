import { apiCache } from '../../services/apiCache'
import { clearUserCache } from './utils'
import { validateUserLogin } from './utils'
import type { User } from './types'

export class FollowService {
  // 关注用户
  async followUser(followerId: string, followingId: string): Promise<void> {
    try {
      const accessToken = validateUserLogin();
      
      const response = await fetch('/api/follows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ follower_id: followerId, following_id: followingId }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // 清除相关缓存
      clearUserCache(followerId, followingId);
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  }

  // 取消关注用户
  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    try {
      const accessToken = validateUserLogin();
      
      const response = await fetch(`/api/follows/${followerId}/${followingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // 清除相关缓存
      clearUserCache(followerId, followingId);
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  }

  // 检查是否已关注用户
  async isUserFollowed(followerId: string, followingId: string): Promise<boolean> {
    return apiCache.cached(
      'user_followed_status',
      async () => {
        try {
          const response = await fetch(`/api/follows/${followerId}/${followingId}/status`);
          if (response.status === 404) {
            return false;
          }
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          return data.isFollowing || false;
        } catch (error) {
          console.error('Error checking follow status:', error);
          return false;
        }
      },
      { followerId, followingId },
      2 * 60 * 1000 // 2分钟缓存
    );
  }

  // 检查是否关注用户
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/follows/${followerId}/${followingId}/status`);
      if (!response.ok) {
        if (response.status === 404) {
          return false;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.isFollowing || false;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  }

  // 获取用户关注数
  async getUserFollowingCount(userId: string): Promise<number> {
    return apiCache.cached(
      'user_following_count',
      async () => {
        try {
          const response = await fetch(`/api/users/${userId}/following/count`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          return data.count || 0;
        } catch (error) {
          console.error('Error fetching following count:', error);
          return 0;
        }
      },
      { userId },
      5 * 60 * 1000 // 5分钟缓存
    );
  }

  // 获取用户粉丝数
  async getUserFollowersCount(userId: string): Promise<number> {
    return apiCache.cached(
      'user_followers_count',
      async () => {
        try {
          const response = await fetch(`/api/users/${userId}/followers/count`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          return data.count || 0;
        } catch (error) {
          console.error('Error fetching followers count:', error);
          return 0;
        }
      },
      { userId },
      5 * 60 * 1000 // 5分钟缓存
    );
  }

  // 获取用户关注的人列表
  async getUserFollowing(userId: string): Promise<unknown[]> {
    try {
      const response = await fetch(`/api/users/${userId}/following`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error fetching user following:', error);
      throw error;
    }
  }

  // 获取用户粉丝列表
  async getUserFollowers(userId: string): Promise<unknown[]> {
    try {
      const response = await fetch(`/api/users/${userId}/followers`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error fetching user followers:', error);
      throw error;
    }
  }

  // 获取用户的关注者列表
  async getFollowers(userId: string): Promise<User[]> {
    try {
      const response = await fetch(`/api/users/${userId}/followers`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error fetching followers:', error);
      throw error;
    }
  }

  // 获取用户的关注列表
  async getFollowing(userId: string): Promise<User[]> {
    try {
      const response = await fetch(`/api/users/${userId}/following`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error fetching following:', error);
      throw error;
    }
  }
}
