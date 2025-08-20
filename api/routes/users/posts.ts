/**
 * User Posts and Activities API routes
 * Handle user posts and activities operations
 */
import { Router, Request, Response } from 'express';
import { supabase } from '../../lib/supabase';
import asyncHandler from '../../middleware/asyncHandler.js';

const router = Router();

// GET /api/users/:id/posts - 获取用户帖子列表
router.get('/:id/posts', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { 
      limit = 10, 
      offset = 0, 
      category,
      status 
    } = req.query;

    let query = supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        tags,
        user_id,
        likes_count,
        comments_count,
        shares_count,
        is_published,
        status,
        created_at,
        updated_at,
        category,
        media_files(
          id,
          file_url,
          file_type,
          thumbnail_url,
          display_order
        )
      `)
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    // 如果指定了status参数，则按status过滤；否则显示用户所有帖子
    if (status) {
      query = query.eq('status', status);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching user posts:', error);
      res.status(500).json({ error: 'Failed to fetch user posts' });
      return;
    }

    // 获取总数
    let totalQuery = supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', id);

    if (status) {
      totalQuery = totalQuery.eq('status', status);
    }

    if (category) {
      totalQuery = totalQuery.eq('category', category);
    }

    const { count: total, error: countError } = await totalQuery;

    if (countError) {
      console.error('Error fetching user posts count:', countError);
      res.status(500).json({ error: 'Failed to fetch user posts count' });
      return;
    }

    res.json({
      posts: data || [],
      total: total || 0
    });
  } catch (error) {
    console.error('Error in GET /users/:id/posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}));

// GET /api/users/:id/activities - 获取用户参加的活动列表
router.get('/:id/activities', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { 
      limit = 10, 
      offset = 0, 
      category,
      status = 'published' 
    } = req.query;

    // 通过activity_participants表查询用户参加的活动
    let query = supabase
      .from('activity_participants')
      .select(`
        activities!inner(
          id,
          title,
          description,
          category,
          location,
          start_date,
          end_date,
          max_participants,
          current_participants,
          status,
          created_at,
          updated_at,
          user_id,
          category_id
        )
      `)
      .eq('user_id', id)
      .eq('activities.status', status)
      .order('joined_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (category) {
      query = query.eq('activities.category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user participated activities:', error);
      res.status(500).json({ error: 'Failed to fetch user participated activities' });
      return;
    }

    // 格式化数据，提取activities信息
    const activities = data?.map((item: any) => item.activities) || [];

    // 获取所有活动组织者的用户信息
    if (activities.length > 0) {
      const organizerIds = [...new Set(activities.map((activity: any) => activity.user_id))];
      const { data: organizers } = await supabase
        .from('user_profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', organizerIds);

      // 将组织者信息添加到活动中
      activities.forEach((activity: any) => {
        const organizer = organizers?.find((org: any) => org.id === activity.user_id);
        activity.organizer = {
          id: activity.user_id,
          username: organizer?.username || 'Unknown',
          full_name: organizer?.full_name || 'Unknown',
          avatar_url: organizer?.avatar_url || null
        };
      });
    }

    res.json(activities);
  } catch (error) {
    console.error('Error in GET /users/:id/activities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}));

// GET /api/users/:id/created-activities - 获取用户创建的活动
router.get('/:id/created-activities', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { 
      limit = 10, 
      offset = 0, 
      category, 
      status = 'published' 
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
}));

export default router;