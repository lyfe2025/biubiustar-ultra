import { Router } from 'express'
import { supabaseAdmin } from '../../lib/supabase'
import { requireAdmin } from './auth'

const router = Router()

// 对所有路由应用权限验证
router.use(requireAdmin)

// ==================== 活动分类管理 API ====================

// 获取所有活动分类
router.get('/', async (req, res) => {
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
})

// 创建活动分类
router.post('/', async (req, res) => {
  try {
    const { name, description, color, icon } = req.body

    // 验证必填字段
    if (!name || !name.trim()) {
      return res.status(400).json({ error: '分类名称为必填项' })
    }

    // 验证颜色格式
    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return res.status(400).json({ error: '颜色格式不正确，请使用十六进制格式（如 #3B82F6）' })
    }

    // 创建分类
    const { data: category, error } = await supabaseAdmin
      .from('activity_categories')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
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
})

// 更新活动分类
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, color, icon, is_active } = req.body

    // 验证必填字段
    if (!name || !name.trim()) {
      return res.status(400).json({ error: '分类名称为必填项' })
    }

    // 验证颜色格式
    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return res.status(400).json({ error: '颜色格式不正确，请使用十六进制格式（如 #3B82F6）' })
    }

    // 更新分类
    const { data: category, error } = await supabaseAdmin
      .from('activity_categories')
      .update({
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#3B82F6',
        icon: icon || 'tag',
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date().toISOString()
      })
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
})

// 删除活动分类
router.delete('/:id', async (req, res) => {
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
})

// 切换分类状态
router.put('/:id/toggle', async (req, res) => {
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
})

// ==================== 内容分类管理 API ====================

// 获取所有内容分类
router.get('/content-categories', async (req, res) => {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('content_categories')
      .select('*')
      .order('sort_order', { ascending: true })
    
    if (error) {
      console.error('获取内容分类列表失败:', error)
      return res.status(500).json({ error: '获取内容分类列表失败' })
    }

    res.json(categories || [])
  } catch (error) {
    console.error('获取内容分类列表失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 创建内容分类
router.post('/content-categories', async (req, res) => {
  try {
    const { name, description, color, icon, sort_order } = req.body

    // 验证必填字段
    if (!name || !name.trim()) {
      return res.status(400).json({ error: '分类名称为必填项' })
    }

    // 验证颜色格式
    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return res.status(400).json({ error: '颜色格式不正确，请使用十六进制格式（如 #3B82F6）' })
    }

    // 如果没有指定排序，获取最大排序值+1
    let finalSortOrder = sort_order
    if (!finalSortOrder) {
      const { data: maxSort } = await supabaseAdmin
        .from('content_categories')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
        .single()
      
      finalSortOrder = (maxSort?.sort_order || 0) + 1
    }

    // 创建分类
    const { data: category, error } = await supabaseAdmin
      .from('content_categories')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#3B82F6',
        icon: icon || 'folder',
        sort_order: finalSortOrder,
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
      console.error('创建内容分类失败:', error)
      return res.status(500).json({ error: '创建内容分类失败' })
    }

    res.status(201).json(category)
  } catch (error) {
    console.error('创建内容分类失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 更新内容分类
router.put('/content-categories/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, color, icon, sort_order, is_active } = req.body

    // 验证必填字段
    if (!name || !name.trim()) {
      return res.status(400).json({ error: '分类名称为必填项' })
    }

    // 验证颜色格式
    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return res.status(400).json({ error: '颜色格式不正确，请使用十六进制格式（如 #3B82F6）' })
    }

    // 更新分类
    const { data: category, error } = await supabaseAdmin
      .from('content_categories')
      .update({
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#3B82F6',
        icon: icon || 'folder',
        sort_order: sort_order || 1,
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      if (error.code === '23505') { // 唯一约束违反
        return res.status(400).json({ error: '分类名称已存在' })
      }
      console.error('更新内容分类失败:', error)
      return res.status(500).json({ error: '更新内容分类失败' })
    }

    if (!category) {
      return res.status(404).json({ error: '分类不存在' })
    }

    res.json(category)
  } catch (error) {
    console.error('更新内容分类失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 删除内容分类
router.delete('/content-categories/:id', async (req, res) => {
  try {
    const { id } = req.params

    // 检查是否有内容使用此分类
    const { data: posts, error: postsError } = await supabaseAdmin
      .from('posts')
      .select('id')
      .eq('category', id)
      .limit(1)

    if (postsError) {
      console.error('检查分类使用情况失败:', postsError)
      return res.status(500).json({ error: '检查分类使用情况失败' })
    }

    if (posts && posts.length > 0) {
      return res.status(400).json({ error: '该分类正在被内容使用，无法删除' })
    }

    // 删除分类
    const { error } = await supabaseAdmin
      .from('content_categories')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('删除内容分类失败:', error)
      return res.status(500).json({ error: '删除内容分类失败' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('删除内容分类失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 切换内容分类状态
router.put('/content-categories/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params

    // 获取当前状态
    const { data: category, error: fetchError } = await supabaseAdmin
      .from('content_categories')
      .select('is_active')
      .eq('id', id)
      .single()

    if (fetchError || !category) {
      return res.status(404).json({ error: '分类不存在' })
    }

    // 切换状态
    const { data: updatedCategory, error } = await supabaseAdmin
      .from('content_categories')
      .update({ 
        is_active: !category.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('切换内容分类状态失败:', error)
      return res.status(500).json({ error: '切换内容分类状态失败' })
    }

    res.json(updatedCategory)
  } catch (error) {
    console.error('切换内容分类状态失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

export default router
