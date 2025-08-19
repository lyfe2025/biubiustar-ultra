import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Heart, MessageCircle, Share2, User, Calendar, Tag, Send, Trash2 } from 'lucide-react'
import { cn } from '../lib/utils'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/language'
import { socialService } from '../lib/socialService'
import type { Post, Comment } from '../types'
import { formatDistanceToNow } from 'date-fns'
import { zhCN, enUS, vi } from 'date-fns/locale'
import { toast } from 'sonner'
import AuthModal from '../components/AuthModal'
import { generateDefaultAvatarUrl, isDefaultAvatar, getUserDefaultAvatarUrl } from '../utils/avatarGenerator'

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
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-4">出错了</h2>
          <p className="text-red-600 mb-6">{error || t('posts.detail.postNotFound')}</p>
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
          onClick={() => navigate(-1)}
          className="group flex items-center bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 px-4 py-3 mb-8 hover:bg-white transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
        >
          <ArrowLeft className="w-5 h-5 mr-2 text-purple-600 group-hover:text-purple-700 transition-colors" />
          <span className="text-purple-600 group-hover:text-purple-700 font-medium transition-colors">{t('posts.detail.back')}</span>
        </button>

        {/* 帖子详情卡片 */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 shadow-lg transform hover:scale-[1.02] transition-all duration-500">
          {/* 帖子头部 */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                  {post.author?.avatar_url && !isDefaultAvatar(post.author.avatar_url) ? (
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
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">
                  {post.author?.username || t('posts.card.anonymousUser')}
                </h4>
                <div className="flex items-center space-x-2 text-sm text-purple-600 font-medium">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(post.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 帖子标题 */}
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 leading-tight">
            {post.title}
          </h1>

          {/* 分类标签 */}
          {post.category && (
            <div className="flex items-center space-x-2 mb-8">
              <Tag className="w-4 h-4 text-purple-600" />
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200 shadow-sm">
                #{categoryDisplayName || post.category}
              </span>
            </div>
          )}

          {/* 帖子内容 */}
          <div className="prose prose-lg max-w-none mb-8">
            <div className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-2xl p-6 border border-purple-100/50">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                {post.content}
              </p>
            </div>
          </div>

          {/* 帖子图片 */}
          {post.image_url && (
            <div className="mb-8">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-purple-100/50">
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full max-h-96 object-cover transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          )}

          {/* 互动按钮 */}
          <div className="flex items-center justify-between pt-8 border-t border-gradient-to-r from-purple-100 to-pink-100">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                disabled={isLoading}
                className={cn(
                  'group flex items-center space-x-2 px-6 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105 font-semibold',
                  isLiked
                    ? 'bg-gradient-to-r from-red-50 to-pink-50 text-red-600 border border-red-200 shadow-lg'
                    : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600 border border-gray-200 hover:border-red-200 shadow-md hover:shadow-lg',
                  isLoading && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Heart className={cn('w-5 h-5 transition-all duration-300', isLiked ? 'fill-current scale-110' : 'group-hover:scale-110')} />
                <span>{likesCount}</span>
              </button>

              <button
                onClick={handleComment}
                className="group flex items-center space-x-2 bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 px-6 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105 border border-gray-200 hover:border-blue-200 shadow-md hover:shadow-lg font-semibold"
              >
                <MessageCircle className="w-5 h-5 transition-all duration-300 group-hover:scale-110" />
                <span>{commentsCount}</span>
              </button>

              <button
                onClick={handleShare}
                className="group flex items-center space-x-2 bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-600 px-6 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105 border border-gray-200 hover:border-green-200 shadow-md hover:shadow-lg font-semibold"
              >
                <Share2 className="w-5 h-5 transition-all duration-300 group-hover:scale-110" />
                <span>{t('posts.card.share')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 评论区域 */}
        <div id="comments-section" className="mt-12">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 md:p-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t('posts.comments.title')} ({comments.length})
              </h3>
            </div>

            {/* 评论输入框 */}
            {user ? (
              <form onSubmit={handleSubmitComment} className="mb-8">
                <div className="flex space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    {user.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt={user.user_metadata?.username || user.email}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={t('posts.comments.placeholder')}
                        className="w-full p-6 bg-gradient-to-r from-purple-50/50 to-pink-50/50 border border-purple-200/50 rounded-2xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-gray-700 placeholder-gray-500"
                        rows={4}
                        disabled={isSubmittingComment}
                        maxLength={500}
                      />
                      <div className="absolute bottom-4 right-4">
                        <div className="text-xs text-gray-400">
                          {newComment.length}/500
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <button
                        type="submit"
                        disabled={!newComment.trim() || isSubmittingComment}
                        className={cn(
                          'group flex items-center space-x-2 px-8 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl',
                          newComment.trim() && !isSubmittingComment
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
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
                            <Send className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="text-center py-8 bg-gradient-to-r from-purple-50/80 to-pink-50/80 rounded-2xl border border-purple-200/50 mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-600 mb-4 text-lg">{t('posts.card.loginRequired')}</p>
                <button
                  onClick={() => openAuthModal('login')}
                  className="group px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
                >
                  <div className="flex items-center space-x-2">
                    <span>{t('common.actions.login')}</span>
                    <ArrowLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform rotate-180" />
                  </div>
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
              <div className="text-center py-12 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-2xl border border-purple-100/50">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-10 h-10 text-purple-400" />
                </div>
                <p className="text-gray-500 text-lg">{t('posts.comments.noComments')}</p>
              </div>
            ) : (
              comments.map((comment, index) => (
                <div key={comment.id} className="group">
                  <div className="flex space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                        {comment.author?.avatar_url ? (
                          <img
                            src={comment.author.avatar_url}
                            alt={comment.author.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-white" />
                        )}
                      </div>
                      {index < comments.length - 1 && (
                        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-purple-200 to-transparent"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100/50 group-hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-bold text-gray-900">
                              {comment.author?.username || t('posts.card.anonymousUser')}
                            </h4>
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            <span className="text-sm text-purple-600 font-medium">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          {user && comment.author?.id === user.id && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="group/delete p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100"
                              title={t('posts.comments.delete')}
                            >
                              <Trash2 className="w-4 h-4 group-hover/delete:scale-110 transition-transform" />
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
    </div>
  )
}

export default PostDetail