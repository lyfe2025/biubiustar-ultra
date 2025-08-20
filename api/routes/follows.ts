/**
 * Follows API routes
 * Handle user follow/unfollow operations and related data
 */
import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import asyncHandler from '../middleware/asyncHandler.js';

const router = Router();

// POST /api/follows - 关注用户
router.post('/', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { follower_id, following_id } = req.body;

    if (!follower_id || !following_id) {
      res.status(400).json({ error: 'follower_id and following_id are required' });
      return;
    }

    if (follower_id === following_id) {
      res.status(400).json({ error: 'Cannot follow yourself' });
      return;
    }

    // 检查是否已经关注
    const { data: existingFollow } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', follower_id)
      .eq('following_id', following_id)
      .maybeSingle();

    if (existingFollow) {
      res.status(409).json({ error: 'Already following this user' });
      return;
    }

    // 创建关注关系
    const { data, error } = await supabase
      .from('follows')
      .insert({
        follower_id,
        following_id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating follow relationship:', error);
      res.status(500).json({ error: 'Failed to follow user' });
      return;
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Error in POST /follows:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}));

// DELETE /api/follows/:id - 取消关注
router.delete('/:id', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting follow relationship:', error);
      res.status(500).json({ error: 'Failed to unfollow user' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error in DELETE /follows/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}));

// DELETE /api/follows/unfollow - 通过用户ID取消关注
router.delete('/unfollow', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { follower_id, following_id } = req.body;

    if (!follower_id || !following_id) {
      res.status(400).json({ error: 'follower_id and following_id are required' });
      return;
    }

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', follower_id)
      .eq('following_id', following_id);

    if (error) {
      console.error('Error unfollowing user:', error);
      res.status(500).json({ error: 'Failed to unfollow user' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error in DELETE /follows/unfollow:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}));



// GET /api/follows/check - 检查关注状态
router.get('/check', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { follower_id, following_id } = req.query;

    if (!follower_id || !following_id) {
      res.status(400).json({ error: 'follower_id and following_id are required' });
      return;
    }

    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', follower_id)
      .eq('following_id', following_id)
      .maybeSingle();

    if (error) {
      console.error('Error checking follow status:', error);
      res.status(500).json({ error: 'Failed to check follow status' });
      return;
    }

    res.json({ is_following: !!data });
  } catch (error) {
    console.error('Error in GET /follows/check:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}));

export default router;