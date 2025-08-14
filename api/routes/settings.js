/**
 * Public Settings API routes
 * Handle public system settings for frontend
 */
import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

const router = Router();

// GET /api/settings/public - 获取公开的系统设置（供前台使用）
router.get('/public', async (req, res) => {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from('system_settings')
      .select('setting_key, setting_value, setting_type, category')
      .eq('is_public', true)
      .order('category', { ascending: true })
      .order('setting_key', { ascending: true })
    
    if (error) {
      console.error('获取公开系统设置失败:', error)
      return res.status(500).json({ error: '获取公开系统设置失败' })
    }
    
    // 按分类组织设置
    const settingsByCategory = settings?.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {}
      }
      
      let value = setting.setting_value
      // 根据类型转换值
      if (setting.setting_type === 'boolean') {
        value = value === 'true'
      } else if (setting.setting_type === 'number') {
        value = parseInt(value) || 0
      } else if (setting.setting_type === 'json') {
        try {
          value = JSON.parse(value)
        } catch (e) {
          value = null
        }
      }
      
      acc[setting.category][setting.setting_key] = value
      
      return acc
    }, {}) || {}
    
    res.json(settingsByCategory)
  } catch (error) {
    console.error('获取公开系统设置失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

export default router