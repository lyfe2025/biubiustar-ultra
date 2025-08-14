import { Router } from 'express'
import { supabaseAdmin } from '../../lib/supabase'
import { requireAdmin } from './auth'

const router = Router()

// 对所有路由应用权限验证
router.use(requireAdmin)

// 获取所有用户（用户管理）
router.get('/', async (req, res) => {
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
router.put('/:id/status', async (req, res) => {
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
router.put('/:id/role', async (req, res) => {
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
router.put('/:id/password', async (req, res) => {
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
router.post('/', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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

export default router
