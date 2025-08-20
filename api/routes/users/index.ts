/**
 * Users API routes - Main router
 * Integrates all user-related route modules and admin functions
 */
import { Router, Request, Response } from 'express';
import { supabase } from '../../lib/supabase';
import profileRoutes from './profile';
import statsRoutes from './stats';
import postsRoutes from './posts';
import socialRoutes from './social';
import asyncHandler from '../../middleware/asyncHandler.js';

const router = Router();

// 整合所有子模块路由
router.use('/', profileRoutes);
router.use('/', statsRoutes);
router.use('/', postsRoutes);
router.use('/', socialRoutes);

// 管理员功能路由

// PUT /api/users/:id - 更新用户资料
router.put('/:id', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 验证必要字段
    const allowedFields = ['full_name', 'bio', 'location', 'website', 'avatar_url'];
    const filteredData: any = {};
    
    // 只允许更新指定字段
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        filteredData[key] = updateData[key];
      }
    });

    // 如果没有有效的更新数据
    if (Object.keys(filteredData).length === 0) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }

    // 添加更新时间
    filteredData.updated_at = new Date().toISOString();

    // 更新用户资料
    const { data, error } = await supabase
      .from('user_profiles')
      .update(filteredData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update user profile error:', error);
      res.status(500).json({ error: 'Failed to update user profile' });
      return;
    }

    if (!data) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ data });
  } catch (error) {
    console.error('Error in PUT /users/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}));

// GET /api/users/:id - 获取单个用户信息
router.get('/:id', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;

    // 获取用户基本信息
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (userError) {
      console.error('Error fetching user:', userError);
      res.status(500).json({ error: 'Failed to fetch user' });
      return;
    }

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Error in GET /users/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}));

// PUT /api/users/:id/status - 更新用户状态（管理员功能）
router.put('/:id/status', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
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
}));

// PUT /api/users/:id/role - 更新用户角色（管理员功能）
router.put('/:id/role', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
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
}));

// DELETE /api/users/:id - 删除用户（管理员功能）
router.delete('/:id', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
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
}));

// GET /api/users - 获取用户列表（管理员功能）
router.get('/', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
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
      query = query.or(`username.ilike.%${search}%,full_name.ilike.%${search}%`);
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
}));

export default router;