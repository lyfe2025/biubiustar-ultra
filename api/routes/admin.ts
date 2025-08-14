import { Router } from 'express'
import { supabase, supabaseAdmin } from '../lib/supabase'
import { randomUUID } from 'crypto'

const router = Router()

// 管理员权限验证中间件
const requireAdmin = async (req: any, res: any, next: any) => {
  try {
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
  } catch (error) {
    console.error('权限验证失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
}

// 管理员登录API（不需要权限验证）
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码不能为空' })
    }

    // 使用Supabase进行用户认证
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    })

    if (authError || !authData.user || !authData.session) {
      return res.status(401).json({ error: '邮箱或密码错误' })
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
      return res.status(403).json({ error: '需要管理员权限' })
    }

    if (userProfile.role !== 'admin') {
      console.log('权限检查失败:', { profileError, userProfile, role: userProfile?.role })
      return res.status(403).json({ error: '需要管理员权限' })
    }

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
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 对所有管理员路由应用权限验证（除了登录接口）
router.use('/stats', requireAdmin)
router.use('/recent-activities', requireAdmin)
router.use('/users', requireAdmin)
router.use('/posts', requireAdmin)
router.use('/activities', requireAdmin)
router.use('/categories', requireAdmin)
router.use('/content-categories', requireAdmin)

