import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Eye, 
  Check, 
  X, 
  Clock, 
  Search, 
  Filter, 
  MoreHorizontal,
  Image,
  Video,
  FileText,
  Calendar,
  User,
  Heart,
  MessageSquare,
  Trash2,
  EyeOff,
  RefreshCw,
  Plus,
  Edit,
  Tag,
  Folder
} from 'lucide-react'
import { cn } from '../../lib/utils'
import AdminLayout from '../../components/AdminLayout'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'
import { adminService, type Post, type ContentCategory } from '../../services/AdminService'

const AdminContent = () => {
  const { t } = useLanguage()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  
  // 标签页管理
  const [activeTab, setActiveTab] = useState<'content' | 'categories'>('content')
  
  // 内容分类管理相关状态
  const [contentCategories, setContentCategories] = useState<ContentCategory[]>([])
  const [categorySearchTerm, setCategorySearchTerm] = useState('')
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false)
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false)
  const [showDeleteCategoryConfirm, setShowDeleteCategoryConfirm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<ContentCategory | null>(null)
  const [newCategoryData, setNewCategoryData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: 'folder',
    sort_order: 1,
    is_active: true
  })
  
  const navigate = useNavigate()

  useEffect(() => {
    // 检查管理员登录状态
    const adminToken = localStorage.getItem('adminToken')
    if (!adminToken) {
      navigate('/admin')
      return
    }

    // 从数据库获取内容数据
    const fetchPosts = async () => {
      try {
        const postsData = await adminService.getPosts()
        setPosts(postsData)
      } catch (error) {
        console.error('获取内容数据失败:', error)
        
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

    // 获取内容分类数据
    const fetchContentCategories = async () => {
      try {
        const categoriesData = await adminService.getContentCategories()
        setContentCategories(categoriesData)
      } catch (error) {
        console.error('获取内容分类数据失败:', error)
        
        // 检查是否为认证失败错误
        if (error instanceof Error && error.name === 'AuthenticationError') {
          alert('认证令牌已失效，请重新登录')
          navigate('/admin')
          return
        }
      }
    }

    fetchPosts()
    fetchContentCategories()
  }, [navigate])

  // 内容分类管理相关函数
  const handleCreateCategory = async () => {
    try {
      const category = await adminService.createContentCategory(newCategoryData)
      setContentCategories(prev => [...prev, category])
      setShowCreateCategoryModal(false)
      setNewCategoryData({
        name: '',
        description: '',
        color: '#3B82F6',
        icon: 'folder',
        sort_order: 1,
        is_active: true
      })
    } catch (error) {
      console.error('创建内容分类失败:', error)
      
      // 检查是否为认证失败错误
      if (error instanceof Error && error.name === 'AuthenticationError') {
        alert('认证令牌已失效，请重新登录')
        navigate('/admin')
        return
      }
      
      alert('创建分类失败，请重试')
    }
  }

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return
    
    try {
      const updatedCategory = await adminService.updateContentCategory(selectedCategory.id, newCategoryData)
      setContentCategories(prev => prev.map(cat => 
        cat.id === selectedCategory.id ? updatedCategory : cat
      ))
      setShowEditCategoryModal(false)
      setSelectedCategory(null)
      setNewCategoryData({
        name: '',
        description: '',
        color: '#3B82F6',
        icon: 'folder',
        sort_order: 1,
        is_active: true
      })
    } catch (error) {
      console.error('更新内容分类失败:', error)
      
      // 检查是否为认证失败错误
      if (error instanceof Error && error.name === 'AuthenticationError') {
        alert('认证令牌已失效，请重新登录')
        navigate('/admin')
        return
      }
      
      alert('更新分类失败，请重试')
    }
  }

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return
    
    try {
      await adminService.deleteContentCategory(selectedCategory.id)
      setContentCategories(prev => prev.filter(cat => cat.id !== selectedCategory.id))
      setShowDeleteCategoryConfirm(false)
      setSelectedCategory(null)
    } catch (error) {
      console.error('删除内容分类失败:', error)
      
      // 检查是否为认证失败错误
      if (error instanceof Error && error.name === 'AuthenticationError') {
        alert('认证令牌已失效，请重新登录')
        navigate('/admin')
        return
      }
      
      alert('删除分类失败，请重试')
    }
  }

  const openEditCategoryModal = (category: ContentCategory) => {
    setSelectedCategory(category)
    setNewCategoryData({
      name: category.name,
      description: category.description || '',
      color: category.color,
      icon: category.icon,
      sort_order: category.sort_order,
      is_active: category.is_active ?? true
    })
    setShowEditCategoryModal(true)
  }

  const openDeleteCategoryConfirm = (category: ContentCategory) => {
    setSelectedCategory(category)
    setShowDeleteCategoryConfirm(true)
  }

  const handleStatusChange = async (postId: string, newStatus: 'published' | 'rejected' | 'draft' | 'pending') => {
    try {
      // 调用AdminService更新帖子状态
      const result = await adminService.updatePostStatus(postId, newStatus)
      
      if (result.success) {
        // 更新本地状态
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, status: newStatus as 'pending' | 'published' | 'draft' | 'rejected', updated_at: new Date().toISOString() }
            : post
        ))
        
        setShowPreview(false)
        setSelectedPost(null)
        
        // 显示成功提示
        console.log('内容状态更新成功:', result)
      } else {
        throw new Error('更新状态失败')
      }
    } catch (error) {
      console.error('更新内容状态失败:', error)
      
      // 检查是否为认证失败错误
      if (error instanceof Error && error.name === 'AuthenticationError') {
        alert('认证令牌已失效，请重新登录')
        navigate('/admin')
        return
      }
      
      // 这里可以添加错误提示UI
      alert('更新状态失败，请重试')
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('确定要删除这篇帖子吗？此操作不可撤销。')) {
      return
    }
    
    try {
      // 调用AdminService删除帖子
      const result = await adminService.deletePost(postId)
      
      if (result.success) {
        // 从本地状态中移除帖子
        setPosts(prev => prev.filter(post => post.id !== postId))
        
        setShowPreview(false)
        setSelectedPost(null)
        
        // 显示成功提示
        console.log('帖子删除成功:', result)
      } else {
        throw new Error('删除帖子失败')
      }
    } catch (error) {
      console.error('删除帖子失败:', error)
      
      // 检查是否为认证失败错误
      if (error instanceof Error && error.name === 'AuthenticationError') {
        alert('认证令牌已失效，请重新登录')
        navigate('/admin')
        return
      }
      
      alert('删除帖子失败，请重试')
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesStatus = selectedStatus === 'all' || post.status === selectedStatus
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.username.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const filteredCategories = contentCategories.filter(category =>
    category.name.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(categorySearchTerm.toLowerCase()))
  )

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: t('admin.content.status.pending'), color: 'bg-yellow-100 text-yellow-800' },
      published: { label: t('admin.content.status.published'), color: 'bg-green-100 text-green-800' },
      rejected: { label: t('admin.content.status.rejected'), color: 'bg-red-100 text-red-800' },
      draft: { label: t('admin.content.status.draft'), color: 'bg-gray-100 text-gray-800' }
    }
    const config = statusConfig[status as keyof typeof statusConfig]
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
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
        {/* 页面标题和标签页导航 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('admin.content.title')}</h1>
            <p className="text-gray-600">{t('admin.content.description')}</p>
          </div>
          {activeTab === 'categories' && (
            <button
              onClick={() => setShowCreateCategoryModal(true)}
              className="mt-4 sm:mt-0 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t('admin.content.categories.create')}</span>
            </button>
          )}

        {/* 分类管理标签页 */}
        {activeTab === 'categories' && (
          <>
            {/* 分类搜索 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder={t('admin.content.categories.search.placeholder')}
                  value={categorySearchTerm}
                  onChange={(e) => setCategorySearchTerm(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 分类列表 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="text-center py-12">
                  <Folder className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">{t('admin.content.categories.empty.title')}</h3>
                  <p className="mt-1 text-sm text-gray-500">{t('admin.content.categories.empty.description')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('admin.content.categories.table.name')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('admin.content.categories.table.description')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('admin.content.categories.table.status')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('admin.content.categories.table.sort_order')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('admin.content.categories.table.created')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('admin.content.categories.table.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCategories.map((category) => (
                        <tr key={category.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-4 h-4 rounded-full flex-shrink-0"
                                style={{ backgroundColor: category.color }}
                              ></div>
                              <div className="flex items-center space-x-2">
                                {category.icon && (
                                  <span className="text-lg">{category.icon}</span>
                                )}
                                <span className="text-sm font-medium text-gray-900">
                                  {category.name}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-500 max-w-xs truncate">
                              {category.description || '-'}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={cn(
                              'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                              category.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            )}>
                              {category.is_active ? t('admin.content.categories.status.active') : t('admin.content.categories.status.inactive')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {category.sort_order}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(category.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => openEditCategoryModal(category)}
                                className="text-purple-600 hover:text-purple-900"
                                title={t('admin.content.categories.actions.edit')}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openDeleteCategoryConfirm(category)}
                                className="text-red-600 hover:text-red-900"
                                title={t('admin.content.categories.actions.delete')}
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
              )}
            </div>
          </>
        )}
        </div>

        {/* 标签页导航 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('content')}
                className={cn(
                  'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                  activeTab === 'content'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>{t('admin.content.tabs.content')}</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={cn(
                  'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                  activeTab === 'categories'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <div className="flex items-center space-x-2">
                  <Folder className="w-4 h-4" />
                  <span>{t('admin.content.tabs.categories')}</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* 内容管理标签页 */}
        {activeTab === 'content' && (
          <>
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
                    <option value="all">{t('admin.content.filter.all')}</option>
                    <option value="pending">{t('admin.content.filter.pending')}</option>
                    <option value="published">{t('admin.content.filter.published')}</option>
                    <option value="rejected">{t('admin.content.filter.rejected')}</option>
                    <option value="draft">{t('admin.content.filter.draft')}</option>
                  </select>
                </div>

                {/* 搜索框 */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('admin.content.search.placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* 内容列表 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">{t('admin.content.empty.title')}</h3>
                  <p className="mt-1 text-sm text-gray-500">{t('admin.content.empty.description')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('admin.content.table.content')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('admin.content.table.author')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('admin.content.table.status')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('admin.content.table.engagement')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('admin.content.table.created')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('admin.content.table.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPosts.map((post) => (
                        <tr key={post.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-start space-x-3">
                              {post.image && (
                          <img
                            src={post.image}
                                  alt=""
                                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {post.title || t('admin.content.untitled')}
                                </p>
                                <p className="text-sm text-gray-500 line-clamp-2">
                                  {post.content}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                <img
                                  className="h-8 w-8 rounded-full"
                                  src={post.author?.avatar || '/default-avatar.png'}
                                  alt=""
                                />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {post.author?.username || t('admin.content.unknown_user')}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={cn(
                              'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                              {
                                'bg-yellow-100 text-yellow-800': post.status === 'pending',
                                'bg-green-100 text-green-800': post.status === 'published',
                                'bg-red-100 text-red-800': post.status === 'rejected',
                                'bg-gray-100 text-gray-800': post.status === 'draft',
                              }
                            )}>
                              {t(`admin.content.status.${post.status}`)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center">
                                <Heart className="w-4 h-4 mr-1" />
                                {post.likes_count || 0}
                              </div>
                              <div className="flex items-center">
                                <MessageSquare className="w-4 h-4 mr-1" />
                                {post.comments_count || 0}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(post.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setSelectedPost(post)}
                                className="text-purple-600 hover:text-purple-900"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {post.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleStatusChange(post.id, 'published')}
                                    className="text-green-600 hover:text-green-900"
                                    title={t('admin.content.actions.approve')}
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(post.id, 'rejected')}
                                    className="text-red-600 hover:text-red-900"
                                    title={t('admin.content.actions.reject')}
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              {post.status === 'published' && (
                                <button
                                  onClick={() => handleStatusChange(post.id, 'rejected')}
                                  className="text-orange-600 hover:text-orange-900"
                                  title={t('admin.content.actions.hide')}
                                >
                                  <EyeOff className="w-4 h-4" />
                                </button>
                              )}
                              {(post.status === 'rejected' || post.status === 'draft') && (
                                <button
                                  onClick={() => handleStatusChange(post.id, 'pending')}
                                  className="text-blue-600 hover:text-blue-900"
                                  title={t('admin.content.actions.resubmit')}
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="text-red-600 hover:text-red-900"
                                title={t('admin.content.actions.delete')}
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
              )}
            </div>
          </>
        )}

        {/* 内容预览弹窗 */}
        {showPreview && selectedPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowPreview(false)}
            />
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{t('admin.content.preview.title')}</h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* 作者信息 */}
                  <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                    <img
                      src={selectedPost.author?.avatar || 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=default%20avatar&image_size=square'}
                      alt={selectedPost.author?.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{selectedPost.author?.username}</p>
                      <p className="text-sm text-gray-500">{formatDate(selectedPost.created_at)}</p>
                    </div>
                    <div className="ml-auto">
                      {getStatusBadge(selectedPost.status)}
                    </div>
                  </div>

                  {/* 内容标题 */}
                  <h4 className="text-xl font-semibold text-gray-900">{selectedPost.title}</h4>

                  {/* 内容正文 */}
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedPost.content}</p>
                  </div>

                  {/* 图片 */}
                  {selectedPost.image && (
                    <div className="space-y-2">
                      <img
                        src={selectedPost.image}
                        alt={t('admin.content.preview.image')}
                        className="w-full rounded-lg"
                      />
                    </div>
                  )}

                  {/* 操作按钮 */}
                  {selectedPost.status === 'pending' && (
                    <div className="flex space-x-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleStatusChange(selectedPost.id, 'published')}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        {t('admin.content.actions.approve')}
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedPost.id, 'rejected')}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        {t('admin.content.actions.reject')}
                      </button>
                    </div>
                  )}
                  {selectedPost.status === 'published' && (
                    <div className="flex space-x-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleStatusChange(selectedPost.id, 'draft')}
                        className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        <EyeOff className="w-4 h-4 mr-2" />
                        隐藏/下架
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedPost.id, 'pending')}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        重新审核
                      </button>
                      <button
                        onClick={() => handleDeletePost(selectedPost.id)}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        删除
                      </button>
                    </div>
                  )}
                  {selectedPost.status === 'draft' && (
                    <div className="flex space-x-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleStatusChange(selectedPost.id, 'pending')}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        提交审核
                      </button>
                      <button
                        onClick={() => handleDeletePost(selectedPost.id)}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        删除
                      </button>
                    </div>
                  )}
                  {selectedPost.status === 'rejected' && (
                    <div className="flex space-x-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleDeletePost(selectedPost.id)}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        删除
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 创建分类模态框 */}
        {showCreateCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('admin.content.categories.create')}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.content.categories.form.name')}
                  </label>
                  <input
                    type="text"
                    value={newCategoryData.name}
                    onChange={(e) => setNewCategoryData({ ...newCategoryData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder={t('admin.content.categories.form.name_placeholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.content.categories.form.description')}
                  </label>
                  <textarea
                    value={newCategoryData.description}
                    onChange={(e) => setNewCategoryData({ ...newCategoryData, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    placeholder={t('admin.content.categories.form.description_placeholder')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.content.categories.form.color')}
                    </label>
                    <input
                      type="color"
                      value={newCategoryData.color}
                      onChange={(e) => setNewCategoryData({ ...newCategoryData, color: e.target.value })}
                      className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.content.categories.form.icon')}
                    </label>
                    <input
                      type="text"
                      value={newCategoryData.icon}
                      onChange={(e) => setNewCategoryData({ ...newCategoryData, icon: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="📁"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.content.categories.form.sort_order')}
                  </label>
                  <input
                    type="number"
                    value={newCategoryData.sort_order}
                    onChange={(e) => setNewCategoryData({ ...newCategoryData, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateCategoryModal(false);
                    setNewCategoryData({ name: '', description: '', color: '#6366f1', icon: '', sort_order: 0, is_active: true });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleCreateCategory}
                  disabled={!newCategoryData.name.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t('common.create')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 编辑分类模态框 */}
        {showEditCategoryModal && selectedCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('admin.content.categories.edit')}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.content.categories.form.name')}
                  </label>
                  <input
                    type="text"
                    value={newCategoryData.name}
                    onChange={(e) => setNewCategoryData({ ...newCategoryData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder={t('admin.content.categories.form.name_placeholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.content.categories.form.description')}
                  </label>
                  <textarea
                    value={newCategoryData.description}
                    onChange={(e) => setNewCategoryData({ ...newCategoryData, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    placeholder={t('admin.content.categories.form.description_placeholder')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.content.categories.form.color')}
                    </label>
                    <input
                      type="color"
                      value={newCategoryData.color}
                      onChange={(e) => setNewCategoryData({ ...newCategoryData, color: e.target.value })}
                      className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.content.categories.form.icon')}
                    </label>
                    <input
                      type="text"
                      value={newCategoryData.icon}
                      onChange={(e) => setNewCategoryData({ ...newCategoryData, icon: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="📁"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.content.categories.form.sort_order')}
                  </label>
                  <input
                    type="number"
                    value={newCategoryData.sort_order}
                    onChange={(e) => setNewCategoryData({ ...newCategoryData, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="0"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={newCategoryData.is_active}
                    onChange={(e) => setNewCategoryData({ ...newCategoryData, is_active: e.target.checked })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    {t('admin.content.categories.form.is_active')}
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditCategoryModal(false);
                    setSelectedCategory(null);
                    setNewCategoryData({ name: '', description: '', color: '#6366f1', icon: '', sort_order: 0, is_active: true });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleUpdateCategory}
                  disabled={!newCategoryData.name.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t('common.save')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 删除分类确认对话框 */}
        {showDeleteCategoryConfirm && selectedCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    {t('admin.content.categories.delete.title')}
                  </h3>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  {t('admin.content.categories.delete.message')}
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteCategoryConfirm(false);
                    setSelectedCategory(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleDeleteCategory}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
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

export default AdminContent