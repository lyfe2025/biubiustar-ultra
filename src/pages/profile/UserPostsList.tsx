import React, { useState } from 'react'
import { FileText, Heart, MessageCircle, Trash2, Calendar, Eye, Play } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { formatDateByLanguage } from '../../utils/dateFormatter'
import { useLanguage } from '../../contexts/language'
import { UserPostsListProps } from './types'
import { toast } from 'sonner'
import MediaGrid from '../../components/MediaGrid'
import type { MediaFile } from '../../types'

const UserPostsList: React.FC<UserPostsListProps> = ({ 
  posts, 
  isLoading, 
  onDeletePost,
  onLikePost 
}) => {
  const { t } = useLanguage()
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const location = useLocation()

  // 获取当前标签页信息
  const getCurrentTab = () => {
    const pathname = location.pathname
    if (pathname.includes('/profile')) {
      // 从 URL 参数或状态中获取当前标签页
      const searchParams = new URLSearchParams(location.search)
      const tab = searchParams.get('tab') || 'overview'
      return `/profile?tab=${tab}`
    }
    return '/profile'
  }

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
    setPendingDeleteId(postId)
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDateByLanguage(dateString, 'PPP', t('common.language'))
    } catch {
      return dateString
    }
  }

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content
    return content.slice(0, maxLength) + '...'
  }

  // 获取媒体文件数据，支持新的media_files和向后兼容旧的image_url/video字段
  const getMediaFiles = (post: any): MediaFile[] => {
    const mediaFiles: MediaFile[] = []
    
    // 优先使用新的media_files数据
    if (post.media_files && Array.isArray(post.media_files) && post.media_files.length > 0) {
      return post.media_files.sort((a: MediaFile, b: MediaFile) => (a.display_order || 0) - (b.display_order || 0))
    }
    
    // 向后兼容：转换旧的image_url和video字段
    if (post.image_url) {
      mediaFiles.push({
        id: `legacy-image-${post.id}`,
        post_id: post.id,
        file_url: post.image_url,
        file_type: 'image',
        thumbnail_url: post.image_url,
        display_order: 0,
        created_at: post.created_at
      })
    }
    
    if (post.video) {
      mediaFiles.push({
        id: `legacy-video-${post.id}`,
        post_id: post.id,
        file_url: post.video,
        file_type: 'video',
        thumbnail_url: post.thumbnail || post.video,
        display_order: post.image_url ? 1 : 0,
        created_at: post.created_at
      })
    }
    
    return mediaFiles
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('profile.myPosts')}</h3>
      
      <div className="space-y-6">
        {posts.map((post) => {
          const currentTab = getCurrentTab()
          
          return (
            <div key={post.id} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
              {/* 帖子标题 */}
              <div className="flex items-start justify-between mb-3">
                <Link 
                  to={`/post/${post.id}`}
                  state={{ from: currentTab }}
                  className="text-lg font-medium text-gray-900 flex-1 hover:text-purple-600 transition-colors"
                >
                  {post.title || t('profile.untitledPost')}
                </Link>
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
              {(() => {
                const mediaFiles = getMediaFiles(post)
                return mediaFiles.length > 0 ? (
                  <div className="mb-4">
                    <MediaGrid mediaFiles={mediaFiles} maxItems={9} />
                  </div>
                ) : null
              })()}

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
                    <span>{post.views_count || 0}</span>
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
          )
        })}
      </div>

      {/* 删除确认 */}
      {pendingDeleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('common.delete')}</h3>
            <p className="text-gray-600 mb-6">{t('profile.confirmDeletePost')}</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setPendingDeleteId(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => {
                  onDeletePost(pendingDeleteId)
                  setPendingDeleteId(null)
                  toast.success(t('posts.card.deleteSuccess'))
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                {t('common.delete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserPostsList
