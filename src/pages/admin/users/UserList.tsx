import React from 'react'
import { User, Calendar, Mail, Shield, CheckCircle, XCircle, Ban } from 'lucide-react'
import { useLanguage } from '../../../contexts/language'
import { User as UserType } from './types'
import UserActions from './UserActions'
import { generateDefaultAvatarUrl, isDefaultAvatar, getUserDefaultAvatarUrl } from '../../../utils/avatarGenerator'

interface UserListProps {
  users: UserType[]
  loading: boolean
  onEdit: (user: UserType) => void
  onDelete: (user: UserType) => void
  onUpdateStatus: (userId: string, status: UserType['status']) => void
  onUpdateRole: (userId: string, role: UserType['role']) => void
  onChangePassword: (user: UserType) => void
}

const UserList: React.FC<UserListProps> = ({
  users,
  loading,
  onEdit,
  onDelete,
  onUpdateStatus,
  onUpdateRole,
  onChangePassword
}) => {
  const { t } = useLanguage()

  const getStatusBadge = (status: UserType['status']) => {
    const configs = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: t('admin.usersManagement.status.active') },
      suspended: { color: 'bg-yellow-100 text-yellow-800', icon: Ban, text: t('admin.usersManagement.status.suspended') },
      banned: { color: 'bg-red-100 text-red-800', icon: XCircle, text: t('admin.usersManagement.status.banned') },
      pending: { color: 'bg-gray-100 text-gray-800', icon: Calendar, text: t('admin.usersManagement.status.pending') }
    }
    const config = configs[status]
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    )
  }

  const getRoleBadge = (role: UserType['role']) => {
    const configs = {
      admin: { color: 'bg-purple-100 text-purple-800', text: t('admin.usersManagement.role.admin') },
      moderator: { color: 'bg-blue-100 text-blue-800', text: t('admin.usersManagement.role.moderator') },
      user: { color: 'bg-gray-100 text-gray-800', text: t('admin.usersManagement.role.user') }
    }
    const config = configs[role]
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Shield className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">{t('admin.users.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.usersManagement.table.user')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.usersManagement.table.contact')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.usersManagement.table.status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.usersManagement.table.role')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.usersManagement.table.stats')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.usersManagement.table.joined')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.usersManagement.table.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    {user.avatar && !isDefaultAvatar(user.avatar) ? (
                      <img className="h-10 w-10 rounded-full object-cover" src={user.avatar} alt="" />
                    ) : (
                      <img 
                        className="h-10 w-10 rounded-full" 
                        src={getUserDefaultAvatarUrl(user.username, user.avatar)} 
                        alt="" 
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.username}</div>
                      {user.full_name && (
                        <div className="text-sm text-gray-500">{user.full_name}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{user.email}</span>
                  </div>
                  {user.email_verified && (
                    <div className="text-xs text-green-600 mt-1">已验证</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(user.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRoleBadge(user.role)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="space-y-1">
                    <div>帖子: {user.posts_count}</div>
                    <div>关注者: {user.followers_count}</div>
                    <div>关注: {user.following_count}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(user.created_at)}</span>
                  </div>
                  {user.last_login && (
                    <div className="text-xs mt-1">
                      最后登录: {formatDate(user.last_login)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <UserActions
                    user={user}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onUpdateStatus={onUpdateStatus}
                    onUpdateRole={onUpdateRole}
                    onChangePassword={onChangePassword}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {users.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t('admin.users.noUsers')}</h3>
          <p className="mt-1 text-sm text-gray-500">{t('admin.users.noUsersDesc')}</p>
        </div>
      )}
    </div>
  )
}

export default UserList
