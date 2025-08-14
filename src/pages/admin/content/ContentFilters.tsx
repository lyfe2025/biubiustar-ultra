import React from 'react'
import { Search, Filter, RefreshCw } from 'lucide-react'
import { useLanguage } from '../../../contexts/language'
import { ContentFiltersProps } from './types'

const ContentFilters: React.FC<ContentFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
  onRefresh
}) => {
  const { t } = useLanguage()

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* 搜索框 */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.content.searchContent')}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('admin.content.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 状态筛选 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.content.filterByStatus')}
          </label>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
            >
              <option value="all">{t('admin.content.allStatus')}</option>
              <option value="pending">{t('admin.content.status.pending')}</option>
              <option value="published">{t('admin.content.status.published')}</option>
              <option value="rejected">{t('admin.content.status.rejected')}</option>
              <option value="draft">{t('admin.content.status.draft')}</option>
            </select>
          </div>
        </div>

        {/* 刷新按钮 */}
        <div>
          <button
            onClick={onRefresh}
            className="flex items-center justify-center w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            title={t('admin.content.refresh')}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ContentFilters
