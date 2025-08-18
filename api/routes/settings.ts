/**
 * Public Settings API routes
 * Handle public system settings for frontend
 */
import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';

const router = Router();

// GET /api/settings/public - 获取公开的系统设置（供前台使用）
router.get('/public', async (req: Request, res: Response): Promise<Response | void> => {
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
    
    // 按分类组织设置 - 使用category.key格式（与前台SettingsService兼容）
    const settingsByCategory = settings?.reduce((acc, setting) => {
      let value = setting.setting_value
      // 根据类型转换值
      if (setting.setting_type === 'boolean') {
        value = value === 'true'
      } else if (setting.setting_type === 'number') {
        value = parseInt(value) || 0
      } else if (setting.setting_type === 'json') {
        try {
          value = JSON.parse(value)
        } catch {
          value = null
        }
      }

      // 转换数据库字段名为前端使用的格式
      let frontendKey = setting.setting_key
      if (setting.category === 'basic') {
        // 将下划线命名转换为驼峰命名
        if (setting.setting_key === 'site_name') frontendKey = 'siteName'
        else if (setting.setting_key === 'site_description') frontendKey = 'siteDescription'
        else if (setting.setting_key === 'site_description_zh') frontendKey = 'siteDescriptionZh'
        else if (setting.setting_key === 'site_description_zh_tw') frontendKey = 'siteDescriptionZhTw'
        else if (setting.setting_key === 'site_description_en') frontendKey = 'siteDescriptionEn'
        else if (setting.setting_key === 'site_description_vi') frontendKey = 'siteDescriptionVi'
        else if (setting.setting_key === 'site_logo') frontendKey = 'siteLogo'
        else if (setting.setting_key === 'site_favicon') frontendKey = 'siteFavicon'
        else if (setting.setting_key === 'site_keywords') frontendKey = 'siteKeywords'
        else if (setting.setting_key === 'contact_email') frontendKey = 'contactEmail'
        else if (setting.setting_key === 'site_domain') frontendKey = 'siteDomain'
        else if (setting.setting_key === 'tech_stack') frontendKey = 'techStack'
        else if (setting.setting_key === 'timezone') frontendKey = 'timezone'
      }

      // 使用 category.key 格式作为键名
      const categoryKey = `${setting.category}.${frontendKey}`
      acc[categoryKey] = value
      
      return acc
    }, {}) || {}
    
    res.json(settingsByCategory)
  } catch (error) {
    console.error('获取公开系统设置失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

export default router