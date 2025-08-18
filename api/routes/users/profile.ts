/**
 * User Profile API routes
 * Handle user profile operations including get, update, and avatar upload
 */
import { Router, Request, Response } from 'express';
import multer from 'multer';
import { supabase } from '../../lib/supabase';

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
router.get('/:id/profile', async (req: Request, res: Response): Promise<Response | void> => {
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
router.put('/:id/profile', async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 移除不允许更新的字段
    const { id: _id, created_at: _createdAt, updated_at: _updatedAt, ...allowedData } = updateData;
    // 避免未使用变量警告
    void _id; void _createdAt; void _updatedAt;

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

// POST /api/users/avatar - 上传用户头像
router.post('/avatar', upload.single('avatar'), async (req: Request, res: Response): Promise<Response | void> => {
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
    const { error: uploadError } = await supabase.storage
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

export default router;