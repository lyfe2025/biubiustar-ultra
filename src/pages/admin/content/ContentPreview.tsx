import React from 'react'
import { X, Check, Trash2, Calendar, User, Heart, MessageSquare, Eye, Image, Video } from 'lucide-react'
import { useLanguage } from '../../../contexts/language'
import { ContentPreviewProps, Post } from './types'
import { generateDefaultAvatarUrl, isDefaultAvatar, getUserDefaultAvatarUrl } from '../../../utils/avatarGenerator'
import MediaGrid from '../../../components/MediaGrid'
import type { MediaFile } from '../../../types'

const ContentPreview: React.FC<ContentPreviewProps> = ({
  post,
  isOpen,
  onClose,
  onUpdateStatus,
  onDelete
}) => {
  const { t } = useLanguage()

  if (!isOpen || !post) return null

  // 获取媒体文件数据，支持新的media_files和向后兼容旧的image_url/video字段
  const getMediaFiles = (post: Post): MediaFile[] => {
    // 优先使用新的 media_files 数据
    if (post.media_files && post.media_files.length > 0) {
      return post.media_files.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    }
    
    // 向后兼容：将旧的 image_url 和 video 转换为 MediaFile 格式
    const mediaFiles: MediaFile[] = []
    
    if (post.image_url) {
      mediaFiles.push({
        id: 'legacy-image',
        post_id: post.id,
        file_url: post.image_url,
        file_type: 'image',
        display_order: 0,
        created_at: post.created_at
      })
    }
    
    if (post.video) {
      mediaFiles.push({
        id: 'legacy-video',
        post_id: post.id,
        file_url: post.video,
        file_type: 'video',
        thumbnail_url: post.image_url, // 使用image_url作为视频缩略图
        display_order: post.image_url ? 1 : 0,
        created_at: post.created_at
      })
    }
    
    return mediaFiles
  }

  const getStatusColor = (status: Post['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'published': return 'text-green-600 bg-green-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      case 'draft': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{t('admin.content.previewContent')}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-6">
          {/* 标题和状态 */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{post.title}</h1>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(post.status)}`}>
                  {t(`admin.content.status.${post.status}`)}
                </span>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(post.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 作者信息 */}
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            {post.author.avatar_url ? (
              <img className="h-12 w-12 rounded-full object-cover" src={post.author.avatar_url} alt="" />
            ) : (
              <img 
                className="h-12 w-12 rounded-full" 
                src={getUserDefaultAvatarUrl(post.author.username, post.author.avatar_url)} 
                alt="" 
              />
            )}
            <div>
              <div className="text-sm font-medium text-gray-900">{post.author.username}</div>
              <div className="text-sm text-gray-500">{t('admin.content.author')}</div>
            </div>
          </div>

          {/* 媒体内容 */}
          {(() => {
            const mediaFiles = getMediaFiles(post)
            return mediaFiles.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                  <Image className="w-4 h-4" />
                  <span>{t('admin.content.mediaFiles')} ({mediaFiles.length})</span>
                </h4>
                <MediaGrid 
                   mediaFiles={mediaFiles}
                   className="rounded-lg"
                 />
              </div>
            )
          })()}

          {/* 正文内容 */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">{t('admin.content.content')}</h4>
            <div className="prose max-w-none">
              <div className="text-gray-700 whitespace-pre-wrap break-words">
                {post.content}
              </div>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-3 gap-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 text-red-500 mb-1">
                <Heart className="w-5 h-5" />
                <span className="text-2xl font-bold text-gray-900">{post.likes_count}</span>
              </div>
              <div className="text-sm text-gray-500">{t('admin.content.likes')}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 text-blue-500 mb-1">
                <MessageSquare className="w-5 h-5" />
                <span className="text-2xl font-bold text-gray-900">{post.comments_count}</span>
              </div>
              <div className="text-sm text-gray-500">{t('admin.content.comments')}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 text-green-500 mb-1">
                <Eye className="w-5 h-5" />
                <span className="text-2xl font-bold text-gray-900">{post.views_count}</span>
              </div>
              <div className="text-sm text-gray-500">{t('admin.content.views')}</div>
            </div>
          </div>
        </div>

        {/* 操作栏 */}
        <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onDelete}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t('admin.content.delete')}</span>
          </button>

          <div className="flex space-x-3">
            {post.status === 'pending' && (
              <>
                <button
                  onClick={() => onUpdateStatus('rejected')}
                  className="flex items-center space-x-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>{t('admin.content.reject')}</span>
                </button>
                <button
                  onClick={() => onUpdateStatus('published')}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>{t('admin.content.approve')}</span>
                </button>
              </>
            )}

            {post.status === 'rejected' && (
              <button
                onClick={() => onUpdateStatus('published')}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>{t('admin.content.approve')}</span>
              </button>
            )}

            {post.status === 'published' && (
              <button
                onClick={() => onUpdateStatus('rejected')}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>{t('admin.content.reject')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContentPreview
