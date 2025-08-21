import { Router, Request, Response } from 'express'
import { supabaseAdmin } from '../../../lib/supabase.js'
import asyncHandler from '../../../middleware/asyncHandler.js'
import { configCache } from '../../../lib/cacheInstances.js'
import { CacheKeyGenerator, CACHE_TTL } from '../../../config/cache.js'

const router = Router()

// 获取公开设置
router.get('/', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    // 生成缓存键
    const cacheKey = CacheKeyGenerator.publicSettings()

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
    // 只获取公开的设置
    const { data: settings, error } = await supabaseAdmin
      .from('system_settings')
      .select('*')
      .eq('is_public', true)
      .order('category', { ascending: true })
      .order('setting_key', { ascending: true })
    
    if (error) {
      console.error('获取公开系统设置失败:', error)
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

    const responseData = { success: true, data: result };

    // 缓存数据 (TTL: 2小时，公开设置变化更不频繁)
    await configCache.set(cacheKey, responseData, CACHE_TTL.VERY_LONG * 2)
    
    res.json({
      ...responseData,
      _cacheInfo: {
        cached: false,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('获取分类设置失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
}))

// 获取指定分类的公开设置
router.get('/:category', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { category } = req.params
    
    if (!category) {
      return res.status(400).json({ error: '分类参数不能为空' })
    }

    // 生成缓存键
    const cacheKey = CacheKeyGenerator.publicSettings(category)

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
    // 只获取指定分类的公开设置
    const { data: settings, error } = await supabaseAdmin
      .from('system_settings')
      .select('*')
      .eq('is_public', true)
      .eq('category', category)
      .order('setting_key', { ascending: true })
    
    if (error) {
      console.error('获取公开系统设置失败:', error)
      return res.status(500).json({ error: '获取系统设置失败' })
    }

    // 转换为前端期望的对象格式
    const result: Record<string, unknown> = {};
    settings?.forEach(setting => {
      const { setting_key, setting_value, setting_type } = setting;
      
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
      
      result[camelKey] = convertedValue;
    });

    const responseData = { success: true, data: result };

    // 缓存数据 (TTL: 2小时，公开设置变化更不频繁)
    await configCache.set(cacheKey, responseData, CACHE_TTL.VERY_LONG * 2)
    
    res.json({
      ...responseData,
      _cacheInfo: {
        cached: false,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('获取公开系统设置失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
}))

export default router