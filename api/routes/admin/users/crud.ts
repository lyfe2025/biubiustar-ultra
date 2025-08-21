import { Router, Request, Response } from 'express'
import { supabaseAdmin } from '../../../lib/supabase'
import { clearAuthUsersCache } from './cache'
import { authenticateToken, requireAdmin } from '../../../middleware/auth'
import asyncHandler from '../../../middleware/asyncHandler'
import { userCache, statsCache } from '../../../lib/cacheInstances.js'
import { CacheKeyGenerator, CACHE_TTL } from '../../../config/cache.js'
import { 
  invalidateOnUserCreate, 
  invalidateOnUserDelete, 
  invalidateOnBatchUserDelete 
} from '../../../utils/userCacheInvalidation.js'

const router = Router()

// 对所有路由应用权限验证
router.use(requireAdmin)

// 清理失败的用户创建
async function cleanupFailedUserCreation(authUserId?: string, profileId?: string) {
  const cleanupTasks = []
  
  if (authUserId) {
    cleanupTasks.push(
      supabaseAdmin.auth.admin.deleteUser(authUserId)
        .catch(err => console.error('清理认证用户失败:', err))
    )
  }
  
  if (profileId) {
    cleanupTasks.push(
      supabaseAdmin
        .from('user_profiles')
        .delete()
        .eq('id', profileId)
        .then(result => {
          if (result.error) {
            console.error('清理用户资料失败:', result.error)
          }
        })
    )
  }
  
  await Promise.all(cleanupTasks)
}

// 原子化用户创建函数
async function createUserAtomically(userData: {
  username: string
  email: string
  password: string
  full_name?: string
  role?: string
}) {
  const { username, email, password, full_name, role = 'user' } = userData
  
  let authUserId: string | undefined
  let profileId: string | undefined
  
  try {
    // 1. 检查用户名唯一性
    const { data: existingProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('username', username)
      .single()
    
    if (existingProfile) {
      throw new Error('用户名已存在')
    }
    
    // 2. 检查邮箱唯一性
    const { data: existingAuth } = await supabaseAdmin.auth.admin.listUsers()
    const emailExists = existingAuth.users.some((user: any) => user.email === email)
    
    if (emailExists) {
      throw new Error('邮箱已存在')
    }
    
    // 3. 创建认证用户
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })
    
    if (authError || !authData.user) {
      throw new Error(`创建认证用户失败: ${authError?.message}`)
    }
    
    authUserId = authData.user.id
    
    // 4. 创建或更新用户资料
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .upsert({
        id: authUserId,
        username,
        full_name: full_name || username,
        role,
        status: 'active',
        followers_count: 0,
        following_count: 0,
        posts_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (profileError || !profileData) {
      throw new Error(`创建用户资料失败: ${profileError?.message}`)
    }
    
    profileId = profileData.id
    
    return {
      authUser: authData.user,
      profile: profileData
    }
  } catch (error) {
    // 原子化回滚：清理已创建的数据
    await cleanupFailedUserCreation(authUserId, profileId)
    throw error
  }
}

// 创建用户
router.post('/', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { username, email, password, full_name, role } = req.body

    // 验证必填字段
    if (!username || !email || !password) {
      return res.status(400).json({ error: '用户名、邮箱和密码为必填项' })
    }

    // 验证密码长度
    if (password.length < 6) {
      return res.status(400).json({ error: '密码长度至少为6位' })
    }

    // 验证角色
    if (role && !['user', 'admin', 'moderator'].includes(role)) {
      return res.status(400).json({ error: '无效的角色值' })
    }

    // 原子化创建用户
    const result = await createUserAtomically({
      username,
      email,
      password,
      full_name,
      role
    })

    // 智能缓存失效
    await invalidateOnUserCreate()

    res.status(201).json({
      message: '用户创建成功',
      user: {
        id: result.profile.id,
        username: result.profile.username,
        email: result.authUser.email,
        full_name: result.profile.full_name,
        role: result.profile.role,
        status: result.profile.status,
        created_at: result.profile.created_at
      }
    })
  } catch (error: unknown) {
    console.error('创建用户失败:', error)
    
    // 根据错误类型返回相应的状态码
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage?.includes('已存在')) {
      return res.status(409).json({ error: errorMessage })
    }
    
    res.status(500).json({ error: errorMessage || '创建用户失败' })
  }
}))

// 删除用户
router.delete('/:id', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params

    // 检查用户是否存在
    const { data: existingUser } = await supabaseAdmin
      .from('user_profiles')
      .select('username')
      .eq('id', id)
      .single()

    if (!existingUser) {
      return res.status(404).json({ error: '用户不存在' })
    }

    // 级联删除用户相关数据
    const deleteTasks = [
      // 删除用户点赞
      supabaseAdmin.from('post_likes').delete().eq('user_id', id),
      // 删除用户评论
      supabaseAdmin.from('comments').delete().eq('user_id', id),
      // 删除用户活动记录
      supabaseAdmin.from('user_activities').delete().eq('user_id', id),
      // 删除用户帖子
      supabaseAdmin.from('posts').delete().eq('user_id', id),
      // 删除关注关系
      supabaseAdmin.from('user_follows').delete().or(`follower_id.eq.${id},following_id.eq.${id}`)
    ]

    // 执行级联删除
    const deleteResults = await Promise.allSettled(deleteTasks)
    
    // 记录删除结果
    deleteResults.forEach((result, index) => {
      const taskNames = ['点赞', '评论', '活动记录', '帖子', '关注关系']
      if (result.status === 'rejected') {
        console.error(`删除用户${taskNames[index]}失败:`, result.reason)
      }
    })

    // 删除用户资料
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('id', id)

    if (profileError) {
      console.error('删除用户资料失败:', profileError)
      return res.status(500).json({ error: '删除用户资料失败' })
    }

    // 删除认证用户
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id)
    
    if (authError) {
      console.error('删除认证用户失败:', authError)
      // 注意：即使删除认证用户失败，用户资料已被删除，所以仍然返回成功
    }

    // 智能缓存失效
    await invalidateOnUserDelete(id)

    res.json({ message: '用户删除成功' })
  } catch (error) {
    console.error('删除用户失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
}))

