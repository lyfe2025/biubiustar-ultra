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
  
  console.log('🚀 开始创建用户:', {
    username,
    email: email ? '***@' + email.split('@')[1] : 'undefined',
    passwordLength: password?.length,
    full_name,
    role,
    timestamp: new Date().toISOString()
  })
  
  try {
    // 1. 检查用户名唯一性
    console.log('🔍 步骤1: 检查用户名唯一性...', { username })
    const { data: existingProfile, error: usernameCheckError } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('username', username)
      .single()
    
    console.log('🔍 用户名检查结果:', {
      username,
      existingProfile: existingProfile ? { id: existingProfile.id } : null,
      error: usernameCheckError ? {
        message: usernameCheckError.message,
        code: usernameCheckError.code,
        details: usernameCheckError.details
      } : null,
      isUnique: !existingProfile
    })
    
    if (existingProfile) {
      throw new Error('用户名已存在')
    }
    
    // 2. 检查邮箱唯一性
    console.log('📧 步骤2: 检查邮箱唯一性...', { email: email ? '***@' + email.split('@')[1] : 'undefined' })
    const { data: existingAuth, error: emailListError } = await supabaseAdmin.auth.admin.listUsers()
    
    console.log('📧 邮箱列表查询结果:', {
      totalUsers: existingAuth?.users?.length || 0,
      error: emailListError ? {
        message: emailListError.message,
        code: emailListError.code
      } : null
    })
    
    if (emailListError) {
      throw new Error(`查询邮箱列表失败: ${emailListError.message}`)
    }
    
    const emailExists = existingAuth.users.some((user: any) => user.email === email)
    
    console.log('📧 邮箱唯一性检查结果:', {
      email: email ? '***@' + email.split('@')[1] : 'undefined',
      emailExists,
      isUnique: !emailExists
    })
    
    if (emailExists) {
      const friendlyError = new Error('该邮箱地址已被使用过。出于系统安全考虑，每个邮箱只能注册一次，即使之前的账户已被删除也无法重复使用。请使用其他邮箱地址进行注册。')
      console.error('🚫 邮箱唯一性检查失败:', {
        email: email ? '***@' + email.split('@')[1] : 'undefined',
        reason: '邮箱已存在',
        friendlyMessage: friendlyError.message,
        timestamp: new Date().toISOString()
      })
      throw friendlyError
    }
    
    // 3. 创建认证用户
    console.log('🔐 步骤3: 创建认证用户...', {
      email: email ? '***@' + email.split('@')[1] : 'undefined',
      passwordLength: password?.length,
      email_confirm: true
    })
    
    let authData: any
    let authError: any
    
    try {
      const createUserResult = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      })
      
      authData = createUserResult.data
      authError = createUserResult.error
      
      // 详细记录Supabase Admin API的完整响应
      console.log('🔐 Supabase Admin API 完整响应:', {
        hasData: !!authData,
        hasError: !!authError,
        dataKeys: authData ? Object.keys(authData) : [],
        errorDetails: authError ? {
          message: authError.message,
          status: authError.status,
          statusCode: authError.statusCode,
          code: authError.code,
          name: authError.name,
          details: authError.details,
          hint: authError.hint,
          stack: authError.stack,
          // 记录完整的错误对象
          fullError: JSON.stringify(authError, null, 2)
        } : null,
        timestamp: new Date().toISOString()
      })
      
    } catch (apiError: any) {
      // 捕获API调用过程中的异常
      console.error('🚨 Supabase Admin API 调用异常:', {
        errorType: typeof apiError,
        errorName: apiError?.name,
        errorMessage: apiError?.message,
        errorCode: apiError?.code,
        errorStatus: apiError?.status,
        errorStack: apiError?.stack,
        fullError: JSON.stringify(apiError, null, 2),
        timestamp: new Date().toISOString()
      })
      
      throw new Error(`Supabase Admin API 调用失败: ${apiError?.message || 'Unknown API error'}`)
    }
    
    console.log('🔐 认证用户创建结果:', {
      success: !authError && !!authData?.user,
      userId: authData?.user?.id,
      userEmail: authData?.user?.email ? '***@' + authData.user.email.split('@')[1] : 'undefined',
      error: authError ? {
        message: authError.message,
        status: authError.status,
        code: authError.code,
        details: authError.details,
        hint: authError.hint
      } : null,
      timestamp: new Date().toISOString()
    })
    
    // 检查Supabase项目配置
    if (authError) {
      console.error('🔍 Supabase认证配置检查:', {
        projectUrl: process.env.SUPABASE_URL ? 'configured' : 'missing',
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'configured' : 'missing',
        errorSuggestions: [
          '1. 检查Supabase项目是否启用了用户注册',
          '2. 验证SERVICE_ROLE_KEY权限是否正确',
          '3. 确认项目URL和密钥是否匹配',
          '4. 检查Supabase项目的认证设置'
        ],
        possibleCauses: [
          authError.message?.includes('Database error') ? 'Supabase数据库配置问题' : null,
          authError.message?.includes('Invalid') ? 'API密钥或配置无效' : null,
          authError.status === 403 ? '权限不足，检查SERVICE_ROLE_KEY' : null,
          authError.status === 400 ? '请求参数错误或项目配置问题' : null
        ].filter(Boolean)
      })
      
      throw new Error(`创建认证用户失败: ${authError.message} (状态码: ${authError.status || 'unknown'})`)
    }
    
    if (!authData?.user) {
      console.error('🚨 认证用户创建返回空数据:', {
        authData,
        hasUser: !!authData?.user,
        dataStructure: authData ? Object.keys(authData) : 'null'
      })
      throw new Error('创建认证用户失败: 返回数据为空')
    }
    
    authUserId = authData.user.id
    console.log('✅ 认证用户创建成功:', { authUserId })
    
    // 4. 创建或更新用户资料
    console.log('👤 步骤4: 创建用户资料...', {
      authUserId,
      username,
      full_name: full_name || username,
      role
    })
    
    const profileData = {
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
    }
    
    console.log('👤 准备插入的用户资料数据:', profileData)
    
    const { data: profileResult, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .upsert(profileData)
      .select()
      .single()
    
    console.log('👤 用户资料创建结果:', {
      success: !profileError && !!profileResult,
      profileId: profileResult?.id,
      username: profileResult?.username,
      error: profileError ? {
        message: profileError.message,
        code: profileError.code,
        details: profileError.details,
        hint: profileError.hint
      } : null,
      timestamp: new Date().toISOString()
    })
    
    if (profileError || !profileResult) {
      throw new Error(`创建用户资料失败: ${profileError?.message}`)
    }
    
    profileId = profileResult.id
    console.log('✅ 用户资料创建成功:', { profileId })
    
    console.log('🎉 用户创建完全成功:', {
      authUserId,
      profileId,
      username,
      email: email ? '***@' + email.split('@')[1] : 'undefined'
    })
    
    return {
      authUser: authData.user,
      profile: profileResult
    }
  } catch (error) {
    console.error('❌ 用户创建过程中发生错误:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error,
      authUserId,
      profileId,
      username,
      email: email ? '***@' + email.split('@')[1] : 'undefined',
      timestamp: new Date().toISOString()
    })
    
    // 原子化回滚：清理已创建的数据
    console.log('🔄 开始清理失败的用户创建数据...', { authUserId, profileId })
    await cleanupFailedUserCreation(authUserId, profileId)
    console.log('🔄 清理完成')
    
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
    
    // 检查是否为邮箱或用户名冲突错误
    if (errorMessage?.includes('已存在') || 
        errorMessage?.includes('已被使用过') || 
        errorMessage?.includes('无法重复使用')) {
      console.log('🚫 返回冲突错误给前端:', {
        statusCode: 409,
        errorMessage,
        timestamp: new Date().toISOString()
      })
      return res.status(409).json({ error: errorMessage })
    }
    
    console.log('🚨 返回服务器错误给前端:', {
      statusCode: 500,
      errorMessage,
      timestamp: new Date().toISOString()
    })
    res.status(500).json({ error: errorMessage || '创建用户失败' })
  }
}))

