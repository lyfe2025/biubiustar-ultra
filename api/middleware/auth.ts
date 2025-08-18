import { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '../lib/supabase'

// 基础认证中间件
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
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

    req.user = user
    next()
  } catch (error) {
    console.error('认证失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
}

// 管理员权限验证中间件
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
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
