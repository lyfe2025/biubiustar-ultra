import React from 'react'
import { 
  Eye, 
  Check, 
  X, 
  Clock, 
  Image,
  Video,
  FileText,
  Calendar,
  User,
  Heart,
  MessageSquare,
  Trash2,
  Play
} from 'lucide-react'
// import { cn } from '../../../lib/utils'
import { useLanguage } from '../../../contexts/language'
import { ContentListProps, Post } from './types'
import { generateDefaultAvatarUrl, isDefaultAvatar, getUserDefaultAvatarUrl } from '../../../utils/avatarGenerator'
import MediaGrid from '../../../components/MediaGrid'
import type { MediaFile } from '../../../types'

const ContentList: React.FC<ContentListProps> = ({
  posts,
  loading,
  onView,
  onUpdateStatus,
  onDelete
}) => {
  const { t } = useLanguage()

  const getStatusBadge = (status: Post['status']) => {
    const configs = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: t('admin.content.status.pending') },
      published: { color: 'bg-green-100 text-green-800', icon: Check, text: t('admin.content.status.published') },
      rejected: { color: 'bg-red-100 text-red-800', icon: X, text: t('admin.content.status.rejected') },
      draft: { color: 'bg-gray-100 text-gray-800', icon: FileText, text: t('admin.content.status.draft') }
    }
    const config = configs[status]
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    )
  }

  const getContentTypeIcon = (post: Post) => {
    const mediaFiles = getMediaFiles(post)
    if (mediaFiles.length === 0) return <FileText className="w-4 h-4 text-gray-500" />
    
    const hasVideo = mediaFiles.some(file => file.file_type === 'video')
    const hasImage = mediaFiles.some(file => file.file_type === 'image')
    
    if (hasVideo && hasImage) {
      return (
        <div className="flex space-x-1">
          <Image className="w-3 h-3 text-green-500" />
          <Video className="w-3 h-3 text-blue-500" />
        </div>
      )
    }
    if (hasVideo) return <Video className="w-4 h-4 text-blue-500" />
    if (hasImage) return <Image className="w-4 h-4 text-green-500" />
    return <FileText className="w-4 h-4 text-gray-500" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  const getMediaFiles = (post: Post): MediaFile[] => {
    // 优先使用新的 media_files 数据
    if (post.media_files && post.media_files.length > 0) {
      return post.media_files.sort((a, b) => a.display_order - b.display_order)
    }
    
    // 向后兼容：转换旧的 image_url 和 video 字段
    const mediaFiles: MediaFile[] = []
    
    if (post.image_url) {
      mediaFiles.push({
        id: `legacy-image-${post.id}`,
        post_id: post.id,
        file_url: post.image_url,
        file_type: 'image',
        thumbnail_url: null,
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
        thumbnail_url: post.thumbnail || null,
        display_order: post.image_url ? 1 : 0,
        created_at: post.created_at
      })
    }
    
    return mediaFiles
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">{t('admin.content.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.content.table.content')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.content.table.author')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.content.table.status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.content.table.stats')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.content.table.date')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.content.table.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getContentTypeIcon(post)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {truncateText(post.title, 50)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {truncateText(post.content, 80)}
                      </div>
                      {(() => {
                        const mediaFiles = getMediaFiles(post)
                        return mediaFiles.length > 0 && (
                          <div className="mt-2">
                            <MediaGrid 
                              mediaFiles={mediaFiles} 
                              maxItems={3}
                              className="max-w-[200px]"
                              itemClassName="h-16"
                            />
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    {post.author.avatar_url && !isDefaultAvatar(post.author.avatar_url) ? (
                          <img className="h-8 w-8 rounded-full object-cover" src={post.author.avatar_url} alt="" />
                    ) : (
                      <img 
                        className="h-8 w-8 rounded-full" 
                        src={getUserDefaultAvatarUrl(post.author.username, post.author.avatar_url)} 
                        alt="" 
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{post.author.username}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(post.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1">
                      <Heart className="h-3 w-3 text-red-500" />
                      <span>{post.likes_count}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="h-3 w-3 text-blue-500" />
                      <span>{post.comments_count}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3 text-green-500" />
                      <span>{post.views_count}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                  {post.updated_at !== post.created_at && (
                    <div className="text-xs mt-1">
                      更新: {formatDate(post.updated_at)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    {/* 查看详情 */}
                    <button
                      onClick={() => onView(post)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded"
                      title={t('admin.content.actions.view')}
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* 状态操作 */}
                    {post.status === 'pending' && (
                      <>
                        <button
                          onClick={() => onUpdateStatus(post.id, 'published')}
                          className="text-green-600 hover:text-green-800 p-1 rounded"
                          title={t('admin.content.actions.approve')}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onUpdateStatus(post.id, 'rejected')}
                          className="text-red-600 hover:text-red-800 p-1 rounded"
                          title={t('admin.content.actions.reject')}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {post.status === 'rejected' && (
                      <button
                        onClick={() => onUpdateStatus(post.id, 'published')}
                        className="text-green-600 hover:text-green-800 p-1 rounded"
                        title={t('admin.content.actions.approve')}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}

                    {post.status === 'published' && (
                      <button
                        onClick={() => onUpdateStatus(post.id, 'rejected')}
                        className="text-red-600 hover:text-red-800 p-1 rounded"
                        title={t('admin.content.actions.reject')}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    {/* 删除 */}
                    <button
                      onClick={() => onDelete(post)}
                      className="text-red-600 hover:text-red-800 p-1 rounded"
                      title={t('admin.content.actions.delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {posts.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t('admin.content.noContent')}</h3>
          <p className="mt-1 text-sm text-gray-500">{t('admin.content.noContentDesc')}</p>
        </div>
      )}
    </div>
  )
}

export default ContentList