// 批量删除用户
router.delete('/batch', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { userIds } = req.body

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: '用户ID列表不能为空' })
    }

    const results = {
      success: [] as string[],
      failed: [] as { id: string, error: string }[]
    }

    // 逐个删除用户（避免并发问题）
    for (const userId of userIds) {
      try {
        // 检查用户是否存在
        const { data: existingUser } = await supabaseAdmin
          .from('user_profiles')
          .select('username')
          .eq('id', userId)
          .single()

        if (!existingUser) {
          results.failed.push({ id: userId, error: '用户不存在' })
          continue
        }

        // 级联删除用户相关数据
        const deleteTasks = [
          supabaseAdmin.from('post_likes').delete().eq('user_id', userId),
          supabaseAdmin.from('comments').delete().eq('user_id', userId),
          supabaseAdmin.from('user_activities').delete().eq('user_id', userId),
          supabaseAdmin.from('posts').delete().eq('user_id', userId),
          supabaseAdmin.from('user_follows').delete().or(`follower_id.eq.${userId},following_id.eq.${userId}`)
        ]

        await Promise.allSettled(deleteTasks)

        // 删除用户资料
        const { error: profileError } = await supabaseAdmin
          .from('user_profiles')
          .delete()
          .eq('id', userId)

        if (profileError) {
          results.failed.push({ id: userId, error: '删除用户资料失败' })
          continue
        }

        // 删除认证用户
        await supabaseAdmin.auth.admin.deleteUser(userId)

        results.success.push(userId)
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        results.failed.push({ id: userId, error: errorMessage || '删除失败' })
      }
    }

    // 智能缓存失效（只对成功删除的用户进行缓存失效）
    if (results.success.length > 0) {
      await invalidateOnBatchUserDelete(results.success)
    }

    res.json({
      message: `批量删除完成：成功${results.success.length}个，失败${results.failed.length}个`,
      results
    })
  } catch (error) {
    console.error('批量删除用户失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
}))

// 获取用户统计数据
router.get('/stats', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const cacheKey = CacheKeyGenerator.adminUserStats()
    
    // 尝试从缓存获取统计数据
    const cachedStats = await statsCache.get(cacheKey)
    if (cachedStats && typeof cachedStats === 'object') {
      return res.json({
        success: true,
        data: cachedStats,
        _cacheInfo: {
          cached: true,
          timestamp: new Date().toISOString()
        }
      })
    }
    
    // 并行执行多个统计查询
    const [
      { count: totalUsers },
      { count: activeUsers },
      { count: newUsersThisMonth },
      { data: roleDistribution }
    ] = await Promise.all([
      // 总用户数
      supabaseAdmin.from('user_profiles').select('*', { count: 'exact', head: true }),
      
      // 活跃用户数（状态为active）
      supabaseAdmin.from('user_profiles').select('*', { count: 'exact', head: true })
        .eq('status', 'active'),
      
      // 本月新增用户数
      supabaseAdmin.from('user_profiles').select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString()),
      
      // 所有活跃用户的角色信息
      supabaseAdmin.from('user_profiles').select('role').eq('status', 'active')
    ])
    
    // 处理角色分布统计
    const roleStats = (roleDistribution || []).reduce((acc: any, user: any) => {
      const role = user.role || 'user'
      acc[role] = (acc[role] || 0) + 1
      return acc
    }, {})
    
    // 计算增长率（与上月对比）
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 2)
    const { count: lastMonthUsers } = await supabaseAdmin
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', lastMonth.toISOString())
      .lt('created_at', new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString())
    
    const growthRate = lastMonthUsers > 0 
      ? ((newUsersThisMonth || 0) - lastMonthUsers) / lastMonthUsers * 100 
      : 100
    
    const statsData = {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      newUsersThisMonth: newUsersThisMonth || 0,
      roleDistribution: roleStats,
      growthRate: Math.round(growthRate * 100) / 100, // 保留两位小数
      lastUpdated: new Date().toISOString()
    }
    
    // 缓存统计数据 (TTL: 15分钟)
    await statsCache.set(cacheKey, statsData, CACHE_TTL.MEDIUM)
    
    return res.json({
      success: true,
      data: statsData,
      _cacheInfo: {
        cached: false,
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('获取用户统计失败:', error)
    return res.status(500).json({
      success: false,
      error: '获取用户统计失败'
    })
  }
}))

export default router