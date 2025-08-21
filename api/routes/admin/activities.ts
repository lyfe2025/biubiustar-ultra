import { Router, Request, Response } from 'express'
import { supabaseAdmin } from '../../lib/supabase.js'
import { requireAdmin } from './auth.js'
import asyncHandler from '../../middleware/asyncHandler.js'
import { CacheInvalidationService } from '../../services/cacheInvalidation'
import { contentCache, statsCache } from '../../lib/cacheInstances.js'
import { CacheKeyGenerator, CACHE_TTL } from '../../config/cache.js'
import { 
  invalidateOnActivityCreate,
  invalidateOnActivityUpdate,
  invalidateOnActivityDelete,
  invalidateOnActivityStatusChange
} from '../../utils/activityCacheInvalidation.js'

const router = Router()

// 对所有路由应用权限验证
router.use(requireAdmin)

// 获取所有活动（管理员）
router.get('/', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    // 获取分页参数
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10

    // 生成缓存键
    const cacheKey = CacheKeyGenerator.adminActivitiesList(page, limit)

    // 尝试从缓存获取数据
    const cachedData = await contentCache.get(cacheKey)
    if (cachedData && typeof cachedData === 'object') {
      return res.json({
        ...cachedData,
        _cacheInfo: {
          cached: true,
          timestamp: new Date().toISOString()
        }
      })
    }

    // 缓存未命中，从数据库获取数据
    const offset = (page - 1) * limit

    // 获取总活动数
    const { count: totalActivities, error: countError } = await supabaseAdmin
      .from('activities')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('获取活动总数失败:', countError)
      return res.status(500).json({ error: '获取活动总数失败' })
    }

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
      .range(offset, offset + limit - 1)
    
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

    // 批量获取所有活动的参与人数
    const activityIds = activities?.map(activity => activity.id) || []
    const participantsCountMap = new Map()
    
    if (activityIds.length > 0) {
      // 查询所有活动的参与人数
      const { data: participantsData } = await supabaseAdmin
        .from('activity_participants')
        .select('activity_id')
        .in('activity_id', activityIds)
      
      // 统计每个活动的参与人数
      participantsData?.forEach(participant => {
        const activityId = participant.activity_id
        participantsCountMap.set(activityId, (participantsCountMap.get(activityId) || 0) + 1)
      })
    }

    // 转换数据格式以匹配AdminService接口
    const formattedActivities = activities?.map(activity => {
      const user = userMap.get(activity.user_id)
      const actualParticipants = participantsCountMap.get(activity.id) || 0
      
      return {
        id: activity.id,
        title: activity.title,
        description: activity.description,
        image_url: activity.image_url, // 保持与Activity类型一致
        location: activity.location,
        start_date: activity.start_date,
        end_date: activity.end_date,
        status: activity.status,
        category: activity.category || 'general',
        current_participants: actualParticipants, // 使用实际查询的参与人数
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

    // 构建响应数据
    const totalPages = Math.ceil((totalActivities || 0) / limit)
    const responseData = {
      activities: formattedActivities,
      pagination: {
        page,
        limit,
        total: totalActivities || 0,
        totalPages
      }
    }

    // 缓存数据 (TTL: 10分钟)
    await contentCache.set(cacheKey, responseData, CACHE_TTL.MEDIUM)

    res.json({
      ...responseData,
      _cacheInfo: {
        cached: false,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('获取活动列表失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
}))

// 更新活动状态
router.put('/:id/status', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['published', 'draft', 'cancelled', 'active', 'completed', 'pending'].includes(status)) {
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

    // 智能缓存失效
    await invalidateOnActivityStatusChange(id)

    res.json({ success: true })
  } catch (error) {
    console.error('更新活动状态失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
}))

// 创建活动
router.post('/', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
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
    const missingFields = []
    if (!title || !title.trim()) missingFields.push('标题')
    if (!description || !description.trim()) missingFields.push('描述')
    if (!location || !location.trim()) missingFields.push('地点')
    if (!start_date) missingFields.push('开始时间')
    if (!end_date) missingFields.push('结束时间')
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `缺少必填字段: ${missingFields.join('、')}`,
        missingFields
      })
    }

    // 处理分类字段 - 如果category为空，设置为默认值
    const activityCategory = category && category.trim() ? category.trim() : 'general'

    // 验证时间
    const startDate = new Date(start_date)
    const endDate = new Date(end_date)
    const now = new Date()

    // 验证时间格式
    if (isNaN(startDate.getTime())) {
      return res.status(400).json({ 
        error: '开始时间格式错误',
        field: 'start_date',
        value: start_date
      })
    }

    if (isNaN(endDate.getTime())) {
      return res.status(400).json({ 
        error: '结束时间格式错误',
        field: 'end_date',
        value: end_date
      })
    }

    if (startDate < now) {
      return res.status(400).json({ 
        error: '开始时间不能早于当前时间',
        field: 'start_date',
        current_time: now.toISOString(),
        provided_time: startDate.toISOString()
      })
    }

    if (endDate <= startDate) {
      return res.status(400).json({ 
        error: '结束时间必须晚于开始时间',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      })
    }

    // 验证最大参与人数
    if (max_participants !== null && max_participants !== undefined) {
      const maxParticipantsNum = Number(max_participants)
      if (isNaN(maxParticipantsNum) || maxParticipantsNum < 1 || maxParticipantsNum > 10000) {
        return res.status(400).json({ 
          error: '最大参与人数必须在1-10000之间的数字',
          field: 'max_participants',
          value: max_participants
        })
      }
    }

    // 从认证中间件获取当前用户ID
    const currentUserId = (req as any).user?.id
    if (!currentUserId) {
      return res.status(401).json({ 
        error: '无法获取当前用户信息，请重新登录' 
      })
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
        category: activityCategory,
        max_participants: max_participants || null,
        image_url: image_url || null,
        user_id: currentUserId, // 使用当前认证用户的ID
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single()

    if (error) {
      console.error('创建活动失败:', error)
      
      // 提供更详细的错误信息
      let errorMessage = '创建活动失败'
      
      // 根据错误类型提供具体信息
      if (error.code === '23505') {
        errorMessage = '活动标题或其他唯一字段已存在，请修改后重试'
      } else if (error.code === '23502') {
        errorMessage = '缺少必需的字段信息'
      } else if (error.code === '23514') {
        errorMessage = '输入数据不符合约束条件'
      } else if (error.code === '42703') {
        errorMessage = '字段名称错误'
      } else if (error.message) {
        errorMessage = `创建活动失败: ${error.message}`
      }
      
      return res.status(500).json({ 
        error: errorMessage,
        details: error.message || '数据库操作失败',
        code: error.code
      })
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

    // 智能缓存失效
    await invalidateOnActivityCreate()

    res.status(201).json(formattedActivity)
  } catch (error) {
    console.error('创建活动失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
}))

// 更新活动
router.put('/:id', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
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
    
    // 验证时间格式
    if (isNaN(startDate.getTime())) {
      return res.status(400).json({ 
        error: '开始时间格式错误',
        field: 'start_date',
        value: start_date
      })
    }

    if (isNaN(endDate.getTime())) {
      return res.status(400).json({ 
        error: '结束时间格式错误',
        field: 'end_date',
        value: end_date
      })
    }
    
    if (endDate <= startDate) {
      return res.status(400).json({ 
        error: '结束时间必须晚于开始时间',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      })
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
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
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
      image_url: activity.image_url,
      status: activity.status,
      current_participants: 0, // 需要单独查询
      created_at: activity.created_at,
      updated_at: activity.updated_at
    }

    // 智能缓存失效
    await invalidateOnActivityUpdate(id)

    res.json(formattedActivity)
  } catch (error) {
    console.error('更新活动失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
}))

// 删除活动
router.delete('/:id', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
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

    // 智能缓存失效
    await invalidateOnActivityDelete(id)

    res.json({ success: true })
  } catch (error) {
    console.error('删除活动失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
}))

export default router
