import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminService } from '../../../../services/AdminService'
import { toast } from 'sonner'
import { User, NewUserData } from '../types'

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
  const navigate = useNavigate()

  // 获取用户数据
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await adminService.getUsers()
      setUsers(data)
    } catch (error) {
      console.error('获取用户数据失败:', error)
      
      if (error instanceof Error && error.name === 'AuthenticationError') {
        alert('认证令牌已失效，请重新登录')
        navigate('/admin')
        return
      }
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    fetchUsers()
  }, [])

  // 过滤用户
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    
    return matchesSearch && matchesStatus && matchesRole
  })

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
      await adminService.deleteUser(user.id)
      await fetchUsers()
      setShowDeleteConfirm(false)
      setSelectedUser(null)
      toast.success('用户删除成功')
    } catch (error) {
      console.error('删除用户失败:', error)
      toast.error('删除用户失败')
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
      toast.error('创建用户失败')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  // 更新用户密码
  const updateUserPassword = async (userId: string, password: string) => {
    try {
      setIsUpdatingPassword(true)
      await adminService.updateUserPassword(userId, password)
      setShowPasswordModal(false)
      setSelectedUser(null)
      toast.success('密码更新成功')
      return true
    } catch (error) {
      console.error('更新密码失败:', error)
      toast.error('更新密码失败')
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
    users: filteredUsers,
    allUsers: users,
    loading,
    selectedUser,
    isSubmitting,
    isUpdatingPassword,
    
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
    updateUserStatus,
    updateUserRole,
    deleteUser,
    createUser,
    updateUserPassword,
    
    // 模态框操作
    openUserModal,
    openDeleteConfirm,
    openPasswordModal,
    setShowAddUserModal,
    closeAllModals
  }
}
