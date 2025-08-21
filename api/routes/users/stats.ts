/**
 * User Statistics API routes
 * Handle user statistics and metrics
 */
import { Router, Request, Response } from 'express';
import { supabase } from '../../lib/supabase';
import asyncHandler from '../../middleware/asyncHandler.js';
import { createUserSpecificCacheMiddleware } from '../../middleware/cache';
import { userCache } from '../../lib/cacheInstances';
import { CACHE_TTL } from '../../config/cache';

const router = Router();

// GET /api/users/:id/stats - 获取用户统计数据
router.get('/:id/stats', 
  createUserSpecificCacheMiddleware({
    cacheService: userCache,
    keyGenerator: (req) => `user:${req.params.id}:stats`
  }),
  asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;

    // 并行获取各种统计数据
    const [postsResult, activitiesResult, followersResult, followingResult, likesResult] = await Promise.all([
      // 帖子数量
      supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', id)
        .eq('is_published', true),
      
      // 活动数量
      supabase
        .from('activities')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', id),
      
      // 粉丝数量
      supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', id),
      
      // 关注数量
      supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('follower_id', id),
      
      // 获得的点赞数（帖子点赞总数）
      supabase
        .from('posts')
        .select('likes_count')
        .eq('user_id', id)
        .eq('is_published', true)
    ]);

    // 计算总点赞数
    const totalLikes = likesResult.data?.reduce((sum, post) => sum + (post.likes_count || 0), 0) || 0;

    const stats = {
      posts_count: postsResult.count || 0,
      activities_count: activitiesResult.count || 0,
      followers_count: followersResult.count || 0,
      following_count: followingResult.count || 0,
      total_likes: totalLikes
    };

    res.json(stats);
  } catch (error) {
    console.error('Error in GET /users/:id/stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}));

export default router;