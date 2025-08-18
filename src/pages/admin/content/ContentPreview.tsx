import React from 'react'
import { X, Check, Trash2, Calendar, User, Heart, MessageSquare, Eye, Image, Video } from 'lucide-react'
import { useLanguage } from '../../../contexts/language'
import { ContentPreviewProps, Post } from './types'

const ContentPreview: React.FC<ContentPreviewProps> = ({
  post,
  isOpen,
  onClose,
  onUpdateStatus,
  onDelete
}) => {
  const { t } = useLanguage()

  if (!isOpen || !post) return null

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
              <img className="h-12 w-12 rounded-full" src={post.author.avatar_url} alt="" />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                <User className="h-6 w-6 text-gray-600" />
              </div>
            )}
            <div>
              <div className="text-sm font-medium text-gray-900">{post.author.username}</div>
              <div className="text-sm text-gray-500">{t('admin.content.author')}</div>
            </div>
          </div>

          {/* 媒体内容 */}
          {(post.image_url || post.video) && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                {post.video ? <Video className="w-4 h-4" /> : <Image className="w-4 h-4" />}
                <span>{post.video ? t('admin.content.video') : t('admin.content.image')}</span>
              </h4>
              {post.video ? (
                <video 
                  src={post.video} 
                  controls 
                  className="w-full max-h-96 rounded-lg"
                  poster={post.image_url}
                />
              ) : post.image_url && (
                <img 
                  src={post.image_url} 
                  alt="内容图片" 
                  className="w-full max-h-96 object-contain rounded-lg"
                />
              )}
            </div>
          )}

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
                <span className="text-2xl font-bold text-gray-900">{post.likes_count}</span>
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
