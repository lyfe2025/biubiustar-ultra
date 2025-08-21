import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Heart, MessageCircle, Share2, User, Calendar, Tag, Send, Trash2, Play } from 'lucide-react'
import { cn } from '../lib/utils'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/language'
import { socialService } from '../lib/socialService'
import type { Post, Comment, MediaFile } from '../types'
import { formatDistanceToNow } from 'date-fns'
import { zhCN, enUS, vi } from 'date-fns/locale'
import { toast } from 'sonner'
import AuthModal from '../components/AuthModal'
import { generateDefaultAvatarUrl, getUserDefaultAvatarUrl } from '../utils/avatarGenerator'
import MediaGrid from '../components/MediaGrid'
import { usePostDetailData } from '../hooks/useOptimizedData'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import { useErrorMessage } from '../utils/errorMessages'

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
  const { getErrorMessage } = useErrorMessage()

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

  // 格式化日期
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const locale = language === 'zh' ? zhCN : language === 'vi' ? vi : enUS
      const result = formatDistanceToNow(date, { addSuffix: true, locale })
      
      if (language !== 'en') {
        return result
          .replace('less than a minute ago', t('posts.time.justNow'))
          .replace('minute ago', t('posts.time.minuteAgo'))
          .replace('minutes ago', t('posts.time.minutesAgo'))
          .replace('hour ago', t('posts.time.hourAgo'))
          .replace('hours ago', t('posts.time.hoursAgo'))
          .replace('day ago', t('posts.time.dayAgo'))
          .replace('days ago', t('posts.time.daysAgo'))
          .replace('week ago', t('posts.time.weekAgo'))
          .replace('weeks ago', t('posts.time.weeksAgo'))
          .replace('month ago', t('posts.time.monthAgo'))
          .replace('months ago', t('posts.time.monthsAgo'))
          .replace('year ago', t('posts.time.yearAgo'))
          .replace('years ago', t('posts.time.yearsAgo'))
      }
      
      return result
    } catch {
      return t('posts.time.justNow')
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

  // 处理分享
  const handleShare = async () => {
    if (!post) return
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.content,
          url: window.location.href
        })
      } else {
        // 复制链接到剪贴板
        await navigator.clipboard.writeText(window.location.href)
        toast.success(t('posts.detail.linkCopied'))
      }
    } catch (error) {
      console.error('分享失败:', error)
      // 如果分享失败，尝试复制链接
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast.success(t('posts.detail.linkCopied'))
      } catch (clipboardError) {
        console.error('复制链接失败:', clipboardError)
        toast.error(t('posts.detail.shareError'))
      }
    }
  }

  // 获取媒体文件列表
  const getMediaFiles = (post: Post): MediaFile[] => {
    // 优先使用新的 media_files 数据
    if (post.media_files && post.media_files.length > 0) {
      return post.media_files.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    }
    
    // 向后兼容：将旧的 image_url 和 video 转换为 MediaFile 格式
    const mediaFiles: MediaFile[] = []
    
    if (post.image_url) {
      mediaFiles.push({
        id: 'legacy-image',
        post_id: post.id,
        file_url: post.image_url,
        file_type: 'image',
        display_order: 0,
        created_at: post.created_at
      })
    }
    
    if (post.video) {
      mediaFiles.push({
        id: 'legacy-video',
        post_id: post.id,
        file_url: post.video,
        file_type: 'video',
        thumbnail_url: post.thumbnail,
        display_order: post.image_url ? 1 : 0,
        created_at: post.created_at
      })
    }
    
    return mediaFiles
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 relative overflow-hidden flex items-center justify-center">
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-pink-400/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="relative flex flex-col justify-center items-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent absolute top-0 left-0"></div>
          </div>
          <p className="mt-6 text-lg text-gray-600 font-medium">{t('posts.detail.loading')}</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 relative overflow-hidden flex items-center justify-center">
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-pink-400/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="relative text-center bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 max-w-md mx-4">
          <div className="text-6xl mb-4 animate-bounce">😵</div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-4">{t('posts.detail.errorTitle')}</h2>
          <p className="text-red-600 mb-6">{error || getErrorMessage('posts.notFound')}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-medium hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {t('posts.detail.back')}
          </button>
        </div>
      </div>
    )
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

        {/* 帖子详情卡片 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 p-8">
          {/* 帖子头部 */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                {(() => {
                  console.log('PostDetail 头像调试信息:', {
                    post: post,
                    author: post.author,
                    avatar_url: post.author?.avatar_url
                  })
                  return null
                })()} 
                {post.author?.avatar_url ? (
                  <img
                    src={post.author.avatar_url}
                    alt={post.author.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <img
                    src={getUserDefaultAvatarUrl(post.author?.username || 'User', post.author?.avatar_url)}
                    alt={post.author?.username || 'User'}
                    className="w-full h-full rounded-full"
                  />
                )}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-lg">
                  {post.author?.username || t('posts.card.anonymousUser')}
                </h4>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(post.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 帖子标题 */}
          <h1 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* 分类标签 */}
          {post.category && (
            <div className="flex items-center space-x-2 mb-6">
              <Tag className="w-4 h-4 text-purple-600" />
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                #{categoryDisplayName || post.category}
              </span>
            </div>
          )}

          {/* 帖子内容 */}
          <div className="mb-8">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                {post.content}
              </p>
            </div>
          </div>

          {/* 帖子媒体内容 */}
          {(() => {
            const mediaFiles = getMediaFiles(post)
            return mediaFiles.length > 0 && (
              <div className="mb-8">
                <MediaGrid mediaFiles={mediaFiles} />
              </div>
            )
          })()}

          {/* 互动按钮 */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                disabled={isLoading}
                className={cn(
                  'flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200',
                  isLiked
                    ? 'text-red-600 bg-red-50 hover:bg-red-100'
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50',
                  isLoading && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Heart className={cn('w-5 h-5', isLiked && 'fill-current')} />
                <span className="font-medium">{likesCount}</span>
              </button>

              <button
                onClick={handleComment}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">{commentsCount}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50 transition-all duration-200"
              >
                <Share2 className="w-5 h-5" />
                <span className="font-medium">{t('posts.card.share')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 评论区域 */}
        <div id="comments-section" className="mt-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {t('posts.comments.title')} ({comments.length})
              </h3>
            </div>

            {/* 评论输入框 */}
            {user ? (
              <form onSubmit={handleSubmitComment} className="mb-6">
                <div className="flex space-x-4">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    {userProfile?.avatar_url || user.user_metadata?.avatar_url ? (
                      <img
                        src={userProfile?.avatar_url || user.user_metadata?.avatar_url}
                        alt={userProfile?.username || user.user_metadata?.username || user.email}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <img
                        src={getUserDefaultAvatarUrl(userProfile?.username || user.user_metadata?.username || user.email || '')}
                        alt={userProfile?.username || user.user_metadata?.username || user.email}
                        className="w-full h-full rounded-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={t('posts.comments.placeholder')}
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-gray-700 placeholder-gray-500"
                        rows={3}
                        disabled={isSubmittingComment}
                        maxLength={500}
                      />
                      <div className="absolute bottom-3 right-3">
                        <div className="text-xs text-gray-400">
                          {newComment.length}/500
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end mt-3">
                      <button
                        type="submit"
                        disabled={!newComment.trim() || isSubmittingComment}
                        className={cn(
                          'flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all duration-300',
                          newComment.trim() && !isSubmittingComment
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        )}
                      >
                        {isSubmittingComment ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>{t('common.actions.loading')}</span>
                          </>
                        ) : (
                          <>
                            <span>{t('posts.comments.submit')}</span>
                            <Send className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-200 mb-6">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <p className="text-gray-600 mb-3">{t('posts.card.loginRequired')}</p>
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  {t('common.actions.login')}
                </button>
              </div>
            )}

            {/* 评论列表 */}
            <div className="space-y-4">
              {commentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">{t('posts.comments.noComments')}</p>
                </div>
              ) : (
                comments.map((comment, index) => (
                  <div key={comment.id} className="group">
                    <div className="flex space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          {comment.author?.avatar_url ? (
                            <img
                              src={comment.author.avatar_url}
                              alt={comment.author.username}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <img
                              src={getUserDefaultAvatarUrl(comment.author?.username || '')}
                              alt={comment.author?.username || t('posts.card.anonymousUser')}
                              className="w-full h-full rounded-full object-cover"
                            />
                          )}
                        </div>
                        {index < comments.length - 1 && (
                          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-gray-200"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-gray-900">
                                {comment.author?.username || t('posts.card.anonymousUser')}
                              </h4>
                              <span className="text-sm text-gray-500">
                                {formatDate(comment.created_at)}
                              </span>
                            </div>
                            {user && comment.author?.id === user.id && (
                              <button
                                onClick={() => handleDeleteComment(comment.id, comment.content)}
                                className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all duration-300"
                                title={t('posts.comments.delete')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
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