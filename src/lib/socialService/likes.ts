import { apiCache } from '../../services/apiCache'
import { clearPostCache } from './utils'
import { validateUserLogin } from './utils'

export class LikeService {
  // 点赞帖子
  async likePost(postId: string, userId: string): Promise<void> {
    try {
      const accessToken = validateUserLogin();
      
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // 清除相关缓存
      clearPostCache(postId);
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  }

  // 检查用户是否已点赞帖子
  async isPostLiked(postId: string, userId: string): Promise<boolean> {
    return apiCache.cached(
      'post_liked_status',
      async () => {
        try {
          const response = await fetch(`/api/posts/${postId}/likes/${userId}`);
          if (response.status === 404) {
            return false;
          }
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          return data.isLiked || false;
        } catch (error) {
          console.error('Error checking if post is liked:', error);
          return false;
        }
      },
      { postId, userId },
      1 * 60 * 1000 // 1分钟缓存
    );
  }

  // 取消点赞帖子
  async unlikePost(postId: string, userId: string): Promise<void> {
    try {
      const accessToken = validateUserLogin();
      
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // 清除相关缓存
      clearPostCache(postId);
    } catch (error) {
      console.error('Error unliking post:', error);
      throw error;
    }
  }

  // 获取帖子点赞数
  async getPostLikesCount(postId: string): Promise<number> {
    return apiCache.cached(
      'post_likes_count',
      async () => {
        try {
          const response = await fetch(`/api/posts/${postId}/likes/count`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          return data.count || 0;
        } catch (error) {
          console.error('Error fetching post likes count:', error);
          return 0;
        }
      },
      { postId },
      2 * 60 * 1000 // 2分钟缓存
    );
  }
}
