import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  MoreHorizontal,
  User,
  Mail,
  Calendar,
  Shield,
  ShieldCheck,
  ShieldX,
  Eye,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
  Users,
  UserPlus,
  Settings,
  Key
} from 'lucide-react'
import { cn } from '../../lib/utils'
import AdminLayout from '../../components/AdminLayout'
import { useLanguage } from '../../contexts/LanguageContext'
import { adminService } from '../../services/AdminService'
import { toast } from 'sonner'

interface User {
  id: string
  username: string
  email: string
  avatar?: string
  full_name?: string
  bio?: string
  location?: string
  website?: string
  followers_count: number
  following_count: number
  posts_count: number
  status: 'active' | 'suspended' | 'banned' | 'pending'
  role: 'user' | 'moderator' | 'admin'
  email_verified: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

const AdminUsers = () => {
  const { t } = useLanguage()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [newUserData, setNewUserData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'user' as 'user' | 'moderator' | 'admin',
    status: 'active' as 'active' | 'suspended' | 'banned' | 'pending'
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const navigate = useNavigate()

  // 获取用户数据函数
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await adminService.getUsers()
      setUsers(data)
    } catch (error) {
      console.error('获取用户数据失败:', error)
      
      // 检查是否为认证失败错误
      if (error instanceof Error && error.name === 'AuthenticationError') {
        // 显示友好提示
        alert('认证令牌已失效，请重新登录')
        // 跳转到管理后台登录页面
        navigate('/admin')
        return
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // 检查管理员登录状态
    const adminToken = localStorage.getItem('adminToken')
    if (!adminToken) {
      navigate('/admin')
      return
    }

    fetchUsers()
  }, [navigate])

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'suspended' | 'banned') => {
    try {
      await adminService.updateUserStatus(userId, newStatus)
      
      // 更新本地状态
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, status: newStatus, updated_at: new Date().toISOString() }
          : user
      ))
      
      setShowUserModal(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('更新用户状态失败:', error)
      
      // 检查是否为认证失败错误
      if (error instanceof Error && error.name === 'AuthenticationError') {
        alert('认证令牌已失效，请重新登录')
        navigate('/admin')
        return
      }
    }
  }

  const handleRoleChange = async (userId: string, newRole: 'user' | 'moderator' | 'admin') => {
    try {
      await adminService.updateUserRole(userId, newRole)
      
      // 更新本地状态
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, role: newRole, updated_at: new Date().toISOString() }
          : user
      ))
      
      setShowUserModal(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('更新用户角色失败:', error)
      
      // 检查是否为认证失败错误
      if (error instanceof Error && error.name === 'AuthenticationError') {
        alert('认证令牌已失效，请重新登录')
        navigate('/admin')
        return
      }
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await adminService.deleteUser(userId)
      
      // 从本地状态中移除用户
      setUsers(prev => prev.filter(user => user.id !== userId))
      setShowDeleteConfirm(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('删除用户失败:', error)
      
      // 检查是否为认证失败错误
      if (error instanceof Error && error.name === 'AuthenticationError') {
        alert('认证令牌已失效，请重新登录')
        navigate('/admin')
        return
      }
    }
  }

  // 表单验证函数
  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    // 用户名验证
    if (!newUserData.username.trim()) {
      errors.username = t('admin.users.add.validation.usernameRequired')
    } else if (newUserData.username.length < 3 || newUserData.username.length > 20) {
      errors.username = t('admin.users.add.validation.usernameLength')
    } else if (!/^[a-zA-Z0-9_]+$/.test(newUserData.username)) {
      errors.username = t('admin.users.add.validation.usernameFormat')
    }
    
    // 邮箱验证
    if (!newUserData.email.trim()) {
      errors.email = t('admin.users.add.validation.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUserData.email)) {
      errors.email = t('admin.users.add.validation.emailFormat')
    }
    
    // 密码验证
    if (!newUserData.password.trim()) {
      errors.password = t('admin.users.add.validation.passwordRequired')
    } else if (newUserData.password.length < 8) {
      errors.password = t('admin.users.add.validation.passwordLength')
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(newUserData.password)) {
      errors.password = t('admin.users.add.validation.passwordStrength')
    }
    
    // 姓名验证
    if (newUserData.full_name.trim() && newUserData.full_name.length > 50) {
      errors.full_name = t('admin.users.add.validation.fullNameLength')
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }
  
  // 实时验证单个字段
  const validateField = (field: string, value: string) => {
    const errors = { ...validationErrors }
    
    switch (field) {
      case 'username':
        if (!value.trim()) {
          errors.username = t('admin.users.add.validation.usernameRequired')
        } else if (value.length < 3 || value.length > 20) {
          errors.username = t('admin.users.add.validation.usernameLength')
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          errors.username = t('admin.users.add.validation.usernameFormat')
        } else {
          delete errors.username
        }
        break
      case 'email':
        if (!value.trim()) {
          errors.email = t('admin.users.add.validation.emailRequired')
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = t('admin.users.add.validation.emailFormat')
        } else {
          delete errors.email
        }
        break
      case 'password':
        if (!value.trim()) {
          errors.password = t('admin.users.add.validation.passwordRequired')
        } else if (value.length < 8) {
          errors.password = t('admin.users.add.validation.passwordLength')
        } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(value)) {
          errors.password = t('admin.users.add.validation.passwordStrength')
        } else {
          delete errors.password
        }
        break
      case 'full_name':
        if (value.trim() && value.length > 50) {
          errors.full_name = t('admin.users.add.validation.fullNameLength')
        } else {
          delete errors.full_name
        }
        break
    }
    
    setValidationErrors(errors)
  }

  // 密码强度验证函数
  const getPasswordStrength = (password: string): number => {
    let strength = 0
    if (password.length >= 6) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^\w\s]/.test(password)) strength++
    return Math.min(strength, 3)
  }

  // 密码强度文本
  const getPasswordStrengthText = (password: string): string => {
    const strength = getPasswordStrength(password)
    switch (strength) {
      case 0:
      case 1:
        return t('admin.users.password.strengthWeak')
      case 2:
        return t('admin.users.password.strengthMedium')
      case 3:
        return t('admin.users.password.strengthStrong')
      default:
        return ''
    }
  }

  // 密码字段验证
  const validatePasswordField = (field: string, value: string) => {
    const errors = { ...passwordErrors }
    
    if (field === 'newPassword') {
      if (!value.trim()) {
        errors.newPassword = t('admin.users.password.errors.required')
      } else if (value.length < 6) {
        errors.newPassword = t('admin.users.password.errors.minLength')
      } else {
        delete errors.newPassword
      }
      
      // 如果确认密码已填写，重新验证确认密码
      if (passwordData.confirmPassword && value !== passwordData.confirmPassword) {
        errors.confirmPassword = t('admin.users.password.errors.mismatch')
      } else if (passwordData.confirmPassword && value === passwordData.confirmPassword) {
        delete errors.confirmPassword
      }
    }
    
    if (field === 'confirmPassword') {
      if (!value.trim()) {
        errors.confirmPassword = t('admin.users.password.errors.required')
      } else if (value !== passwordData.newPassword) {
        errors.confirmPassword = t('admin.users.password.errors.mismatch')
      } else {
        delete errors.confirmPassword
      }
    }
    
    setPasswordErrors(errors)
  }

  // 处理密码更新
  const handlePasswordUpdate = async () => {
    if (!selectedUser || Object.keys(passwordErrors).length > 0 || !passwordData.newPassword || !passwordData.confirmPassword) {
      return
    }
    
    setIsUpdatingPassword(true)
    
    try {
      await adminService.updateUserPassword(selectedUser.id, passwordData.newPassword)
      
      // 显示成功提示
      toast.success(t('admin.users.password.success'))
      
      // 关闭弹窗并重置状态
      setShowPasswordModal(false)
      setPasswordData({ newPassword: '', confirmPassword: '' })
      setPasswordErrors({})
    } catch (error: any) {
      console.error('更新密码失败:', error)
      toast.error(error.message || t('admin.users.password.error'))
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleAddUser = async () => {
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    try {
      const newUser = await adminService.createUser(newUserData)
      
      // 重新获取用户列表以确保数据同步
      await fetchUsers()
      
      setShowAddUserModal(false)
      setNewUserData({
        username: '',
        email: '',
        password: '',
        full_name: '',
        role: 'user',
        status: 'active'
      })
      setValidationErrors({})
      
      // 显示成功提示
      toast.success(t('admin.users.add.success'))
    } catch (error) {
      console.error('添加用户失败:', error)
      
      // 检查是否为认证失败错误
      if (error instanceof Error && error.name === 'AuthenticationError') {
        alert('认证令牌已失效，请重新登录')
        navigate('/admin')
        return
      }
      
      // 解析后端返回的具体错误信息
      let errorMessage = t('admin.users.add.error')
      
      if (error instanceof Error) {
        const message = error.message.toLowerCase()
        
        // 根据后端返回的错误信息提供友好提示
        if (message.includes('username') && message.includes('already exists')) {
          errorMessage = t('admin.users.add.errors.usernameExists')
        } else if (message.includes('email') && message.includes('already exists')) {
          errorMessage = t('admin.users.add.errors.emailExists')
        } else if (message.includes('missing required fields')) {
          errorMessage = t('admin.users.add.errors.missingFields')
        } else if (message.includes('invalid email format')) {
          errorMessage = t('admin.users.add.errors.invalidEmail')
        } else if (message.includes('password too weak')) {
          errorMessage = t('admin.users.add.errors.weakPassword')
        } else if (message.includes('username too short')) {
          errorMessage = t('admin.users.add.errors.usernameTooShort')
        } else {
          // 如果是其他错误，显示原始错误信息
          errorMessage = `${t('admin.users.add.error')}: ${error.message}`
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    const matchesSearch = (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesStatus && matchesRole && matchesSearch
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: t('admin.users.status.active'), color: 'bg-green-100 text-green-800', icon: CheckCircle },
      suspended: { label: t('admin.users.status.suspended'), color: 'bg-yellow-100 text-yellow-800', icon: Ban },
      banned: { label: t('admin.users.status.banned'), color: 'bg-red-100 text-red-800', icon: XCircle },
      pending: { label: t('admin.users.status.pending'), color: 'bg-gray-100 text-gray-800', icon: User }
    }
    const config = statusConfig[status as keyof typeof statusConfig]
    const Icon = config.icon
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    )
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      user: { label: t('admin.users.role.user'), color: 'bg-blue-100 text-blue-800', icon: User },
      moderator: { label: t('admin.users.role.moderator'), color: 'bg-purple-100 text-purple-800', icon: Shield },
      admin: { label: t('admin.users.role.admin'), color: 'bg-red-100 text-red-800', icon: ShieldCheck }
    }
    const config = roleConfig[role as keyof typeof roleConfig]
    const Icon = config.icon
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 页面标题和操作 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('admin.users.title')}</h1>
            <p className="text-gray-600">{t('admin.users.description')}</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button 
              onClick={() => setShowAddUserModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t('admin.users.actions.addUser')}</span>
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{t('admin.users.stats.total')}</p>
                <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{t('admin.users.stats.active')}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Ban className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{t('admin.users.stats.suspended')}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {users.filter(u => u.status === 'suspended').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <User className="w-8 h-8 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{t('admin.users.stats.pending')}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {users.filter(u => u.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 筛选和搜索 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 状态筛选 */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">{t('admin.users.filter.allStatus')}</option>
                <option value="active">{t('admin.users.status.active')}</option>
                <option value="suspended">{t('admin.users.status.suspended')}</option>
                <option value="banned">{t('admin.users.status.banned')}</option>
                <option value="pending">{t('admin.users.status.pending')}</option>
              </select>
            </div>

            {/* 角色筛选 */}
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-gray-400" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">{t('admin.users.filter.allRoles')}</option>
                <option value="user">{t('admin.users.role.user')}</option>
                <option value="moderator">{t('admin.users.role.moderator')}</option>
                <option value="admin">{t('admin.users.role.admin')}</option>
              </select>
            </div>

            {/* 搜索框 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('admin.users.search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* 用户列表 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.users.table.user')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.users.table.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.users.table.role')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.users.table.stats')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.users.table.lastLogin')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.users.table.joinDate')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.users.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={user.avatar || 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=default%20avatar&image_size=square'}
                          alt={user.username}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.username}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          {user.full_name && (
                            <p className="text-xs text-gray-400">{user.full_name}</p>
                          )}
                        </div>
                        {user.email_verified && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        <div>{t('admin.users.stats.posts')}: {user.posts_count}</div>
                        <div>{t('admin.users.stats.followers')}: {user.followers_count}</div>
                        <div>{t('admin.users.stats.following')}: {user.following_count}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.last_login ? formatDate(user.last_login) : t('admin.users.table.neverLoggedIn')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowUserModal(true)
                          }}
                          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowDeleteConfirm(true)
                          }}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('admin.users.empty.title')}</h3>
              <p className="text-gray-500">{t('admin.users.empty.description')}</p>
            </div>
          )}
        </div>

        {/* 用户详情弹窗 */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowUserModal(false)}
            />
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">{t('admin.users.modal.title')}</h3>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* 用户基本信息 */}
                  <div className="flex items-center space-x-4">
                    <img
                      src={selectedUser.avatar || 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=default%20avatar&image_size=square'}
                      alt={selectedUser.username}
                      className="w-16 h-16 rounded-full"
                    />
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-gray-900">{selectedUser.username}</h4>
                      <p className="text-gray-600">{selectedUser.email}</p>
                      {selectedUser.full_name && (
                        <p className="text-gray-500">{selectedUser.full_name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      {getStatusBadge(selectedUser.status)}
                      {getRoleBadge(selectedUser.role)}
                    </div>
                  </div>

                  {/* 用户详细信息 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.users.modal.bio')}</label>
                      <p className="text-sm text-gray-900">{selectedUser.bio || t('admin.users.modal.noData')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.users.modal.location')}</label>
                      <p className="text-sm text-gray-900">{selectedUser.location || t('admin.users.modal.noData')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.users.modal.website')}</label>
                      <p className="text-sm text-gray-900">{selectedUser.website || t('admin.users.modal.noData')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.users.modal.emailVerified')}</label>
                      <p className="text-sm text-gray-900">
                        {selectedUser.email_verified ? t('admin.users.modal.verified') : t('admin.users.modal.notVerified')}
                      </p>
                    </div>
                  </div>

                  {/* 统计信息 */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-gray-900">{selectedUser.posts_count}</p>
                      <p className="text-sm text-gray-500">{t('admin.users.stats.posts')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-gray-900">{selectedUser.followers_count}</p>
                      <p className="text-sm text-gray-500">{t('admin.users.stats.followers')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-gray-900">{selectedUser.following_count}</p>
                      <p className="text-sm text-gray-500">{t('admin.users.stats.following')}</p>
                    </div>
                  </div>

                  {/* 时间信息 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.users.modal.joinDate')}</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedUser.created_at)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.users.modal.lastLogin')}</label>
                      <p className="text-sm text-gray-900">
                        {selectedUser.last_login ? formatDate(selectedUser.last_login) : t('admin.users.table.neverLoggedIn')}
                      </p>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                    {/* 状态操作 */}
                    {selectedUser.status === 'active' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(selectedUser.id, 'suspended')}
                          className="bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors"
                        >
                          {t('admin.users.actions.suspend')}
                        </button>
                        <button
                          onClick={() => handleStatusChange(selectedUser.id, 'banned')}
                          className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          {t('admin.users.actions.ban')}
                        </button>
                      </>
                    )}
                    {selectedUser.status === 'suspended' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(selectedUser.id, 'active')}
                          className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          {t('admin.users.actions.restore')}
                        </button>
                        <button
                          onClick={() => handleStatusChange(selectedUser.id, 'banned')}
                          className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          {t('admin.users.actions.ban')}
                        </button>
                      </>
                    )}
                    {selectedUser.status === 'banned' && (
                      <button
                        onClick={() => handleStatusChange(selectedUser.id, 'active')}
                        className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        {t('admin.users.actions.unban')}
                      </button>
                    )}
                    {selectedUser.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(selectedUser.id, 'active')}
                          className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          {t('admin.users.actions.approve')}
                        </button>
                        <button
                          onClick={() => handleStatusChange(selectedUser.id, 'banned')}
                          className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          {t('admin.users.actions.reject')}
                        </button>
                      </>
                    )}

                    {/* 角色操作 */}
                    {selectedUser.role === 'user' && (
                      <button
                        onClick={() => handleRoleChange(selectedUser.id, 'moderator')}
                        className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        {t('admin.users.actions.setModerator')}
                      </button>
                    )}
                    {selectedUser.role === 'moderator' && (
                      <>
                        <button
                          onClick={() => handleRoleChange(selectedUser.id, 'user')}
                          className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          {t('admin.users.actions.removeModerator')}
                        </button>
                        <button
                          onClick={() => handleRoleChange(selectedUser.id, 'admin')}
                          className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          {t('admin.users.actions.setAdmin')}
                        </button>
                      </>
                    )}

                    {/* 修改密码按钮 */}
                    <button
                      onClick={() => {
                        setShowUserModal(false)
                        setShowPasswordModal(true)
                      }}
                      className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Key className="w-4 h-4" />
                      <span>{t('admin.users.actions.changePassword')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 删除确认弹窗 */}
        {showDeleteConfirm && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowDeleteConfirm(false)}
            />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex-shrink-0">
                    <Trash2 className="w-8 h-8 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{t('admin.users.delete.title')}</h3>
                    <p className="text-sm text-gray-500">{t('admin.users.delete.warning')}</p>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6">
                  {t('admin.users.delete.confirmation')}
                </p>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={() => handleDeleteUser(selectedUser.id)}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    {t('admin.users.delete.confirm')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 添加用户弹窗 */}
        {showAddUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowAddUserModal(false)}
            />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex-shrink-0">
                    <UserPlus className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{t('admin.users.add.title')}</h3>
                    <p className="text-sm text-gray-500">{t('admin.users.add.description')}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.users.add.username')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newUserData.username}
                      onChange={(e) => {
                        const value = e.target.value
                        setNewUserData(prev => ({ ...prev, username: value }))
                        validateField('username', value)
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        validationErrors.username ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder={t('admin.users.add.usernamePlaceholder')}
                    />
                    {validationErrors.username && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.username}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.users.add.email')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={newUserData.email}
                      onChange={(e) => {
                        const value = e.target.value
                        setNewUserData(prev => ({ ...prev, email: value }))
                        validateField('email', value)
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        validationErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder={t('admin.users.add.emailPlaceholder')}
                    />
                    {validationErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.users.add.password')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={newUserData.password}
                      onChange={(e) => {
                        const value = e.target.value
                        setNewUserData(prev => ({ ...prev, password: value }))
                        validateField('password', value)
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        validationErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder={t('admin.users.add.passwordPlaceholder')}
                    />
                    {validationErrors.password && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.users.add.fullName')}
                    </label>
                    <input
                      type="text"
                      value={newUserData.full_name}
                      onChange={(e) => {
                        const value = e.target.value
                        setNewUserData(prev => ({ ...prev, full_name: value }))
                        validateField('full_name', value)
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        validationErrors.full_name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder={t('admin.users.add.fullNamePlaceholder')}
                    />
                    {validationErrors.full_name && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.full_name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.users.add.role')}
                    </label>
                    <select
                      value={newUserData.role}
                      onChange={(e) => setNewUserData(prev => ({ ...prev, role: e.target.value as 'user' | 'moderator' | 'admin' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="user">{t('admin.users.role.user')}</option>
                      <option value="moderator">{t('admin.users.role.moderator')}</option>
                      <option value="admin">{t('admin.users.role.admin')}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.users.add.status')}
                    </label>
                    <select
                      value={newUserData.status}
                      onChange={(e) => setNewUserData(prev => ({ ...prev, status: e.target.value as 'active' | 'suspended' | 'banned' | 'pending' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="active">{t('admin.users.status.active')}</option>
                      <option value="pending">{t('admin.users.status.pending')}</option>
                      <option value="suspended">{t('admin.users.status.suspended')}</option>
                      <option value="banned">{t('admin.users.status.banned')}</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setShowAddUserModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleAddUser}
                    disabled={isSubmitting || Object.keys(validationErrors).length > 0 || !newUserData.username || !newUserData.email || !newUserData.password}
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('admin.users.add.submitting')}
                      </>
                    ) : (
                      t('admin.users.add.submit')
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 修改密码弹窗 */}
        {showPasswordModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowPasswordModal(false)}
            />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex-shrink-0">
                    <Key className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{t('admin.users.password.title')}</h3>
                    <p className="text-sm text-gray-500">
                      {t('admin.users.password.description')}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.users.password.newPassword')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => {
                        const value = e.target.value
                        setPasswordData(prev => ({ ...prev, newPassword: value }))
                        validatePasswordField('newPassword', value)
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        passwordErrors.newPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder={t('admin.users.password.newPasswordPlaceholder')}
                    />
                    {passwordErrors.newPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                    )}
                    
                    {/* 密码强度指示器 */}
                    {passwordData.newPassword && (
                      <div className="mt-2">
                        <div className="text-xs text-gray-600 mb-1">{t('admin.users.password.strength')}</div>
                        <div className="flex space-x-1">
                          <div className={`h-1 flex-1 rounded ${
                            getPasswordStrength(passwordData.newPassword) >= 1 ? 'bg-red-500' : 'bg-gray-200'
                          }`} />
                          <div className={`h-1 flex-1 rounded ${
                            getPasswordStrength(passwordData.newPassword) >= 2 ? 'bg-yellow-500' : 'bg-gray-200'
                          }`} />
                          <div className={`h-1 flex-1 rounded ${
                            getPasswordStrength(passwordData.newPassword) >= 3 ? 'bg-green-500' : 'bg-gray-200'
                          }`} />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {getPasswordStrengthText(passwordData.newPassword)}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.users.password.confirmPassword')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => {
                        const value = e.target.value
                        setPasswordData(prev => ({ ...prev, confirmPassword: value }))
                        validatePasswordField('confirmPassword', value)
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        passwordErrors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder={t('admin.users.password.confirmPasswordPlaceholder')}
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowPasswordModal(false)
                      setPasswordData({ newPassword: '', confirmPassword: '' })
                      setPasswordErrors({})
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handlePasswordUpdate}
                    disabled={isUpdatingPassword || Object.keys(passwordErrors).length > 0 || !passwordData.newPassword || !passwordData.confirmPassword}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isUpdatingPassword ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('admin.users.password.updating')}
                      </>
                    ) : (
                      t('admin.users.password.update')
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminUsers