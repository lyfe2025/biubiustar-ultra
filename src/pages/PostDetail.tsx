import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, MessageCircle, Share2, User, Calendar, Tag, Send, Trash2 } from 'lucide-react'
import { cn } from '../lib/utils'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/language'
import { socialService } from '../lib/socialService'
import type { Post, Comment } from '../types'
import { formatDistanceToNow } from 'date-fns'
import { zhCN, enUS, vi } from 'date-fns/locale'
import { toast } from 'sonner'
import AuthModal from '../components/AuthModal'

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
  const { user } = useAuth()
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
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalType, setAuthModalType] = useState<'login' | 'register'>('login')

  // 获取帖子详情
  const fetchPost = async () => {
    if (!id) {
      setError(t('posts.detail.postIdMissing'))
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const postData = await socialService.getPost(id)
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
      const response = await fetch('/api/categories/content')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('获取分类失败:', error)
    }
  }

  // 根据当前语言获取分类名称
  const getCategoryName = (category: ContentCategory): string => {
    switch (language) {
      case 'zh':
        return category.name_zh || category.name
      case 'zh-TW':
        return category.name_zh_tw || category.name
      case 'en':
        return category.name_en || category.name
      case 'vi':
        return category.name_vi || category.name
      default:
        return category.name
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
      await socialService.likePost(post.id, user.id)
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
  const handleDeleteComment = async (commentId: string) => {
    if (!user) return
    if (!window.confirm(t('posts.detail.deleteConfirm'))) return

    try {
      await socialService.deleteComment(commentId, user.id)
      setComments(prev => prev.filter(comment => comment.id !== commentId))
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
      await socialService.sharePost(post.id)
      setSharesCount(prev => prev + 1)
      
      // 复制链接到剪贴板
      const postUrl = `${window.location.origin}/post/${post.id}`
      await navigator.clipboard.writeText(postUrl)
      
      toast.success(t('posts.card.shareSuccess'))
    } catch (error) {
      console.error('分享失败:', error)
      toast.error(t('posts.detail.shareError'))
    }
  }

  useEffect(() => {
    fetchPost()
    fetchCategories()
    fetchComments()
  }, [id])

  // 当分类数据或语言变化时，更新分类显示名称
  useEffect(() => {
    if (categories.length > 0 && post?.category) {
      if (post.category === 'general') {
        setCategoryDisplayName(t('posts.create.generalCategory'))
      } else {
        const category = categories.find(cat => cat.id === post.category)
        if (category) {
          setCategoryDisplayName(getCategoryName(category))
        } else {
          setCategoryDisplayName(post.category)
        }
      }
    } else if (post?.category) {
      setCategoryDisplayName(post.category === 'general' ? t('posts.create.generalCategory') : post.category)
    }
  }, [categories, post?.category, language])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('posts.detail.loading')}</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || t('posts.detail.postNotFound')}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {t('posts.detail.back')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 返回按钮 */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('posts.detail.back')}</span>
        </button>

        {/* 帖子详情卡片 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-purple-100 p-8 shadow-lg">
          {/* 帖子头部 */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                {post.author?.avatar_url ? (
                  <img
                    src={post.author.avatar_url}
                    alt={post.author.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-white" />
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {post.title}
          </h1>

          {/* 分类标签 */}
          {post.category && (
            <div className="flex items-center space-x-2 mb-6">
              <Tag className="w-4 h-4 text-blue-600" />
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                #{categoryDisplayName || post.category}
              </span>
            </div>
          )}

          {/* 帖子内容 */}
          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* 帖子图片 */}
          {post.image_url && (
            <div className="mb-8">
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full max-h-96 object-cover rounded-lg shadow-md"
              />
            </div>
          )}

          {/* 互动按钮 */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-8">
              <button
                onClick={handleLike}
                disabled={isLoading}
                className={cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium',
                  isLiked
                    ? 'text-red-600 bg-red-50 hover:bg-red-100'
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50',
                  isLoading && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Heart className={cn('w-5 h-5', isLiked && 'fill-current')} />
                <span>{likesCount}</span>
              </button>

              <button
                onClick={handleComment}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{commentsCount}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50 transition-all duration-200 font-medium"
              >
                <Share2 className="w-5 h-5" />
                <span>{t('posts.card.share')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 评论区域 */}
        <div id="comments-section" className="mt-12 border-t border-gray-100 pt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {t('posts.comments.title')} ({comments.length})
            </h3>
          </div>

          {/* 评论输入框 */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="mb-8">
              <div className="flex space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt={user.user_metadata?.username || user.email}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={t('posts.comments.placeholder')}
                    className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    rows={3}
                    disabled={isSubmittingComment}
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      type="submit"
                      disabled={!newComment.trim() || isSubmittingComment}
                      className={cn(
                        'flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all duration-200',
                        newComment.trim() && !isSubmittingComment
                          ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      )}
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmittingComment ? t('common.actions.loading') : t('posts.comments.submit')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl mb-8">
              <p className="text-gray-500 mb-4">{t('posts.card.loginRequired')}</p>
              <button
                onClick={() => openAuthModal('login')}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {t('common.actions.login')}
              </button>
            </div>
          )}

          {/* 评论列表 */}
          <div className="space-y-6">
            {commentsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">{t('posts.comments.noComments')}</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    {comment.author?.avatar_url ? (
                      <img
                        src={comment.author.avatar_url}
                        alt={comment.author.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">
                          {comment.author?.username || t('posts.card.anonymousUser')}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {formatDate(comment.created_at)}
                          </span>
                          {user && comment.author?.id === user.id && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="p-1 hover:bg-red-100 rounded text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        type={authModalType}
      />
    </div>
  )
}

export default PostDetail