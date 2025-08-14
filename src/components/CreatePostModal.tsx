import { useState } from 'react'
import { X, Image, Hash, Send } from 'lucide-react'
import { cn } from '../lib/utils'
import { useAuth } from '../contexts/AuthContext'
import { socialService } from '../lib/socialService'

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  onPostCreated?: () => void
}

const CreatePostModal = ({ isOpen, onClose, onPostCreated }: CreatePostModalProps) => {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      alert('请先登录')
      return
    }
    if (!title.trim() || !content.trim()) {
      alert('请填写标题和内容')
      return
    }

    setIsSubmitting(true)
    try {
      const postData = {
        title: title.trim(),
        content: content.trim(),
        user_id: user.id,
        image_url: imageUrl.trim() || undefined,
        category: 'general',
        shares_count: 0
      }

      await socialService.createPost(postData)
      
      // 重置表单
      setTitle('')
      setContent('')
      setTags('')
      setImageUrl('')
      
      onPostCreated?.()
      onClose()
      alert('发布成功！')
    } catch (error) {
      console.error('发布帖子失败:', error)
      alert('发布失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (title || content || tags || imageUrl) {
      if (confirm('确定要关闭吗？未保存的内容将丢失。')) {
        setTitle('')
        setContent('')
        setTags('')
        setImageUrl('')
        onClose()
      }
    } else {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">发布新帖子</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* 标题输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                标题 *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="输入帖子标题..."
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isSubmitting}
                maxLength={100}
              />
              <div className="text-right text-xs text-gray-400 mt-1">
                {title.length}/100
              </div>
            </div>

            {/* 内容输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                内容 *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="分享你的想法..."
                className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={6}
                disabled={isSubmitting}
                maxLength={1000}
              />
              <div className="text-right text-xs text-gray-400 mt-1">
                {content.length}/1000
              </div>
            </div>

            {/* 图片URL输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Image className="w-4 h-4 inline mr-1" />
                图片链接（可选）
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isSubmitting}
              />
              {imageUrl && (
                <div className="mt-2">
                  <img
                    src={imageUrl}
                    alt="预览"
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>

            {/* 标签输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Hash className="w-4 h-4 inline mr-1" />
                标签（可选）
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="用逗号分隔多个标签，如：科技,生活,分享"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isSubmitting}
              />
              {tags && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.split(',').map((tag, index) => {
                    const trimmedTag = tag.trim()
                    if (!trimmedTag) return null
                    return (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                      >
                        #{trimmedTag}
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="border-t border-gray-100 p-6">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isSubmitting}
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!title.trim() || !content.trim() || isSubmitting}
                className={cn(
                  'flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all duration-200',
                  title.trim() && content.trim() && !isSubmitting
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                )}
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? '发布中...' : '发布'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePostModal