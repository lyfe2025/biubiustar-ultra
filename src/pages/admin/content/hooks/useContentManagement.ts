import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminService } from '../../../../services/AdminService'
import { toast } from 'sonner'
import { Post, ContentCategory } from '../types'

export const useContentManagement = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'categories'>('content')
  
  // 分类管理状态
  const [contentCategories, setContentCategories] = useState<ContentCategory[]>([])
  const [categorySearchTerm, setCategorySearchTerm] = useState('')
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false)
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false)
  const [showDeleteCategoryConfirm, setShowDeleteCategoryConfirm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<ContentCategory | null>(null)
  
  const navigate = useNavigate()

  // 获取帖子数据
  const fetchPosts = async () => {
    try {
      setLoading(true)
      const data = await adminService.getPosts()
      setPosts(data)
    } catch (error) {
      console.error('获取帖子数据失败:', error)
      if (error instanceof Error && error.name === 'AuthenticationError') {
        alert('认证令牌已失效，请重新登录')
        navigate('/admin')
        return
      }
      toast.error('获取帖子数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 获取内容分类
  const fetchContentCategories = async () => {
    try {
      const data = await adminService.getContentCategories()
      setContentCategories(data)
    } catch (error) {
      console.error('获取内容分类失败:', error)
      toast.error('获取内容分类失败')
    }
  }

  // 初始加载
  useEffect(() => {
    fetchPosts()
    fetchContentCategories()
  }, [])

  // 过滤帖子
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.username.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || post.status === selectedStatus
    
    return matchesSearch && matchesStatus
  })

  // 过滤分类
  const filteredCategories = contentCategories.filter(category =>
    category.name.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(categorySearchTerm.toLowerCase()))
  )

  // 更新帖子状态
  const updatePostStatus = async (postId: string, status: Post['status']) => {
    try {
      // 直接使用传入的状态
      const mappedStatus = status === 'published' ? 'published' : status
      await adminService.updatePostStatus(postId, mappedStatus as any)
      await fetchPosts()
      toast.success('帖子状态更新成功')
    } catch (error) {
      console.error('更新帖子状态失败:', error)
      toast.error('更新帖子状态失败')
    }
  }

  // 删除帖子
  const deletePost = async (postId: string) => {
    try {
      await adminService.deletePost(postId)
      await fetchPosts()
      toast.success('帖子删除成功')
    } catch (error) {
      console.error('删除帖子失败:', error)
      toast.error('删除帖子失败')
    }
  }

  // 创建内容分类
  const createContentCategory = async (categoryData: any) => {
    try {
      await adminService.createContentCategory(categoryData)
      await fetchContentCategories()
      setShowCreateCategoryModal(false)
      toast.success('分类创建成功')
    } catch (error) {
      console.error('创建分类失败:', error)
      toast.error('创建分类失败')
    }
  }

  // 更新内容分类
  const updateContentCategory = async (categoryId: string, categoryData: any) => {
    try {
      await adminService.updateContentCategory(categoryId, categoryData)
      await fetchContentCategories()
      setShowEditCategoryModal(false)
      setSelectedCategory(null)
      toast.success('分类更新成功')
    } catch (error) {
      console.error('更新分类失败:', error)
      toast.error('更新分类失败')
    }
  }

  // 删除内容分类
  const deleteContentCategory = async (categoryId: string) => {
    try {
      await adminService.deleteContentCategory(categoryId)
      await fetchContentCategories()
      setShowDeleteCategoryConfirm(false)
      setSelectedCategory(null)
      toast.success('分类删除成功')
    } catch (error) {
      console.error('删除分类失败:', error)
      toast.error('删除分类失败')
    }
  }

  // 切换分类状态
  const toggleCategoryStatus = async (category: ContentCategory) => {
    try {
      await adminService.toggleContentCategoryStatus(category.id)
      await fetchContentCategories()
      toast.success('分类状态更新成功')
    } catch (error) {
      console.error('更新分类状态失败:', error)
      toast.error('更新分类状态失败')
    }
  }

  // 预览相关操作
  const openPreview = (post: Post) => {
    setSelectedPost(post)
    setShowPreview(true)
  }

  const closePreview = () => {
    setShowPreview(false)
    setSelectedPost(null)
  }

  // 分类管理操作
  const openCreateCategoryModal = () => {
    setShowCreateCategoryModal(true)
  }

  const openEditCategoryModal = (category: ContentCategory) => {
    setSelectedCategory(category)
    setShowEditCategoryModal(true)
  }

  const openDeleteCategoryConfirm = (category: ContentCategory) => {
    setSelectedCategory(category)
    setShowDeleteCategoryConfirm(true)
  }

  const closeAllModals = () => {
    setShowCreateCategoryModal(false)
    setShowEditCategoryModal(false)
    setShowDeleteCategoryConfirm(false)
    setSelectedCategory(null)
  }

  return {
    // 数据
    posts: filteredPosts,
    allPosts: posts,
    contentCategories: filteredCategories,
    allCategories: contentCategories,
    loading,
    selectedPost,
    selectedCategory,
    
    // 筛选状态
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    categorySearchTerm,
    setCategorySearchTerm,
    
    // 标签页
    activeTab,
    setActiveTab,
    
    // 预览状态
    showPreview,
    
    // 模态框状态
    showCreateCategoryModal,
    showEditCategoryModal,
    showDeleteCategoryConfirm,
    
    // 操作方法
    fetchPosts,
    fetchContentCategories,
    updatePostStatus,
    deletePost,
    createContentCategory,
    updateContentCategory,
    deleteContentCategory,
    toggleCategoryStatus,
    
    // 预览操作
    openPreview,
    closePreview,
    
    // 分类模态框操作
    openCreateCategoryModal,
    openEditCategoryModal,
    openDeleteCategoryConfirm,
    closeAllModals
  }
}
