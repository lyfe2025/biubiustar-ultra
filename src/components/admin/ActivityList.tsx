import React from 'react'
import { Search, Filter, Eye, Edit2, Star, StarOff, Trash2, Plus } from 'lucide-react'
import { useLanguage } from '../../contexts/language'
import { getCategoryName } from '../../utils/categoryUtils'

import { AdminActivity } from '../../services/AdminService'

// 使用统一的Activity类型定义

interface ActivityListProps {
  activities: AdminActivity[]
  searchTerm: string
  setSearchTerm: (term: string) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
  categoryFilter: string
  setCategoryFilter: (category: string) => void
  categories: Array<{ id: string; name: string; color: string }>
  onViewActivity: (activity: AdminActivity) => void
  onEditActivity: (activity: AdminActivity) => void
  onToggleFeatured: (activityId: string, isFeatured: boolean) => void
  onToggleRecommend: (activityId: string, isRecommended: boolean) => void
  onDeleteActivity: (activity: AdminActivity) => void

}

const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  categories,
  onViewActivity,
  onEditActivity,
  onToggleFeatured,
  onToggleRecommend,
  onDeleteActivity,

}) => {
  const { t, language } = useLanguage()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'active': return 'bg-green-100 text-green-800' // 向后兼容，映射为published样式
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || activity.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || activity.category === categoryFilter
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  return (
    <>
      {/* 搜索和筛选 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-medium text-gray-900">{t('admin.activities.list.title')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('admin.activities.search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* 状态筛选 */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
            >
              <option value="all">{t('admin.activities.filter.allStatus')}</option>
              <option value="published">{t('admin.activities.status.published')}</option>
              <option value="draft">{t('admin.activities.status.draft')}</option>
              <option value="cancelled">{t('admin.activities.status.cancelled')}</option>
            </select>
          </div>

          {/* 分类筛选 */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
            >
              <option value="all">{t('admin.activities.filter.allCategories')}</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>{getCategoryName(category, language)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 活动列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.activities.table.title')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.activities.table.organizer')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.activities.table.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.activities.table.participants')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.activities.table.time')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.activities.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredActivities.map((activity) => (
                <tr key={activity.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {activity.image_url && (
                        <img
                          src={activity.image_url} 
                          alt={activity.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                          {activity.is_featured && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{activity.location}</div>
                        <div className="text-xs text-gray-400">
                          {(() => {
                            const category = categories.find(cat => cat.name === activity.category);
                            return category ? getCategoryName(category, language) : activity.category;
                          })()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{typeof activity.organizer === 'string' ? activity.organizer : activity.organizer?.username || 'Unknown'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(activity.status)}`}>
                      {t(`admin.activities.status.${activity.status}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {activity.current_participants}
                    {activity.max_participants && ` / ${activity.max_participants}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{formatDate(activity.start_date)}</div>
                    <div className="text-xs text-gray-400">{formatDate(activity.end_date)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewActivity(activity)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title={t('admin.activities.actions.view')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditActivity(activity)}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        title={t('admin.activities.actions.edit')}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onToggleFeatured(activity.id, !activity.is_featured)}
                        className={`p-1 rounded ${
                          activity.is_featured 
                            ? 'text-yellow-600 hover:text-yellow-900' 
                            : 'text-gray-400 hover:text-yellow-600'
                        }`}
                        title={activity.is_featured ? t('admin.activities.actions.unfeature') : t('admin.activities.actions.feature')}
                      >
                        {activity.is_featured ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => onDeleteActivity(activity)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title={t('admin.activities.actions.delete')}
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
        
        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">{t('admin.activities.noActivities')}</div>
          </div>
        )}
      </div>
    </>
  )
}

export default ActivityList