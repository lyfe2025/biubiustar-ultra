import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, MessageCircle, Share2, MoreHorizontal, User, Flag, Bookmark, Copy, Trash2, Play } from 'lucide-react'
import { cn } from '../lib/utils'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/language'
import { socialService } from '../lib/socialService'
import type { Post, MediaFile } from '../types'
import { formatDistanceToNow } from 'date-fns'
import { zhCN, enUS, vi } from 'date-fns/locale'
import { toast } from 'sonner'
import { generateDefaultAvatarUrl, isDefaultAvatar, getUserDefaultAvatarUrl } from '../utils/avatarGenerator'
import MediaGrid from './MediaGrid'

interface PostCardProps {
  post: Post
  onLike?: (postId: string) => void
  onComment?: (postId: string) => void
  onShare?: (postId: string) => void
  showFullContent?: boolean // 是否显示完整内容，默认false（截断显示）
  maxContentLength?: number // 最大内容长度，默认150字符
}

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

const PostCard = ({ post, onLike, onComment, onShare, showFullContent = false, maxContentLength = 150 }: PostCardProps) => {
  const { user } = useAuth()
  const { language, t } = useLanguage()
  const navigate = useNavigate()

  // 获取媒体文件数据，支持新的media_files和向后兼容旧的image_url/video字段
  const getMediaFiles = (): MediaFile[] => {
    const mediaFiles: MediaFile[] = []
    
    // 优先使用新的media_files数据
    if (post.media_files && post.media_files.length > 0) {
      return post.media_files.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    }
    
    // 向后兼容：处理旧的image_url字段
    if (post.image_url) {
      mediaFiles.push({
        id: `legacy-image-${post.id}`,
        post_id: post.id,
        file_url: post.image_url,
        file_type: 'image',
        display_order: 0,
        created_at: post.created_at
      })
    }
    
    // 向后兼容：处理旧的video字段
    if (post.video) {
      mediaFiles.push({
        id: `legacy-video-${post.id}`,
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
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes_count || 0)
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0)
  // const [showShareMenu, setShowShareMenu] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sharesCount, setSharesCount] = useState(post.shares_count || 0)
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [categories, setCategories] = useState<ContentCategory[]>([])
  const [categoryDisplayName, setCategoryDisplayName] = useState<string>('')

  // 获取真实的评论数量
  const fetchCommentsCount = async () => {
    try {
      const count = await socialService.getPostCommentsCount(post.id)
      setCommentsCount(count)
    } catch (error) {
      console.error('获取评论数量失败:', error)
    }
  }

  // 获取分类数据
  const fetchCategories = async () => {
    try {
      console.log(`PostCard: 正在获取分类数据，当前语言: ${language}`)
      const categoriesData = await socialService.getContentCategories(language)
      console.log('PostCard: 获取到的分类数据:', categoriesData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('PostCard: 获取分类失败:', error)
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

  const moreMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      checkIfLiked()
    }
    // 获取真实的评论数量
    fetchCommentsCount()
    // 获取分类数据
    fetchCategories()
  }, [user, post.id])

  // 当分类数据或语言变化时，更新分类显示名称
  useEffect(() => {
    if (categories.length > 0 && post.category) {
      if (post.category === 'general') {
        setCategoryDisplayName(t('posts.create.generalCategory'))
      } else {
        // 查找匹配的分类
        const category = categories.find(cat => cat.id === post.category)
        if (category) {
          // 根据当前语言获取分类名称
          const categoryName = getCategoryName(category)
          console.log(`找到分类: ${post.category} -> ${categoryName} (语言: ${language})`)
          setCategoryDisplayName(categoryName)
        } else {
          // 如果找不到分类，显示原始值（可能是 UUID 或其他标识符）
          console.warn(`未找到分类 ID: ${post.category}，可用分类:`, categories.map(c => ({ id: c.id, name: getCategoryName(c) })))
          setCategoryDisplayName(post.category)
        }
      }
    } else if (post.category) {
      setCategoryDisplayName(post.category === 'general' ? t('posts.create.generalCategory') : post.category)
    }
  }, [categories, post.category, language, t])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const checkIfLiked = async () => {
    if (!user) return
    try {
      const liked = await socialService.isPostLiked(post.id, user.id)
      setIsLiked(liked)
    } catch (error) {
      console.error('检查点赞状态失败:', error)
    }
  }

  const handleLike = async () => {
    if (!user) {
      toast.error(t('posts.card.loginRequired'))
      return
    }

    if (isLoading) return
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
      onLike?.(post.id)
    } catch (error) {
      console.error('点赞失败:', error)
      toast.error(t('common.messages.error'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleComment = () => {
    onComment?.(post.id)
  }

  const handleShare = async () => {
    try {
      // 调用分享功能（纯前端操作）
      await socialService.sharePost(post.id);
      
      // 更新本地分享数量
      setSharesCount(prev => prev + 1);
      
      // 显示分享选项
      setShowShareOptions(!showShareOptions);
      
      // 显示成功提示
      toast.success(t('posts.card.shareSuccess'));
      
      // 调用父组件回调
      if (onShare) {
        onShare(post.id);
      }
    } catch (error) {
      console.error('分享失败:', error);
      toast.error('分享失败，请重试');
    }
  }

  const handleMoreClick = () => {
    setShowMoreMenu(!showMoreMenu)
  }

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${post.id}`
    navigator.clipboard.writeText(postUrl)
    toast.success(t('posts.card.copySuccess'))
    setShowMoreMenu(false)
  }

  const handleBookmark = () => {
    // TODO: 实现收藏功能
    toast.info(t('posts.card.bookmarkComingSoon'))
    setShowMoreMenu(false)
  }

  const handleReport = () => {
    // TODO: 实现举报功能
    toast.info(t('posts.card.reportComingSoon'))
    setShowMoreMenu(false)
  }

  const handleDelete = async () => {
    if (!user || user.id !== post.author?.id) {
      toast.error(t('posts.card.onlyDeleteOwn'))
      return
    }

    try {
      await socialService.deletePost(post.id)
      toast.success(t('posts.card.deleteSuccess'))
      // TODO: 刷新帖子列表
    } catch (error) {
      console.error('删除帖子失败:', error)
      toast.error(t('posts.card.deleteFailed'))
    }
    setShowMoreMenu(false)
    setShowDeleteConfirm(false)
  }

  const formatDate = (dateString: string) => {
    try {
      // 根据当前语言选择对应的 locale
      let locale
      switch (language) {
        case 'zh':
          locale = zhCN
          break
        case 'zh-TW':
          locale = zhCN // 繁体中文使用相同的 locale
          break
        case 'en':
          locale = enUS
          break
        case 'vi':
          locale = vi
          break
        default:
          locale = zhCN
      }

      const result = formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: locale
      })

      // 如果当前语言不是英文，需要手动翻译后缀
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

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-purple-100 p-6 hover:shadow-lg transition-all duration-300">
      {/* 帖子头部 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
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
          <div>
            <h4 className="font-medium text-gray-900">
              {post.author?.username || t('posts.card.anonymousUser')}
            </h4>
            <p className="text-sm text-gray-500">
              {formatDate(post.created_at)}
            </p>
          </div>
        </div>
        <div className="relative" ref={moreMenuRef}>
          <button 
            onClick={handleMoreClick}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </button>
          
          {showMoreMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <button
                onClick={handleCopyLink}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>{t('posts.card.copyLink')}</span>
              </button>
              
              <button
                onClick={handleBookmark}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <Bookmark className="w-4 h-4" />
                <span>{t('posts.card.bookmark')}</span>
              </button>
              
              {user && user.id === post.author?.id && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t('posts.card.delete')}</span>
                </button>
              )}
              
              {user && user.id !== post.author?.id && (
                <button
                  onClick={handleReport}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Flag className="w-4 h-4" />
                  <span>{t('posts.card.report')}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 帖子内容 */}
      <div className="mb-4">
        <h3 
          className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-purple-600 transition-colors duration-200"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/post/${post.id}`)
          }}
        >
          {post.title}
        </h3>
        <div className="text-gray-700 leading-relaxed">
          {showFullContent || post.content.length <= maxContentLength ? (
            <p>{post.content}</p>
          ) : (
            <div>
              <p>{post.content.slice(0, maxContentLength)}...</p>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/post/${post.id}`)
                }}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium mt-2 transition-colors duration-200"
              >
                {t('posts.card.readMore')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 媒体文件展示 */}
      {getMediaFiles().length > 0 && (
        <div className="mb-4">
          <MediaGrid 
            mediaFiles={getMediaFiles()}
            className="rounded-lg"
            showPreview={true}
            maxItems={9}
          />
        </div>
      )}

      {/* 分类 */}
      {post.category && (
        <div className="flex flex-wrap gap-1 mt-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            #{categoryDisplayName || post.category}
          </span>
        </div>
      )}

      {/* 标签 */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {post.tags.map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 互动按钮 */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleLike}
            disabled={isLoading}
            className={cn(
              'flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200',
              isLiked
                ? 'text-red-600 bg-red-50 hover:bg-red-100'
                : 'text-gray-600 hover:text-red-600 hover:bg-red-50',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
            <span className="text-sm font-medium">{likesCount}</span>
          </button>

          <button
            onClick={handleComment}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{commentsCount}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50 transition-all duration-200"
          >
            <Share2 className="w-4 h-4" />
            <span className="text-sm font-medium">{t('posts.card.share')}</span>
          </button>
        </div>
      </div>

      {/* 删除确认对话框 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div 
            className="absolute inset-0"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 relative z-10">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('posts.card.delete')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('posts.card.deleteConfirm')}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                {t('posts.card.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PostCard