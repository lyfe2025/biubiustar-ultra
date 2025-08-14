import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  Plus,
  Calendar,
  MapPin,
  Users,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Image,
  ExternalLink,
  Tag,
  Edit2
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '../../lib/utils'
import AdminLayout from '../../components/AdminLayout'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'
import { adminService, type Activity, type ActivityCategory } from '../../services/AdminService'

interface Category {
  id: string
  name: string
  description?: string
  color: string
  is_active?: boolean
  created_at: string
  updated_at: string
}

const AdminActivities = () => {
  const { t } = useLanguage()
  const [activities, setActivities] = useState<Activity[]>([])  
  const [categories, setCategories] = useState<ActivityCategory[]>([])  
  const [categoryList, setCategoryList] = useState<Category[]>([])  // 用于分类管理
  const [activeTab, setActiveTab] = useState<'activities' | 'categories'>('activities')
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showCreateActivityModal, setShowCreateActivityModal] = useState(false)
  const [showEditActivityModal, setShowEditActivityModal] = useState(false)
  const [newActivityData, setNewActivityData] = useState({
    title: '',
    description: '',
    location: '',
    category: '',
    start_date: '',
    end_date: '',
    max_participants: '',
    tags: [] as string[],
    image: ''
  })
  const [editActivityData, setEditActivityData] = useState({
    title: '',
    description: '',
    location: '',
    category: '',
    start_date: '',
    end_date: '',
    max_participants: '',
    tags: [] as string[],
    image: ''
  })
  
  // 分类管理相关状态
  const [categorySearchTerm, setCategorySearchTerm] = useState('')
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false)
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false)
  const [showDeleteCategoryConfirm, setShowDeleteCategoryConfirm] = useState(false)
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<Category | null>(null)
  const [newCategoryData, setNewCategoryData] = useState({
    name: '',
    description: '',
    color: '#8B5CF6'
  })
  
  const predefinedColors = [
    '#8B5CF6', '#EF4444', '#10B981', '#F59E0B', '#3B82F6',
    '#EC4899', '#6366F1', '#84CC16', '#F97316', '#06B6D4'
  ]
  const navigate = useNavigate()

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

  // 统一的分类加载函数
  const loadCategories = async () => {
    try {
      const data = await adminService.getCategories()
      setCategories(data)
      setCategoryList(data) // 确保分类管理和活动创建使用相同的数据源
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

  // 分类管理CRUD函数
  const handleCreateCategory = async () => {
    if (!newCategoryData.name.trim()) {
      return
    }

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(newCategoryData)
      })

      if (response.ok) {
        setShowCreateCategoryModal(false)
        setNewCategoryData({ name: '', description: '', color: '#8B5CF6' })
        loadCategories() // 重新加载分类数据
      }
    } catch (error) {
      console.error('Error creating category:', error)
    }
  }

  const handleUpdateCategory = async () => {
    if (!selectedCategoryForEdit || !newCategoryData.name.trim()) {
      return
    }

    try {
      const response = await fetch(`/api/admin/categories/${selectedCategoryForEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(newCategoryData)
      })

      if (response.ok) {
        setShowEditCategoryModal(false)
        setSelectedCategoryForEdit(null)
        setNewCategoryData({ name: '', description: '', color: '#8B5CF6' })
        loadCategories() // 重新加载分类数据
      }
    } catch (error) {
      console.error('Error updating category:', error)
    }
  }

  const handleDeleteCategory = async () => {
    if (!selectedCategoryForEdit) return

    try {
      const response = await fetch(`/api/admin/categories/${selectedCategoryForEdit.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      if (response.ok) {
        setShowDeleteCategoryConfirm(false)
        setSelectedCategoryForEdit(null)
        loadCategories() // 重新加载分类数据
      }
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  // 打开编辑分类弹窗
  const openEditCategoryModal = (category: Category) => {
    setSelectedCategoryForEdit(category)
    setNewCategoryData({
      name: category.name,
      description: category.description || '',
      color: category.color
    })
    setShowEditCategoryModal(true)
  }

  // 打开删除分类确认弹窗
  const openDeleteCategoryConfirm = (category: Category) => {
    setSelectedCategoryForEdit(category)
    setShowDeleteCategoryConfirm(true)
  }

  const handleStatusChange = async (activityId: string, newStatus: Activity['status']) => {
    try {
      await adminService.updateActivityStatus(activityId, newStatus)
      
      setActivities(prev => prev.map(activity => 
        activity.id === activityId 
          ? { ...activity, status: newStatus, updated_at: new Date().toISOString() }
          : activity
      ))
      
      setShowActivityModal(false)
      setSelectedActivity(null)
    } catch (error) {
      console.error('Failed to update activity status:', error)
      
      // 检查是否为认证失败错误
      if (error instanceof Error && error.name === 'AuthenticationError') {
        alert('认证令牌已失效，请重新登录')
        navigate('/admin')
        return
      }
    }
  }

  const handleToggleFeatured = async (activityId: string) => {
    try {
      const activity = activities.find(a => a.id === activityId)
      if (activity) {
        await adminService.updateActivityStatus(activityId, activity.status, !activity.is_featured)
        
        setActivities(prev => prev.map(a => 
          a.id === activityId 
            ? { ...a, is_featured: !a.is_featured, updated_at: new Date().toISOString() }
            : a
        ))
      }
    } catch (error) {
      console.error('Failed to toggle featured status:', error)
      
      // 检查是否为认证失败错误
      if (error instanceof Error && error.name === 'AuthenticationError') {
        alert('认证令牌已失效，请重新登录')
        navigate('/admin')
        return
      }
    }
  }

  const handleDeleteActivity = async (activityId: string) => {
    try {
      await adminService.deleteActivity(activityId)
      
      setActivities(prev => prev.filter(activity => activity.id !== activityId))
      setShowDeleteConfirm(false)
      setSelectedActivity(null)
    } catch (error) {
      console.error('Failed to delete activity:', error)
      
      // 检查是否为认证失败错误
      if (error instanceof Error && error.name === 'AuthenticationError') {
        alert('认证令牌已失效，请重新登录')
        navigate('/admin')
        return
      }
    }
  }

  const handleCreateActivity = async () => {
    try {
      const activityData = {
        title: newActivityData.title,
        description: newActivityData.description,
        location: newActivityData.location,
        category: newActivityData.category,
        start_date: newActivityData.start_date,
        end_date: newActivityData.end_date,
        max_participants: newActivityData.max_participants,
        image_url: newActivityData.image || ''
      }
      
      const newActivity = await adminService.createActivity(activityData)
      setActivities(prev => [newActivity, ...prev])
      setShowCreateActivityModal(false)
      setNewActivityData({
        title: '',
        description: '',
        location: '',
        category: '摄影',
        start_date: '',
        end_date: '',
        max_participants: '',
        tags: [],
        image: ''
      })
      toast.success(t('admin.activities.create.success'))
    } catch (error) {
      console.error('Failed to create activity:', error)
      
      // 检查是否为认证失败错误
      if (error instanceof Error && error.name === 'AuthenticationError') {
        toast.error(t('admin.login.sessionExpired'))
        navigate('/admin')
        return
      }
      
      // 显示用户友好的错误提示
      const errorMessage = error instanceof Error ? error.message : t('admin.activities.create.error')
      toast.error(errorMessage)
    }
  }

  const handleEditActivity = async () => {
    if (!selectedActivity) return
    
    try {
      const activityData = {
        title: editActivityData.title,
        description: editActivityData.description,
        location: editActivityData.location,
        category: editActivityData.category,
        start_date: editActivityData.start_date,
        end_date: editActivityData.end_date,
        max_participants: editActivityData.max_participants,
        image_url: editActivityData.image || ''
      }
      
      const updatedActivity = await adminService.updateActivity(selectedActivity.id, activityData)
      setActivities(prev => prev.map(activity => 
        activity.id === selectedActivity.id ? updatedActivity : activity
      ))
      setShowEditActivityModal(false)
      setSelectedActivity(null)
      setEditActivityData({
        title: '',
        description: '',
        location: '',
        category: '摄影',
        start_date: '',
        end_date: '',
        max_participants: '',
        tags: [],
        image: ''
      })
      toast.success(t('admin.activities.update.success'))
    } catch (error) {
      console.error('Failed to update activity:', error)
      
      // 检查是否为认证失败错误
      if (error instanceof Error && error.name === 'AuthenticationError') {
        toast.error(t('admin.login.sessionExpired'))
        navigate('/admin')
        return
      }
      
      // 显示用户友好的错误提示
      const errorMessage = error instanceof Error ? error.message : t('admin.activities.update.error')
      toast.error(errorMessage)
    }
  }

  const filteredActivities = activities.filter(activity => {
    const matchesStatus = selectedStatus === 'all' || activity.status === selectedStatus
    const matchesCategory = selectedCategory === 'all' || activity.category === selectedCategory
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.location.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesCategory && matchesSearch
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: t('admin.activities.status.draft'), color: 'bg-gray-100 text-gray-800', icon: Edit },
      published: { label: t('admin.activities.status.published'), color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      ongoing: { label: t('admin.activities.status.ongoing'), color: 'bg-green-100 text-green-800', icon: Clock },
      completed: { label: t('admin.activities.status.completed'), color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
      cancelled: { label: t('admin.activities.status.cancelled'), color: 'bg-red-100 text-red-800', icon: XCircle }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status || 'Unknown',
      color: 'bg-gray-100 text-gray-800',
      icon: Edit
    }
    const Icon = config.icon
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const startStr = start.toLocaleDateString('zh-CN')
    const endStr = end.toLocaleDateString('zh-CN')
    
    if (startStr === endStr) {
      return `${startStr} ${start.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
    }
    return `${startStr} - ${endStr}`
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
                <Calendar className="w-4 h-4" />
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
                <Tag className="w-4 h-4" />
                <span>{t('admin.activities.tabs.categories')}</span>
              </div>
            </button>
          </nav>
        </div>

        {/* 活动管理标签页内容 */}
        {activeTab === 'activities' && (
          <>
            {/* 操作按钮 */}
            <div className="flex justify-end">
              <button 
                onClick={() => setShowCreateActivityModal(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>{t('admin.activities.actions.create')}</span>
              </button>
            </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{t('admin.activities.stats.total')}</p>
                <p className="text-2xl font-semibold text-gray-900">{activities.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{t('admin.activities.stats.ongoing')}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {activities.filter(a => a.status === 'ongoing').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{t('admin.activities.stats.participants')}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {activities.reduce((sum, a) => sum + a.current_participants, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{t('admin.activities.stats.featured')}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {activities.filter(a => a.is_featured).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 筛选和搜索 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 状态筛选 */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">{t('admin.activities.filters.allStatus')}</option>
                <option value="draft">{t('admin.activities.status.draft')}</option>
                <option value="published">{t('admin.activities.status.published')}</option>
                <option value="ongoing">{t('admin.activities.status.ongoing')}</option>
                <option value="completed">{t('admin.activities.status.completed')}</option>
                <option value="cancelled">{t('admin.activities.status.cancelled')}</option>
              </select>
            </div>

            {/* 分类筛选 */}
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">{t('admin.activities.filters.allCategories')}</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
            </div>

            {/* 搜索框 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('admin.activities.search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
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
                    {t('admin.activities.table.activity')}
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
                      <div className="flex items-start space-x-3">
                        {activity.image && (
                          <img
                            src={activity.image}
                            alt={activity.title}
                            className="w-16 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {activity.title}
                            </p>
                            {activity.is_featured && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {activity.description.substring(0, 80)}...
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center space-x-1 text-xs text-gray-400">
                              <MapPin className="w-3 h-3" />
                              <span>{activity.location}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-gray-400">
                              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                {activity.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <img
                          src={activity.organizer.avatar || 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=default%20avatar&image_size=square'}
                          alt={activity.organizer.username}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="text-sm text-gray-900">{activity.organizer.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(activity.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>
                            {activity.current_participants}
                            {activity.max_participants && ` / ${activity.max_participants}`}
                          </span>
                        </div>
                        {activity.max_participants && (
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-purple-600 h-1.5 rounded-full" 
                              style={{ 
                                width: `${Math.min((activity.current_participants / activity.max_participants) * 100, 100)}%` 
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDateRange(activity.start_date, activity.end_date)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedActivity(activity)
                            setShowActivityModal(true)
                          }}
                          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                          title={t('admin.activities.actions.view')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedActivity(activity)
                            setEditActivityData({
                              title: activity.title,
                              description: activity.description,
                              location: activity.location,
                              category: activity.category,
                              start_date: activity.start_date.split('T')[0] + 'T' + activity.start_date.split('T')[1].slice(0, 5),
                              end_date: activity.end_date.split('T')[0] + 'T' + activity.end_date.split('T')[1].slice(0, 5),
                              max_participants: activity.max_participants?.toString() || '',
                              tags: activity.tags || [],
                              image: activity.image || ''
                            })
                            setShowEditActivityModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          title={t('admin.activities.actions.edit')}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleFeatured(activity.id)}
                          className={`text-sm font-medium ${
                            activity.is_featured 
                              ? 'text-yellow-600 hover:text-yellow-700' 
                              : 'text-gray-400 hover:text-yellow-600'
                          }`}
                          title={activity.is_featured ? t('admin.activities.actions.unrecommend') : t('admin.activities.actions.recommend')}
                        >
                          <Star className={`w-4 h-4 ${activity.is_featured ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedActivity(activity)
                            setShowDeleteConfirm(true)
                          }}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
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
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{searchTerm || selectedStatus !== 'all' || selectedCategory !== 'all' ? t('admin.activities.empty.noResults') : t('admin.activities.empty.noActivities')}</h3>
              <p className="text-gray-500">{t('admin.activities.empty.description')}</p>
            </div>
          )}
        </div>

        {/* 活动详情弹窗 */}
        {showActivityModal && selectedActivity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowActivityModal(false)}
            />
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">{t('admin.activities.details.title')}</h3>
                  <button
                    onClick={() => setShowActivityModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* 活动基本信息 */}
                  <div className="flex items-start space-x-4">
                    {selectedActivity.image && (
                      <img
                        src={selectedActivity.image}
                        alt={selectedActivity.title}
                        className="w-32 h-24 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-xl font-semibold text-gray-900">{selectedActivity.title}</h4>
                        {selectedActivity.is_featured && (
                          <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        )}
                        {getStatusBadge(selectedActivity.status)}
                      </div>
                      <p className="text-gray-600 mb-3">{selectedActivity.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{selectedActivity.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDateRange(selectedActivity.start_date, selectedActivity.end_date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 组织者信息 */}
                  <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                    <img
                      src={selectedActivity.organizer.avatar || 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=default%20avatar&image_size=square'}
                      alt={selectedActivity.organizer.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{t('admin.activities.details.organizer')}: {selectedActivity.organizer.username}</p>
                      <p className="text-sm text-gray-500">{t('admin.activities.details.createdAt')}: {formatDate(selectedActivity.created_at)}</p>
                    </div>
                  </div>

                  {/* 参与情况 */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">参与情况</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">当前参与人数</span>
                          <span className="font-medium">{selectedActivity.current_participants}</span>
                        </div>
                        {selectedActivity.max_participants && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">最大参与人数</span>
                              <span className="font-medium">{selectedActivity.max_participants}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-purple-600 h-2 rounded-full" 
                                style={{ 
                                  width: `${Math.min((selectedActivity.current_participants / selectedActivity.max_participants) * 100, 100)}%` 
                                }}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">活动标签</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedActivity.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                    {/* 状态操作 */}
                    {selectedActivity.status === 'draft' && (
                      <button
                        onClick={() => handleStatusChange(selectedActivity.id, 'published')}
                        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {t('admin.activities.actions.publish')}
                      </button>
                    )}
                    {selectedActivity.status === 'published' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(selectedActivity.id, 'ongoing')}
                        className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        {t('admin.activities.actions.start')}
                        </button>
                        <button
                          onClick={() => handleStatusChange(selectedActivity.id, 'cancelled')}
                        className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        {t('admin.activities.actions.cancel')}
                        </button>
                      </>
                    )}
                    {selectedActivity.status === 'ongoing' && (
                      <button
                        onClick={() => handleStatusChange(selectedActivity.id, 'completed')}
                        className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        {t('admin.activities.actions.complete')}
                      </button>
                    )}
                    
                    {/* 推荐操作 */}
                    <button
                      onClick={() => handleToggleFeatured(selectedActivity.id)}
                      className={`py-2 px-4 rounded-lg transition-colors ${
                        selectedActivity.is_featured
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {selectedActivity.is_featured ? t('admin.activities.actions.unrecommend') : t('admin.activities.actions.recommend')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 删除确认弹窗 */}
        {showDeleteConfirm && selectedActivity && (
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
                    <h3 className="text-lg font-semibold text-gray-900">{t('admin.activities.delete.title')}</h3>
                    <p className="text-sm text-gray-500">{t('admin.activities.delete.warning')}</p>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6">
                  {t('admin.activities.delete.confirm')} <strong>{selectedActivity.title}</strong> {t('admin.activities.delete.permanent')}？
                </p>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    {t('admin.activities.delete.cancel')}
                  </button>
                  <button
                    onClick={() => handleDeleteActivity(selectedActivity.id)}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    {t('admin.activities.delete.confirmDelete')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 编辑活动弹窗 */}
        {showEditActivityModal && selectedActivity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowEditActivityModal(false)}
            />
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">{t('admin.activities.actions.edit')}</h3>
                  <button
                    onClick={() => setShowEditActivityModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">活动标题</label>
                    <input
                      type="text"
                      value={editActivityData.title}
                      onChange={(e) => setEditActivityData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="请输入活动标题"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">活动描述</label>
                    <textarea
                      value={editActivityData.description}
                      onChange={(e) => setEditActivityData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="请输入活动描述"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">活动地点</label>
                      <input
                        type="text"
                        value={editActivityData.location}
                        onChange={(e) => setEditActivityData(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="请输入活动地点"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">活动分类</label>
                      <select
                        value={editActivityData.category}
                        onChange={(e) => setEditActivityData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">请选择分类</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.name}>{category.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
                      <input
                        type="datetime-local"
                        value={editActivityData.start_date}
                        onChange={(e) => setEditActivityData(prev => ({ ...prev, start_date: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
                      <input
                        type="datetime-local"
                        value={editActivityData.end_date}
                        onChange={(e) => setEditActivityData(prev => ({ ...prev, end_date: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">最大参与人数（可选）</label>
                    <input
                      type="number"
                      value={editActivityData.max_participants}
                      onChange={(e) => setEditActivityData(prev => ({ ...prev, max_participants: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="不限制请留空"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">活动图片URL（可选）</label>
                    <input
                      type="url"
                      value={editActivityData.image}
                      onChange={(e) => setEditActivityData(prev => ({ ...prev, image: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="请输入图片URL"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setShowEditActivityModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleEditActivity}
                    disabled={!editActivityData.title || !editActivityData.description || !editActivityData.location || !editActivityData.start_date || !editActivityData.end_date}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    保存修改
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 创建活动弹窗 */}
        {showCreateActivityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowCreateActivityModal(false)}
            />
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">{t('admin.activities.actions.create')}</h3>
                  <button
                    onClick={() => setShowCreateActivityModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">活动标题</label>
                    <input
                      type="text"
                      value={newActivityData.title}
                      onChange={(e) => setNewActivityData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="请输入活动标题"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">活动描述</label>
                    <textarea
                      value={newActivityData.description}
                      onChange={(e) => setNewActivityData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="请输入活动描述"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">活动地点</label>
                      <input
                        type="text"
                        value={newActivityData.location}
                        onChange={(e) => setNewActivityData(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="请输入活动地点"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">活动分类</label>
                      <select
                        value={newActivityData.category}
                        onChange={(e) => setNewActivityData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">请选择分类</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.name}>{category.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
                      <input
                        type="datetime-local"
                        value={newActivityData.start_date}
                        onChange={(e) => setNewActivityData(prev => ({ ...prev, start_date: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
                      <input
                        type="datetime-local"
                        value={newActivityData.end_date}
                        onChange={(e) => setNewActivityData(prev => ({ ...prev, end_date: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">最大参与人数（可选）</label>
                    <input
                      type="number"
                      value={newActivityData.max_participants}
                      onChange={(e) => setNewActivityData(prev => ({ ...prev, max_participants: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="不限制请留空"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">活动图片URL（可选）</label>
                    <input
                      type="url"
                      value={newActivityData.image}
                      onChange={(e) => setNewActivityData(prev => ({ ...prev, image: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="请输入图片URL"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setShowCreateActivityModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleCreateActivity}
                    disabled={!newActivityData.title || !newActivityData.description || !newActivityData.location || !newActivityData.start_date || !newActivityData.end_date}
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    创建活动
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
          </>
        )}

        {/* 分类管理标签页内容 */}
        {activeTab === 'categories' && (
          <>
            {/* 操作按钮 */}
            <div className="flex justify-end">
              <button 
                onClick={() => setShowCreateCategoryModal(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>{t('admin.categories.actions.create')}</span>
              </button>
            </div>

            {/* 搜索框 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('admin.categories.search.placeholder')}
                  value={categorySearchTerm}
                  onChange={(e) => setCategorySearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 分类列表 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.categories.table.name')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.categories.table.description')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.categories.table.color')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.categories.table.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categoryList
                      .filter(category => 
                        category.name.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
                        (category.description && category.description.toLowerCase().includes(categorySearchTerm.toLowerCase()))
                      )
                      .map((category) => (
                        <tr key={category.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500">
                              {category.description || t('admin.categories.noDescription')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: category.color }}
                              />
                              <span className="text-sm text-gray-500">{category.color}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => openEditCategoryModal(category)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                title={t('admin.categories.actions.edit')}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openDeleteCategoryConfirm(category)}
                                className="text-red-600 hover:text-red-900 p-1 rounded"
                                title={t('admin.categories.actions.delete')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>

            {/* 创建分类弹窗 */}
            {showCreateCategoryModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div 
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                  onClick={() => setShowCreateCategoryModal(false)}
                />
                <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">{t('admin.categories.actions.create')}</h3>
                      <button
                        onClick={() => setShowCreateCategoryModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XCircle className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('admin.categories.form.name')}
                        </label>
                        <input
                          type="text"
                          value={newCategoryData.name}
                          onChange={(e) => setNewCategoryData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder={t('admin.categories.form.namePlaceholder')}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('admin.categories.form.description')}
                        </label>
                        <textarea
                          value={newCategoryData.description}
                          onChange={(e) => setNewCategoryData(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder={t('admin.categories.form.descriptionPlaceholder')}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('admin.categories.form.color')}
                        </label>
                        <div className="grid grid-cols-5 gap-2 mb-3">
                          {predefinedColors.map(color => (
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
                        <input
                          type="color"
                          value={newCategoryData.color}
                          onChange={(e) => setNewCategoryData(prev => ({ ...prev, color: e.target.value }))}
                          className="w-full h-10 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-3 mt-6">
                      <button
                        onClick={() => setShowCreateCategoryModal(false)}
                        className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        {t('admin.categories.actions.cancel')}
                      </button>
                      <button
                        onClick={handleCreateCategory}
                        disabled={!newCategoryData.name.trim()}
                        className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {t('admin.categories.actions.create')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 编辑分类弹窗 */}
            {showEditCategoryModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div 
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                  onClick={() => setShowEditCategoryModal(false)}
                />
                <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">{t('admin.categories.actions.edit')}</h3>
                      <button
                        onClick={() => setShowEditCategoryModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XCircle className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('admin.categories.form.name')}
                        </label>
                        <input
                          type="text"
                          value={newCategoryData.name}
                          onChange={(e) => setNewCategoryData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder={t('admin.categories.form.namePlaceholder')}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('admin.categories.form.description')}
                        </label>
                        <textarea
                          value={newCategoryData.description}
                          onChange={(e) => setNewCategoryData(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder={t('admin.categories.form.descriptionPlaceholder')}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('admin.categories.form.color')}
                        </label>
                        <div className="grid grid-cols-5 gap-2 mb-3">
                          {predefinedColors.map(color => (
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
                        <input
                          type="color"
                          value={newCategoryData.color}
                          onChange={(e) => setNewCategoryData(prev => ({ ...prev, color: e.target.value }))}
                          className="w-full h-10 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-3 mt-6">
                      <button
                        onClick={() => setShowEditCategoryModal(false)}
                        className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        {t('admin.categories.actions.cancel')}
                      </button>
                      <button
                        onClick={handleUpdateCategory}
                        disabled={!newCategoryData.name.trim()}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {t('admin.categories.actions.save')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 删除分类确认弹窗 */}
            {showDeleteCategoryConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div 
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                  onClick={() => setShowDeleteCategoryConfirm(false)}
                />
                <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">{t('admin.categories.actions.delete')}</h3>
                      <button
                        onClick={() => setShowDeleteCategoryConfirm(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XCircle className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="mb-6">
                      <p className="text-gray-600">
                        {t('admin.categories.deleteConfirm.message')}
                      </p>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowDeleteCategoryConfirm(false)}
                        className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        {t('admin.categories.actions.cancel')}
                      </button>
                      <button
                        onClick={handleDeleteCategory}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        {t('admin.categories.actions.delete')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminActivities