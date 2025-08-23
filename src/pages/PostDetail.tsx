import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/language'
import { socialService } from '../lib/socialService'
import type { Post, Comment } from '../types'
import { toast } from 'sonner'
import AuthModal from '../components/AuthModal'
import { usePostDetailData } from '../hooks/useOptimizedData'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import {
  PostCard,
  CommentsSection,
  LoadingState,
  ErrorState
} from '../components/PostDetail'

interface ContentCategory {
  id: string
  name: string
  name_zh: string
  name_zh_tw: string
  name_en: string
  name_vi: string
  description?: string
  color?: string
  icon?: string
  is_active: boolean
}

const PostDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, userProfile } = useAuth()
  const { language, t } = useLanguage()


  const openAuthModal = (type: 'login' | 'register') => {
    setAuthModalType(type)
    setIsAuthModalOpen(true)
  }
  
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [commentsCount, setCommentsCount] = useState(0)
  const [sharesCount, setSharesCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<ContentCategory[]>([])
  const [categoryDisplayName, setCategoryDisplayName] = useState<string>('')
  const [comments, setComments] = useState<Comment[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  
  // 使用优化的数据获取Hook
  const {
    data: optimizedData,
    loading: optimizedLoading,
    error: optimizedError,
    refetch: refetchOptimizedData
  } = usePostDetailData(id || '', user?.id)
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalType, setAuthModalType] = useState<'login' | 'register'>('login')
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [deleteCommentModal, setDeleteCommentModal] = useState<{
    isOpen: boolean
    commentId: string | null
    commentContent: string
  }>({
    isOpen: false,
    commentId: null,
    commentContent: ''
  })

  // 处理优化数据的更新
  useEffect(() => {
    if (optimizedData) {
      console.log('PostDetail: 使用优化数据', optimizedData)
      
      if (optimizedData.post_details?.post) {
        setPost(optimizedData.post_details.post)
        setLikesCount(optimizedData.post_details.post.likes_count || 0)
        setCommentsCount(optimizedData.post_details.commentsCount || optimizedData.post_details.post.comments_count || 0)
        setSharesCount(optimizedData.post_details.post.shares_count || 0)
      }
      
      if (optimizedData.content_categories) {
        setCategories(optimizedData.content_categories)
      }
      
      if (optimizedData.post_comments) {
        setComments(optimizedData.post_comments)
      }
      
      if (optimizedData.post_details?.isLiked !== undefined) {
        setIsLiked(optimizedData.post_details.isLiked)
      }
      
      setLoading(false)
      setCommentsLoading(false)
    }
  }, [optimizedData])
  
  // 处理优化数据的错误状态
  useEffect(() => {
    if (optimizedError) {
      console.error('PostDetail: 优化数据获取失败', optimizedError)
      setError(optimizedError)
      setLoading(false)
      setCommentsLoading(false)
    }
  }, [optimizedError])
  
  // 处理优化数据的加载状态
  useEffect(() => {
    setLoading(optimizedLoading)
    if (optimizedLoading) {
      setCommentsLoading(true)
    }
  }, [optimizedLoading])
  
  // 降级方案：如果优化数据获取失败，使用原有逻辑
  const fetchPost = async () => {
    if (!id) {
      setError(t('posts.detail.postIdMissing'))
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log('🔍 PostDetail: 降级方案 - 调用 socialService.getPost，帖子ID:', id)
      const postData = await socialService.getPost(id)
      console.log('✅ PostDetail: 降级方案 - 获取帖子数据成功，阅读量:', postData.views_count)
      setPost(postData)
      setLikesCount(postData.likes_count || 0)
      setCommentsCount(postData.comments_count || 0)
      setSharesCount(postData.shares_count || 0)
      
      // 检查是否已点赞
      if (user) {
        const liked = await socialService.isPostLiked(id, user.id)
        setIsLiked(liked)
      }
      
      // 获取真实的评论数量
      const realCommentsCount = await socialService.getPostCommentsCount(id)
      setCommentsCount(realCommentsCount)
      
    } catch (error) {
      console.error('获取帖子详情失败:', error)
      setError(t('posts.detail.loadError'))
    } finally {
      setLoading(false)
    }
  }

  // 获取分类数据
  const fetchCategories = async () => {
    try {
      console.log(`PostDetail: 正在获取分类数据，当前语言: ${language}`)
      const categoriesData = await socialService.getContentCategories(language)
      console.log('PostDetail: 获取到的分类数据:', categoriesData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('PostDetail: 获取分类失败:', error)
    }
  }

  // 根据当前语言获取分类名称
  const getCategoryName = (category: ContentCategory): string => {
    switch (language) {
      case 'zh':
        return category.name_zh || category.name
      case 'zh-TW':
        return category.name_zh_tw || category.name_zh || category.name
      case 'en':
        return category.name_en || category.name
      case 'vi':
        return category.name_vi || category.name
      default:
        return category.name_zh || category.name
    }
  }



  // 处理点赞
  const handleLike = async () => {
    if (!user) {
      toast.error(t('posts.card.loginRequired'))
      return
    }

    if (isLoading || !post) return
    setIsLoading(true)

    try {
      if (isLiked) {
        await socialService.unlikePost(post.id, user.id)
      } else {
        await socialService.likePost(post.id, user.id)
      }
      const newIsLiked = !isLiked
      setIsLiked(newIsLiked)
      setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1)
    } catch (error) {
      console.error('点赞失败:', error)
      toast.error(t('posts.detail.operationError'))
    } finally {
      setIsLoading(false)
    }
  }

  // 获取评论列表
  const fetchComments = async () => {
    if (!id) return
    
    setCommentsLoading(true)
    try {
      const commentsData = await socialService.getPostComments(id)
      setComments(commentsData)
    } catch (error) {
      console.error('获取评论失败:', error)
    } finally {
      setCommentsLoading(false)
    }
  }

  // 处理评论
  const handleComment = () => {
    // 滚动到评论区域
    const commentsSection = document.getElementById('comments-section')
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // 提交评论
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error(t('posts.detail.loginRequired'))
      return
    }
    if (!newComment.trim() || !id) return

    setIsSubmittingComment(true)
    try {
      const comment = await socialService.addComment({
        post_id: id,
        user_id: user.id,
        content: newComment.trim()
      })
      setComments(prev => [comment, ...prev])
      setNewComment('')
      toast.success(t('posts.detail.commentSuccess'))
    } catch (error) {
      console.error('发表评论失败:', error)
      toast.error(t('posts.detail.commentSubmitError'))
    } finally {
      setIsSubmittingComment(false)
    }
  }

  // 删除评论
  const handleDeleteComment = (commentId: string, commentContent: string) => {
    if (!user) return
    setDeleteCommentModal({
      isOpen: true,
      commentId,
      commentContent: commentContent.length > 50 ? commentContent.slice(0, 50) + '...' : commentContent
    })
  }

  const confirmDeleteComment = async () => {
    if (!deleteCommentModal.commentId || !user) return
    
    try {
      await socialService.deleteComment(deleteCommentModal.commentId, user.id)
      setComments(prev => prev.filter(comment => comment.id !== deleteCommentModal.commentId))
      setDeleteCommentModal({ isOpen: false, commentId: null, commentContent: '' })
      toast.success(t('posts.detail.commentDeleteSuccess'))
    } catch (error) {
      console.error('删除评论失败:', error)
      toast.error(t('posts.detail.commentDeleteError'))
    }
  }





  // 处理视频播放
  const handleVideoPlay = () => {
    setIsVideoPlaying(true)
  }

  // 获取返回路径
  const getBackPath = () => {
    const referrer = location.state?.from;
    if (referrer) {
      return referrer;
    }
    
    // 如果没有 referrer，根据当前路径判断
    const pathname = location.pathname;
    if (pathname.includes('/profile')) {
      return '/profile';
    } else if (pathname.includes('/admin')) {
      return '/admin';
    } else if (pathname.includes('/home') || pathname === '/') {
      return '/';
    } else {
      return '/';
    }
  };

  // 处理返回
  const handleBack = () => {
    const backPath = getBackPath();
    navigate(backPath);
  };

  useEffect(() => {
    // 如果优化数据获取失败，使用降级方案
    if (optimizedError && id) {
      console.log('PostDetail: 使用降级方案获取数据')
      fetchPost()
      fetchCategories()
      fetchComments()
    }
  }, [id, optimizedError])

  // 当分类数据或语言变化时，更新分类显示名称
  useEffect(() => {
    if (categories.length > 0 && post?.category) {
      if (post.category === 'general') {
        setCategoryDisplayName(t('posts.create.generalCategory'))
      } else {
        // 查找匹配的分类
        const category = categories.find(cat => cat.id === post.category)
        if (category) {
          // 根据当前语言获取分类名称
          const categoryName = getCategoryName(category)
          console.log(`PostDetail: 找到分类: ${post.category} -> ${categoryName} (语言: ${language})`)
          setCategoryDisplayName(categoryName)
        } else {
          // 如果找不到分类，显示原始值（可能是 UUID 或其他标识符）
          console.warn(`PostDetail: 未找到分类 ID: ${post.category}，可用分类:`, categories.map(c => ({ id: c.id, name: getCategoryName(c) })))
          setCategoryDisplayName(post.category)
        }
      }
    } else if (post?.category) {
      setCategoryDisplayName(post.category === 'general' ? t('posts.create.generalCategory') : post.category)
    }
  }, [categories, post?.category, language, t])

  if (loading) {
    return <LoadingState t={t} />
  }

  if (error || !post) {
    return <ErrorState error={error} t={t} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 relative overflow-hidden pt-20">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-pink-400/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="relative container mx-auto px-4 py-8 max-w-4xl">
        {/* 返回按钮 */}
        <button
          onClick={handleBack}
          className="flex items-center bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-purple-100 px-4 py-3 mb-8 hover:bg-white transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5 mr-2 text-purple-600" />
          <span className="text-purple-600 font-medium">{t('posts.detail.back')}</span>
        </button>

        <PostCard
          post={post}
          categoryDisplayName={categoryDisplayName}
          language={language}
          isLiked={isLiked}
          likesCount={likesCount}
          commentsCount={commentsCount}
          isLoading={isLoading}
          onLike={handleLike}
          onComment={handleComment}
          t={t}
        />

        <CommentsSection
          comments={comments}
          commentsLoading={commentsLoading}
          user={user}
          userProfile={userProfile}
          newComment={newComment}
          setNewComment={setNewComment}
          isSubmittingComment={isSubmittingComment}
          onSubmitComment={handleSubmitComment}
          onDeleteComment={handleDeleteComment}
          onLoginClick={() => openAuthModal('login')}
          t={t}
        />
      </div>
      
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        type={authModalType}
      />

      {/* 删除评论确认弹窗 */}
      <DeleteConfirmModal
        isOpen={deleteCommentModal.isOpen}
        onClose={() => setDeleteCommentModal({ isOpen: false, commentId: null, commentContent: '' })}
        onConfirm={confirmDeleteComment}
        title={t('posts.comments.deleteConfirmTitle')}
        message={t('posts.detail.deleteConfirm')}
        itemName={deleteCommentModal.commentContent}
        loading={isSubmittingComment}
        confirmText={t('posts.comments.delete')}
        cancelText={t('common.cancel')}
      />
    </div>
  )
}

export default PostDetail