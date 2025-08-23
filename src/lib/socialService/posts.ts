import { apiCache } from '../../services/apiCache'
import { clearPostCache } from './utils'
import { validateUserLogin } from './utils'
import type { Post } from './types'

export class PostService {
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
      // 尝试获取认证token（如果用户已登录）
      let headers: Record<string, string> = {};
      
      try {
        const sessionData = localStorage.getItem('supabase.auth.token');
        if (sessionData) {
          const session = JSON.parse(sessionData);
          const accessToken = session.access_token;
          
          if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
            console.log('🔍 [FRONTEND] getPost: 携带认证token');
          } else {
            console.log('🔍 [FRONTEND] getPost: 未找到有效的access_token');
          }
        } else {
          console.log('🔍 [FRONTEND] getPost: 未找到session数据，用户未登录');
        }
      } catch (tokenError) {
        console.log('🔍 [FRONTEND] getPost: 获取token失败，继续以未登录状态请求:', tokenError);
        // 继续执行，不抛出错误
      }
      
      console.log('🔍 [FRONTEND] getPost: 请求帖子详情 ID:', id);
      
      const response = await fetch(`/api/posts/${id}`, {
        headers
      });
      
      console.log('🔍 [FRONTEND] getPost: 响应状态:', response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('🔍 [FRONTEND] getPost: 帖子不存在 (404)');
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🔍 [FRONTEND] getPost: 响应数据:', data.success ? '成功' : '失败');
      
      // 适应API返回格式：{success: true, data: {post: actualPostData}}
      if (data.success && data.data && data.data.post) {
        return data.data.post;
      }
      // 兼容旧格式
      return data;
    } catch (error) {
      console.error('🔍 [FRONTEND] getPost: 请求失败:', error);
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
      let createdPost;
      // 适应API返回格式：{success: true, data: formattedComment}
      if (data.success && data.data) {
        createdPost = data.data;
      } else {
        // 兼容旧格式
        createdPost = data;
      }
      
      // 清除相关缓存，确保新帖子能立即显示
      apiCache.invalidatePattern('posts:*'); // 清除帖子列表缓存
      apiCache.invalidatePattern('user_posts:*'); // 清除用户帖子缓存
      apiCache.invalidatePattern('post_*_count:*'); // 清除帖子统计缓存
      
      return createdPost;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  // 删除帖子
  async deletePost(postId: string): Promise<void> {
    try {
      const accessToken = validateUserLogin();
      
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

  // 获取热门帖子（保持向后兼容）
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

  // 获取热门帖子（支持分页）
  async getTrendingPostsPaginated(
    page: number = 1, 
    limit: number = 20, 
    category?: string, 
    search?: string
  ): Promise<{ posts: Post[]; total: number; hasMore: boolean }> {
    const cacheKey = `trending_posts_paginated_${page}_${limit}_${category || 'all'}_${search || 'none'}`;
    
    return apiCache.cached(
      'trending_posts_paginated',
      async () => {
        try {
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            sort: 'trending'
          });
          
          if (category) {
            params.append('category', category);
          }
          
          if (search) {
            params.append('search', search);
          }
          
          const url = `/api/posts?${params}`;
          console.log('getTrendingPostsPaginated: 请求URL:', url);
          
          const response = await fetch(url);
          console.log('getTrendingPostsPaginated: 响应状态:', response.status, response.statusText);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('getTrendingPostsPaginated: 原始响应数据:', data);
          
          // 处理不同的API返回格式
          let posts: Post[] = [];
          let total = 0;
          
          if (data.success && data.data) {
            // 新格式：{success: true, data: {posts: [...], pagination: {total_count: number}}}
            posts = data.data.posts || [];
            total = data.data.pagination?.total_count || data.data.total || 0;
          } else if (data.posts) {
            // 兼容格式：{posts: [...], total: number}
            posts = data.posts;
            total = data.total || 0;
          } else if (Array.isArray(data)) {
            // 直接数组格式
            posts = data;
            total = data.length;
          }
          
          if (!Array.isArray(posts)) {
            console.warn('getTrendingPostsPaginated: API returned non-array data, using empty array');
            posts = [];
          }
          
          const hasMore = page * limit < total;
          
          console.log('getTrendingPostsPaginated: 返回结果 - posts数量:', posts.length, 'total:', total, 'hasMore:', hasMore);
          
          return {
            posts,
            total,
            hasMore
          };
        } catch (error) {
          console.error('Error fetching trending posts paginated:', error);
          return {
            posts: [],
            total: 0,
            hasMore: false
          };
        }
      },
      { cacheKey },
      2 * 60 * 1000 // 2分钟缓存
    );
  }

  // 获取用户的帖子
  async getUserPosts(userId: string, page = 1, limit = 10): Promise<{ posts: Post[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
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
}
