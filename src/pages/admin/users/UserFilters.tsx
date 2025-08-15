import React from 'react'
import { Search, Filter } from 'lucide-react'
import { useLanguage } from '../../../contexts/language'
import { UserFiltersProps } from './types'

const UserFilters: React.FC<UserFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
  selectedRole,
  setSelectedRole
}) => {
  const { t } = useLanguage()

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('admin.usersManagement.search.placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* 状态筛选 */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
          >
            <option value="all">{t('admin.usersManagement.filter.allStatus')}</option>
            <option value="active">{t('admin.usersManagement.status.active')}</option>
            <option value="suspended">{t('admin.usersManagement.status.suspended')}</option>
            <option value="banned">{t('admin.usersManagement.status.banned')}</option>
            <option value="pending">{t('admin.usersManagement.status.pending')}</option>
          </select>
        </div>

        {/* 角色筛选 */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
          >
            <option value="all">{t('admin.usersManagement.filter.allRoles')}</option>
            <option value="user">{t('admin.usersManagement.role.user')}</option>
            <option value="moderator">{t('admin.usersManagement.role.moderator')}</option>
            <option value="admin">{t('admin.usersManagement.role.admin')}</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default UserFilters
