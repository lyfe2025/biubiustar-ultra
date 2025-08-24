import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from "../../contexts/language"
import { ChevronLeft, ChevronRight, RefreshCw, Activity, Plus } from 'lucide-react'
import { toast } from 'sonner'
import AdminLayout from '../../components/AdminLayout'
import ActivityList from '../../components/admin/ActivityList'
import ActivityStats from '../../components/admin/ActivityStats'
import CategoryManagement from '../../components/admin/CategoryManagement'
import ActivityModal from '../../components/admin/ActivityModal'
import CreateActivityModal from '../../components/admin/CreateActivityModal'
import EditActivityModal from '../../components/admin/EditActivityModal'
import { adminService, AdminActivity, ActivityCategory } from '../../services/admin'

// 定义Category接口以匹配CategoryManagement组件的期望
interface Category {
  id: string
  name: string
  description: string
  name_zh: string
  name_zh_tw: string
  name_en: string
  name_vi: string
  description_zh: string
  description_zh_tw: string
  description_en: string
  description_vi: string
  color: string
  created_at: string
  updated_at: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

const AdminActivities = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [activities, setActivities] = useState<AdminActivity[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activeTab, setActiveTab] = useState<'activities' | 'categories'>('activities')
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [selectedActivity, setSelectedActivity] = useState<AdminActivity | null>(null)
  const [editingActivity, setEditingActivity] = useState<AdminActivity | null>(null)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [showCreateActivityModal, setShowCreateActivityModal] = useState(false)
  const [showEditActivityModal, setShowEditActivityModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [activityToDelete, setActivityToDelete] = useState<AdminActivity | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isCacheHit, setIsCacheHit] = useState(false)
  const [cacheTimestamp, setCacheTimestamp] = useState<string>('')
  const [categoryCacheHit, setCategoryCacheHit] = useState(false)
  const [categoryCacheTimestamp, setCategoryCacheTimestamp] = useState<string>('')

  const loadActivities = async (page: number = pagination.page, limit: number = pagination.limit) => {
    try {
      setLoading(true)
      const response = await adminService.getActivities(page, limit)
      
      // 处理缓存信息
      const cacheInfo = response._cacheInfo
      if (cacheInfo) {
        setIsCacheHit(cacheInfo.cached || false)
        setCacheTimestamp(cacheInfo.timestamp || '')
      } else {
        setIsCacheHit(false)
        setCacheTimestamp('')
      }
      
      setActivities(response.data)
      setPagination(response.pagination)
    } catch (error) {
      console.error('Failed to load activities:', error)
      
      // 确保activities不会是undefined
      setActivities([])
      
      // 检查是否为认证失败错误
      if (error instanceof Error && error.name === 'AuthenticationError') {
        toast.error('认证令牌已失效，请重新登录')
        setTimeout(() => {
          navigate('/admin')
        }, 1000)
        return
      }
    } finally {
      setLoading(false)
    }
  }

