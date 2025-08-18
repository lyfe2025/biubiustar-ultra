import { Router, Request, Response } from 'express'
import { supabaseAdmin } from '../../../lib/supabase.js'

const router = Router()

// 测试端点 - 不需要认证，用于调试 - 必须在认证中间件之前定义
router.get('/test', async (req: Request, res: Response): Promise<Response | void> => {
  try {
    console.log('开始测试获取系统设置...')
    
    const { data: settings, error } = await supabaseAdmin
      .from('system_settings')
      .select('*')
      .order('category', { ascending: true })
      .order('setting_key', { ascending: true })
    
    if (error) {
      console.error('获取系统设置失败:', error)
      return res.status(500).json({ error: '获取系统设置失败', details: error })
    }

    console.log('原始数据库数据:', settings)

    // 转换为前端期望的格式：{ "category.key": { value, type, description, is_public } }
    const result: Record<string, { value: any; type: string; description: string; is_public: boolean }> = {};
    
    settings?.forEach(setting => {
      const { category, setting_key, setting_value, setting_type, description, is_public } = setting;
      
      console.log(`处理设置: ${category}.${setting_key} = ${setting_value}`);
      
      // 先尝试解析 setting_value，可能包含嵌套的元数据
      let rawValue = setting_value;
      try {
        const parsedValue = JSON.parse(setting_value);
        // 如果解析成功且包含 value 字段，使用内部的 value
        if (parsedValue && typeof parsedValue === 'object' && 'value' in parsedValue) {
          rawValue = parsedValue.value;
        } else {
          rawValue = parsedValue;
        }
      } catch {
        // 如果解析失败，直接使用原始值
        rawValue = setting_value;
      }
      
      // 转换数据类型
      let convertedValue = rawValue;
      if (setting_type === 'boolean') {
        convertedValue = rawValue === true || rawValue === 'true';
      } else if (setting_type === 'number') {
        const numValue = parseFloat(rawValue);
        convertedValue = isNaN(numValue) ? 0 : numValue;
      } else if (setting_type === 'json') {
        if (typeof rawValue === 'string') {
          try {
            convertedValue = JSON.parse(rawValue);
          } catch {
            convertedValue = rawValue;
          }
        } else {
          convertedValue = rawValue;
        }
      }
      
      // 转换字段名为驼峰命名
      let camelKey = setting_key;
      if (setting_key === 'contact_email') camelKey = 'contactEmail';
      if (setting_key === 'site_domain') camelKey = 'siteDomain';
      if (setting_key === 'site_name') camelKey = 'siteName';
      if (setting_key === 'site_description') camelKey = 'siteDescription';
      if (setting_key === 'site_description_zh') camelKey = 'siteDescriptionZh';
      if (setting_key === 'site_description_zh_tw') camelKey = 'siteDescriptionZhTw';
      if (setting_key === 'site_description_en') camelKey = 'siteDescriptionEn';
      if (setting_key === 'site_description_vi') camelKey = 'siteDescriptionVi';
      if (setting_key === 'site_logo') camelKey = 'siteLogo';
      if (setting_key === 'site_favicon') camelKey = 'siteFavicon';
      if (setting_key === 'site_keywords') camelKey = 'siteKeywords';
      if (setting_key === 'tech_stack') camelKey = 'techStack';
      
      // 创建 category.key 格式的键名
      const fullKey = `${category}.${camelKey}`;
      
      console.log(`转换后的键名: ${fullKey}, 值: ${JSON.stringify(convertedValue)}`);
      
      // 创建符合前端期望的数据结构
      result[fullKey] = {
        value: convertedValue,
        type: setting_type,
        description: description || `Setting: ${setting_key}`,
        is_public: is_public || false
      };
    });
    
    console.log('最终结果:', result);
    
    res.json({ 
      success: true, 
      data: result,
      debug: {
        rawSettings: settings,
        processedCount: settings?.length || 0
      }
    });
  } catch (error) {
    console.error('测试获取系统设置失败:', error)
    res.status(500).json({ error: '服务器内部错误', details: error })
  }
})

export default router