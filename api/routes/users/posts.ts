/**
 * User Posts and Activities API routes
 * Handle user posts and activities operations
 */
import { Router, Request, Response } from 'express';
import { supabase } from '../../lib/supabase';

const router = Router();

// GET /api/users/:id/posts - 获取用户帖子列表
router.get('/:id/posts', async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { 
      limit = 10, 
      offset = 0, 
      category,
      is_published = true 
    } = req.query;

    let query = supabase
      .from('posts')
      .select('*')
      .eq('user_id', id)
      .eq('is_published', is_published)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user posts:', error);
      res.status(500).json({ error: 'Failed to fetch user posts' });
      return;
    }

    res.json(data || []);
  } catch (error) {
    console.error('Error in GET /users/:id/posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/:id/activities - 获取用户活动列表
router.get('/:id/activities', async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { 
      limit = 10, 
      offset = 0, 
      category,
      status = 'active' 
    } = req.query;

    let query = supabase
      .from('activities')
      .select('*')
      .eq('user_id', id)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user activities:', error);
      res.status(500).json({ error: 'Failed to fetch user activities' });
      return;
    }

    res.json(data || []);
  } catch (error) {
    console.error('Error in GET /users/:id/activities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/:id/created-activities - 获取用户创建的活动
router.get('/:id/created-activities', async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { 
      limit = 10, 
      offset = 0, 
      category, 
      status = 'active' 
    } = req.query;

    let query = supabase
      .from('activities')
      .select('*')
      .eq('user_id', id)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user created activities:', error);
      res.status(500).json({ error: 'Failed to fetch user created activities' });
      return;
    }

    res.json(data || []);
  } catch (error) {
    console.error('Error in GET /users/:id/created-activities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;