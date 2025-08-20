import { Router, Request, Response } from 'express'
import { supabaseAdmin } from '../../../lib/supabase.js'
import { requireAdmin } from '../auth.js'
import asyncHandler from '../../../middleware/asyncHandler.js'

const router = Router()

// 对所有路由应用权限验证
router.use(requireAdmin)

// ==================== 活动分类管理 API ====================

// 获取所有分类
router.get('/', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('activity_categories')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('获取分类列表失败:', error)
      return res.status(500).json({ error: '获取分类列表失败' })
    }

    res.json(categories || [])
  } catch (error) {
    console.error('获取分类列表失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
}))

// 创建新分类
router.post('/', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { 
      name, description, color, icon,
      name_zh, name_zh_tw, name_en, name_vi,
      description_zh, description_zh_tw, description_en, description_vi
    } = req.body

    // 验证必填字段 - 所有语言的名称都必须填写
    if (!name_zh || !name_zh.trim()) {
      return res.status(400).json({ error: '中文分类名称为必填项' })
    }
    if (!name_zh_tw || !name_zh_tw.trim()) {
      return res.status(400).json({ error: '繁体中文分类名称为必填项' })
    }
    if (!name_en || !name_en.trim()) {
      return res.status(400).json({ error: '英文分类名称为必填项' })
    }
    if (!name_vi || !name_vi.trim()) {
      return res.status(400).json({ error: '越南语分类名称为必填项' })
    }

    // 验证颜色格式
    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return res.status(400).json({ error: '颜色格式不正确，请使用十六进制格式（如 #3B82F6）' })
    }

    // 创建分类
    const { data: category, error } = await supabaseAdmin
      .from('activity_categories')
      .insert({
        // 保持原有字段作为默认值（使用中文）
        name: name_zh.trim(),
        description: description_zh?.trim() || null,
        // 多语言字段
        name_zh: name_zh.trim(),
        name_zh_tw: name_zh_tw.trim(),
        name_en: name_en.trim(),
        name_vi: name_vi.trim(),
        description_zh: description_zh?.trim() || null,
        description_zh_tw: description_zh_tw?.trim() || null,
        description_en: description_en?.trim() || null,
        description_vi: description_vi?.trim() || null,
        // 其他字段
        color: color || '#3B82F6',
        icon: icon || 'tag',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single()

    if (error) {
      if (error.code === '23505') { // 唯一约束违反
        return res.status(400).json({ error: '分类名称已存在' })
      }
      console.error('创建分类失败:', error)
      return res.status(500).json({ error: '创建分类失败' })
    }

    res.status(201).json(category)
  } catch (error) {
    console.error('创建分类失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
}))

// 更新分类
router.put('/:id', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params
    const { 
      name, description, color, icon, is_active,
      name_zh, name_zh_tw, name_en, name_vi,
      description_zh, description_zh_tw, description_en, description_vi
    } = req.body

    // 构建更新对象
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    // 如果提供了多语言字段，则验证并更新
    if (name_zh !== undefined || name_zh_tw !== undefined || name_en !== undefined || name_vi !== undefined) {
      // 验证必填字段 - 所有语言的名称都必须填写
      if (!name_zh || !name_zh.trim()) {
        return res.status(400).json({ error: '中文分类名称为必填项' })
      }
      if (!name_zh_tw || !name_zh_tw.trim()) {
        return res.status(400).json({ error: '繁体中文分类名称为必填项' })
      }
      if (!name_en || !name_en.trim()) {
        return res.status(400).json({ error: '英文分类名称为必填项' })
      }
      if (!name_vi || !name_vi.trim()) {
        return res.status(400).json({ error: '越南语分类名称为必填项' })
      }

      // 更新多语言字段
      updateData.name = name_zh.trim() // 保持原有字段作为默认值
      updateData.name_zh = name_zh.trim()
      updateData.name_zh_tw = name_zh_tw.trim()
      updateData.name_en = name_en.trim()
      updateData.name_vi = name_vi.trim()
      updateData.description = description_zh?.trim() || null
      updateData.description_zh = description_zh?.trim() || null
      updateData.description_zh_tw = description_zh_tw?.trim() || null
      updateData.description_en = description_en?.trim() || null
      updateData.description_vi = description_vi?.trim() || null
    } else {
      // 兼容旧版本API - 如果没有提供多语言字段，使用原有字段
      if (name !== undefined) {
        if (!name || !name.trim()) {
          return res.status(400).json({ error: '分类名称为必填项' })
        }
        updateData.name = name.trim()
      }
      if (description !== undefined) {
        updateData.description = description?.trim() || null
      }
    }

    // 验证颜色格式
    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return res.status(400).json({ error: '颜色格式不正确，请使用十六进制格式（如 #3B82F6）' })
    }

    // 更新其他字段
    if (color !== undefined) updateData.color = color || '#3B82F6'
    if (icon !== undefined) updateData.icon = icon || 'tag'
    if (is_active !== undefined) updateData.is_active = is_active

    // 更新分类
    const { data: category, error } = await supabaseAdmin
      .from('activity_categories')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      if (error.code === '23505') { // 唯一约束违反
        return res.status(400).json({ error: '分类名称已存在' })
      }
      console.error('更新分类失败:', error)
      return res.status(500).json({ error: '更新分类失败' })
    }

    if (!category) {
      return res.status(404).json({ error: '分类不存在' })
    }

    res.json(category)
  } catch (error) {
    console.error('更新分类失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
}))

// 删除分类
router.delete('/:id', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params

    // 检查是否有活动使用此分类
    const { data: activities, error: activitiesError } = await supabaseAdmin
      .from('activities')
      .select('id')
      .eq('category_id', id)
      .limit(1)

    if (activitiesError) {
      console.error('检查分类使用情况失败:', activitiesError)
      return res.status(500).json({ error: '检查分类使用情况失败' })
    }

    if (activities && activities.length > 0) {
      return res.status(400).json({ error: '该分类正在被活动使用，无法删除' })
    }

    // 删除分类
    const { error } = await supabaseAdmin
      .from('activity_categories')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('删除分类失败:', error)
      return res.status(500).json({ error: '删除分类失败' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('删除分类失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
}))

// 切换分类状态
router.put('/:id/toggle', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params

    // 获取当前状态
    const { data: category, error: fetchError } = await supabaseAdmin
      .from('activity_categories')
      .select('is_active')
      .eq('id', id)
      .single()

    if (fetchError || !category) {
      return res.status(404).json({ error: '分类不存在' })
    }

    // 切换状态
    const { data: updatedCategory, error } = await supabaseAdmin
      .from('activity_categories')
      .update({ 
        is_active: !category.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('切换分类状态失败:', error)
      return res.status(500).json({ error: '切换分类状态失败' })
    }

    res.json(updatedCategory)
  } catch (error) {
    console.error('切换分类状态失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
}))

export default router