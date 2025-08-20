import { Router, Request, Response } from 'express'
import { getClientIP, getLoginAttempts } from '../../middleware/security'
import { supabaseAdmin } from '../../lib/supabase'
import asyncHandler from '../../middleware/asyncHandler.js'

const router = Router()

// 获取当前IP的安全状态
router.get('/security-status', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const clientIP = getClientIP(req)
    
    // 检查IP是否在黑名单中
    const { data: blacklistEntry } = await supabaseAdmin
      .from('ip_blacklist')
      .select('*')
      .eq('ip_address', clientIP)
      .eq('is_active', true)
      .single()
    
    // 获取登录尝试次数
    const loginAttempts = await getLoginAttempts(clientIP)
    const maxAttempts = 3 // 从配置中获取
    const attemptsRemaining = Math.max(0, maxAttempts - loginAttempts.failedAttempts)
    
    // 检查是否被锁定
    const isLocked = blacklistEntry && new Date(blacklistEntry.locked_until) > new Date()
    
    res.json({
      success: true,
      attemptsRemaining,
      maxAttempts,
      isLocked: !!isLocked,
      lockedUntil: isLocked ? blacklistEntry.locked_until : null,
      currentAttempts: loginAttempts.failedAttempts
    })
  } catch (error) {
    console.error('获取安全状态失败:', error)
    res.status(500).json({
      success: false,
      error: '获取安全状态失败'
    })
  }
}))

export default router