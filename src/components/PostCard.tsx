import { useState, useEffect, useRef } from 'react'
import { Heart, MessageCircle, Share2, MoreHorizontal, User, Flag, Bookmark, Copy, Trash2 } from 'lucide-react'
import { cn } from '../lib/utils'
import { useAuth } from '../contexts/AuthContext'
import { socialService } from '../lib/socialService'
import type { Post } from '../types'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface PostCardProps {
  post: Post
  onLike?: (postId: string) => void
  onComment?: (postId: string) => void
  onShare?: (postId: string) => void
}

const PostCard = ({ post, onLike, onComment, onShare }: PostCardProps) => {
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes_count || 0)
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sharesCount, setSharesCount] = useState(post.shares_count || 0)
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  // 获取真实的评论数量
  const fetchCommentsCount = async () => {
    try {
      const count = await socialService.getPostCommentsCount(post.id)
      setCommentsCount(count)
    } catch (error) {
      console.error('获取评论数量失败:', error)
    }
  }
  const moreMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      checkIfLiked()
    }
    // 获取真实的评论数量
    fetchCommentsCount()
  }, [user, post.id])

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
      alert('请先登录')
      return
    }

    if (isLoading) return
    setIsLoading(true)

    try {
      await socialService.likePost(post.id, user.id)
      const newIsLiked = !isLiked
      setIsLiked(newIsLiked)
      setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1)
      onLike?.(post.id)
    } catch (error) {
      console.error('点赞失败:', error)
      alert('操作失败，请重试')
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
      alert('分享成功！');
      
      // 调用父组件回调
      if (onShare) {
        onShare(post.id);
      }
    } catch (error) {
      console.error('分享失败:', error);
      alert('分享失败，请重试');
    }
  }

  const handleMoreClick = () => {
    setShowMoreMenu(!showMoreMenu)
  }

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${post.id}`
    navigator.clipboard.writeText(postUrl)
    alert('帖子链接已复制到剪贴板')
    setShowMoreMenu(false)
  }

  const handleBookmark = () => {
    // TODO: 实现收藏功能
    alert('收藏功能开发中')
    setShowMoreMenu(false)
  }

  const handleReport = () => {
    // TODO: 实现举报功能
    alert('举报功能开发中')
    setShowMoreMenu(false)
  }

  const handleDelete = async () => {
    if (!user || user.id !== post.author?.id) {
      alert('只能删除自己的帖子')
      return
    }

    if (confirm('确定要删除这个帖子吗？')) {
      try {
        await socialService.deletePost(post.id)
        alert('帖子已删除')
        // TODO: 刷新帖子列表
      } catch (error) {
        console.error('删除帖子失败:', error)
        alert('删除失败，请重试')
      }
    }
    setShowMoreMenu(false)
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: zhCN
      })
    } catch {
      return '刚刚'
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-purple-100 p-6 hover:shadow-lg transition-all duration-300">
      {/* 帖子头部 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            {post.author?.avatar_url ? (
              <img
                src={post.author.avatar_url}
                alt={post.author.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">
              {post.author?.username || '匿名用户'}
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
                <span>复制链接</span>
              </button>
              
              <button
                onClick={handleBookmark}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <Bookmark className="w-4 h-4" />
                <span>收藏</span>
              </button>
              
              {user && user.id === post.author?.id && (
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>删除</span>
                </button>
              )}
              
              {user && user.id !== post.author?.id && (
                <button
                  onClick={handleReport}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Flag className="w-4 h-4" />
                  <span>举报</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 帖子内容 */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {post.title}
        </h3>
        <p className="text-gray-700 leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* 帖子图片 */}
      {post.image_url && (
        <div className="mb-4">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
      )}

      {/* 分类 */}
      {post.category && (
        <div className="flex flex-wrap gap-1 mt-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            #{post.category}
          </span>
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
            <span className="text-sm font-medium">分享</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default PostCard