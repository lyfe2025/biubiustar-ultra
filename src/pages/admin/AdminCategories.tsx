import React, { useState } from 'react'
import { Plus, Edit2, Trash2, Tag, Search } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import { useLanguage } from '../../contexts/language'
import { toast } from 'sonner'
import { useCategories } from './hooks/useCategories'
import { Category } from './hooks/useCategories'
import CacheStatusIndicator from '../../components/CacheStatusIndicator'

const AdminCategories: React.FC = () => {
  const { t } = useLanguage()
  const {
    categories,
    loading,
    isCacheHit,
    cacheTimestamp,
    lastUpdateTime,
    isCacheExpired,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    forceRefresh
  } = useCategories()

  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [newCategoryData, setNewCategoryData] = useState({
    name: '',
    description: '',
    color: '#8B5CF6',
    // 多语言字段
    name_zh: '',
    name_zh_tw: '',
    name_en: '',
    name_vi: '',
    description_zh: '',
    description_zh_tw: '',
    description_en: '',
    description_vi: ''
  })

  const predefinedColors = [
    '#8B5CF6', '#EF4444', '#10B981', '#F59E0B', '#3B82F6',
    '#EC4899', '#6366F1', '#84CC16', '#F97316', '#06B6D4'
  ]

  // 创建分类
  const handleCreateCategory = async () => {
    // 验证所有语言的名称都已填写
    if (!newCategoryData.name_zh.trim() || !newCategoryData.name_zh_tw.trim() || 
        !newCategoryData.name_en.trim() || !newCategoryData.name_vi.trim()) {
      toast.error('请填写所有语言的分类名称')
      return
    }

    const success = await createCategory(newCategoryData)
    if (success) {
      setShowCreateModal(false)
      setNewCategoryData({ 
        name: '', 
        description: '', 
        color: '#8B5CF6',
        name_zh: '',
        name_zh_tw: '',
        name_en: '',
        name_vi: '',
        description_zh: '',
        description_zh_tw: '',
        description_en: '',
        description_vi: ''
      })
    }
  }

  // 更新分类
  const handleUpdateCategory = async () => {
    if (!selectedCategory || !newCategoryData.name_zh.trim() || !newCategoryData.name_zh_tw.trim() || 
        !newCategoryData.name_en.trim() || !newCategoryData.name_vi.trim()) {
      toast.error('请填写所有语言的分类名称')
      return
    }

    const success = await updateCategory(selectedCategory.id, newCategoryData)
    if (success) {
      setShowEditModal(false)
      setSelectedCategory(null)
      setNewCategoryData({ 
        name: '', 
        description: '', 
        color: '#8B5CF6',
        name_zh: '',
        name_zh_tw: '',
        name_en: '',
        name_vi: '',
        description_zh: '',
        description_zh_tw: '',
        description_en: '',
        description_vi: ''
      })
    }
  }

  // 删除分类
  const handleDeleteCategory = async () => {
    if (!selectedCategory) return

    const success = await deleteCategory(selectedCategory.id)
    if (success) {
      setShowDeleteConfirm(false)
      setSelectedCategory(null)
    }
  }

  // 切换分类状态
  const handleToggleStatus = async (category: Category) => {
    await toggleCategoryStatus(category.id)
  }

  // 过滤分类
  const filteredCategories = categories.filter(category =>
    category.name_zh?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 格式化时间
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('zh-CN')
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* 页面标题和操作 */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">分类管理</h1>
            <p className="text-gray-600 mt-1">管理系统内容分类</p>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* 缓存状态指示器 */}
            <CacheStatusIndicator
              isCacheHit={isCacheHit}
              cacheTimestamp={cacheTimestamp}
              isCacheExpired={isCacheExpired()}
              onForceRefresh={forceRefresh}
              showRefreshButton={true}
            />
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>新建分类</span>
            </button>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索分类名称或描述..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 分类列表 */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">加载中...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <h3 className="font-semibold text-gray-900">{category.name_zh}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleStatus(category)}
                      className={`px-2 py-1 text-xs rounded-full ${
                        category.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {category.is_active ? '启用' : '禁用'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCategory(category)
                        setNewCategoryData({
                          name: category.name,
                          description: category.description || '',
                          color: category.color,
                          name_zh: category.name_zh || '',
                          name_zh_tw: category.name_zh_tw || '',
                          name_en: category.name_en || '',
                          name_vi: category.name_vi || '',
                          description_zh: category.description_zh || '',
                          description_zh_tw: category.description_zh_tw || '',
                          description_en: category.description_en || '',
                          description_vi: category.description_vi || ''
                        })
                        setShowEditModal(true)
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCategory(category)
                        setShowDeleteConfirm(true)
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-3">{category.description_zh}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>排序: {category.sort_order}</span>
                  <span>更新: {formatTime(category.updated_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 创建分类模态框 */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">新建分类</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">中文名称 *</label>
                  <input
                    type="text"
                    value={newCategoryData.name_zh}
                    onChange={(e) => setNewCategoryData(prev => ({ ...prev, name_zh: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="请输入中文名称"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">繁体中文名称 *</label>
                  <input
                    type="text"
                    value={newCategoryData.name_zh_tw}
                    onChange={(e) => setNewCategoryData(prev => ({ ...prev, name_zh_tw: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="请输入繁体中文名称"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">英文名称 *</label>
                  <input
                    type="text"
                    value={newCategoryData.name_en}
                    onChange={(e) => setNewCategoryData(prev => ({ ...prev, name_en: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="请输入英文名称"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">越南语名称 *</label>
                  <input
                    type="text"
                    value={newCategoryData.name_vi}
                    onChange={(e) => setNewCategoryData(prev => ({ ...prev, name_vi: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="请输入越南语名称"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">颜色</label>
                  <div className="flex space-x-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewCategoryData(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-full border-2 ${
                          newCategoryData.color === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateCategory}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  创建
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 编辑分类模态框 */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">编辑分类</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">中文名称 *</label>
                  <input
                    type="text"
                    value={newCategoryData.name_zh}
                    onChange={(e) => setNewCategoryData(prev => ({ ...prev, name_zh: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="请输入中文名称"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">繁体中文名称 *</label>
                  <input
                    type="text"
                    value={newCategoryData.name_zh_tw}
                    onChange={(e) => setNewCategoryData(prev => ({ ...prev, name_zh_tw: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="请输入繁体中文名称"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">英文名称 *</label>
                  <input
                    type="text"
                    value={newCategoryData.name_en}
                    onChange={(e) => setNewCategoryData(prev => ({ ...prev, name_en: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="请输入英文名称"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">越南语名称 *</label>
                  <input
                    type="text"
                    value={newCategoryData.name_vi}
                    onChange={(e) => setNewCategoryData(prev => ({ ...prev, name_vi: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="请输入越南语名称"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">颜色</label>
                  <div className="flex space-x-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewCategoryData(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-full border-2 ${
                          newCategoryData.color === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  取消
                </button>
                <button
                  onClick={handleUpdateCategory}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  更新
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 删除确认模态框 */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">确认删除</h3>
              <p className="text-gray-600 mb-6">
                确定要删除分类 "{selectedCategory?.name_zh}" 吗？此操作无法撤销。
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  取消
                </button>
                <button
                  onClick={handleDeleteCategory}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminCategories