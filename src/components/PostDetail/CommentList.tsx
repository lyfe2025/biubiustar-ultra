import { MessageCircle, Trash2 } from 'lucide-react'
import { getUserDefaultAvatarUrl } from '../../utils/avatarGenerator'
import { formatDistanceToNow } from 'date-fns'
import { zhCN, enUS, vi } from 'date-fns/locale'
import type { Comment, User } from '../../types'

interface CommentListProps {
  comments: Comment[]
  commentsLoading: boolean
  user: User | null
  language: string
  onDeleteComment: (commentId: string, commentContent: string) => void
  t: (key: string) => string
}

const CommentList = ({ 
  comments, 
  commentsLoading, 
  user, 
  language, 
  onDeleteComment, 
  t 
}: CommentListProps) => {
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

  if (commentsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
          <MessageCircle className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500">{t('posts.comments.noComments')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment, index) => (
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
                      onClick={() => onDeleteComment(comment.id, comment.content)}
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
      ))}
    </div>
  )
}

export default CommentList
