import { Router, Request, Response } from 'express'
import { supabaseAdmin } from '../../lib/supabase'
import { requireAdmin } from './auth';
import { logSecurityEvent, logActivityEvent, getClientIP } from '../../middleware/security'
import { User } from '@supabase/supabase-js'

// 扩展Request接口以包含user属性
interface AuthenticatedRequest extends Request {
  user?: User;
}

const router = Router()

// 获取登录尝试记录（分页）
router.get('/login-attempts', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const offset = (page - 1) * limit
    
    // 获取总数
    const { count } = await supabaseAdmin
      .from('login_attempts')
      .select('*', { count: 'exact', head: true })
    
    // 获取分页数据
    const { data: attempts, error } = await supabaseAdmin
      .from('login_attempts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      console.error('获取登录尝试记录失败:', error)
      return res.status(500).json({ error: '获取登录尝试记录失败' })
    }
    
    res.json({
      data: attempts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('获取登录尝试记录失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 获取IP黑名单（分页）
router.get('/ip-blacklist', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const offset = (page - 1) * limit
    
    // 获取总数
    const { count } = await supabaseAdmin
      .from('ip_blacklist')
      .select('*', { count: 'exact', head: true })
    
    // 获取分页数据
    const { data: blacklist, error } = await supabaseAdmin
      .from('ip_blacklist')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      console.error('获取IP黑名单失败:', error)
      return res.status(500).json({ error: '获取IP黑名单失败' })
    }
    
    res.json({
      data: blacklist,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('获取IP黑名单失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 获取安全日志（分页）
router.get('/security-logs', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const offset = (page - 1) * limit
    const eventType = req.query.event_type as string
    const severity = req.query.severity as string
    
    let query = supabaseAdmin.from('security_logs').select('*', { count: 'exact' })
    
    // 添加过滤条件
    if (eventType) {
      query = query.eq('event_type', eventType)
    }
    if (severity) {
      query = query.eq('severity', severity)
    }
    
    // 获取总数
    let countQuery = supabaseAdmin.from('security_logs').select('*', { count: 'exact', head: true })
    if (eventType) {
      countQuery = countQuery.eq('event_type', eventType)
    }
    if (severity) {
      countQuery = countQuery.eq('severity', severity)
    }
    const { count } = await countQuery
    
    // 获取分页数据
    query = supabaseAdmin.from('security_logs').select('*')
    if (eventType) {
      query = query.eq('event_type', eventType)
    }
    if (severity) {
      query = query.eq('severity', severity)
    }
    
    const { data: logs, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      console.error('获取安全日志失败:', error)
      return res.status(500).json({ error: '获取安全日志失败' })
    }
    
    res.json({
      data: logs,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('获取安全日志失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 手动解锁IP
router.delete('/ip-blacklist/:ip', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
  try {
    const { ip } = req.params
    const adminIP = getClientIP(req)
    
    if (!ip) {
      return res.status(400).json({ error: 'IP地址不能为空' })
    }
    
    // 从黑名单中移除IP
    const { error } = await supabaseAdmin
      .from('ip_blacklist')
      .delete()
      .eq('ip_address', ip)
    
    if (error) {
      console.error('解锁IP失败:', error)
      return res.status(500).json({ error: '解锁IP失败' })
    }
    
    // 记录安全事件
    await logSecurityEvent(
      'ip_manual_unlock',
      adminIP,
      req.user?.id || null,
      req.user?.email || null,
      { unlockedIP: ip, adminAction: true },
      'info'
    )
    await logActivityEvent(
      'ip_security',
      'ip_manual_unlock',
      { unlockedIP: ip, adminAction: true },
      req.user?.id || null,
      req.user?.email || null,
      adminIP,
      req.headers['user-agent'] as string
    )
    
    res.json({ success: true, message: 'IP已成功解锁' })
  } catch (error) {
    console.error('解锁IP失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 手动添加IP到黑名单
router.post('/ip-blacklist', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
  try {
    const { ip_address, reason } = req.body
    const adminIP = getClientIP(req)
    
    if (!ip_address) {
      return res.status(400).json({ error: 'IP地址不能为空' })
    }
    
    // 检查IP是否已在黑名单中
    const { data: existing } = await supabaseAdmin
      .from('ip_blacklist')
      .select('*')
      .eq('ip_address', ip_address)
      .single()
    
    if (existing) {
      return res.status(400).json({ error: 'IP已在黑名单中' })
    }
    
    // 添加到黑名单
    const { error } = await supabaseAdmin
      .from('ip_blacklist')
      .insert({
        ip_address,
        reason: reason || '管理员手动添加',
        blocked_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 默认24小时
        is_permanent: false
      })
    
    if (error) {
      console.error('添加IP到黑名单失败:', error)
      return res.status(500).json({ error: '添加IP到黑名单失败' })
    }
    
    // 记录安全事件
    await logSecurityEvent(
      'ip_manual_block',
      adminIP,
      req.user?.id || null,
      req.user?.email || null,
      { blockedIP: ip_address, reason, adminAction: true },
      'warning'
    )
    await logActivityEvent(
      'ip_security',
      'ip_blocked',
      { blockedIP: ip_address, reason, adminAction: true },
      req.user?.id || null,
      req.user?.email || null,
      adminIP,
      req.headers['user-agent'] as string
    )
    
    res.json({ success: true, message: 'IP已添加到黑名单' })
  } catch (error) {
    console.error('添加IP到黑名单失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 获取安全统计数据
router.get('/stats', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
  try {
    const now = new Date()
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    // 获取各种统计数据
    const [totalAttempts, failedAttempts24h, blockedIPs, securityEvents7d] = await Promise.all([
      // 总登录尝试次数
      supabaseAdmin
        .from('login_attempts')
        .select('*', { count: 'exact', head: true }),
      
      // 24小时内失败登录次数
      supabaseAdmin
        .from('login_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('success', false)
        .gte('created_at', last24Hours.toISOString()),
      
      // 当前被阻止的IP数量
      supabaseAdmin
        .from('ip_blacklist')
        .select('*', { count: 'exact', head: true })
        .or(`blocked_until.gte.${now.toISOString()},is_permanent.eq.true`),
      
      // 7天内安全事件数量
      supabaseAdmin
        .from('security_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', last7Days.toISOString())
    ])
    
    res.json({
      totalLoginAttempts: totalAttempts.count || 0,
      failedAttempts24h: failedAttempts24h.count || 0,
      blockedIPs: blockedIPs.count || 0,
      securityEvents7d: securityEvents7d.count || 0
    })
  } catch (error) {
    console.error('获取安全统计数据失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

export default router