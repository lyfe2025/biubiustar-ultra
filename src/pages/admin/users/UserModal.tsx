import React, { useState, useEffect } from 'react'
import { X, User, Save, Trash2, Key, Eye, EyeOff } from 'lucide-react'
import { useLanguage } from '../../../contexts/language'
import { User as UserType, UserModalProps, AddUserModalProps, PasswordModalProps, NewUserData, PasswordData } from './types'
import { generateDefaultAvatarUrl, isDefaultAvatar, getUserDefaultAvatarUrl } from '../../../utils/avatarGenerator'

// 用户详情/编辑模态框
export const UserModal: React.FC<UserModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
  onDelete,
  loading = false
}) => {
  const { t } = useLanguage()
  const [editData, setEditData] = useState<Partial<UserType>>({})

  useEffect(() => {
    if (user) {
      setEditData({
        username: user.username,
        full_name: user.full_name || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || ''
      })
    }
  }, [user])

  if (!isOpen || !user) return null

  const handleSave = () => {
    onSave(editData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{t('admin.users.editUser')}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 用户头像和基本信息 */}
          <div className="flex items-center space-x-4">
            {user.avatar ? (
              <img className="h-16 w-16 rounded-full object-cover" src={user.avatar} alt="" />
            ) : (
              <img 
                className="h-16 w-16 rounded-full" 
                src={getUserDefaultAvatarUrl(user.username, user.avatar)} 
                alt="" 
              />
            )}
            <div>
              <h4 className="text-lg font-medium text-gray-900">{user.username}</h4>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          {/* 编辑表单 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.users.username')}
              </label>
              <input
                type="text"
                value={editData.username || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.users.fullName')}
              </label>
              <input
                type="text"
                value={editData.full_name || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, full_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.users.bio')}
              </label>
              <textarea
                rows={3}
                value={editData.bio || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.users.location')}
              </label>
              <input
                type="text"
                value={editData.location || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.users.website')}
              </label>
              <input
                type="url"
                value={editData.website || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, website: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{user.posts_count}</div>
              <div className="text-sm text-gray-500">{t('admin.users.posts')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{user.followers_count}</div>
              <div className="text-sm text-gray-500">{t('admin.users.followers')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{user.following_count}</div>
              <div className="text-sm text-gray-500">{t('admin.users.following')}</div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
          <button
            onClick={() => onDelete(user)}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t('admin.users.delete')}</span>
          </button>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              {t('admin.users.cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? t('admin.users.saving') : t('admin.users.save')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// 添加用户模态框
export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  loading = false
}) => {
  const { t } = useLanguage()
  const [userData, setUserData] = useState<NewUserData>({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'user',
    status: 'active'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!userData.username.trim()) {
      newErrors.username = t('admin.users.validation.usernameRequired')
    }
    if (!userData.email.trim()) {
      newErrors.email = t('admin.users.validation.emailRequired')
    }
    if (!userData.password.trim()) {
      newErrors.password = t('admin.users.validation.passwordRequired')
    } else if (userData.password.length < 6) {
      newErrors.password = t('admin.users.validation.passwordTooShort')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      onSave(userData)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{t('admin.users.addUser')}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.users.username')} *
            </label>
            <input
              type="text"
              value={userData.username}
              onChange={(e) => setUserData(prev => ({ ...prev, username: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.username ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.users.email')} *
            </label>
            <input
              type="email"
              value={userData.email}
              onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.users.password')} *
            </label>
            <input
              type="password"
              value={userData.password}
              onChange={(e) => setUserData(prev => ({ ...prev, password: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.users.fullName')}
            </label>
            <input
              type="text"
              value={userData.full_name}
              onChange={(e) => setUserData(prev => ({ ...prev, full_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.users.table.role')}
              </label>
              <select
                value={userData.role}
                onChange={(e) => setUserData(prev => ({ ...prev, role: e.target.value as NewUserData['role'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="user">{t('admin.usersManagement.role.user')}</option>
                <option value="moderator">{t('admin.usersManagement.role.moderator')}</option>
                <option value="admin">{t('admin.usersManagement.role.admin')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.users.table.status')}
              </label>
              <select
                value={userData.status}
                onChange={(e) => setUserData(prev => ({ ...prev, status: e.target.value as NewUserData['status'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="active">{t('admin.usersManagement.status.active')}</option>
                <option value="pending">{t('admin.usersManagement.status.pending')}</option>
                <option value="suspended">{t('admin.usersManagement.status.suspended')}</option>
                <option value="banned">{t('admin.usersManagement.status.banned')}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            {t('admin.users.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {loading ? t('admin.users.creating') : t('admin.users.create')}
          </button>
        </div>
      </div>
    </div>
  )
}

// 修改密码模态框
export const PasswordModal: React.FC<PasswordModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
  loading = false
}) => {
  const { t } = useLanguage()
  const [passwordData, setPasswordData] = useState<PasswordData>({
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 当模态框打开时重置密码数据
  useEffect(() => {
    if (isOpen) {
      setPasswordData({
        newPassword: '',
        confirmPassword: ''
      })
      setErrors({})
    }
  }, [isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!passwordData.newPassword.trim()) {
      newErrors.newPassword = t('admin.users.validation.passwordRequired')
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = t('admin.users.validation.passwordTooShort')
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = t('admin.users.validation.passwordMismatch')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    console.log('🔐 密码模态框保存:', { 
      newPassword: passwordData.newPassword ? '***' : 'undefined',
      newPasswordLength: passwordData.newPassword?.length,
      confirmPassword: passwordData.confirmPassword ? '***' : 'undefined',
      confirmPasswordLength: passwordData.confirmPassword?.length
    })
    
    if (validateForm()) {
      console.log('✅ 表单验证通过，调用onSave')
      onSave(passwordData.newPassword)
    } else {
      console.log('❌ 表单验证失败:', errors)
    }
  }

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{t('admin.users.changePassword')}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="text-sm text-gray-600">
            {t('admin.users.changePasswordFor')}: <strong>{user.username}</strong>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.users.newPassword')} *
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.newPassword ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
            {/* 调试信息 */}
            <p className="mt-1 text-xs text-gray-500">
              密码长度: {passwordData.newPassword.length} / 6-128
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.users.confirmPassword')} *
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>
        </div>

        <div className="flex justify-end space-x-3 px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            {t('admin.users.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <Key className="w-4 h-4" />
            <span>{loading ? t('admin.users.updating') : t('admin.users.updatePassword')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserModal
