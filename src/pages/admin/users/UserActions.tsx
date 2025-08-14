import React from 'react'
import { 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
  Shield,
  ShieldCheck,
  ShieldX,
  Key
} from 'lucide-react'
import { cn } from '../../../lib/utils'
import { useLanguage } from '../../../contexts/language'
import { UserActionsProps, User } from './types'

const UserActions: React.FC<UserActionsProps> = ({
  user,
  onEdit,
  onDelete,
  onUpdateStatus,
  onUpdateRole,
  onChangePassword
}) => {
  const { t } = useLanguage()

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active': return 'text-green-600'
      case 'suspended': return 'text-yellow-600'
      case 'banned': return 'text-red-600'
      case 'pending': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'admin': return 'text-purple-600'
      case 'moderator': return 'text-blue-600'
      case 'user': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="flex items-center space-x-2">
      {/* 查看详情 */}
      <button
        onClick={() => onEdit(user)}
        className="text-blue-600 hover:text-blue-800 p-1 rounded"
        title={t('admin.users.actions.view')}
      >
        <Eye className="w-4 h-4" />
      </button>

      {/* 编辑 */}
      <button
        onClick={() => onEdit(user)}
        className="text-green-600 hover:text-green-800 p-1 rounded"
        title={t('admin.users.actions.edit')}
      >
        <Edit className="w-4 h-4" />
      </button>

      {/* 修改密码 */}
      <button
        onClick={() => onChangePassword(user)}
        className="text-orange-600 hover:text-orange-800 p-1 rounded"
        title={t('admin.users.actions.changePassword')}
      >
        <Key className="w-4 h-4" />
      </button>

      {/* 状态切换 */}
      <div className="relative group">
        <button className={cn("p-1 rounded", getStatusColor(user.status))}>
          {user.status === 'active' && <CheckCircle className="w-4 h-4" />}
          {user.status === 'suspended' && <Ban className="w-4 h-4" />}
          {user.status === 'banned' && <XCircle className="w-4 h-4" />}
          {user.status === 'pending' && <MoreHorizontal className="w-4 h-4" />}
        </button>
        
        {/* 状态切换下拉菜单 */}
        <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
          <div className="py-1">
            <button
              onClick={() => onUpdateStatus(user.id, 'active')}
              className="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{t('admin.users.status.active')}</span>
            </button>
            <button
              onClick={() => onUpdateStatus(user.id, 'suspended')}
              className="w-full text-left px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50 flex items-center space-x-2"
            >
              <Ban className="w-4 h-4" />
              <span>{t('admin.users.status.suspended')}</span>
            </button>
            <button
              onClick={() => onUpdateStatus(user.id, 'banned')}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
            >
              <XCircle className="w-4 h-4" />
              <span>{t('admin.users.status.banned')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 角色切换 */}
      <div className="relative group">
        <button className={cn("p-1 rounded", getRoleColor(user.role))}>
          {user.role === 'admin' && <Shield className="w-4 h-4" />}
          {user.role === 'moderator' && <ShieldCheck className="w-4 h-4" />}
          {user.role === 'user' && <ShieldX className="w-4 h-4" />}
        </button>
        
        {/* 角色切换下拉菜单 */}
        <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
          <div className="py-1">
            <button
              onClick={() => onUpdateRole(user.id, 'admin')}
              className="w-full text-left px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 flex items-center space-x-2"
            >
              <Shield className="w-4 h-4" />
              <span>{t('admin.users.role.admin')}</span>
            </button>
            <button
              onClick={() => onUpdateRole(user.id, 'moderator')}
              className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t('admin.users.role.moderator')}</span>
            </button>
            <button
              onClick={() => onUpdateRole(user.id, 'user')}
              className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center space-x-2"
            >
              <ShieldX className="w-4 h-4" />
              <span>{t('admin.users.role.user')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 删除 */}
      <button
        onClick={() => onDelete(user)}
        className="text-red-600 hover:text-red-800 p-1 rounded"
        title={t('admin.users.actions.delete')}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

export default UserActions
