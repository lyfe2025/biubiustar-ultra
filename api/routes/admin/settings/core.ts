import { Router, Request, Response } from 'express'
import { supabaseAdmin } from '../../../lib/supabase.js'
import { requireAdmin } from '../auth.js'

const router = Router()

// 对所有路由应用权限验证
router.use(requireAdmin)

// 获取系统设置
router.get('/', async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { category } = req.query
    let query = supabaseAdmin
      .from('system_settings')
      .select('*')
      .order('category', { ascending: true })
      .order('setting_key', { ascending: true })
    
    if (category) {
      query = query.eq('category', category)
    }
    
    const { data: settings, error } = await query
    
    if (error) {
      console.error('获取系统设置失败:', error)
      return res.status(500).json({ error: '获取系统设置失败' })
    }

    // 转换为前端期望的嵌套对象格式
    const result: Record<string, Record<string, unknown>> = {};
    settings?.forEach(setting => {
      const { category, setting_key, setting_value, setting_type } = setting;
      
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
      
      // 创建嵌套对象结构
      if (!result[category]) {
        result[category] = {};
      }
      result[category][camelKey] = convertedValue;
    });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('获取系统设置失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 保存系统设置
router.put('/', async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const settings = req.body
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: '设置数据格式不正确' })
    }
    
    const updates = []
    
    // 遍历所有的设置项（支持category.key格式）
    for (const [fullKey, value] of Object.entries(settings)) {
      if (fullKey.includes('.')) {
        // category.key格式
        const [category, frontendKey] = fullKey.split('.')
        
        // 将前端格式转换为数据库字段名
        let dbKey = frontendKey
        if (category === 'basic') {
          if (frontendKey === 'siteName') dbKey = 'site_name'
          else if (frontendKey === 'siteDescription') dbKey = 'site_description'
          else if (frontendKey === 'siteDescriptionZh') dbKey = 'site_description_zh'
          else if (frontendKey === 'siteDescriptionZhTw') dbKey = 'site_description_zh_tw'
          else if (frontendKey === 'siteDescriptionEn') dbKey = 'site_description_en'
          else if (frontendKey === 'siteDescriptionVi') dbKey = 'site_description_vi'
          else if (frontendKey === 'siteLogo') dbKey = 'site_logo'
          else if (frontendKey === 'siteFavicon') dbKey = 'site_favicon'
          else if (frontendKey === 'siteKeywords') dbKey = 'site_keywords'
          else if (frontendKey === 'contactEmail') dbKey = 'contact_email'
          else if (frontendKey === 'siteDomain') dbKey = 'site_domain'
          else if (frontendKey === 'techStack') dbKey = 'tech_stack'
        }
        
        let stringValue = String(value)
        
        // 如果是对象或数组，转换为JSON字符串
        if (typeof value === 'object' && value !== null) {
          stringValue = JSON.stringify(value)
        }
        
        updates.push({
          setting_key: dbKey,
          setting_value: stringValue,
          updated_at: new Date().toISOString()
        })
      } else {
        // 兼容旧格式 - 直接使用字段名
        let stringValue = String(value)
        
        if (typeof value === 'object' && value !== null) {
          stringValue = JSON.stringify(value)
        }
        
        updates.push({
          setting_key: fullKey,
          setting_value: stringValue,
          updated_at: new Date().toISOString()
        })
      }
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: '没有要更新的设置' })
    }
    
    // 批量更新设置
    try {
      const updatePromises = updates.map(async (update) => {
        // 首先尝试更新
        const { data: updateData, error: updateError } = await supabaseAdmin
          .from('system_settings')
          .update({
            setting_value: update.setting_value,
            updated_at: update.updated_at
          })
          .eq('setting_key', update.setting_key)
          .select()
        
        // 如果更新失败或没有影响行数，尝试插入
        if (updateError || !updateData || updateData.length === 0) {
          const { data: insertData, error: insertError } = await supabaseAdmin
            .from('system_settings')
            .insert({
              setting_key: update.setting_key,
              setting_value: update.setting_value,
              setting_type: 'string',
              category: 'basic',
              description: `Setting: ${update.setting_key}`,
              is_public: true,
              created_at: update.updated_at,
              updated_at: update.updated_at
            })
            .select()
          
          if (insertError) {
            console.error(`插入设置 ${update.setting_key} 失败:`, insertError)
            throw new Error(`插入设置失败: ${insertError.message}`)
          }
          
          return insertData
        } else {
          return updateData
        }
      })
      
      await Promise.all(updatePromises)
      
    } catch (error) {
      console.error('保存系统设置时发生异常:', error)
      return res.status(500).json({ 
        error: '保存系统设置失败',
        details: error.message
      })
    }
    
    res.json({ success: true, message: '系统设置保存成功' })
  } catch (error) {
    console.error('保存系统设置失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

export default router