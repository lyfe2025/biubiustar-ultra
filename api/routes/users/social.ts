/**
 * User Social API routes
 * Handle user social relationships (followers, following)
 */
import { Router, Request, Response } from 'express';
import { supabase } from '../../lib/supabase';
import asyncHandler from '../../middleware/asyncHandler.js';

const router = Router();

// GET /api/users/:id/followers - 获取粉丝列表
router.get('/:id/followers', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
    const { id } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const { data, error } = await supabase
      .from('follows')
      .select(`
        id,
        created_at,
        follower:user_profiles!follows_follower_id_fkey(
          id,
          username,
          full_name,
          avatar_url,
          bio
        )
      `)
      .eq('following_id', id)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) {
      console.error('Error fetching followers:', error);
      res.status(500).json({ error: 'Failed to fetch followers' });
      return;
    }

    res.json(data || []);
}));

// GET /api/users/:id/following - 获取关注列表
router.get('/:id/following', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
    const { id } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const { data, error } = await supabase
      .from('follows')
      .select(`
        id,
        created_at,
        following:user_profiles!follows_following_id_fkey(
          id,
          username,
          full_name,
          avatar_url,
          bio
        )
      `)
      .eq('follower_id', id)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) {
      console.error('Error fetching following:', error);
      res.status(500).json({ error: 'Failed to fetch following' });
      return;
    }

    res.json(data || []);
}));

// GET /api/users/:id/followers/count - 获取粉丝数
router.get('/:id/followers/count', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
    const { id } = req.params;

    const { count, error } = await supabase
      .from('follows')
      .select('id', { count: 'exact', head: true })
      .eq('following_id', id);

    if (error) {
      console.error('Error counting followers:', error);
      res.status(500).json({ error: 'Failed to count followers' });
      return;
    }

    res.json({ count: count || 0 });
}));

// GET /api/users/:id/following/count - 获取关注数
router.get('/:id/following/count', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
    const { id } = req.params;

    const { count, error } = await supabase
      .from('follows')
      .select('id', { count: 'exact', head: true })
      .eq('follower_id', id);

    if (error) {
      console.error('Error counting following:', error);
      res.status(500).json({ error: 'Failed to count following' });
      return;
    }

    res.json({ count: count || 0 });
}));

export default router;