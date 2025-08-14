import { Router } from 'express'
import { supabaseAdmin } from '../../lib/supabase'
import { requireAdmin } from './auth'

const router = Router()

// 对所有路由应用权限验证
router.use(requireAdmin)

// 获取所有活动（活动管理）
router.get('/', async (req, res) => {
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
router.put('/:id/status', async (req, res) => {
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
router.post('/', async (req, res) => {
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
    if (!title || !description || !location || !start_date || !end_date) {
      return res.status(400).json({ error: '标题、描述、地点、开始时间、结束时间为必填项' })
    }

    // 处理分类字段 - 如果category为空，设置为默认值
    const activityCategory = category && category.trim() ? category.trim() : 'general'

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
        category: activityCategory,
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
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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

export default router
