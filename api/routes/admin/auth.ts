import { Router, Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '../../lib/supabase'
import { 
  ipSecurityCheck, 
  logLoginAttempt, 
  logSecurityEvent, 
  getClientIP,
  logActivityEvent 
} from '../../middleware/security'
import asyncHandler from '../../middleware/asyncHandler.js'
import { getCachedStats } from '../../services/statsCache.js'
import { statsRateLimiter } from '../../middleware/rateLimiter.js'

const router = Router()

// 管理员权限验证中间件
export const requireAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未提供认证令牌' })
  }

  const token = authHeader.substring(7)
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  
  if (error || !user) {
    return res.status(401).json({ error: '无效的认证令牌' })
  }

  // 检查用户是否为管理员
  const { data: userProfile, error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profileError || !userProfile || userProfile.role !== 'admin') {
    return res.status(403).json({ error: '需要管理员权限' })
  }

  req.user = user
  next()
})

// 管理员登录API（应用安全检查中间件）
router.post('/login', ipSecurityCheck, asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { email, password } = req.body
    const ipAddress = req.clientIP || getClientIP(req)
    const userAgent = req.headers['user-agent'] || null
    const loginAttempts = req.loginAttempts

    if (!email || !password) {
      await logLoginAttempt(ipAddress, email, false, userAgent, 'Missing email or password')
      return res.status(400).json({ 
        error: '邮箱和密码不能为空',
        attemptsRemaining: loginAttempts ? Math.max(0, 3 - loginAttempts.recentFailedAttempts) : 3
      })
    }

    // 使用Supabase进行用户认证
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    })

    if (authError || !authData.user || !authData.session) {
      // 记录登录失败
      await logLoginAttempt(ipAddress, email, false, userAgent, 'Invalid credentials')
      
      // 计算剩余尝试次数
      const attemptsRemaining = loginAttempts ? Math.max(0, 3 - (loginAttempts.recentFailedAttempts + 1)) : 2
      
      return res.status(401).json({ 
        error: '邮箱或密码错误',
        attemptsRemaining,
        maxAttempts: 3
      })
    }

    // 查询用户资料以验证管理员权限 - 使用supabaseAdmin绕过RLS限制
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    console.log('用户认证调试信息:', {
      userId: authData.user.id,
      email: authData.user.email,
      profileError,
      userProfile,
      roleCheck: userProfile?.role === 'admin'
    })

    if (profileError || !userProfile) {
      console.log('权限检查失败:', { profileError, userProfile, role: userProfile?.role })
      await logLoginAttempt(ipAddress, email, false, userAgent, 'User profile not found')
      
      const attemptsRemaining = loginAttempts ? Math.max(0, 3 - (loginAttempts.recentFailedAttempts + 1)) : 2
      
      return res.status(403).json({ 
        error: '需要管理员权限',
        attemptsRemaining,
        maxAttempts: 3
      })
    }

    if (userProfile.role !== 'admin') {
      console.log('权限检查失败:', { profileError, userProfile, role: userProfile?.role })
      await logLoginAttempt(ipAddress, email, false, userAgent, 'Insufficient privileges - not admin')
      await logSecurityEvent(
        'unauthorized_admin_access_attempt',
        ipAddress,
        authData.user.id,
        email,
        { role: userProfile.role, userAgent },
        'warning'
      )
      await logActivityEvent(
        'admin_login',
        'unauthorized_admin_access_attempt',
        { role: userProfile.role, userAgent },
        authData.user.id,
        email,
        ipAddress,
        userAgent
      )
      
      const attemptsRemaining = loginAttempts ? Math.max(0, 3 - (loginAttempts.recentFailedAttempts + 1)) : 2
      
      return res.status(403).json({ 
        error: '需要管理员权限',
        attemptsRemaining,
        maxAttempts: 3
      })
    }

    // 记录成功登录
    await logLoginAttempt(ipAddress, email, true, userAgent)
    await logSecurityEvent(
      'admin_login_success',
      ipAddress,
      authData.user.id,
      email,
      { username: userProfile.username, userAgent },
      'info'
    )
    await logActivityEvent(
      'admin_login',
      'admin_login_success',
      { username: userProfile.username, userAgent },
      authData.user.id,
      email,
      ipAddress,
      userAgent
    )

    // 返回认证信息
    res.json({
      success: true,
      token: authData.session.access_token,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        username: userProfile.username,
        role: userProfile.role
      }
    })
  } catch (error) {
    console.error('管理员登录失败:', error)
    
    // 记录系统错误
    const ipAddress = req.clientIP || getClientIP(req)
    const email = req.body?.email
    await logSecurityEvent(
      'login_system_error',
      ipAddress,
      null,
      email,
      { error: error.message, userAgent: req.headers['user-agent'] },
      'error'
    )
    await logActivityEvent(
      'admin_login',
      'login_system_error',
      { error: error.message, userAgent: req.headers['user-agent'] },
      null,
      email,
      ipAddress,
      req.headers['user-agent'] as string
    )
    
    res.status(500).json({ error: '服务器内部错误' })
  }
}))

// 获取管理员统计信息（使用缓存优化和频率限制）
router.get('/stats', statsRateLimiter, requireAdmin, asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    // 使用缓存服务获取统计数据
    const statsData = await getCachedStats()
    
    // 转换为原有的响应格式
    const stats = {
      totalUsers: statsData.userStats.totalUsers,
      newUsersToday: statsData.userStats.newUsersToday,
      totalPosts: statsData.postStats.totalPosts,
      pendingPosts: statsData.postStats.pendingPosts,
      totalActivities: statsData.activityStats.totalActivities,
      activeActivities: statsData.activityStats.activeActivities,
      completedActivities: statsData.activityStats.completedActivities,
      totalParticipants: statsData.participationStats.totalParticipants,
      totalViews: statsData.postStats.totalViews,
      totalLikes: statsData.likeStats.totalLikes,
      totalComments: statsData.commentStats.totalComments
    }

    res.json(stats)
  } catch (error) {
    console.error('获取统计数据失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
}))

// 获取最近活动
router.get('/recent-activities', requireAdmin, asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const activities = []

    // 获取最近注册的用户
    const { data: recentUsers, error: usersError } = await supabaseAdmin
      .from('user_profiles')
      .select('username, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (!usersError && recentUsers) {
      recentUsers.forEach(user => {
        activities.push({
          id: `user_${user.username}`,
          type: 'user_register',
          message: `用户 ${user.username} 注册了账号`,
          time: formatTimeAgo(user.created_at),
          icon: 'UserPlus',
          color: 'text-green-600'
        })
      })
    }

    // 获取最近的待审核帖子
    const { data: pendingPosts, error: postsError } = await supabaseAdmin
      .from('posts')
      .select('title, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(3)
    
    if (!postsError && pendingPosts) {
      pendingPosts.forEach(post => {
        activities.push({
          id: `post_${post.title}`,
          type: 'post_pending',
          message: `帖子 "${post.title}" 等待审核`,
          time: formatTimeAgo(post.created_at),
          icon: 'Clock',
          color: 'text-orange-600'
        })
      })
    }

    // 按时间排序并限制数量
    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    
    res.json(activities.slice(0, 10))
  } catch (error) {
    console.error('获取最近活动失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
}))

// 格式化时间为相对时间
function formatTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) {
    return '刚刚'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}分钟前`
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60)
    return `${hours}小时前`
  } else {
    const days = Math.floor(diffInMinutes / 1440)
    return `${days}天前`
  }
}

export default router
