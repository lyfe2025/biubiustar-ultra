import { Router, Request, Response } from 'express'
import { supabaseAdmin } from '../../../lib/supabase'
import { getCachedAuthUsers } from './cache'
import { requireAdmin } from '../auth'

const router = Router()

// 对所有路由应用权限验证
router.use(requireAdmin)

// 获取所有用户（用户管理）
router.get('/', async (req: Request, res: Response): Promise<Response | void> => {
  try {
    // 获取分页参数
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const offset = (page - 1) * limit
    
    // 获取搜索和筛选参数
    const search = req.query.search as string || ''
    const status = req.query.status as string || 'all'
    const role = req.query.role as string || 'all'

    // 构建查询条件
    let countQuery = supabaseAdmin.from('user_profiles').select('*', { count: 'exact', head: true })
    let dataQuery = supabaseAdmin.from('user_profiles').select(`
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

    // 添加搜索条件（支持用户名和全名搜索）
    if (search.trim()) {
      const searchCondition = `username.ilike.%${search}%,full_name.ilike.%${search}%`
      countQuery = countQuery.or(searchCondition)
      dataQuery = dataQuery.or(searchCondition)
    }

    // 添加状态筛选条件
    if (status !== 'all') {
      countQuery = countQuery.eq('status', status)
      dataQuery = dataQuery.eq('status', status)
    }

    // 添加角色筛选条件
    if (role !== 'all') {
      countQuery = countQuery.eq('role', role)
      dataQuery = dataQuery.eq('role', role)
    }

    // 获取总用户数
    const { count: totalUsers, error: countError } = await countQuery
    
    if (countError) {
      console.error('获取用户总数失败:', countError)
      return res.status(500).json({ error: '获取用户总数失败' })
    }

    // 从user_profiles表获取用户资料信息（分页）
    const { data: userProfiles, error: profilesError } = await dataQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (profilesError) {
      console.error('获取用户资料失败:', profilesError)
      return res.status(500).json({ error: '获取用户资料失败' })
    }

    // 🚀 方案B优化：使用缓存的认证用户数据，按需过滤
    const emailMap = new Map()
    
    if (userProfiles && userProfiles.length > 0) {
      try {
        const startTime = Date.now()
        
        // 使用缓存获取认证用户信息
        const authUsers = await getCachedAuthUsers()
        
        if (authUsers.length > 0) {
          // 创建需要的用户ID集合，提高查找效率
          const neededUserIds = new Set(userProfiles.map(profile => profile.id))
          
          // 只处理当前分页需要的用户，构建邮箱映射表
          let processedCount = 0
          authUsers.forEach(authUser => {
            if (neededUserIds.has(authUser.id) && authUser.email) {
              emailMap.set(authUser.id, authUser.email)
              processedCount++
            }
          })
          
          const endTime = Date.now()
          console.log(`方案B缓存优化: 总认证用户${authUsers.length}个，当前分页需要${userProfiles.length}个，成功匹配${processedCount}个邮箱，耗时${endTime - startTime}ms`)
        }
      } catch (error) {
        console.error('获取用户邮箱失败:', error)
        // 如果获取失败，继续执行，只是邮箱信息为空
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

    // 返回分页数据
    const totalPages = Math.ceil((totalUsers || 0) / limit)
    res.json({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total: totalUsers || 0,
        totalPages
      }
    })
  } catch (error) {
    console.error('获取用户列表失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

export default router