import { Router, Request, Response } from 'express'
import { supabaseAdmin, supabase } from '../../lib/supabase'
import { requireAdmin } from './auth'
import asyncHandler from '../../middleware/asyncHandler.js'

const router = Router()

// 对所有路由应用权限验证
router.use(requireAdmin)

// 获取所有帖子（内容管理）
router.get('/', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    // 获取分页参数
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const offset = (page - 1) * limit

    // 获取总帖子数
    const { count: totalPosts, error: countError } = await supabaseAdmin
      .from('posts')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('获取帖子总数失败:', countError)
      return res.status(500).json({ error: '获取帖子总数失败' })
    }

    const { data: posts, error } = await supabaseAdmin
      .from('posts')
      .select(`
        id,
        title,
        content,
        tags,
        likes_count,
        comments_count,
        shares_count,
        views_count,
        is_published,
        status,
        created_at,
        updated_at,
        category,
        user_id,
        media_files(
          id,
          file_url,
          file_type,
          thumbnail_url,
          display_order
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      console.error('获取帖子数据失败:', error)
      return res.status(500).json({ error: '获取帖子数据失败' })
    }

    // 获取用户信息
    const userIds = posts?.map(post => post.user_id) || []
    const { data: userProfiles } = await supabase
      .from('user_profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', userIds)
    
    // 创建用户信息映射
    const userMap = new Map()
    userProfiles?.forEach(user => {
      userMap.set(user.id, user)
    })

    // 转换数据格式以匹配AdminService接口
    const formattedPosts = posts?.map(post => {
      const user = userMap.get(post.user_id)
      return {
        id: post.id,
        title: post.title,
        content: post.content,

        media_files: post.media_files || [],
        status: post.status || 'pending',
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        shares_count: post.shares_count || 0,
        views_count: post.views_count || 0,
        created_at: post.created_at,
        updated_at: post.updated_at,
        user_id: post.user_id,
        category: post.category,
        tags: post.tags || [],
        author: {
          id: user?.id || post.user_id,
          username: user?.username || '未知用户',
          full_name: user?.full_name || user?.username || '未知用户',
          avatar_url: user?.avatar_url
        }
      }
    }) || []

    // 返回分页数据
    const totalPages = Math.ceil((totalPosts || 0) / limit)
    res.json({
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total: totalPosts || 0,
        totalPages
      }
    })
  } catch (error) {
    console.error('获取帖子列表失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
}))

// 更新帖子状态
router.put('/:id/status', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['published', 'rejected', 'pending', 'draft'].includes(status)) {
      return res.status(400).json({ error: '无效的状态值' })
    }

    const { error } = await supabaseAdmin
      .from('posts')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
    
    if (error) {
      console.error('更新帖子状态失败:', error)
      return res.status(500).json({ error: '更新帖子状态失败' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('更新帖子状态失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
}))

// 删除帖子
router.delete('/:id', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params

    // 先删除相关的点赞和评论
    await supabaseAdmin.from('post_likes').delete().eq('post_id', id)
    await supabaseAdmin.from('comments').delete().eq('post_id', id)
    
    // 删除帖子
    const { error } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('删除帖子失败:', error)
      return res.status(500).json({ error: '删除帖子失败' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('删除帖子失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
}))

export default router
