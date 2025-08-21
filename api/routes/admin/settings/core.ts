import { Router, Request, Response } from 'express'
import { supabaseAdmin } from '../../../lib/supabase.js'
import { requireAdmin } from '../auth.js'
import asyncHandler from '../../../middleware/asyncHandler.js'
import { configCache } from '../../../lib/cacheInstances.js'
import { CacheKeyGenerator, CACHE_TTL } from '../../../config/cache.js'
import { invalidateOnSettingsUpdate } from '../../../utils/settingsCacheInvalidation.js'

const router = Router()

// 对所有路由应用权限验证
router.use(requireAdmin)

// 获取系统设置
router.get('/', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { category } = req.query as { category?: string }
    
    // 生成缓存键
    const cacheKey = CacheKeyGenerator.systemSettings(category)

    // 尝试从缓存获取数据
    const cachedData = await configCache.get(cacheKey)
    if (cachedData && typeof cachedData === 'object') {
      return res.json({
        ...cachedData,
        _cacheInfo: {
          cached: true,
          timestamp: new Date().toISOString()
        }
      })
    }

    // 缓存未命中，从数据库获取数据
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

    // 转换为前端期望的格式：{ "category.key": { value, type, description, is_public } }
    const result: Record<string, { value: any; type: string; description: string; is_public: boolean }> = {};
    settings?.forEach(setting => {
      const { category, setting_key, setting_value, setting_type, description, is_public } = setting;
      
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
      let categoryForKey = category;
      
      // 特殊处理 default_language 字段：无论在数据库中属于哪个分类，都映射到 basic.defaultLanguage
      if (setting_key === 'default_language') {
        camelKey = 'defaultLanguage';
        categoryForKey = 'basic';  // 强制映射到 basic 分类
      } else {
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
      }
      
      // 创建 category.key 格式的键名
      const fullKey = `${categoryForKey}.${camelKey}`;
      
      // 创建符合前端期望的数据结构
      result[fullKey] = {
        value: convertedValue,
        type: setting_type,
        description: description || `Setting: ${setting_key}`,
        is_public: is_public || false
      };
    });

    const responseData = { success: true, data: result };

    // 缓存数据 (TTL: 1小时，系统设置变化不频繁)
    await configCache.set(cacheKey, responseData, CACHE_TTL.VERY_LONG)

    res.json({
      ...responseData,
      _cacheInfo: {
        cached: false,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('获取系统设置失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
}))

// 保存系统设置
router.put('/', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
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
        let targetCategory = category
        
        // 特殊处理 defaultLanguage：无论前端发送的是哪个分类，都需要找到数据库中的实际分类
        if (frontendKey === 'defaultLanguage') {
          dbKey = 'default_language'
          // 保持原有的分类逻辑，让数据库操作时自动匹配现有记录的分类
        } else if (category === 'basic') {
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
        let updateQuery = supabaseAdmin
          .from('system_settings')
          .update({
            setting_value: update.setting_value,
            updated_at: update.updated_at
          })
          .eq('setting_key', update.setting_key)
        
        // 执行更新操作
        const { data: updateData, error: updateError } = await updateQuery.select()
        
        console.log(`更新设置 ${update.setting_key}:`, { updateData, updateError })
        
        // 如果更新失败或没有影响行数，尝试插入
        if (updateError || !updateData || updateData.length === 0) {
          // 对于 default_language，如果更新失败，先检查是否存在于其他分类中
          if (update.setting_key === 'default_language') {
            console.log('default_language 更新失败，检查是否存在于数据库中...')
            
            const { data: existingData, error: checkError } = await supabaseAdmin
              .from('system_settings')
              .select('*')
              .eq('setting_key', 'default_language')
            
            console.log('检查 default_language 存在性:', { existingData, checkError })
            
            if (!checkError && existingData && existingData.length > 0) {
              // 记录存在，但可能在不同分类中，强制更新
              console.log('找到 default_language 记录，执行强制更新...')
              
              const { data: forceUpdateData, error: forceUpdateError } = await supabaseAdmin
                .from('system_settings')
                .update({
                  setting_value: update.setting_value,
                  updated_at: update.updated_at
                })
                .eq('setting_key', 'default_language')
                .select()
              
              console.log('强制更新结果:', { forceUpdateData, forceUpdateError })
              
              if (forceUpdateError) {
                console.error(`强制更新 default_language 失败:`, forceUpdateError)
                throw new Error(`强制更新设置失败: ${forceUpdateError.message}`)
              }
              
              return forceUpdateData
            } else {
              console.log('default_language 记录不存在，将创建新记录')
            }
          }
          
          // 如果记录不存在，插入新记录
          console.log(`准备插入新设置记录: ${update.setting_key}`)
          
          const insertRecord = {
            setting_key: update.setting_key,
            setting_value: update.setting_value,
            setting_type: 'string',
            category: update.setting_key === 'default_language' ? 'basic' : 'basic',
            description: `Setting: ${update.setting_key}`,
            is_public: true,
            created_at: update.updated_at,
            updated_at: update.updated_at
          }
          
          console.log('插入记录数据:', insertRecord)
          
          const { data: insertData, error: insertError } = await supabaseAdmin
            .from('system_settings')
            .insert(insertRecord)
            .select()
          
          console.log(`插入设置 ${update.setting_key} 结果:`, { insertData, insertError })
          
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

    // 智能缓存失效 - 分析受影响的分类
    try {
      const affectedCategories = new Set<string>();
      
      // 从更新的设置中提取分类信息
      for (const [fullKey] of Object.entries(settings)) {
        if (fullKey.includes('.')) {
          const [category] = fullKey.split('.');
          affectedCategories.add(category);
        } else {
          // 兼容旧格式，假设为basic分类
          affectedCategories.add('basic');
        }
      }

      await invalidateOnSettingsUpdate(Array.from(affectedCategories));
      console.log('系统设置缓存失效完成，受影响分类:', Array.from(affectedCategories));
    } catch (cacheError) {
      console.error('系统设置缓存失效失败:', cacheError);
      // 缓存失效失败不应该影响设置保存的成功响应
    }
    
    res.json({ success: true, message: '系统设置保存成功' })
  } catch (error) {
    console.error('保存系统设置失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
}))

export default router