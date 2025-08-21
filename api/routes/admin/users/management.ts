import { Router, Request, Response } from 'express'
import { supabaseAdmin } from '../../../lib/supabase'
import { clearAuthUsersCache } from './cache'
import { requireAdmin } from '../auth'
import asyncHandler from '../../../middleware/asyncHandler.js'
import { CacheInvalidationService } from '../../../services/cacheInvalidation'

const router = Router()

// 对所有路由应用权限验证
router.use(requireAdmin)

// 更新用户状态
router.patch('/:id/status', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status || !['active', 'inactive', 'banned'].includes(status)) {
      return res.status(400).json({ error: '无效的状态值' })
    }

    // 更新用户状态
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('更新用户状态失败:', error)
      return res.status(500).json({ error: '更新用户状态失败' })
    }

    if (!data) {
      return res.status(404).json({ error: '用户不存在' })
    }

    // 清除缓存
    clearAuthUsersCache()
    const invalidationService = new CacheInvalidationService()
    await invalidationService.invalidateUserCache(id)
    await invalidationService.invalidateContentCache()

    res.json({ message: '用户状态更新成功', user: data })
  } catch (error) {
    console.error('更新用户状态失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
}))

// 更新用户角色
router.patch('/:id/role', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params
    const { role } = req.body

    if (!role || !['user', 'admin', 'moderator'].includes(role)) {
      return res.status(400).json({ error: '无效的角色值' })
    }

    // 更新用户角色
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('更新用户角色失败:', error)
      return res.status(500).json({ error: '更新用户角色失败' })
    }

    if (!data) {
      return res.status(404).json({ error: '用户不存在' })
    }

    // 清除缓存
    clearAuthUsersCache()
    const invalidationService = new CacheInvalidationService()
    await invalidationService.invalidateUserCache(id)
    await invalidationService.invalidateContentCache()

    res.json({ message: '用户角色更新成功', user: data })
  } catch (error) {
    console.error('更新用户角色失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
}))

// 更新用户密码
router.patch('/:id/password', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params
    const { password } = req.body

    if (!password || password.length < 6) {
      return res.status(400).json({ error: '密码长度至少为6位' })
    }

    // 使用Supabase Admin API更新用户密码
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      id,
      { password }
    )

    if (error) {
      console.error('更新用户密码失败:', error)
      return res.status(500).json({ error: '更新用户密码失败' })
    }

    if (!data.user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    // 清除缓存
    clearAuthUsersCache()
    const invalidationService = new CacheInvalidationService()
    await invalidationService.invalidateUserCache(id)
    await invalidationService.invalidateContentCache()

    res.json({ message: '用户密码更新成功' })
  } catch (error) {
    console.error('更新用户密码失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
}))

// 批量更新用户状态
router.patch('/batch/status', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { userIds, status } = req.body

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: '用户ID列表不能为空' })
    }

    if (!status || !['active', 'inactive', 'banned'].includes(status)) {
      return res.status(400).json({ error: '无效的状态值' })
    }

    // 批量更新用户状态
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update({ status, updated_at: new Date().toISOString() })
      .in('id', userIds)
      .select()

    if (error) {
      console.error('批量更新用户状态失败:', error)
      return res.status(500).json({ error: '批量更新用户状态失败' })
    }

    // 清除缓存
    clearAuthUsersCache()
    const invalidationService = new CacheInvalidationService()
    // 批量操作时清除所有用户缓存
    for (const userId of userIds) {
      await invalidationService.invalidateUserCache(userId)
    }
    await invalidationService.invalidateContentCache()

    res.json({ 
      message: `成功更新${data?.length || 0}个用户的状态`, 
      updatedUsers: data 
    })
  } catch (error) {
    console.error('批量更新用户状态失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
}))

// 重置用户密码（生成临时密码）
router.post('/:id/reset-password', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params

    // 生成临时密码
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)

    // 使用Supabase Admin API更新用户密码
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      id,
      { password: tempPassword }
    )

    if (error) {
      console.error('重置用户密码失败:', error)
      return res.status(500).json({ error: '重置用户密码失败' })
    }

    if (!data.user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    // 清除缓存
    clearAuthUsersCache()
    const invalidationService = new CacheInvalidationService()
    await invalidationService.invalidateUserCache(id)
    await invalidationService.invalidateContentCache()

    res.json({ 
      message: '用户密码重置成功', 
      tempPassword,
      note: '请将临时密码告知用户，并提醒用户尽快修改密码'
    })
  } catch (error) {
    console.error('重置用户密码失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
}))

// 锁定/解锁用户账户
router.patch('/:id/lock', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params
    const { locked } = req.body

    if (typeof locked !== 'boolean') {
      return res.status(400).json({ error: '锁定状态必须是布尔值' })
    }

    // 更新用户锁定状态（通过status字段实现）
    const status = locked ? 'banned' : 'active'
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('更新用户锁定状态失败:', error)
      return res.status(500).json({ error: '更新用户锁定状态失败' })
    }

    if (!data) {
      return res.status(404).json({ error: '用户不存在' })
    }

    // 清除缓存
    clearAuthUsersCache()
    const invalidationService = new CacheInvalidationService()
    await invalidationService.invalidateUserCache(id)
    await invalidationService.invalidateContentCache()

    res.json({ 
      message: locked ? '用户账户已锁定' : '用户账户已解锁', 
      user: data 
    })
  } catch (error) {
    console.error('更新用户锁定状态失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
}))

export default router