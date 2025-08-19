import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Tag, Search } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import { useLanguage } from '../../contexts/language'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  description?: string
  color: string
  created_at: string
  updated_at: string
  // 多语言字段
  name_zh?: string
  name_zh_tw?: string
  name_en?: string
  name_vi?: string
  description_zh?: string
  description_zh_tw?: string
  description_en?: string
  description_vi?: string
}

const AdminCategories: React.FC = () => {
  const { t } = useLanguage()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
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

  // 加载分类数据
  const loadCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/categories/content')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        // 解析错误响应
        try {
          const errorData = await response.json()
          let errorMessage = '加载分类失败'
          
          if (errorData.error) {
            errorMessage = errorData.error
            // 如果有详细信息，添加到错误消息中
            if (errorData.details) {
              errorMessage += `：${errorData.details}`
            }
          } else {
            // 根据HTTP状态码提供更具体的错误信息
            switch (response.status) {
              case 401:
                errorMessage = '未授权访问，请重新登录'
                break
              case 403:
                errorMessage = '权限不足，无法访问分类数据'
                break
              case 500:
                errorMessage = '服务器内部错误，请稍后重试'
                break
              default:
                errorMessage = `加载分类失败（错误代码：${response.status}）`
            }
          }
          
          toast.error(errorMessage)
        } catch (parseError) {
          // 如果无法解析错误响应，显示通用错误信息
          console.error('解析错误响应失败:', parseError)
          toast.error(`加载分类失败（HTTP ${response.status}）`)
        }
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      toast.error('网络错误，请检查网络连接后重试')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  // 创建分类
  const handleCreateCategory = async () => {
    // 验证所有语言的名称都已填写
    if (!newCategoryData.name_zh.trim() || !newCategoryData.name_zh_tw.trim() || 
        !newCategoryData.name_en.trim() || !newCategoryData.name_vi.trim()) {
      toast.error('请填写所有语言的分类名称')
      return
    }

    try {
      const response = await fetch('/api/admin/categories/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategoryData)
      })

      if (response.ok) {
        toast.success('分类创建成功')
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
        loadCategories()
      } else {
        // 解析错误响应
        try {
          const errorData = await response.json()
          let errorMessage = '创建分类失败'
          
          if (errorData.error) {
            errorMessage = errorData.error
            // 如果有详细信息，添加到错误消息中
            if (errorData.details) {
              errorMessage += `：${errorData.details}`
            }
            // 如果有缺失字段信息，显示具体缺失的字段
            if (errorData.missingFields && errorData.missingFields.length > 0) {
              errorMessage += `，缺失字段：${errorData.missingFields.join('、')}`
            }
          } else {
            // 根据HTTP状态码提供更具体的错误信息
            switch (response.status) {
              case 400:
                errorMessage = '请求参数错误，请检查输入内容'
                break
              case 409:
                errorMessage = '分类名称已存在，请使用不同的名称'
                break
              case 500:
                errorMessage = '服务器内部错误，请稍后重试'
                break
              default:
                errorMessage = `创建分类失败（错误代码：${response.status}）`
            }
          }
          
          toast.error(errorMessage)
        } catch (parseError) {
          // 如果无法解析错误响应，显示通用错误信息
          console.error('解析错误响应失败:', parseError)
          toast.error(`创建分类失败（HTTP ${response.status}）`)
        }
      }
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error('网络错误，请检查网络连接后重试')
    }
  }

  // 更新分类
  const handleUpdateCategory = async () => {
    if (!selectedCategory || !newCategoryData.name_zh.trim() || !newCategoryData.name_zh_tw.trim() || 
        !newCategoryData.name_en.trim() || !newCategoryData.name_vi.trim()) {
      toast.error('请填写所有语言的分类名称')
      return
    }

    try {
      const response = await fetch(`/api/admin/categories/content/${selectedCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategoryData)
      })

      if (response.ok) {
        toast.success('分类更新成功')
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
        loadCategories()
      } else {
        // 解析错误响应
        try {
          const errorData = await response.json()
          let errorMessage = '更新分类失败'
          
          if (errorData.error) {
            errorMessage = errorData.error
            // 如果有详细信息，添加到错误消息中
            if (errorData.details) {
              errorMessage += `：${errorData.details}`
            }
            // 如果有缺失字段信息，显示具体缺失的字段
            if (errorData.missingFields && errorData.missingFields.length > 0) {
              errorMessage += `，缺失字段：${errorData.missingFields.join('、')}`
            }
          } else {
            // 根据HTTP状态码提供更具体的错误信息
            switch (response.status) {
              case 400:
                errorMessage = '请求参数错误，请检查输入内容'
                break
              case 404:
                errorMessage = '分类不存在或已被删除'
                break
              case 500:
                errorMessage = '服务器内部错误，请稍后重试'
                break
              default:
                errorMessage = `更新分类失败（错误代码：${response.status}）`
            }
          }
          
          toast.error(errorMessage)
        } catch (parseError) {
          // 如果无法解析错误响应，显示通用错误信息
          console.error('解析错误响应失败:', parseError)
          toast.error(`更新分类失败（HTTP ${response.status}）`)
        }
      }
    } catch (error) {
      console.error('Error updating category:', error)
      toast.error('网络错误，请检查网络连接后重试')
    }
  }

  // 删除分类
  const handleDeleteCategory = async () => {
    if (!selectedCategory) return

    try {
      const response = await fetch(`/api/admin/categories/content/${selectedCategory.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('分类删除成功')
        setShowDeleteConfirm(false)
        setSelectedCategory(null)
        loadCategories()
      } else {
        // 解析错误响应
        try {
          const errorData = await response.json()
          let errorMessage = '删除分类失败'
          
          if (errorData.error) {
            errorMessage = errorData.error
            // 如果有详细信息，添加到错误消息中
            if (errorData.details) {
              errorMessage += `：${errorData.details}`
            }
          } else {
            // 根据HTTP状态码提供更具体的错误信息
            switch (response.status) {
              case 400:
                errorMessage = '无法删除分类，可能正在被使用中'
                break
              case 404:
                errorMessage = '分类不存在或已被删除'
                break
              case 500:
                errorMessage = '服务器内部错误，请稍后重试'
                break
              default:
                errorMessage = `删除分类失败（错误代码：${response.status}）`
            }
          }
          
          toast.error(errorMessage)
        } catch (parseError) {
          // 如果无法解析错误响应，显示通用错误信息
          console.error('解析错误响应失败:', parseError)
          toast.error(`删除分类失败（HTTP ${response.status}）`)
        }
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('网络错误，请检查网络连接后重试')
    }
  }

  // 打开编辑弹窗
  const openEditModal = (category: Category) => {
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
  }

  // 打开删除确认弹窗
  const openDeleteConfirm = (category: Category) => {
    setSelectedCategory(category)
    setShowDeleteConfirm(true)
  }

  // 过滤分类
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 页面标题和操作 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">活动分类管理</h1>
            <p className="text-gray-600 mt-1">管理活动分类，创建、编辑和删除分类</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>创建分类</span>
          </button>
        </div>

        {/* 搜索栏 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="搜索分类名称或描述..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* 分类列表 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">分类列表 ({filteredCategories.length})</h2>
            
            {filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? '未找到匹配的分类' : '暂无分类'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm ? '尝试使用其他关键词搜索' : '点击上方按钮创建第一个分类'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map((category) => (
                  <div key={category.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <h3 className="font-medium text-gray-900">{category.name}</h3>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => openEditModal(category)}
                          className="text-gray-400 hover:text-purple-600 p-1"
                          title="编辑分类"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(category)}
                          className="text-gray-400 hover:text-red-600 p-1"
                          title="删除分类"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {category.description && (
                      <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      创建时间: {new Date(category.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 创建分类弹窗 */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowCreateModal(false)}
            />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">创建新分类</h3>
                
                <div className="space-y-4">
                  {/* 多语言名称输入 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">分类名称 *</label>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">中文</label>
                        <input
                          type="text"
                          value={newCategoryData.name_zh}
                          onChange={(e) => setNewCategoryData(prev => ({ ...prev, name_zh: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="请输入中文名称"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">繁体中文</label>
                        <input
                          type="text"
                          value={newCategoryData.name_zh_tw}
                          onChange={(e) => setNewCategoryData(prev => ({ ...prev, name_zh_tw: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="請輸入繁體中文名稱"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">English</label>
                        <input
                          type="text"
                          value={newCategoryData.name_en}
                          onChange={(e) => setNewCategoryData(prev => ({ ...prev, name_en: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Please enter English name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Tiếng Việt</label>
                        <input
                          type="text"
                          value={newCategoryData.name_vi}
                          onChange={(e) => setNewCategoryData(prev => ({ ...prev, name_vi: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Vui lòng nhập tên tiếng Việt"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 多语言描述输入 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">分类描述</label>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">中文</label>
                        <textarea
                          value={newCategoryData.description_zh}
                          onChange={(e) => setNewCategoryData(prev => ({ ...prev, description_zh: e.target.value }))}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="请输入中文描述（可选）"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">繁体中文</label>
                        <textarea
                          value={newCategoryData.description_zh_tw}
                          onChange={(e) => setNewCategoryData(prev => ({ ...prev, description_zh_tw: e.target.value }))}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="請輸入繁體中文描述（可選）"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">English</label>
                        <textarea
                          value={newCategoryData.description_en}
                          onChange={(e) => setNewCategoryData(prev => ({ ...prev, description_en: e.target.value }))}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Please enter English description (optional)"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Tiếng Việt</label>
                        <textarea
                          value={newCategoryData.description_vi}
                          onChange={(e) => setNewCategoryData(prev => ({ ...prev, description_vi: e.target.value }))}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Vui lòng nhập mô tả tiếng Việt (tùy chọn)"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">分类颜色</label>
                    <div className="flex flex-wrap gap-2">
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

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleCreateCategory}
                    disabled={!newCategoryData.name_zh.trim() || !newCategoryData.name_zh_tw.trim() || !newCategoryData.name_en.trim() || !newCategoryData.name_vi.trim()}
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    创建分类
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 编辑分类弹窗 */}
        {showEditModal && selectedCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowEditModal(false)}
            />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">编辑分类</h3>
                
                <div className="space-y-4">
                  {/* 多语言名称输入 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">分类名称 *</label>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">中文</label>
                        <input
                          type="text"
                          value={newCategoryData.name_zh}
                          onChange={(e) => setNewCategoryData(prev => ({ ...prev, name_zh: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="请输入中文名称"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">繁体中文</label>
                        <input
                          type="text"
                          value={newCategoryData.name_zh_tw}
                          onChange={(e) => setNewCategoryData(prev => ({ ...prev, name_zh_tw: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="請輸入繁體中文名稱"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">English</label>
                        <input
                          type="text"
                          value={newCategoryData.name_en}
                          onChange={(e) => setNewCategoryData(prev => ({ ...prev, name_en: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Please enter English name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Tiếng Việt</label>
                        <input
                          type="text"
                          value={newCategoryData.name_vi}
                          onChange={(e) => setNewCategoryData(prev => ({ ...prev, name_vi: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Vui lòng nhập tên tiếng Việt"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 多语言描述输入 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">分类描述</label>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">中文</label>
                        <textarea
                          value={newCategoryData.description_zh}
                          onChange={(e) => setNewCategoryData(prev => ({ ...prev, description_zh: e.target.value }))}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="请输入中文描述（可选）"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">繁体中文</label>
                        <textarea
                          value={newCategoryData.description_zh_tw}
                          onChange={(e) => setNewCategoryData(prev => ({ ...prev, description_zh_tw: e.target.value }))}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="請輸入繁體中文描述（可選）"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">English</label>
                        <textarea
                          value={newCategoryData.description_en}
                          onChange={(e) => setNewCategoryData(prev => ({ ...prev, description_en: e.target.value }))}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Please enter English description (optional)"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Tiếng Việt</label>
                        <textarea
                          value={newCategoryData.description_vi}
                          onChange={(e) => setNewCategoryData(prev => ({ ...prev, description_vi: e.target.value }))}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Vui lòng nhập mô tả tiếng Việt (tùy chọn)"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">分类颜色</label>
                    <div className="flex flex-wrap gap-2">
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

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleUpdateCategory}
                    disabled={!newCategoryData.name_zh.trim() || !newCategoryData.name_zh_tw.trim() || !newCategoryData.name_en.trim() || !newCategoryData.name_vi.trim()}
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    更新分类
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 删除确认弹窗 */}
        {showDeleteConfirm && selectedCategory && (
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
                    <h3 className="text-lg font-semibold text-gray-900">删除分类</h3>
                    <p className="text-sm text-gray-500">此操作无法撤销</p>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6">
                  确定要删除分类 <strong>{selectedCategory.name}</strong> 吗？删除后无法恢复。
                </p>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleDeleteCategory}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    确认删除
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

export default AdminCategories