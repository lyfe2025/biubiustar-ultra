import React from 'react'
import { FileText, Heart, MessageCircle, Trash2, Calendar, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { useLanguage } from '../../contexts/language'
import { UserPostsListProps } from './types'

const UserPostsList: React.FC<UserPostsListProps> = ({ 
  posts, 
  isLoading, 
  onDeletePost,
  onLikePost 
}) => {
  const { t } = useLanguage()

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="animate-pulse border-b border-gray-200 pb-4">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="flex space-x-4">
                <div className="h-3 bg-gray-300 rounded w-16"></div>
                <div className="h-3 bg-gray-300 rounded w-16"></div>
                <div className="h-3 bg-gray-300 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('profile.noPosts')}</h3>
          <p className="text-gray-500">{t('profile.createFirstPost')}</p>
        </div>
      </div>
    )
  }

  const handleDeleteClick = (postId: string) => {
    if (window.confirm(t('profile.confirmDeletePost'))) {
      onDeletePost(postId)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP')
    } catch {
      return dateString
    }
  }

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content
    return content.slice(0, maxLength) + '...'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('profile.myPosts')}</h3>
      
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
            {/* 帖子标题 */}
            <div className="flex items-start justify-between mb-3">
              <h4 className="text-lg font-medium text-gray-900 flex-1">
                {post.title || t('profile.untitledPost')}
              </h4>
              <button
                onClick={() => handleDeleteClick(post.id)}
                className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                title={t('profile.deletePost')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* 帖子内容 */}
            <div className="text-gray-700 mb-4">
              <p className="whitespace-pre-wrap">
                {truncateContent(post.content || '')}
              </p>
            </div>

            {/* 帖子媒体 */}
            {post.image_url && (
              <div className="mb-4">
                <img
                  src={post.image_url}
                  alt="Post image"
                  className="max-w-full h-auto rounded-lg border border-gray-200"
                  style={{ maxHeight: '300px' }}
                />
              </div>
            )}

            {/* 帖子统计和操作 */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => onLikePost(post.id)}
                  className="flex items-center space-x-1 hover:text-red-600 transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  <span>{post.likes_count || 0}</span>
                </button>

                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.comments_count || 0}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{post.likes_count || 0}</span>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.created_at)}</span>
              </div>
            </div>

            {/* 帖子状态 */}
            {post.status && (
              <div className="mt-3">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  post.status === 'published' ? 'bg-green-100 text-green-800' :
                  post.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  post.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {t(`profile.postStatus.${post.status}`)}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default UserPostsList
