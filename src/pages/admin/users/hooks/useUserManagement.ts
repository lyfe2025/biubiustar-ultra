import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminService } from '../../../../services/admin'
import { toast } from 'sonner'
import { User, NewUserData } from '../types'

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [isCacheHit, setIsCacheHit] = useState(false)
  const [cacheTimestamp, setCacheTimestamp] = useState<string>('')
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const navigate = useNavigate()

  // 获取用户数据
  const fetchUsers = useCallback(async (
    page: number = pagination.page, 
    limit: number = pagination.limit,
    forceSearch: boolean = false
  ) => {
    try {
      setLoading(true)
      const response = await adminService.getUsers(
        page, 
        limit, 
        searchTerm, 
        selectedStatus, 
        selectedRole
      )
      
      // 处理缓存信息
      const cacheInfo = (response as any)._cacheInfo
      if (cacheInfo) {
        setIsCacheHit(cacheInfo.cached || false)
        setCacheTimestamp(cacheInfo.timestamp || '')
      } else {
        setIsCacheHit(false)
        setCacheTimestamp('')
      }
      
      setUsers(response.data)
      setPagination(response.pagination)
    } catch (error) {
      console.error('获取用户数据失败:', error)
      
      // 确保在错误情况下users不会变成undefined
      setUsers([])
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      })
      
      if (error instanceof Error && error.name === 'AuthenticationError') {
        toast.error('认证令牌已失效，请重新登录')
        // 延迟跳转，避免重复触发
        setTimeout(() => {
          navigate('/admin')
        }, 1000)
        return
      }
      
      toast.error('获取用户数据失败')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, searchTerm, selectedStatus, selectedRole, navigate])

  // 强制刷新（跳过缓存）
  const forceRefresh = useCallback(async () => {
    // 添加一个时间戳参数来强制跳过缓存
    const timestamp = Date.now()
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        _t: timestamp.toString()
      })
      
      if (searchTerm && searchTerm.trim()) {
        params.append('search', searchTerm.trim())
      }
      if (selectedStatus && selectedStatus !== 'all') {
        params.append('status', selectedStatus)
      }
      if (selectedRole && selectedRole !== 'all') {
        params.append('role', selectedRole)
      }
      
      // 直接调用 fetch 来绕过可能的客户端缓存
      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      
      const data = await response.json()
      
      // 处理缓存信息
      const cacheInfo = data._cacheInfo
      if (cacheInfo) {
        setIsCacheHit(cacheInfo.cached || false)
        setCacheTimestamp(cacheInfo.timestamp || '')
      } else {
        setIsCacheHit(false)
        setCacheTimestamp('')
      }
      
      setUsers(data.data)
      setPagination(data.pagination)
      toast.success('数据已刷新')
    } catch (error) {
      console.error('强制刷新失败:', error)
      
      // 确保在错误情况下users不会变成undefined
      setUsers([])
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      })
      
      toast.error('刷新失败')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, searchTerm, selectedStatus, selectedRole])

  // 切换页面
  const changePage = (page: number) => {
    fetchUsers(page, pagination.limit)
  }

  // 改变每页显示数量
  const changePageSize = (limit: number) => {
    fetchUsers(1, limit)
  }

  // 搜索和筛选改变时重新搜索（重置到第一页）
  const performSearch = useCallback(() => {
    fetchUsers(1, pagination.limit, true)
  }, [fetchUsers, pagination.limit])

  // 初始加载
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // 当搜索条件改变时，延迟搜索以避免频繁请求
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '' || selectedStatus !== 'all' || selectedRole !== 'all') {
        performSearch()
      } else {
        // 如果所有条件都重置了，也要重新获取数据
        fetchUsers(1, pagination.limit)
      }
    }, 500) // 500ms延迟

    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedStatus, selectedRole, performSearch, fetchUsers, pagination.limit])

  // 更新用户状态
  const updateUserStatus = async (userId: string, status: User['status']) => {
    try {
      // 过滤掉不支持的pending状态
      if (status === 'pending') {
        toast.error('不支持的用户状态')
        return
      }
      await adminService.updateUserStatus(userId, status)
      await fetchUsers()
      toast.success('用户状态更新成功')
    } catch (error) {
      console.error('更新用户状态失败:', error)
      toast.error('更新用户状态失败')
    }
  }

  // 更新用户角色
  const updateUserRole = async (userId: string, role: User['role']) => {
    try {
      await adminService.updateUserRole(userId, role)
      await fetchUsers()
      toast.success('用户角色更新成功')
    } catch (error) {
      console.error('更新用户角色失败:', error)
      toast.error('更新用户角色失败')
    }
  }

  // 删除用户
  const deleteUser = async (user: User) => {
    try {
      setIsSubmitting(true)
      await adminService.deleteUser(user.id)
      await fetchUsers()
      setShowDeleteConfirm(false)
      setSelectedUser(null)
      toast.success('用户删除成功')
    } catch (error) {
      console.error('删除用户失败:', error)
      toast.error('删除用户失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 创建用户
  const createUser = async (userData: NewUserData) => {
    try {
      setIsSubmitting(true)
      await adminService.createUser(userData)
      await fetchUsers()
      setShowAddUserModal(false)
      toast.success('用户创建成功')
      return true
    } catch (error) {
      console.error('创建用户失败:', error)
      
      // 提取具体的错误信息
      let errorMessage = '创建用户失败'
      
      if (error instanceof Error) {
        // 检查是否包含具体的错误描述
        if (error.message.includes('用户名已存在')) {
          errorMessage = '用户名已存在，请使用其他用户名'
        } else if (error.message.includes('邮箱已存在') || error.message.includes('邮箱已被使用')) {
          errorMessage = '邮箱已存在，请使用其他邮箱地址'
        } else if (error.message.includes('邮箱已被使用过且无法重复使用')) {
          errorMessage = '该邮箱已被使用过，出于安全考虑无法重复使用，请使用其他邮箱地址'
        } else if (error.message.trim()) {
          // 如果有其他具体错误信息，显示它
          errorMessage = error.message
        }
      }
      
      toast.error(errorMessage)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  // 更新用户信息
  const updateUser = async (userId: string, userData: Partial<User>) => {
    try {
      setIsSubmitting(true)
      await adminService.updateUser(userId, userData)
      await fetchUsers()
      setShowUserModal(false)
      setSelectedUser(null)
      toast.success('用户信息更新成功')
      return true
    } catch (error) {
      console.error('更新用户信息失败:', error)
      toast.error('更新用户信息失败')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  // 更新用户密码
  const updateUserPassword = async (userId: string, password: string) => {
    try {
      // 详细调试日志：打印userId的完整信息
      console.log('🔐 [DEBUG] updateUserPassword - 开始更新密码:', {
        userId,
        userIdType: typeof userId,
        userIdValue: JSON.stringify(userId),
        userIdIsUndefined: userId === undefined,
        userIdIsNull: userId === null,
        userIdIsEmpty: userId === '',
        passwordLength: password?.length,
        password: password ? '***' : 'undefined',
        selectedUser: selectedUser ? {
          id: selectedUser.id,
          idType: typeof selectedUser.id,
          username: selectedUser.username,
          email: selectedUser.email
        } : 'null'
      })
      
      setIsUpdatingPassword(true)
      
      if (!password || password.trim() === '') {
        console.error('❌ 密码为空或未定义')
        toast.error('密码不能为空')
        return false
      }
      
      if (!userId || userId === 'undefined' || userId === 'null') {
        console.error('❌ [DEBUG] userId无效:', { userId, type: typeof userId })
        toast.error('用户ID无效，无法更新密码')
        return false
      }
      
      console.log('🚀 [DEBUG] 调用adminService.updateUserPassword:', { userId, userIdType: typeof userId })
      await adminService.updateUserPassword(userId, password)
      setShowPasswordModal(false)
      setSelectedUser(null)
      toast.success('密码更新成功')
      return true
    } catch (error) {
      console.error('❌ [DEBUG] 更新密码失败 - 详细错误信息:', {
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
        userId,
        userIdType: typeof userId,
        stack: error instanceof Error ? error.stack : undefined
      })
      toast.error(`更新密码失败: ${error instanceof Error ? error.message : String(error)}`)
      return false
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  // 模态框操作
  const openUserModal = (user: User) => {
    setSelectedUser(user)
    setShowUserModal(true)
  }

  const openDeleteConfirm = (user: User) => {
    setSelectedUser(user)
    setShowDeleteConfirm(true)
  }

  const openPasswordModal = (user: User) => {
    setSelectedUser(user)
    setShowPasswordModal(true)
  }

  const closeAllModals = () => {
    setShowUserModal(false)
    setShowDeleteConfirm(false)
    setShowAddUserModal(false)
    setShowPasswordModal(false)
    setSelectedUser(null)
  }

  return {
    // 数据
    users, // 现在直接返回从后端获取的已筛选数据
    loading,
    selectedUser,
    isSubmitting,
    isUpdatingPassword,
    pagination,
    
    // 缓存状态
    isCacheHit,
    cacheTimestamp,
    
    // 筛选状态
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    selectedRole,
    setSelectedRole,
    
    // 模态框状态
    showUserModal,
    showDeleteConfirm,
    showAddUserModal,
    showPasswordModal,
    
    // 操作方法
    fetchUsers,
    forceRefresh,
    updateUser,
    updateUserStatus,
    updateUserRole,
    deleteUser,
    createUser,
    updateUserPassword,
    changePage,
    changePageSize,
    
    // 模态框操作
    openUserModal,
    openDeleteConfirm,
    openPasswordModal,
    setShowAddUserModal,
    closeAllModals
  }
}