// 获取管理后台统计数据
router.get('/stats', async (req, res) => {
  try {
    // 获取用户统计
    const { data: usersData, error: usersError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, created_at')
    
    if (usersError) {
      console.error('获取用户数据失败:', usersError)
      return res.status(500).json({ error: '获取用户数据失败' })
    }

    // 计算今日新增用户
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const newUsersToday = usersData?.filter(user => 
      new Date(user.created_at) >= today
    ).length || 0

    // 获取帖子统计
    const { data: postsData, error: postsError } = await supabaseAdmin
      .from('posts')
      .select('id, created_at, status, views_count')
    
    if (postsError) {
      console.error('获取帖子数据失败:', postsError)
      return res.status(500).json({ error: '获取帖子数据失败' })
    }

    // 计算待审核帖子数
    const pendingPosts = postsData?.filter(post => post.status === 'pending').length || 0
    
    // 计算总浏览量
    const totalViews = postsData?.reduce((sum, post) => sum + (post.views_count || 0), 0) || 0

    // 获取活动统计
    const { data: activitiesData, error: activitiesError } = await supabaseAdmin
      .from('activities')
      .select('id, created_at, status, end_date')
    
    if (activitiesError) {
      console.error('获取活动数据失败:', activitiesError)
      return res.status(500).json({ error: '获取活动数据失败' })
    }

    // 计算进行中的活动数
    const now = new Date()
    const activeActivities = activitiesData?.filter(activity => 
      activity.status === 'active' && new Date(activity.end_date) > now
    ).length || 0

    // 获取点赞统计
    const { data: likesData, error: likesError } = await supabase
      .from('likes')
      .select('id')
    
    if (likesError) {
      console.error('获取点赞数据失败:', likesError)
      return res.status(500).json({ error: '获取点赞数据失败' })
    }

    // 获取评论统计
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select('id')
    
    if (commentsError) {
      console.error('获取评论数据失败:', commentsError)
      return res.status(500).json({ error: '获取评论数据失败' })
    }

    // 返回统计数据
    const stats = {
      totalUsers: usersData?.length || 0,
      newUsersToday,
      totalPosts: postsData?.length || 0,
      pendingPosts,
      totalActivities: activitiesData?.length || 0,
      activeActivities,
      totalViews,
      totalLikes: likesData?.length || 0,
      totalComments: commentsData?.length || 0
    }

    res.json(stats)
  } catch (error) {
    console.error('获取统计数据失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 获取最近活动日志
router.get('/recent-activities', async (req, res) => {
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
})

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

// 获取所有帖子（内容管理）
router.get('/posts', async (req, res) => {
  try {
    const { data: posts, error } = await supabaseAdmin
      .from('posts')
      .select(`
        id,
        title,
        content,
        image_url,
        tags,
        likes_count,
        comments_count,
        shares_count,
        is_published,
        status,
        created_at,
        updated_at,
        category,
        user_id
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('获取帖子数据失败:', error)
      return res.status(500).json({ error: '获取帖子数据失败' })
    }

    // 获取用户信息
    const userIds = posts?.map(post => post.user_id) || []
    const { data: userProfiles } = await supabase
      .from('user_profiles')
      .select('id, username, avatar_url')
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
        image: post.image_url,
        video: null, // posts表中没有video字段
        status: post.status || 'pending',
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        views_count: 0, // posts表中没有views_count字段
        created_at: post.created_at,
        updated_at: post.updated_at,
        author: {
          id: user?.id || post.user_id,
          username: user?.username || '未知用户',
          avatar: user?.avatar_url
        }
      }
    }) || []

    res.json(formattedPosts)
  } catch (error) {
    console.error('获取帖子列表失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 更新帖子状态
router.put('/posts/:id/status', async (req, res) => {
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
})

// 删除帖子
router.delete('/posts/:id', async (req, res) => {
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
})

// 获取所有用户（用户管理）
router.get('/users', async (req, res) => {
  try {
    // 从user_profiles表获取用户资料信息
    const { data: userProfiles, error: profilesError } = await supabaseAdmin
      .from('user_profiles')
      .select(`
        id,
        username,
        full_name,
        avatar_url,
        bio,
        location,
        website,
        followers_count,
        following_count,
        posts_count,
        status,
        role,
        last_login,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })
    
    if (profilesError) {
      console.error('获取用户资料失败:', profilesError)
      return res.status(500).json({ error: '获取用户资料失败' })
    }

    // 从auth.users表获取邮箱信息（使用正确的方法）
    const emailMap = new Map()
    
    // 为每个用户获取认证信息
    for (const profile of userProfiles || []) {
      try {
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(profile.id)
        if (!authError && authUser?.user?.email) {
          emailMap.set(profile.id, authUser.user.email)
        }
      } catch (error) {
        console.error(`获取用户 ${profile.id} 的邮箱失败:`, error)
        // 继续处理其他用户，不中断整个流程
      }
    }

    // 转换数据格式以匹配AdminService接口
    const formattedUsers = userProfiles?.map(user => ({
      id: user.id,
      username: user.username || user.full_name || '未知用户',
      email: emailMap.get(user.id) || '',
      avatar: user.avatar_url,
      full_name: user.full_name,
      bio: user.bio,
      location: user.location,
      website: user.website,
      followers_count: user.followers_count || 0,
      following_count: user.following_count || 0,
      posts_count: user.posts_count || 0,
      status: user.status || 'active',
      role: user.role || 'user',
      email_verified: true, // 默认为已验证，因为是管理员创建的用户
      last_login: user.last_login,
      created_at: user.created_at,
      updated_at: user.updated_at
    })) || []

    res.json(formattedUsers)
  } catch (error) {
    console.error('获取用户列表失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 更新用户状态
router.put('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['active', 'suspended', 'banned'].includes(status)) {
      return res.status(400).json({ error: '无效的状态值' })
    }

    const { error } = await supabaseAdmin
      .from('user_profiles')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
    
    if (error) {
      console.error('更新用户状态失败:', error)
      return res.status(500).json({ error: '更新用户状态失败' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('更新用户状态失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 更新用户角色
router.put('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.body

    if (!['user', 'admin', 'moderator'].includes(role)) {
      return res.status(400).json({ error: '无效的角色值' })
    }

    const { error } = await supabaseAdmin
      .from('user_profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', id)
    
    if (error) {
      console.error('更新用户角色失败:', error)
      return res.status(500).json({ error: '更新用户角色失败' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('更新用户角色失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 更新用户密码
router.put('/users/:id/password', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { password } = req.body

    // 验证密码
    if (!password || password.length < 6) {
      return res.status(400).json({ error: '密码长度至少为6位' })
    }

    // 验证用户是否存在
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('id', id)
      .single()

    if (profileError || !userProfile) {
      return res.status(404).json({ error: '用户不存在' })
    }

    // 更新用户密码
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(id, {
      password: password
    })

    if (updateError) {
      console.error('更新用户密码失败:', updateError)
      return res.status(500).json({ error: '更新用户密码失败' })
    }

    // 更新用户资料的更新时间
    const { error: profileUpdateError } = await supabaseAdmin
      .from('user_profiles')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', id)

    if (profileUpdateError) {
      console.error('更新用户资料时间失败:', profileUpdateError)
      // 这个错误不影响密码更新的成功，只记录日志
    }

    res.json({ success: true, message: '密码更新成功' })
  } catch (error) {
    console.error('更新用户密码失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 错误恢复机制：统一的清理函数
const cleanupFailedUserCreation = async (authUserId?: string, profileId?: string) => {
  const cleanupErrors = []
  
  // 清理用户资料
  if (profileId) {
    try {
      await supabaseAdmin.from('user_profiles').delete().eq('id', profileId)
      console.log('已清理用户资料:', profileId)
    } catch (error) {
      console.error('清理用户资料失败:', error)
      cleanupErrors.push(`清理用户资料失败: ${error.message}`)
    }
  }
  
  // 清理认证用户
  if (authUserId) {
    try {
      await supabaseAdmin.auth.admin.deleteUser(authUserId)
      console.log('已清理认证用户:', authUserId)
    } catch (error) {
      console.error('清理认证用户失败:', error)
      cleanupErrors.push(`清理认证用户失败: ${error.message}`)
    }
  }
  
  if (cleanupErrors.length > 0) {
    console.error('清理过程中出现错误:', cleanupErrors)
  }
  
  return cleanupErrors
}

// 原子化用户创建函数
const createUserAtomically = async (userData) => {
  const { username, email, password, full_name, role = 'user' } = userData
  let authUserId = null
  let profileId = null
  
  try {
    // 第一步：预检查 - 验证数据唯一性（使用count查询避免缓存问题）
    const { count: usernameCount, error: usernameError } = await supabaseAdmin
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('username', username)

    if (usernameError) {
      throw new Error(`检查用户名冲突失败: ${usernameError.message}`)
    }

    if (usernameCount && usernameCount > 0) {
      throw new Error('用户名已存在')
    }

    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const emailExists = existingUsers.users.some((user: any) => (user.email || user.user_metadata?.email) === email)
    
    if (emailExists) {
      throw new Error('邮箱已存在')
    }

    // 第二步：创建认证用户
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authError || !authUser?.user) {
      throw new Error(`创建认证用户失败: ${authError?.message || '未知错误'}`)
    }

    authUserId = authUser.user.id

    // 第三步：检查触发器是否已创建用户资料（触发器会在创建auth.users时自动创建user_profiles）
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', authUserId)
      .maybeSingle()

    if (checkError) {
      throw new Error(`检查现有用户资料失败: ${checkError.message}`)
    }

    let userProfile
    if (existingProfile) {
      // 第四步A：如果触发器已创建记录，则更新它
      const { data: updatedProfile, error: updateError } = await supabaseAdmin
        .from('user_profiles')
        .update({
          username,
          full_name: full_name || username,
          role,
          status: 'active'
        })
        .eq('id', authUserId)
        .select()
        .single()

      if (updateError || !updatedProfile) {
        throw new Error(`更新用户资料失败: ${updateError?.message || '未知错误'}`)
      }
      userProfile = updatedProfile
    } else {
      // 第四步B：如果触发器未创建记录，则插入新记录
      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          id: authUserId,
          username,
          full_name: full_name || username,
          role,
          status: 'active'
        })
        .select()
        .single()

      if (insertError || !newProfile) {
        throw new Error(`创建用户资料失败: ${insertError?.message || '未知错误'}`)
      }
      userProfile = newProfile
     }

    profileId = userProfile.id

    // 第五步：数据一致性验证
    if (userProfile.id !== authUserId) {
      throw new Error('数据库一致性检查失败: 用户资料ID与认证用户ID不匹配')
    }

    // 第六步：最终验证
    const { data: verifyAuthUser, error: verifyError } = await supabaseAdmin.auth.admin.getUserById(userProfile.id)
    if (verifyError || !verifyAuthUser?.user) {
      throw new Error('最终一致性验证失败: 认证用户不存在')
    }

    // 成功返回用户信息
    return {
      id: userProfile.id,
      username: userProfile.username,
      email: authUser.user.email,
      full_name: userProfile.full_name,
      role: userProfile.role,
      status: userProfile.status,
      created_at: userProfile.created_at
    }

  } catch (error) {
    // 原子化回滚：清理所有已创建的数据
    console.error('用户创建失败，开始原子化回滚:', error.message)
    await cleanupFailedUserCreation(authUserId, profileId)
    throw error
  }
}

// 创建用户
router.post('/users', requireAdmin, async (req, res) => {
  try {
    const { username, email, password, full_name, role = 'user' } = req.body

    // 验证必填字段
    if (!username || !email || !password) {
      return res.status(400).json({ error: '用户名、邮箱和密码为必填项' })
    }

    // 原子化创建用户
    const newUser = await createUserAtomically({ username, email, password, full_name, role })
    
    res.status(201).json({
      message: '用户创建成功',
      user: newUser
    })

  } catch (error) {
    console.error('创建用户API失败:', error)
    
    // 根据错误类型返回适当的状态码
    if (error.message.includes('已存在')) {
      return res.status(400).json({ error: error.message })
    }
    
    res.status(500).json({ error: error.message || '创建用户失败' })
  }
})

// 删除用户
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params

    // 先删除用户相关的数据
    await supabaseAdmin.from('post_likes').delete().eq('user_id', id)
    await supabaseAdmin.from('comments').delete().eq('user_id', id)
    await supabaseAdmin.from('activity_participants').delete().eq('user_id', id)
    await supabaseAdmin.from('activities').delete().eq('user_id', id)
    await supabaseAdmin.from('posts').delete().eq('user_id', id)
    
    // 删除用户资料（这会级联删除相关数据）
    const { error } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('删除用户失败:', error)
      return res.status(500).json({ error: '删除用户失败' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('删除用户失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 获取所有活动（活动管理）
router.get('/activities', async (req, res) => {
  try {
    const { data: activities, error } = await supabaseAdmin
      .from('activities')
      .select(`
        id,
        title,
        description,
        image_url,
        location,
        start_date,
        end_date,
        status,
        category,
        current_participants,
        max_participants,
        created_at,
        updated_at,
        user_id
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('获取活动数据失败:', error)
      return res.status(500).json({ error: '获取活动数据失败' })
    }

    // 获取组织者信息
    const userIds = activities?.map(activity => activity.user_id) || []
    const { data: userProfiles } = await supabaseAdmin
      .from('user_profiles')
      .select('id, username, avatar_url')
      .in('id', userIds)
    
    // 创建用户信息映射
    const userMap = new Map()
    userProfiles?.forEach(user => {
      userMap.set(user.id, user)
    })

    // 转换数据格式以匹配AdminService接口
    const formattedActivities = activities?.map(activity => {
      const user = userMap.get(activity.user_id)
      return {
        id: activity.id,
        title: activity.title,
        description: activity.description,
        image: activity.image_url,
        location: activity.location,
        start_date: activity.start_date,
        end_date: activity.end_date,
        status: activity.status,
        category: activity.category || 'general',
        current_participants: activity.current_participants || 0,
        max_participants: activity.max_participants || 0,
        is_featured: false,
        tags: [],
        created_at: activity.created_at,
        updated_at: activity.updated_at,
        organizer: {
          id: user?.id || activity.user_id,
          username: user?.username || '未知用户',
          avatar: user?.avatar_url
        }
      }
    }) || []

    res.json(formattedActivities)
  } catch (error) {
    console.error('获取活动列表失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 更新活动状态
router.put('/activities/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['active', 'cancelled', 'completed', 'pending'].includes(status)) {
      return res.status(400).json({ error: '无效的状态值' })
    }

    const { error } = await supabaseAdmin
      .from('activities')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
    
    if (error) {
      console.error('更新活动状态失败:', error)
      return res.status(500).json({ error: '更新活动状态失败' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('更新活动状态失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 创建活动
router.post('/activities', async (req, res) => {
  try {
    const { 
      title, 
      description, 
      location, 
      start_date, 
      end_date, 
      category, 
      max_participants, 
      image_url,
      user_id 
    } = req.body

    // 验证必填字段
    if (!title || !description || !location || !start_date || !end_date || !category) {
      return res.status(400).json({ error: '标题、描述、地点、开始时间、结束时间和分类为必填项' })
    }

    // 验证时间
    const startDate = new Date(start_date)
    const endDate = new Date(end_date)
    const now = new Date()

    if (startDate < now) {
      return res.status(400).json({ error: '开始时间不能早于当前时间' })
    }

    if (endDate <= startDate) {
      return res.status(400).json({ error: '结束时间必须晚于开始时间' })
    }

    // 验证最大参与人数
    if (max_participants && (max_participants < 1 || max_participants > 10000)) {
      return res.status(400).json({ error: '最大参与人数必须在1-10000之间' })
    }

    // 创建活动
    const { data: activity, error } = await supabaseAdmin
      .from('activities')
      .insert({
        title,
        description,
        location,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        category,
        max_participants: max_participants || null,
        image_url: image_url || null,
        user_id: user_id || null, // 如果没有指定用户ID，则为系统创建
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single()

    if (error) {
      console.error('创建活动失败:', error)
      return res.status(500).json({ error: '创建活动失败' })
    }

    // 获取组织者信息
    let organizer = null
    if (activity.user_id) {
      const { data: userProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('id, username, avatar_url')
        .eq('id', activity.user_id)
        .single()
      
      organizer = userProfile ? {
        id: userProfile.id,
        username: userProfile.username,
        avatar: userProfile.avatar_url
      } : null
    }

    // 获取参与者数量
    const { count: participantsCount } = await supabaseAdmin
      .from('activity_participants')
      .select('*', { count: 'exact', head: true })
      .eq('activity_id', activity.id)

    // 格式化返回数据
    const formattedActivity = {
      id: activity.id,
      title: activity.title,
      description: activity.description,
      location: activity.location,
      start_date: activity.start_date,
      end_date: activity.end_date,
      category: activity.category,
      max_participants: activity.max_participants,
      image_url: activity.image_url,
      status: activity.status,
      is_featured: false,
      created_at: activity.created_at,
      updated_at: activity.updated_at,
      organizer: organizer,
      participants_count: participantsCount || 0
    }

    res.status(201).json(formattedActivity)
  } catch (error) {
    console.error('创建活动失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 更新活动
router.put('/activities/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { 
      title, 
      description, 
      location, 
      start_date, 
      end_date, 
      category, 
      max_participants, 
      image 
    } = req.body

    // 验证必填字段
    if (!title || !description || !location || !start_date || !end_date) {
      return res.status(400).json({ 
        error: '缺少必填字段：title, description, location, start_date, end_date' 
      })
    }

    // 验证时间
    const startDate = new Date(start_date)
    const endDate = new Date(end_date)
    if (startDate >= endDate) {
      return res.status(400).json({ error: '结束时间必须晚于开始时间' })
    }

    // 验证最大参与人数
    if (max_participants && (max_participants < 1 || max_participants > 10000)) {
      return res.status(400).json({ error: '最大参与人数必须在1-10000之间' })
    }

    // 更新活动
    const { data: activity, error } = await supabaseAdmin
      .from('activities')
      .update({
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        start_date,
        end_date,
        category: category || 'general',
        max_participants: max_participants || null,
        image_url: image || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('更新活动失败:', error)
      return res.status(500).json({ error: '更新活动失败' })
    }

    if (!activity) {
      return res.status(404).json({ error: '活动不存在' })
    }

    // 格式化返回数据
    const formattedActivity = {
      id: activity.id,
      title: activity.title,
      description: activity.description,
      location: activity.location,
      start_date: activity.start_date,
      end_date: activity.end_date,
      category: activity.category,
      max_participants: activity.max_participants,
      image: activity.image_url,
      status: activity.status,
      current_participants: 0, // 需要单独查询
      created_at: activity.created_at,
      updated_at: activity.updated_at
    }

    res.json(formattedActivity)
  } catch (error) {
    console.error('更新活动失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 删除活动
router.delete('/activities/:id', async (req, res) => {
  try {
    const { id } = req.params

    // 删除活动参与记录
    await supabaseAdmin.from('activity_participants').delete().eq('activity_id', id)
    
    // 删除活动
    const { error } = await supabaseAdmin
      .from('activities')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('删除活动失败:', error)
      return res.status(500).json({ error: '删除活动失败' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('删除活动失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// ==================== 活动分类管理 API ====================

// 获取所有活动分类
router.get('/categories', async (req, res) => {
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
router.post('/categories', async (req, res) => {
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
router.put('/categories/:id', async (req, res) => {
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
router.delete('/categories/:id', async (req, res) => {
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
router.put('/categories/:id/toggle', async (req, res) => {
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

// 系统设置相关API
router.use('/settings', requireAdmin)

// 获取系统设置
router.get('/settings', async (req, res) => {
  try {
    const { category } = req.query
    
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
    
    // 按分类组织设置
    const settingsByCategory = settings?.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {}
      }
      
      let value = setting.setting_value
      // 根据类型转换值
      if (setting.setting_type === 'boolean') {
        value = value === 'true'
      } else if (setting.setting_type === 'number') {
        value = parseInt(value) || 0
      } else if (setting.setting_type === 'json') {
        try {
          value = JSON.parse(value)
        } catch (e) {
          value = null
        }
      }
      
      acc[setting.category][setting.setting_key] = {
        value,
        type: setting.setting_type,
        description: setting.description,
        is_public: setting.is_public
      }
      
      return acc
    }, {} as any) || {}
    
    res.json(settingsByCategory)
  } catch (error) {
    console.error('获取系统设置失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 保存系统设置
router.put('/settings', async (req, res) => {
  try {
    const { settings } = req.body
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: '设置数据格式不正确' })
    }
    
    const updates = []
    
    // 遍历所有分类的设置
    for (const [category, categorySettings] of Object.entries(settings)) {
      if (typeof categorySettings === 'object' && categorySettings !== null) {
        for (const [key, value] of Object.entries(categorySettings as any)) {
          let stringValue = String(value)
          
          // 如果是对象或数组，转换为JSON字符串
          if (typeof value === 'object' && value !== null) {
            stringValue = JSON.stringify(value)
          }
          
          updates.push({
            setting_key: key,
            setting_value: stringValue,
            updated_at: new Date().toISOString()
          })
        }
      }
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: '没有要更新的设置' })
    }
    
    // 批量更新设置
    const updatePromises = updates.map(update => 
      supabaseAdmin
        .from('system_settings')
        .update({
          setting_value: update.setting_value,
          updated_at: update.updated_at
        })
        .eq('setting_key', update.setting_key)
    )
    
    const results = await Promise.all(updatePromises)
    
    // 检查是否有错误
    const errors = results.filter(result => result.error)
    if (errors.length > 0) {
      console.error('更新系统设置失败:', errors)
      return res.status(500).json({ error: '更新系统设置失败' })
    }
    
    res.json({ success: true, message: '系统设置保存成功' })
  } catch (error) {
    console.error('保存系统设置失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 测试邮件发送
router.post('/settings/test-email', async (req, res) => {
  try {
    const { testEmail } = req.body
    
    if (!testEmail) {
      return res.status(400).json({ error: '请提供测试邮箱地址' })
    }
    
    // 获取邮件设置
    const { data: emailSettings, error } = await supabaseAdmin
      .from('system_settings')
      .select('setting_key, setting_value')
      .eq('category', 'email')
    
    if (error) {
      console.error('获取邮件设置失败:', error)
      return res.status(500).json({ error: '获取邮件设置失败' })
    }
    
    const settings = emailSettings?.reduce((acc, setting) => {
      acc[setting.setting_key] = setting.setting_value
      return acc
    }, {} as any) || {}
    
    // 验证邮件配置
    if (!settings.smtp_host || !settings.smtp_username || !settings.smtp_password) {
      return res.status(400).json({ error: 'SMTP配置不完整，请先配置邮件设置' })
    }
    
    // 这里应该使用实际的邮件发送库（如nodemailer）
    // 为了演示，我们模拟发送过程
    const nodemailer = require('nodemailer')
    
    const transporter = nodemailer.createTransporter({
      host: settings.smtp_host,
      port: parseInt(settings.smtp_port) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: settings.smtp_username,
        pass: settings.smtp_password
      },
      tls: {
        rejectUnauthorized: settings.smtp_use_tls === 'true'
      }
    })
    
    const mailOptions = {
      from: `"${settings.smtp_from_name || 'BiuBiuStar'}" <${settings.smtp_from_email || settings.smtp_username}>`,
      to: testEmail,
      subject: '邮件配置测试',
      html: `
        <h2>邮件配置测试成功</h2>
        <p>恭喜！您的邮件配置已正确设置。</p>
        <p>发送时间: ${new Date().toLocaleString('zh-CN')}</p>
        <p>来自: BiuBiuStar 管理后台</p>
      `
    }
    
    await transporter.sendMail(mailOptions)
    
    res.json({ success: true, message: '测试邮件发送成功' })
  } catch (error) {
    console.error('发送测试邮件失败:', error)
    res.status(500).json({ 
      error: '发送测试邮件失败', 
      details: error.message 
    })
  }
})

// 获取公开的系统设置（供前台使用）
router.get('/settings/public', async (req, res) => {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from('system_settings')
      .select('setting_key, setting_value, setting_type, category')
      .eq('is_public', true)
      .order('category', { ascending: true })
      .order('setting_key', { ascending: true })
    
    if (error) {
      console.error('获取公开系统设置失败:', error)
      return res.status(500).json({ error: '获取公开系统设置失败' })
    }
    
    // 按分类组织设置
    const settingsByCategory = settings?.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {}
      }
      
      let value = setting.setting_value
      // 根据类型转换值
      if (setting.setting_type === 'boolean') {
        value = value === 'true'
      } else if (setting.setting_type === 'number') {
        value = parseInt(value) || 0
      } else if (setting.setting_type === 'json') {
        try {
          value = JSON.parse(value)
        } catch (e) {
          value = null
        }
      }
      
      acc[setting.category][setting.setting_key] = value
      
      return acc
    }, {} as any) || {}
    
    res.json(settingsByCategory)
  } catch (error) {
    console.error('获取公开系统设置失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

export default router