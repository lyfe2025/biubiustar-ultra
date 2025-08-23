import { Heart, MessageCircle, Share2 } from 'lucide-react'
import { cn } from '../../lib/utils'
import { toast } from 'sonner'
import type { Post } from '../../types'

interface PostActionsProps {
  post: Post
  isLiked: boolean
  likesCount: number
  commentsCount: number
  isLoading: boolean
  onLike: () => void
  onComment: () => void
  t: (key: string) => string
}

const PostActions = ({ 
  post, 
  isLiked, 
  likesCount, 
  commentsCount, 
  isLoading, 
  onLike, 
  onComment, 
  t 
}: PostActionsProps) => {
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

  return (
    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
      <div className="flex items-center space-x-4">
        <button
          onClick={onLike}
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
          onClick={onComment}
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
  )
}

export default PostActions
