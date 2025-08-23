import { apiCache } from '../../services/apiCache'
import { clearPostCache } from './utils'
import { validateUserLogin } from './utils'
import type { Comment } from './types'

export class CommentService {
  // 获取帖子评论
  async getPostComments(postId: string): Promise<Comment[]> {
    try {
      const response = await fetch(`/api/comments/${postId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  // 添加评论
  async addComment(comment: {
    post_id: string
    user_id: string
    content: string
  }): Promise<Comment> {
    try {
      const accessToken = validateUserLogin();
      
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(comment),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 清除相关缓存
      apiCache.invalidatePattern(`post_comments_count:*:${comment.post_id}:*`);
      
      // 后端API返回格式: {success: true, data: formattedComment}
      // 需要返回data.data以获取实际的评论对象
      return data.data || data;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  // 删除评论
  async deleteComment(commentId: string, userId: string): Promise<void> {
    try {
      const accessToken = validateUserLogin();
      
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ user_id: userId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  // 获取帖子评论数量
  async getPostCommentsCount(postId: string): Promise<number> {
    return apiCache.cached(
      'post_comments_count',
      async () => {
        try {
          const response = await fetch(`/api/comments/${postId}/count`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          return data.data?.count || 0;
        } catch (error) {
          console.error('Error fetching post comments count:', error);
          return 0;
        }
      },
      { postId },
      2 * 60 * 1000 // 2分钟缓存
    );
  }
}
