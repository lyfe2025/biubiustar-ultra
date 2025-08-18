import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/activities - 获取活动列表
router.get('/', async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { 
      limit = 10, 
      offset = 0, 
      category, 
      status = 'active',
      upcoming = false 
    } = req.query;

    let query = supabase
      .from('activities')
      .select('*')
      .eq('status', status)
      .order('start_date', { ascending: true });

    // 如果只获取即将到来的活动
    if (upcoming === 'true') {
      const now = new Date().toISOString();
      query = query.gte('start_date', now);
    }

    // 按分类筛选
    if (category) {
      query = query.eq('category', category);
    }

    // 分页
    query = query.range(Number(offset), Number(offset) + Number(limit) - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching activities:', error);
      return res.status(500).json({ error: 'Failed to fetch activities' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in GET /activities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/activities/upcoming - 获取即将到来的活动
router.get('/upcoming', async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { limit = 10 } = req.query;
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('status', 'active')
      .gte('start_date', now)
      .order('start_date', { ascending: true })
      .limit(Number(limit));

    if (error) {
      console.error('Error fetching upcoming activities:', error);
      return res.status(500).json({ error: 'Failed to fetch upcoming activities' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Error in GET /activities/upcoming:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/activities/:id - 获取单个活动
router.get('/:id', async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Activity not found' });
      }
      console.error('Error fetching activity:', error);
      return res.status(500).json({ error: 'Failed to fetch activity' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in GET /activities/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/activities/:id/participants - 获取活动参与者
router.get('/:id/participants', async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const { data, error } = await supabase
      .from('activity_participants')
      .select(`
        id,
        activity_id,
        user_id,
        joined_at,
        user_profiles!inner(
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('activity_id', id)
      .order('joined_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) {
      console.error('Error fetching activity participants:', error);
      return res.status(500).json({ error: 'Failed to fetch activity participants' });
    }

    // 格式化返回数据
    const formattedParticipants = (data as any[])?.map((participant: any) => {
      const userProfile = participant.user_profiles as any;
      return {
        id: participant.id,
        activity_id: participant.activity_id,
        user_id: participant.user_id,
        joined_at: participant.joined_at,
        user: {
          id: userProfile.id,
          username: userProfile.username,
          full_name: userProfile.full_name,
          avatar_url: userProfile.avatar_url
        }
      };
    }) || [];

    res.json(formattedParticipants);
  } catch (error) {
    console.error('Error in GET /activities/:id/participants:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/activities - 创建活动
router.post('/', async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const {
      title,
      description,
      image_url,
      start_date,
      end_date,
      location,
      max_participants,
      user_id,
      category
    } = req.body;

    // 输入验证
    if (!title || !description || !start_date || !user_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, description, start_date, user_id' 
      });
    }

    const activityData = {
      title,
      description,
      image_url,
      start_date,
      end_date,
      location,
      max_participants: max_participants || 0,
      current_participants: 0,
      user_id,
      category: category || 'other',
      status: 'active'
    };

    const { data, error } = await supabase
      .from('activities')
      .insert([activityData])
      .select()
      .single();

    if (error) {
      console.error('Error creating activity:', error);
      return res.status(500).json({ error: 'Failed to create activity' });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Error in POST /activities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/activities/:id - 更新活动
router.put('/:id', async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 移除不应该被更新的字段
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.current_participants;

    const { data, error } = await supabase
      .from('activities')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Activity not found' });
      }
      console.error('Error updating activity:', error);
      return res.status(500).json({ error: 'Failed to update activity' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in PUT /activities/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/activities/:id - 删除活动
router.delete('/:id', async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting activity:', error);
      return res.status(500).json({ error: 'Failed to delete activity' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error in DELETE /activities/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/activities/:id/join - 加入活动
router.post('/:id/join', async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'Missing user_id' });
    }

    // 检查活动是否存在
    const { data: activity, error: activityError } = await supabase
      .from('activities')
      .select('max_participants, current_participants')
      .eq('id', id)
      .single();

    if (activityError) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    // 检查是否已满员
    if (activity.max_participants > 0 && activity.current_participants >= activity.max_participants) {
      return res.status(400).json({ error: 'Activity is full' });
    }

    // 检查用户是否已经参加
    const { data: existingParticipant } = await supabase
      .from('activity_participants')
      .select('id')
      .eq('activity_id', id)
      .eq('user_id', user_id)
      .single();

    if (existingParticipant) {
      return res.status(400).json({ error: 'User already joined this activity' });
    }

    // 添加参与者
    const { error: joinError } = await supabase
      .from('activity_participants')
      .insert([{ activity_id: id, user_id }]);

    if (joinError) {
      console.error('Error joining activity:', joinError);
      return res.status(500).json({ error: 'Failed to join activity' });
    }

    // 更新当前参与者数量
    const { error: updateError } = await supabase
      .from('activities')
      .update({ current_participants: activity.current_participants + 1 })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating participant count:', updateError);
    }

    res.status(201).json({ message: 'Successfully joined activity' });
  } catch (error) {
    console.error('Error in POST /activities/:id/join:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/activities/:id/leave - 离开活动
router.delete('/:id/leave', async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'Missing user_id' });
    }

    // 删除参与记录
    const { error: leaveError } = await supabase
      .from('activity_participants')
      .delete()
      .eq('activity_id', id)
      .eq('user_id', user_id);

    if (leaveError) {
      console.error('Error leaving activity:', leaveError);
      return res.status(500).json({ error: 'Failed to leave activity' });
    }

    // 更新当前参与者数量
    const { data: activity } = await supabase
      .from('activities')
      .select('current_participants')
      .eq('id', id)
      .single();

    if (activity && activity.current_participants > 0) {
      await supabase
        .from('activities')
        .update({ current_participants: activity.current_participants - 1 })
        .eq('id', id);
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error in DELETE /activities/:id/leave:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;