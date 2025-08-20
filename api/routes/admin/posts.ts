import { Router, Request, Response } from 'express'
import { supabaseAdmin, supabase } from '../../lib/supabase'
import { requireAdmin } from './auth'
import asyncHandler from '../../middleware/asyncHandler.js'
import { apiCache } from '../../utils/cache.js'

const router = Router()

// 对所有路由应用权限验证
router.use(requireAdmin)

// 优化的帖子总数查询函数
async function getOptimizedPostsCount() {
  try {
    // 首先尝试从缓存获取总数（缓存15分钟）
    const countCacheKey = 'admin_posts_total_count'
    const cachedCount = apiCache.get(countCacheKey)
    if (cachedCount !== null) {
      return { count: cachedCount, error: null }
    }

    // 对于大数据集，使用PostgreSQL统计信息估算
    // 当数据量较大时，使用pg_class统计信息快速估算
    const { data: statsData, error: statsError } = await supabaseAdmin
      .rpc('get_posts_count_estimate')
    
    if (!statsError && statsData && statsData > 1000) {
      // 如果估算数量大于1000，使用估算值（误差在5%以内）
      const estimatedCount = Math.round(statsData)
      apiCache.set(countCacheKey, estimatedCount, 15 * 60 * 1000) // 缓存15分钟
      return { count: estimatedCount, error: null }
    }

    // 对于小数据集或估算失败，使用精确计数
    const { count, error } = await supabaseAdmin
      .from('posts')
      .select('*', { count: 'exact', head: true })
    
    if (!error && count !== null) {
      // 缓存精确计数（缓存10分钟）
      apiCache.set(countCacheKey, count, 10 * 60 * 1000)
    }
    
    return { count, error }
  } catch (error) {
    console.error('获取帖子总数失败:', error)
    return { count: null, error }
  }
}

// 获取所有帖子（内容管理）
router.get('/', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    // 获取分页参数
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const offset = (page - 1) * limit

    // 生成缓存键
    const cacheKey = `admin_posts_${page}_${limit}`
    
    // 尝试从缓存获取数据
    const cachedData = apiCache.get(cacheKey)
    if (cachedData) {
      return res.json(cachedData)
    }

    // 缓存未命中，从数据库获取数据
    const [countResult, postsResult] = await Promise.all([
      // 获取总帖子数（优化：使用估算方式减少全表扫描）
      getOptimizedPostsCount(),
      
      // 获取帖子数据
      supabaseAdmin
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
          user_id
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
    ])

    // 检查查询错误
    if (countResult.error) {
      console.error('获取帖子总数失败:', countResult.error)
      return res.status(500).json({ error: '获取帖子总数失败' })
    }

    if (postsResult.error) {
      console.error('获取帖子数据失败:', postsResult.error)
      return res.status(500).json({ error: '获取帖子数据失败' })
    }

    const totalPosts = countResult.count
    const { data: posts } = postsResult

    // 获取所有用户ID
    const userIds = [...new Set(posts?.map(post => post.user_id).filter(Boolean) || [])]
    
    // 批量获取用户信息和媒体文件
    let userProfiles: any[] = []
    let mediaFiles: any[] = []
    
    if (userIds.length > 0) {
       const [profilesResult, mediaResult] = await Promise.all([
         supabaseAdmin
           .from('user_profiles')
           .select('id, username, full_name, avatar_url')
           .in('id', userIds),
        supabaseAdmin
          .from('media_files')
          .select('id, post_id, file_url, file_type, thumbnail_url, display_order')
          .in('post_id', posts?.map(p => p.id) || [])
      ])
      
      if (profilesResult.error) {
        console.error('获取用户信息失败:', profilesResult.error)
      } else {
        userProfiles = profilesResult.data || []
      }
      
      if (mediaResult.error) {
        console.error('获取媒体文件失败:', mediaResult.error)
      } else {
        mediaFiles = mediaResult.data || []
      }
    }

    // 创建用户信息和媒体文件映射
     const userMap = new Map()
     userProfiles.forEach(profile => {
       userMap.set(profile.id, {
         id: profile.id,
         username: profile.username,
         full_name: profile.full_name,
         avatar_url: profile.avatar_url
       })
     })
    
    const mediaMap = new Map()
    mediaFiles.forEach(media => {
      if (!mediaMap.has(media.post_id)) {
        mediaMap.set(media.post_id, [])
      }
      mediaMap.get(media.post_id).push(media)
    })

    // 转换数据格式以匹配AdminService接口
    const formattedPosts = posts?.map(post => {
      const user = userMap.get(post.user_id)
      const postMediaFiles = mediaMap.get(post.id) || []
      return {
        id: post.id,
        title: post.title,
        content: post.content,
        media_files: postMediaFiles,
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
    const responseData = {
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total: totalPosts || 0,
        totalPages
      }
    }

    // 缓存数据（5分钟）
    apiCache.set(cacheKey, responseData, 5 * 60 * 1000)

    res.json(responseData)
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

    // 清除相关缓存
    clearPostsCache()

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

    // 清除相关缓存
    clearPostsCache()

    res.json({ success: true })
  } catch (error) {
    console.error('删除帖子失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
}))

// 清除帖子相关缓存的辅助函数
function clearPostsCache(): void {
  const stats = apiCache.getStats()
  const postsCacheKeys = stats.keys.filter(key => 
    key.startsWith('admin_posts_') || key === 'admin_posts_total_count'
  )
  postsCacheKeys.forEach(key => apiCache.delete(key))
}

export default router
