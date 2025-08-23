import { Router, Request, Response } from 'express'
import { supabaseAdmin } from '../../../lib/supabase'
import { clearAuthUsersCache } from './cache'
import { requireAdmin } from '../auth'
import asyncHandler from '../../../middleware/asyncHandler.js'
import { 
  invalidateOnUserStatusChange,
  invalidateOnUserRoleChange,
  invalidateOnUserUpdate,
  userCacheInvalidationService,
  UserCacheInvalidationType
} from '../../../utils/userCacheInvalidation.js'

const router = Router()

// 对所有路由应用权限验证
router.use(requireAdmin)

// 更新用户状态
router.patch('/:id/status', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status || !['active', 'inactive', 'banned', 'suspended'].includes(status)) {
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

    // 智能缓存失效
    await invalidateOnUserStatusChange(id)

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

    // 智能缓存失效
    await invalidateOnUserRoleChange(id)

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
    const { newPassword } = req.body
    
    // 详细调试日志 - 请求信息
    console.log('🔐 密码更新请求详情:', {
      userId: id,
      userIdType: typeof id,
      userIdLength: id?.length,
      isValidUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id),
      requestBody: req.body,
      newPassword: newPassword ? '***' : 'undefined',
      newPasswordLength: newPassword?.length,
      newPasswordType: typeof newPassword,
      timestamp: new Date().toISOString()
    })

    // 验证密码格式
    if (!newPassword) {
      console.log('❌ 密码验证失败: 密码为空')
      return res.status(400).json({ 
        error: '密码不能为空',
        field: 'newPassword',
        details: '请提供新密码'
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: '密码长度不足',
        field: 'newPassword',
        details: '密码长度至少为6位字符'
      })
    }

    if (newPassword.length > 128) {
      return res.status(400).json({ 
        error: '密码长度过长',
        field: 'newPassword',
        details: '密码长度不能超过128位字符'
      })
    }

    // 检查用户是否存在 - 详细调试
    console.log('🔍 开始检查用户存在性:', {
      userId: id,
      queryTable: 'user_profiles',
      queryFields: 'id, username'
    })
    
    const { data: existingUser, error: userCheckError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, username')
      .eq('id', id)
      .single()

    console.log('🔍 用户存在性检查结果:', {
      userId: id,
      userFound: !!existingUser,
      userData: existingUser ? {
        id: existingUser.id,
        username: existingUser.username
      } : null,
      error: userCheckError ? {
        message: userCheckError.message,
        code: userCheckError.code,
        details: userCheckError.details,
        hint: userCheckError.hint
      } : null
    })

    if (userCheckError || !existingUser) {
      console.log('❌ 用户不存在 - 详细错误信息:', {
        userId: id,
        errorType: userCheckError ? 'database_error' : 'user_not_found',
        errorMessage: userCheckError?.message || 'No user data returned',
        errorCode: userCheckError?.code || 'USER_NOT_FOUND'
      })
      
      return res.status(404).json({ 
        error: '用户不存在',
        details: '无法找到指定的用户，可能已被删除或ID无效',
        debugInfo: {
          userId: id,
          errorType: userCheckError ? 'database_error' : 'user_not_found',
          errorMessage: userCheckError?.message || 'No user data returned'
        }
      })
    }

    // 使用Supabase Admin API更新用户密码 - 详细调试
    console.log('🔑 调用Supabase Admin API更新密码:', {
      userId: id,
      userIdType: typeof id,
      passwordProvided: !!newPassword,
      passwordLength: newPassword?.length,
      apiMethod: 'supabaseAdmin.auth.admin.updateUserById',
      timestamp: new Date().toISOString()
    })
    
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      id,
      { password: newPassword }
    )

    console.log('🔑 Supabase Admin API响应:', {
      userId: id,
      success: !error,
      userData: data?.user ? {
        id: data.user.id,
        email: data.user.email,
        created_at: data.user.created_at,
        updated_at: data.user.updated_at
      } : null,
      error: error ? {
        message: error.message,
        status: error.status,
        name: error.name,
        stack: error.stack?.split('\n').slice(0, 3).join('\n')
      } : null
    })

    if (error) {
      console.error('❌ Supabase Admin API更新密码失败:', {
        userId: id,
        errorMessage: error.message,
        errorStatus: error.status,
        errorName: error.name,
        fullError: error
      })
      
      // 根据Supabase错误类型提供具体的错误信息
      let errorMessage = '更新用户密码失败'
      let errorDetails = '请稍后重试'
      
      if (error.message) {
        if (error.message.includes('Invalid password')) {
          errorMessage = '密码格式无效'
          errorDetails = '密码包含无效字符或格式不正确'
        } else if (error.message.includes('Password too weak')) {
          errorMessage = '密码强度不足'
          errorDetails = '密码过于简单，请使用更复杂的密码'
        } else if (error.message.includes('User not found')) {
          errorMessage = '用户不存在'
          errorDetails = '无法找到指定的用户账户'
        } else if (error.message.includes('Invalid user ID')) {
          errorMessage = '用户ID无效'
          errorDetails = '提供的用户ID格式不正确'
        } else if (error.message.includes('Rate limit exceeded')) {
          errorMessage = '操作过于频繁'
          errorDetails = '请稍等片刻后再试'
        } else if (error.message.includes('Service unavailable')) {
          errorMessage = '服务暂时不可用'
          errorDetails = '认证服务暂时不可用，请稍后重试'
        } else {
          errorDetails = error.message
        }
      }
      
      return res.status(500).json({ 
        error: errorMessage,
        details: errorDetails,
        code: error.status || 'UNKNOWN_ERROR'
      })
    }

    if (!data.user) {
      return res.status(404).json({ 
        error: '用户不存在',
        details: '无法找到指定的用户账户'
      })
    }

    // 智能缓存失效
    await invalidateOnUserUpdate(id)

    res.json({ 
      message: '用户密码更新成功',
      user: {
        id: existingUser.id,
        username: existingUser.username
      }
    })
  } catch (error) {
    console.error('更新用户密码失败:', error)
    
    // 处理其他类型的错误
    let errorMessage = '服务器内部错误'
    let errorDetails = '请稍后重试'
    
    if (error instanceof Error) {
      if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = '网络连接失败'
        errorDetails = '请检查网络连接后重试'
      } else if (error.message.includes('timeout')) {
        errorMessage = '请求超时'
        errorDetails = '操作耗时过长，请稍后重试'
      } else {
        errorDetails = error.message
      }
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: errorDetails,
      code: 'INTERNAL_ERROR'
    })
  }
}))

// 批量更新用户状态
router.patch('/batch/status', asyncHandler(async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { userIds, status } = req.body

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: '用户ID列表不能为空' })
    }

    if (!status || !['active', 'inactive', 'banned', 'suspended'].includes(status)) {
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

    // 智能缓存失效（批量状态更新）
    await userCacheInvalidationService.invalidate({
      type: UserCacheInvalidationType.STATUS_CHANGE,
      userIds: userIds,
      invalidateStats: true,
      invalidateList: true
    })

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

    // 智能缓存失效
    await invalidateOnUserUpdate(id)

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

    // 智能缓存失效
    await invalidateOnUserStatusChange(id)

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