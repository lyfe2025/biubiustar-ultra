/**
 * User Profile API routes
 * Handle user profile operations including get, update, and avatar upload
 */
import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { supabaseAdmin } from '../../lib/supabase.js';
import { asyncHandler } from '../../middleware/asyncHandler';
import { UploadSecurity, DEFAULT_UPLOAD_CONFIGS } from '../../utils/uploadSecurity';

const router = Router();

// 配置multer用于头像上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: DEFAULT_UPLOAD_CONFIGS.avatar.maxFileSize,
    files: DEFAULT_UPLOAD_CONFIGS.avatar.maxFiles
  },
  fileFilter: (req, file, cb) => {
    // 使用安全工具类进行文件验证
    const isExtensionSafe = UploadSecurity.isExtensionSafe(file.originalname);
    const isMimeTypeAllowed = UploadSecurity.isMimeTypeAllowed(file.mimetype);
    
    if (isExtensionSafe && isMimeTypeAllowed) {
      cb(null, true);
    } else {
      console.error(`危险文件被拒绝: ${file.originalname}, MIME: ${file.mimetype}`);
      cb(null, false);
    }
  }
});

// GET /api/users/:id/profile - 获取用户资料
router.get('/:id/profile', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  const { id } = req.params;

  // 获取用户基本信息
  const { data: user, error: userError } = await supabaseAdmin
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
}));

// PUT /api/users/:id/profile - 更新用户资料
router.put('/:id/profile', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  const { id } = req.params;
  const updateData = req.body;

  // 移除不允许更新的字段
  const { id: _id, created_at: _createdAt, updated_at: _updatedAt, ...allowedData } = updateData;
  // 避免未使用变量警告
  void _id; void _createdAt; void _updatedAt;

  const { data, error } = await supabaseAdmin
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
}));

// POST /api/users/avatar - 上传用户头像
router.post('/avatar', upload.single('avatar'), asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
    const file = req.file;
    const authHeader = req.headers.authorization;

    if (!file) {
      res.status(400).json({ error: '请选择要上传的头像文件' });
      return;
    }

    console.log('头像上传请求 - Authorization header:', authHeader ? 'present' : 'missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('认证失败: 缺少或格式错误的Authorization header');
      res.status(401).json({ error: '未找到认证令牌' });
      return;
    }

    const token = authHeader.substring(7);
    console.log('提取的token长度:', token.length);
    
    // 验证用户身份
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      console.error('用户认证失败:', authError);
      res.status(401).json({ error: '认证失败' });
      return;
    }
    
    console.log('用户认证成功:', user.id);

    // 使用安全工具类验证文件
    const validationResult = UploadSecurity.validateFile({
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer
    }, DEFAULT_UPLOAD_CONFIGS.avatar.maxFileSize);
    
    if (!validationResult.isValid) {
      console.error(`文件安全验证失败: ${file.originalname}`, validationResult.error);
      res.status(400).json({ 
        error: '文件安全验证失败', 
        details: validationResult.error 
      });
      return;
    }

    // 确保头像上传目录安全
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    UploadSecurity.ensureSecureUploadDir(uploadDir);

    // 生成安全的文件名
    const safeFileName = UploadSecurity.generateSafeFilename(file.originalname, user.id);
    const filePath = path.join(uploadDir, safeFileName);

    console.log(`头像上传开始: 用户${user.id}, 文件${safeFileName}`);
    console.log('安全验证通过: 文件格式和内容验证成功');

    // 保存文件到本地
    fs.writeFileSync(filePath, file.buffer);

    // 生成本地访问URL
    const relativePath = `/uploads/avatars/${safeFileName}`;
    const avatarUrl = `${req.protocol}://${req.get('host')}${relativePath}`;

    // 更新用户资料中的头像URL
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({ 
        avatar_url: avatarUrl,
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

    console.log(`头像上传成功: ${safeFileName}, 大小: ${file.size} bytes, URL: ${avatarUrl}`);

    res.json({
      message: '头像上传成功',
      avatar_url: avatarUrl,
      profile: updatedProfile,
      data: {
        filename: safeFileName,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        path: relativePath,
        url: avatarUrl
      }
    });

}));

export default router;