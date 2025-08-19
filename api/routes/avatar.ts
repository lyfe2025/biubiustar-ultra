import { Router } from 'express';
import { getInitials, generateDefaultAvatar } from '../../src/utils/avatarGenerator.js';

const router = Router();

/**
 * 生成默认头像
 * GET /api/avatar/default?username=xxx&size=64
 */
router.get('/default', (req, res) => {
  try {
    const { username, size } = req.query;
    
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: '用户名参数是必需的' });
    }
    
    const avatarSize = size ? parseInt(size as string, 10) : 64;
    
    // 验证尺寸参数
    if (isNaN(avatarSize) || avatarSize < 16 || avatarSize > 512) {
      return res.status(400).json({ error: '头像尺寸必须在16-512像素之间' });
    }
    
    const svg = generateDefaultAvatar(username, avatarSize);
    
    // 设置响应头
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 缓存24小时
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    res.send(svg);
  } catch (error) {
    console.error('生成默认头像时出错:', error);
    res.status(500).json({ error: '生成头像失败' });
  }
});

/**
 * 获取用户名首字母（用于前端预览）
 * GET /api/avatar/initials?username=xxx
 */
router.get('/initials', (req, res) => {
  try {
    const { username } = req.query;
    
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: '用户名参数是必需的' });
    }
    
    const initials = getInitials(username);
    
    res.json({ initials });
  } catch (error) {
    console.error('获取用户名首字母时出错:', error);
    res.status(500).json({ error: '获取首字母失败' });
  }
});

export default router;