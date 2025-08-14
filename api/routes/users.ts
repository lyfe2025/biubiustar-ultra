/**
 * Users API routes
 * Handle user profile, statistics, and user-related data operations
 */
import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import { supabase } from '../lib/supabase';

const router = Router();

// 配置multer用于头像上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB限制
  },
  fileFilter: (req, file, cb) => {
    // 只允许图片文件
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

// GET /api/users/:id/profile - 获取用户资料
router.get('/:id/profile', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // 获取用户基本信息
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (userError) {
      console.error('Error fetching user profile:', userError);
      res.status(500).json({ error: 'Failed to fetch user profile' });
      return;
    }

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Error in GET /users/:id/profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/users/:id/profile - 更新用户资料
router.put('/:id/profile', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 移除不允许更新的字段
    const { id: _, created_at, updated_at, ...allowedData } = updateData;

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...allowedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      console.error('Error updating user profile:', error);
      res.status(500).json({ error: 'Failed to update user profile' });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error('Error in PUT /users/:id/profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/:id/stats - 获取用户统计数据
router.get('/:id/stats', async (req: Request, res: Response): Promise<void> => {
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
});

// GET /api/users/:id/posts - 获取用户帖子列表
router.get('/:id/posts', async (req: Request, res: Response): Promise<void> => {
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

// GET /api/users/:id/followers - 获取粉丝列表
router.get('/:id/followers', async (req: Request, res: Response): Promise<void> => {
  try {
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
  } catch (error) {
    console.error('Error in GET /users/:id/followers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/:id/following - 获取关注列表
router.get('/:id/following', async (req: Request, res: Response): Promise<void> => {
  try {
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
  } catch (error) {
    console.error('Error in GET /users/:id/following:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/:id/followers/count - 获取粉丝数
router.get('/:id/followers/count', async (req: Request, res: Response): Promise<void> => {
  try {
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
  } catch (error) {
    console.error('Error in GET /users/:id/followers/count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/:id/following/count - 获取关注数
router.get('/:id/following/count', async (req: Request, res: Response): Promise<void> => {
  try {
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
  } catch (error) {
    console.error('Error in GET /users/:id/following/count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/:id/activities - 获取用户活动列表
router.get('/:id/activities', async (req: Request, res: Response): Promise<void> => {
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
router.get('/:id/created-activities', async (req: Request, res: Response): Promise<void> => {
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

// POST /api/users/avatar - 上传用户头像
router.post('/avatar', upload.single('avatar'), async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;
    const authHeader = req.headers.authorization;

    if (!file) {
      res.status(400).json({ error: '请选择要上传的头像文件' });
      return;
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: '未提供有效的认证令牌' });
      return;
    }

    const token = authHeader.substring(7);
    
    // 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      res.status(401).json({ error: '认证失败' });
      return;
    }

    // 生成文件名
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // 上传到Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (uploadError) {
      console.error('头像上传错误:', uploadError);
      res.status(500).json({ error: '头像上传失败' });
      return;
    }

    // 获取公共URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // 更新用户资料中的头像URL
    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        avatar_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('更新用户资料错误:', updateError);
      res.status(500).json({ error: '更新用户资料失败' });
      return;
    }

    res.json({
      message: '头像上传成功',
      avatar_url: publicUrl,
      profile: updatedProfile
    });

  } catch (error) {
    console.error('头像上传处理错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// PUT /api/users/:id/status - 更新用户状态（管理员功能）
router.put('/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 验证状态值
    const validStatuses = ['active', 'suspended', 'banned', 'pending'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status value' });
      return;
    }

    // 更新用户状态（这里需要在user_profiles表中添加status字段）
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ 
        status,
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update user status error:', error);
      res.status(500).json({ error: 'Failed to update user status' });
      return;
    }

    res.json({ data });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/users/:id/role - 更新用户角色（管理员功能）
router.put('/:id/role', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // 验证角色值
    const validRoles = ['user', 'moderator', 'admin'];
    if (!validRoles.includes(role)) {
      res.status(400).json({ error: 'Invalid role value' });
      return;
    }

    // 更新用户角色（这里需要在user_profiles表中添加role字段）
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ 
        role,
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update user role error:', error);
      res.status(500).json({ error: 'Failed to update user role' });
      return;
    }

    res.json({ data });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/users/:id - 删除用户（管理员功能）
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // 删除用户资料（这会级联删除相关数据）
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Failed to delete user' });
      return;
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users - 获取用户列表（管理员功能）
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, status, role, search } = req.query;
    
    let query = supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    // 添加筛选条件
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (role && role !== 'all') {
      query = query.eq('role', role);
    }
    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    // 分页
    const offset = (Number(page) - 1) * Number(limit);
    query = query.range(offset, offset + Number(limit) - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
      return;
    }

    res.json({ 
      data: data || [], 
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;