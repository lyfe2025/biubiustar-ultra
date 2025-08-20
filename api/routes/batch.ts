import { Router } from 'express';
import { supabase } from '../lib/supabase';
import asyncHandler from '../middleware/asyncHandler.js';
// import { authenticateUser } from '../middleware/auth';

const router = Router();

/**
 * 批量获取首页数据 - 优化版本
 * 同时获取posts和activities，减少API调用次数
 */
router.get('/home-data', asyncHandler(async (req, res) => {
  try {
    const postsLimit = parseInt(req.query.postsLimit as string) || 3;
    const activitiesLimit = parseInt(req.query.activitiesLimit as string) || 2;
    
    // 并行获取数据以提高性能
    const [postsResult, activitiesResult] = await Promise.allSettled([
      // 获取最新的帖子
      supabase
        .from('posts')
        .select(`
          *,
          user_profiles!posts_user_id_fkey (
            id,
            username,
            avatar_url,
            display_name
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(postsLimit),
      
      // 获取即将到来的活动
      supabase
        .from('activities')
        .select(`
          *,
          activity_categories (
            id,
            name,
            color
          )
        `)
        .gte('start_time', new Date().toISOString())
        .eq('status', 'published')
        .order('start_time', { ascending: true })
        .limit(activitiesLimit)
    ]);

    // 处理posts结果
    let posts = [];
    let postsError = null;
    if (postsResult.status === 'fulfilled') {
      if (postsResult.value.error) {
        postsError = postsResult.value.error.message;
        console.error('Error fetching posts:', postsResult.value.error);
      } else {
        posts = postsResult.value.data || [];
      }
    } else {
      postsError = postsResult.reason?.message || 'Failed to fetch posts';
      console.error('Posts promise rejected:', postsResult.reason);
    }

    // 处理activities结果
    let activities = [];
    let activitiesError = null;
    if (activitiesResult.status === 'fulfilled') {
      if (activitiesResult.value.error) {
        activitiesError = activitiesResult.value.error.message;
        console.error('Error fetching activities:', activitiesResult.value.error);
      } else {
        activities = activitiesResult.value.data || [];
      }
    } else {
      activitiesError = activitiesResult.reason?.message || 'Failed to fetch activities';
      console.error('Activities promise rejected:', activitiesResult.reason);
    }

    // 返回结果，即使部分失败也返回成功的数据
    res.json({
      success: true,
      data: {
        posts,
        activities
      },
      errors: {
        posts: postsError,
        activities: activitiesError
      },
      meta: {
        postsCount: posts.length,
        activitiesCount: activities.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Batch home data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch home page data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * 批量获取帖子详情页数据
 * 同时获取帖子详情、评论、点赞状态等
 */
router.get('/post-detail/:id', asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId as string;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Post ID is required'
      });
    }

    // 并行获取所有相关数据
    const [postResult, commentsResult, likesResult, categoriesResult] = await Promise.allSettled([
      // 获取帖子详情
      supabase
        .from('posts')
        .select(`
          *,
          user_profiles!posts_user_id_fkey (
            id,
            username,
            avatar_url,
            display_name
          )
        `)
        .eq('id', id)
        .single(),
      
      // 获取评论
      supabase
        .from('comments')
        .select(`
          *,
          user_profiles!comments_user_id_fkey (
            id,
            username,
            avatar_url,
            display_name
          )
        `)
        .eq('post_id', id)
        .order('created_at', { ascending: true }),
      
      // 获取点赞信息
      Promise.all([
        // 点赞总数
        supabase
          .from('post_likes')
          .select('id')
          .eq('post_id', id),
        // 用户是否点赞
        userId ? supabase
          .from('post_likes')
          .select('id')
          .eq('post_id', id)
          .eq('user_id', userId)
          .single() : Promise.resolve({ data: null, error: null })
      ]),
      
      // 获取内容分类
      supabase
        .from('content_categories')
        .select('*')
        .order('name')
    ]);

    // 处理结果
    const result: any = {
      success: true,
      data: {},
      errors: {}
    };

    // 处理帖子数据
    if (postResult.status === 'fulfilled' && !postResult.value.error) {
      result.data.post = postResult.value.data;
    } else {
      result.errors.post = postResult.status === 'fulfilled' 
        ? postResult.value.error?.message 
        : postResult.reason?.message;
    }

    // 处理评论数据
    if (commentsResult.status === 'fulfilled' && !commentsResult.value.error) {
      result.data.comments = commentsResult.value.data || [];
    } else {
      result.errors.comments = commentsResult.status === 'fulfilled'
        ? commentsResult.value.error?.message
        : commentsResult.reason?.message;
      result.data.comments = [];
    }

    // 处理点赞数据
    if (likesResult.status === 'fulfilled') {
      const [likesCountResult, userLikeResult] = likesResult.value;
      result.data.likesCount = likesCountResult.data?.length || 0;
      result.data.isLiked = !!userLikeResult.data;
    } else {
      result.errors.likes = likesResult.reason?.message;
      result.data.likesCount = 0;
      result.data.isLiked = false;
    }

    // 处理分类数据
    if (categoriesResult.status === 'fulfilled' && !categoriesResult.value.error) {
      result.data.categories = categoriesResult.value.data || [];
    } else {
      result.errors.categories = categoriesResult.status === 'fulfilled'
        ? categoriesResult.value.error?.message
        : categoriesResult.reason?.message;
      result.data.categories = [];
    }

    res.json(result);

  } catch (error) {
    console.error('Batch post detail error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch post detail data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * 批量获取活动页面数据
 * 同时获取活动列表和分类
 */
router.get('/activities-data', asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    
    // 并行获取活动和分类数据
    const [activitiesResult, categoriesResult] = await Promise.allSettled([
      // 获取活动列表
      supabase
        .from('activities')
        .select(`
          *,
          activity_categories (
            id,
            name,
            color
          )
        `)
        .eq('status', 'published')
        .order('start_time', { ascending: true })
        .range(offset, offset + limit - 1),
      
      // 获取活动分类
      supabase
        .from('activity_categories')
        .select('*')
        .order('name')
    ]);

    const result: any = {
      success: true,
      data: {},
      errors: {}
    };

    // 处理活动数据
    if (activitiesResult.status === 'fulfilled' && !activitiesResult.value.error) {
      result.data.activities = activitiesResult.value.data || [];
    } else {
      result.errors.activities = activitiesResult.status === 'fulfilled'
        ? activitiesResult.value.error?.message
        : activitiesResult.reason?.message;
      result.data.activities = [];
    }

    // 处理分类数据
    if (categoriesResult.status === 'fulfilled' && !categoriesResult.value.error) {
      result.data.categories = categoriesResult.value.data || [];
    } else {
      result.errors.categories = categoriesResult.status === 'fulfilled'
        ? categoriesResult.value.error?.message
        : categoriesResult.reason?.message;
      result.data.categories = [];
    }

    result.meta = {
      page,
      limit,
      activitiesCount: result.data.activities.length,
      categoriesCount: result.data.categories.length,
      timestamp: new Date().toISOString()
    };

    res.json(result);

  } catch (error) {
    console.error('Batch activities data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch activities data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

export default router;