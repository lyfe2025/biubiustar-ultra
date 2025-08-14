import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { useLanguage } from '../../contexts/language'
import ActivityStats from '../../components/admin/ActivityStats'
import ActivityList from '../../components/admin/ActivityList'
import ActivityModal from '../../components/admin/ActivityModal'
import CreateActivityModal from '../../components/admin/CreateActivityModal'
import EditActivityModal from '../../components/admin/EditActivityModal'
import CategoryManagement from '../../components/admin/CategoryManagement'
import { adminService, type ActivityCategory, AdminActivity } from '../../services/AdminService'

const AdminActivities = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [activities, setActivities] = useState<AdminActivity[]>([])
  const [categories, setCategories] = useState<ActivityCategory[]>([])
  const [activeTab, setActiveTab] = useState<'activities' | 'categories'>('activities')
  const [loading, setLoading] = useState(true)
  const [selectedActivity, setSelectedActivity] = useState<AdminActivity | null>(null)
  const [editingActivity, setEditingActivity] = useState<AdminActivity | null>(null)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [showCreateActivityModal, setShowCreateActivityModal] = useState(false)
  const [showEditActivityModal, setShowEditActivityModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const loadActivities = async () => {
    try {
      setLoading(true)
      const data = await adminService.getActivities()
      setActivities(data)
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