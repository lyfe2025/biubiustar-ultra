import { Router, Request, Response } from 'express'
import { supabaseAdmin } from '../../../lib/supabase.js'
import { requireAdmin } from '../auth.js'

const router = Router()

// 对所有路由应用权限验证
router.use(requireAdmin)

// ==================== 内容分类管理 API ====================

// 获取所有内容分类
router.get('/', async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('content_categories')
      .select('*')
      .order('created_at', { ascending: false })
    
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

// 创建新内容分类
router.post('/', async (req: Request, res: Response): Promise<Response | void> => {
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

    // 创建内容分类
    const { data: category, error } = await supabaseAdmin
      .from('content_categories')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#3B82F6',
        icon: icon || 'folder',
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
router.put('/:id', async (req: Request, res: Response): Promise<Response | void> => {
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

    // 更新内容分类
    const { data: category, error } = await supabaseAdmin
      .from('content_categories')
      .update({
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#3B82F6',
        icon: icon || 'folder',
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
router.delete('/:id', async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params

    // 检查是否有内容使用此分类
    const { data: contents, error: contentsError } = await supabaseAdmin
      .from('posts')
      .select('id')
      .eq('category_id', id)
      .limit(1)

    if (contentsError) {
      console.error('检查分类使用情况失败:', contentsError)
      return res.status(500).json({ error: '检查分类使用情况失败' })
    }

    if (contents && contents.length > 0) {
      return res.status(400).json({ error: '该分类正在被内容使用，无法删除' })
    }

    // 删除内容分类
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
router.put('/:id/toggle', async (req: Request, res: Response): Promise<Response | void> => {
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