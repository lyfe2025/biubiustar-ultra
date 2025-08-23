import { Calendar, Tag } from 'lucide-react'
import { getUserDefaultAvatarUrl } from '../../utils/avatarGenerator'
import { formatDistanceToNow } from 'date-fns'
import { zhCN, enUS, vi } from 'date-fns/locale'
import type { Post, ContentCategory } from '../../types'

interface PostHeaderProps {
  post: Post
  categoryDisplayName: string
  language: string
  t: (key: string) => string
}

const PostHeader = ({ post, categoryDisplayName, language, t }: PostHeaderProps) => {
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

  return (
    <>
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
    </>
  )
}

export default PostHeader