  const forceRefresh = async () => {
    const timestamp = Date.now()
    try {
      setIsRefreshing(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        _t: timestamp.toString()
      })
      
      const response = await fetch(`/api/admin/activities?${params.toString()}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('刷新失败')
      }
      
      const data = await response.json()
      
      // 处理缓存信息
      const cacheInfo = data._cacheInfo
      if (cacheInfo) {
        setIsCacheHit(cacheInfo.cached || false)
        setCacheTimestamp(cacheInfo.timestamp || '')
      } else {
        setIsCacheHit(false)
        setCacheTimestamp('')
      }
      
      setActivities(data.data)
      setPagination(data.pagination)
      toast.success('数据已刷新')
    } catch (error) {
      console.error('强制刷新失败:', error)
      toast.error('刷新失败，请重试')
    } finally {
      setIsRefreshing(false)
    }
  }

  const forceRefreshCategories = async () => {
    try {
      setIsRefreshing(true)
      const timestamp = Date.now()
      const response = await fetch(`/api/admin/categories/activity?_t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('刷新分类失败')
      }
      
      const data = await response.json()
      
      // 处理分类缓存信息
      const cacheInfo = data._cacheInfo
      if (cacheInfo) {
        setCategoryCacheHit(cacheInfo.cached || false)
        setCategoryCacheTimestamp(cacheInfo.timestamp || '')
      } else {
        setCategoryCacheHit(false)
        setCategoryCacheTimestamp('')
      }
      
      // 将ActivityCategory转换为Category类型
      const convertedCategories: Category[] = data.categories.map((cat: ActivityCategory) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description || '',
        name_zh: cat.name_zh || cat.name,
        name_zh_tw: cat.name_zh_tw || cat.name,
        name_en: cat.name_en || cat.name,
        name_vi: cat.name_vi || cat.name,
        description_zh: cat.description_zh || cat.description || '',
        description_zh_tw: cat.description_zh_tw || cat.description || '',
        description_en: cat.description_en || cat.description || '',
        description_vi: cat.description_vi || cat.description || '',
        color: cat.color || '#3B82F6',
        created_at: cat.created_at || new Date().toISOString(),
        updated_at: cat.updated_at || new Date().toISOString()
      }))
      setCategories(convertedCategories)
      toast.success('分类数据已刷新')
    } catch (error) {
      console.error('强制刷新分类失败:', error)
      toast.error('刷新分类失败，请重试')
    } finally {
      setIsRefreshing(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await adminService.getCategories()
      
      // 处理分类缓存信息
      const cacheInfo = (response as any)._cacheInfo
      if (cacheInfo) {
        setCategoryCacheHit(cacheInfo.cached || false)
        setCategoryCacheTimestamp(cacheInfo.timestamp || '')
      } else {
        setCategoryCacheHit(false)
        setCategoryCacheTimestamp('')
      }
      
      // 处理不同的响应结构
      let categoriesData: ActivityCategory[] = []
      if ('activity' in response && 'content' in response) {
        // 如果返回的是包含activity和content的对象
        categoriesData = (response as any).activity.data || []
      } else if ('data' in response) {
        // 如果返回的是标准的分页响应
        categoriesData = (response as any).data || []
      } else {
        // 如果直接返回数组
        categoriesData = Array.isArray(response) ? response : []
      }
      
      // 将ActivityCategory转换为Category类型
      const convertedCategories: Category[] = categoriesData.map((cat: ActivityCategory) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description || '',
        name_zh: cat.name_zh || cat.name,
        name_zh_tw: cat.name_zh_tw || cat.name,
        name_en: cat.name_en || cat.name,
        name_vi: cat.name_vi || cat.name,
        description_zh: cat.description_zh || cat.description || '',
        description_zh_tw: cat.description_zh_tw || cat.description || '',
        description_en: cat.description_en || cat.description || '',
        description_vi: cat.description_vi || cat.description || '',
        color: cat.color || '#3B82F6',
        created_at: cat.created_at || new Date().toISOString(),
        updated_at: cat.updated_at || new Date().toISOString()
      }))
      setCategories(convertedCategories)
    } catch (error) {
      console.error('Failed to load categories:', error)
      
      // 检查是否为认证失败错误
      if (error instanceof Error && error.name === 'AuthenticationError') {
        toast.error('认证令牌已失效，请重新登录')
        setTimeout(() => {
          navigate('/admin')
        }, 1000)
        return
      }
    }
  }

  useEffect(() => {
    // 检查管理员权限
    const adminToken = localStorage.getItem('adminToken')
    if (!adminToken) {
      navigate('/admin')
      return
    }

    loadActivities()
    loadCategories()
  }, [navigate])

  // 活动操作处理函数
  const handleViewActivity = (activity: AdminActivity) => {
    setSelectedActivity(activity)
    setShowActivityModal(true)
  }

  const handleEditActivity = (activity: AdminActivity) => {
    setSelectedActivity(activity)
    setShowEditActivityModal(true)
  }

  const handleDeleteActivity = (activity: AdminActivity) => {
    setActivityToDelete(activity)
    setShowDeleteModal(true)
  }

  const confirmDeleteActivity = async () => {
    if (!activityToDelete) return
    
    try {
      await adminService.deleteActivity(activityToDelete.id)
      await loadActivities()
      setShowDeleteModal(false)
      setActivityToDelete(null)
      
      // 如果删除的是当前查看的活动，关闭ActivityModal
      if (selectedActivity && selectedActivity.id === activityToDelete.id) {
        setSelectedActivity(null)
        setShowActivityModal(false)
      }
    } catch (error) {
      console.error('Failed to delete activity:', error)
      if (error instanceof Error && error.name === 'AuthenticationError') {
        toast.error('认证令牌已失效，请重新登录')
        setTimeout(() => {
          navigate('/admin')
        }, 1000)
        return
      }
    }
  }

  const handleToggleRecommend = async (activityId: string, isRecommended: boolean) => {
    try {
      // 使用updateActivityStatus方法来更新推荐状态
      await adminService.updateActivityStatus(activityId, 'published', !isRecommended)
      await loadActivities()
    } catch (error) {
      console.error('切换推荐状态失败:', error)
      if (error instanceof Error && error.name === 'AuthenticationError') {
        toast.error('认证令牌已失效，请重新登录')
        setTimeout(() => {
          navigate('/admin')
        }, 1000)
        return
      }
    }
  }

  const handleActivityCreated = () => {
    loadActivities()
    setShowCreateActivityModal(false)
  }

  const handleActivityUpdated = () => {
    loadActivities()
    setShowEditActivityModal(false)
  }

  // 分页操作函数
  const changePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadActivities(newPage, pagination.limit)
    }
  }

  const changePageSize = (newLimit: number) => {
    loadActivities(1, newLimit)
  }

  const handleCategoriesUpdated = () => {
    loadCategories()
  }

  // 刷新数据
  const handleRefreshData = async () => {
    setIsRefreshing(true)
    try {
      await loadActivities(pagination.page, pagination.limit)
      await loadCategories()
      toast.success(t('admin.activities.messages.refreshed') || '数据已刷新')
    } catch (error) {
      toast.error(t('admin.activities.messages.refreshFailed') || '刷新数据失败')
    } finally {
      setIsRefreshing(false)
    }
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
            <h1 className="text-2xl font-bold text-gray-900">{t('admin.activities.title')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('admin.activities.description')}</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => setShowCreateActivityModal(true)}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              创建活动
            </button>
          </div>
        </div>

        {/* 标签页导航 */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('activities')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'activities'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>{t('admin.activities.tabs.activities')}</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'categories'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>{t('admin.activities.tabs.categories')}</span>
              </div>
            </button>
          </nav>
        </div>

        {/* 活动管理标签页内容 */}
        {activeTab === 'activities' && (
          <>
            {/* 统计卡片 */}
            <ActivityStats activities={activities} />

            {/* 活动列表 */}
            <ActivityList
              activities={activities}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              categories={categories}
              onViewActivity={handleViewActivity}
              onEditActivity={handleEditActivity}
              onToggleFeatured={(activityId, isFeatured) => {
                // TODO: 实现切换推荐功能
                console.log('Toggle featured:', activityId, isFeatured)
              }}
              onToggleRecommend={handleToggleRecommend}
              onDeleteActivity={handleDeleteActivity}
  
            />

            {/* 分页组件 */}
            {!loading && pagination.total > 0 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  显示第 {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} 条，共 {pagination.total} 条记录
                </div>
                <div className="flex items-center space-x-2">
                  {/* 每页显示数量选择 */}
                  <select
                    value={pagination.limit}
                    onChange={(e) => changePageSize(Number(e.target.value))}
                    className="border border-gray-300 rounded px-3 py-1 text-sm"
                  >
                    <option value={10}>10条/页</option>
                    <option value={20}>20条/页</option>
                    <option value={50}>50条/页</option>
                  </select>
                  
                  {/* 分页按钮 */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => changePage(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="p-2 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    {/* 页码按钮 */}
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i
                      } else {
                        pageNum = pagination.page - 2 + i
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => changePage(pageNum)}
                          className={`px-3 py-1 rounded border ${
                            pageNum === pagination.page
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                    
                    <button
                      onClick={() => changePage(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="p-2 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* 分类管理标签页内容 */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <CategoryManagement
              categories={categories}
              onCategoriesUpdated={handleCategoriesUpdated}
            />
          </div>
        )}

        {/* 活动详情弹窗 */}
        {showActivityModal && selectedActivity && (
          <ActivityModal
            activity={selectedActivity}
            isOpen={showActivityModal}
            onClose={() => {
              setShowActivityModal(false)
              setSelectedActivity(null)
            }}
            onEdit={(activity) => {
              setEditingActivity(activity)
              setSelectedActivity(null)
            }}
            onDelete={handleDeleteActivity}
            onToggleFeatured={(activityId) => {
              // TODO: 实现切换推荐功能
              console.log('Toggle featured:', activityId)
            }}
          />
        )}

        {/* 创建活动弹窗 */}
        {showCreateActivityModal && (
          <CreateActivityModal
            isOpen={showCreateActivityModal}
            onClose={() => setShowCreateActivityModal(false)}
            onSuccess={handleActivityCreated}
            categories={categories}
          />
        )}

        {/* 编辑活动弹窗 */}
        {showEditActivityModal && selectedActivity && (
          <EditActivityModal
            isOpen={showEditActivityModal}
            onClose={() => {
              setShowEditActivityModal(false)
              setSelectedActivity(null)
            }}
            onSuccess={handleActivityUpdated}
            activity={selectedActivity}
            categories={categories}
          />
        )}

        {/* 删除确认弹窗 */}
        {showDeleteModal && activityToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">{t('admin.activities.deleteActivity')}</h3>
              <p className="text-gray-600 mb-2">
                {t('admin.activities.deleteActivityConfirm')}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                活动名称：{activityToDelete.title}
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setActivityToDelete(null)
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={confirmDeleteActivity}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  {t('common.delete')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminActivities