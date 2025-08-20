import { supabase } from './supabase'
import { apiCache } from '../services/apiCache'
import type { Post as PostType, Comment as CommentType, User } from '../types'

// 使用导入的类型别名
type Post = PostType;
type Comment = CommentType;

export interface Like {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

class SocialService {
  // 获取帖子列表
  async getPosts(page: number = 1, limit: number = 10, category?: string): Promise<Post[]> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(category && { category })
      });
      
      const response = await fetch(`/api/posts?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (process.env.NODE_ENV === 'development') {
        console.log('Posts API response:', result);
      }
      
      // 适应新的API返回格式：{success: true, data: {posts: [], pagination: {}}}
      if (result.success && result.data && result.data.posts) {
        return result.data.posts;
      }
      // 兼容旧格式
      return result.posts || result || [];
    } catch (error) {
      console.error('Error fetching posts:', error);
      return []; // 返回空数组而不是抛出错误
    }
  }

  // 获取帖子列表（带分页信息）
  async getPostsWithPagination(page: number = 1, limit: number = 10, category?: string): Promise<{ posts: Post[]; total: number }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(category && { category })
      });
      
      const response = await fetch(`/api/posts?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (process.env.NODE_ENV === 'development') {
        console.log('Posts pagination API response:', result);
      }
      
      // 适应新的API返回格式：{success: true, data: {posts: [], pagination: {}}}
      if (result.success && result.data) {
        return {
          posts: result.data.posts || [],
          total: result.data.pagination?.total_count || 0
        };
      }
      // 兼容旧格式
      return result || { posts: [], total: 0 };
    } catch (error) {
      console.error('Error fetching posts:', error);
      return { posts: [], total: 0 }; // 返回默认值而不是抛出错误
    }
  }

  // 获取热门帖子
  async getPopularPosts(limit = 10): Promise<Post[]> {
    try {
      const response = await fetch(`/api/posts/popular?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error fetching popular posts:', error);
      throw error;
    }
  }

  // 获取单个帖子
  async getPost(id: string): Promise<Post | null> {
    try {
      const response = await fetch(`/api/posts/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      // 适应API返回格式：{success: true, data: {post: actualPostData}}
      if (data.success && data.data && data.data.post) {
        return data.data.post;
      }
      // 兼容旧格式
      return data;
    } catch (error) {
      console.error('Error fetching post:', error);
      throw error;
    }
  }

  // 创建帖子
  async createPost(post: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'comments_count' | 'status'>): Promise<Post> {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(post),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      // 适应API返回格式：{success: true, data: formattedComment}
      if (data.success && data.data) {
        return data.data;
      }
      // 兼容旧格式
      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  // 点赞帖子
  async likePost(postId: string, userId: string): Promise<void> {
    try {
      // 从localStorage获取认证token
      const sessionData = localStorage.getItem('supabase.auth.token');
      if (!sessionData) {
        throw new Error('用户未登录，请先登录');
      }
      
      const session = JSON.parse(sessionData);
      const accessToken = session.access_token;
      
      if (!accessToken) {
        throw new Error('认证token无效，请重新登录');
      }
      
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
      apiCache.invalidatePattern(`post_liked_status:*:${postId}:*`);
      apiCache.invalidatePattern(`post_likes_count:*:${postId}:*`);
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
      // 从localStorage获取认证token
      const sessionData = localStorage.getItem('supabase.auth.token');
      if (!sessionData) {
        throw new Error('用户未登录，请先登录');
      }
      
      const session = JSON.parse(sessionData);
      const accessToken = session.access_token;
      
      if (!accessToken) {
        throw new Error('认证token无效，请重新登录');
      }
      
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
      apiCache.invalidatePattern(`post_liked_status:*:${postId}:*`);
      apiCache.invalidatePattern(`post_likes_count:*:${postId}:*`);
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

  // 分享帖子 - 纯前端操作，不需要登录
  async sharePost(postId: string): Promise<void> {
    try {
      // 构建分享链接
      const shareUrl = `${window.location.origin}/post/${postId}`;
      
      // 检查是否支持Web Share API
      if (navigator.share) {
        await navigator.share({
          title: '分享帖子',
          text: '查看这个有趣的帖子',
          url: shareUrl
        });
      } else {
        // 降级方案：复制链接到剪贴板
        await navigator.clipboard.writeText(shareUrl);
        // 可以在这里添加一个提示，告诉用户链接已复制
        console.log('分享链接已复制到剪贴板:', shareUrl);
      }
    } catch (error) {
      console.error('Error sharing post:', error);
      // 如果所有方法都失败，至少提供一个友好的错误信息
      throw new Error('分享功能暂时不可用，请稍后再试');
    }
  }

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
      // 从localStorage获取认证token
      const sessionData = localStorage.getItem('supabase.auth.token');
      if (!sessionData) {
        throw new Error('用户未登录，请先登录');
      }
      
      const session = JSON.parse(sessionData);
      const accessToken = session.access_token;
      
      if (!accessToken) {
        throw new Error('认证token无效，请重新登录');
      }
      
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
      // 从localStorage获取认证token
      const sessionData = localStorage.getItem('supabase.auth.token');
      if (!sessionData) {
        throw new Error('用户未登录，请先登录');
      }
      
      const session = JSON.parse(sessionData);
      const accessToken = session.access_token;
      
      if (!accessToken) {
        throw new Error('认证token无效，请重新登录');
      }
      
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

  // 关注用户
  async followUser(followerId: string, followingId: string): Promise<void> {
    try {
      // 从localStorage获取认证token
      const sessionData = localStorage.getItem('supabase.auth.token');
      if (!sessionData) {
        throw new Error('用户未登录，请先登录');
      }
      
      const session = JSON.parse(sessionData);
      const accessToken = session.access_token;
      
      if (!accessToken) {
        throw new Error('认证token无效，请重新登录');
      }
      
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
      apiCache.invalidatePattern(`user_followed_status:*:${followerId}:*`);
      apiCache.invalidatePattern(`user_following_count:*:${followerId}:*`);
      apiCache.invalidatePattern(`user_followers_count:*:${followingId}:*`);
      apiCache.invalidatePattern(`user_stats:*:${followerId}:*`);
      apiCache.invalidatePattern(`user_stats:*:${followingId}:*`);
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  }

  // 取消关注用户
  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    try {
      // 从localStorage获取认证token
      const sessionData = localStorage.getItem('supabase.auth.token');
      if (!sessionData) {
        throw new Error('用户未登录，请先登录');
      }
      
      const session = JSON.parse(sessionData);
      const accessToken = session.access_token;
      
      if (!accessToken) {
        throw new Error('认证token无效，请重新登录');
      }
      
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
      apiCache.invalidatePattern(`user_followed_status:*:${followerId}:*`);
      apiCache.invalidatePattern(`user_following_count:*:${followerId}:*`);
      apiCache.invalidatePattern(`user_followers_count:*:${followingId}:*`);
      apiCache.invalidatePattern(`user_stats:*:${followerId}:*`);
      apiCache.invalidatePattern(`user_stats:*:${followingId}:*`);
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

  // 更新用户资料
  async updateUserProfile(userId: string, profile: {
    username?: string;
    full_name?: string;
    bio?: string;
    avatar_url?: string;
  }): Promise<User> {
    try {
      // 从localStorage获取认证token
      const sessionData = localStorage.getItem('supabase.auth.token');
      if (!sessionData) {
        throw new Error('用户未登录，请先登录');
      }
      
      const session = JSON.parse(sessionData);
      const accessToken = session.access_token;
      
      if (!accessToken) {
        throw new Error('认证token无效，请重新登录');
      }
      
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

  // 删除帖子
  async deletePost(postId: string): Promise<void> {
    try {
      // 从localStorage获取认证token
      const sessionData = localStorage.getItem('supabase.auth.token');
      if (!sessionData) {
        throw new Error('用户未登录，请先登录');
      }
      
      const session = JSON.parse(sessionData);
      const accessToken = session.access_token;
      
      if (!accessToken) {
        throw new Error('认证token无效，请重新登录');
      }
      
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
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

  // 获取热门帖子
  async getTrendingPosts(limit: number = 20): Promise<Post[]> {
    try {
      const url = `/api/posts?limit=${limit}&sort=trending`;
      console.log('getTrendingPosts: 请求URL:', url);
      
      const response = await fetch(url);
      console.log('getTrendingPosts: 响应状态:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('getTrendingPosts: 原始响应数据:', data);
      console.log('getTrendingPosts: 数据类型:', typeof data);
      
      // 正确处理API返回的数据格式：{success: true, data: {posts: [...]}}
      let posts;
      if (data.success && data.data && data.data.posts) {
        posts = data.data.posts;
      } else if (data.posts) {
        posts = data.posts;
      } else if (Array.isArray(data)) {
        posts = data;
      } else {
        posts = [];
      }
      
      console.log('getTrendingPosts: 提取的posts:', posts);
      console.log('getTrendingPosts: posts是否为数组:', Array.isArray(posts));
      
      if (!Array.isArray(posts)) {
        console.warn('getTrendingPosts: API returned non-array data, using empty array');
        posts = [];
      }
      
      console.log('getTrendingPosts: 最终返回的posts数量:', posts.length);
      return posts;
    } catch (error) {
      console.error('Error fetching trending posts:', error);
      // 返回空数组而不是抛出错误，保持与其他方法一致
      return [];
    }
  }

  // 获取用户的帖子
  async getUserPosts(userId: string, page = 1, limit = 10): Promise<{ posts: Post[]; total: number }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      const response = await fetch(`/api/users/${userId}/posts?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        posts: data.posts || [],
        total: data.total || 0
      };
    } catch (error) {
      console.error('Error fetching user posts:', error);
      throw error;
    }
  }

  // 获取用户资料
  async getUserProfile(userId: string): Promise<User | null> {
    return apiCache.cached(
      'user_profile',
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

  // 添加缺失的方法
  async toggleLike(postId: string, userId: string): Promise<void> {
    // 首先检查是否已经点赞
    const { data: existingLike, error: checkError } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    if (existingLike) {
      // 如果已经点赞，则取消点赞
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id)
      
      if (error) throw error
    } else {
      // 如果没有点赞，则添加点赞
      const { error } = await supabase
        .from('likes')
        .insert([{
          post_id: postId,
          user_id: userId
        }])
      
      if (error) throw error
    }
  }


}

export const socialService = new SocialService()
export default socialService