// 更新用户资料
router.put('/:id', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params
    const { username, full_name, bio, location, website } = req.body

    // 检查用户是否存在
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, username')
      .eq('id', id)
      .single()

    if (fetchError || !existingUser) {
      return res.status(404).json({ error: '用户不存在' })
    }

    // 如果更新了用户名，检查用户名唯一性
    if (username && username !== existingUser.username) {
      const { data: duplicateUser } = await supabaseAdmin
        .from('user_profiles')
        .select('id')
        .eq('username', username)
        .neq('id', id)
        .single()

      if (duplicateUser) {
        return res.status(409).json({ error: '用户名已存在' })
      }
    }

    // 构建更新数据
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (username !== undefined) updateData.username = username
    if (full_name !== undefined) updateData.full_name = full_name
    if (bio !== undefined) updateData.bio = bio
    if (location !== undefined) updateData.location = location
    if (website !== undefined) updateData.website = website

    // 更新用户资料
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update(updateData)
      .eq('id', id)
      .select('id, username, full_name, bio, location, website, role, status, created_at, updated_at')
      .single()

    if (updateError) {
      console.error('更新用户资料失败:', updateError)
      return res.status(500).json({ error: '更新用户资料失败' })
    }

    // 智能缓存失效
    await invalidateOnUserCreate() // 复用用户创建的缓存失效逻辑
    
    // 清除特定用户的缓存
    const userCacheKey = CacheKeyGenerator.userProfile(id)
    await userCache.delete(userCacheKey)

    res.json({
      message: '用户资料更新成功',
      user: updatedUser
    })
  } catch (error: unknown) {
    console.error('更新用户资料失败:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    res.status(500).json({ error: errorMessage || '更新用户资料失败' })
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