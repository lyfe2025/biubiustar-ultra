import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from "../../contexts/language"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import ActivityList from '../../components/admin/ActivityList'
import ActivityStats from '../../components/admin/ActivityStats'
import CategoryManagement from '../../components/admin/CategoryManagement'
import ActivityModal from '../../components/admin/ActivityModal'
import CreateActivityModal from '../../components/admin/CreateActivityModal'
import EditActivityModal from '../../components/admin/EditActivityModal'
import { adminService, AdminActivity, ActivityCategory } from '../../services/AdminService'

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
  const [categories, setCategories] = useState<ActivityCategory[]>([])
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
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const loadActivities = async (page: number = pagination.page, limit: number = pagination.limit) => {
    try {
      setLoading(true)
      const response = await adminService.getActivities(page, limit)
      setActivities(response.activities)
      setPagination(response.pagination)
    } catch (error) {
      console.error('Failed to load activities:', error)
      
      // 检查是否为认证失败错误
      if (error instanceof Error && error.name === 'AuthenticationError') {
        alert('认证令牌已失效，请重新登录')
        navigate('/admin')
        return
      }
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await adminService.getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Failed to load categories:', error)
      
      // 检查是否为认证失败错误
      if (error instanceof Error && error.name === 'AuthenticationError') {
        alert('认证令牌已失效，请重新登录')
        navigate('/admin')
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

  const handleDeleteActivity = async (activity: AdminActivity) => {
    try {
      await adminService.deleteActivity(activity.id)
      await loadActivities()
    } catch (error) {
      console.error('Failed to delete activity:', error)
      if (error instanceof Error && error.name === 'AuthenticationError') {
        alert('认证令牌已失效，请重新登录')
        navigate('/admin')
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
        alert('认证令牌已失效，请重新登录')
        navigate('/admin')
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
        {/* 页面标题和标签页 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('admin.activities.title')}</h1>
            <p className="text-gray-600">{t('admin.activities.description')}</p>
          </div>
        </div>

        {/* 标签页导航 */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('activities')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'activities'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>{t('admin.activities.tabs.activities')}</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'categories'
                  ? 'border-purple-500 text-purple-600'
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
              onCreateActivity={() => setShowCreateActivityModal(true)}
            />

            {/* 分页组件 */}
            {pagination.total > 0 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => changePage(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    上一页
                  </button>
                  <button
                    onClick={() => changePage(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一页
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div className="flex items-center space-x-4">
                    <p className="text-sm text-gray-700">
                      显示第 <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> 到{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>{' '}
                      条，共 <span className="font-medium">{pagination.total}</span> 条
                    </p>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-700">每页显示:</label>
                      <select
                        value={pagination.limit}
                        onChange={(e) => changePageSize(Number(e.target.value))}
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => changePage(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
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
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pageNum === pagination.page
                                ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                      <button
                        onClick={() => changePage(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* 分类管理标签页内容 */}
        {activeTab === 'categories' && (
          <CategoryManagement
            categories={categories}
            onCategoriesUpdated={handleCategoriesUpdated}
          />
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
      </div>
    </AdminLayout>
  )
}

export default AdminActivities