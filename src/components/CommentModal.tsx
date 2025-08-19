import { useState, useEffect } from 'react'
import { X, Send, Trash2, User } from 'lucide-react'
import { cn } from '../lib/utils'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/language'
import { socialService } from '../lib/socialService'
import type { Comment } from '../types'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { toast } from 'sonner'

interface CommentModalProps {
  isOpen: boolean
  onClose: () => void
  postId: string
  postTitle: string
}

const CommentModal = ({ isOpen, onClose, postId, postTitle }: CommentModalProps) => {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadComments = async () => {
    setIsLoading(true)
    try {
      const commentsData = await socialService.getPostComments(postId)
      setComments(commentsData)
    } catch (error) {
      console.error('加载评论失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && postId) {
      loadComments()
    }
  }, [isOpen, postId, loadComments])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('请先登录')
      return
    }
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      const comment = await socialService.addComment({
        post_id: postId,
        user_id: user.id,
        content: newComment.trim()
      })
      setComments(prev => [comment, ...prev])
      setNewComment('')
    } catch (error) {
      console.error('发表评论失败:', error)
      toast.error('发表评论失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return
    if (!window.confirm('确定要删除这条评论吗？')) return

    try {
      await socialService.deleteComment(commentId, user.id)
      setComments(prev => prev.filter(comment => comment.id !== commentId))
    } catch (error) {
      console.error('删除评论失败:', error)
      toast.error('删除评论失败，请重试')
    }
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{t('posts.comments.title')}</h2>
            <p className="text-sm text-gray-500 mt-1 truncate">{postTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 评论列表 */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">{t('posts.comments.noComments')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    {comment.author?.avatar_url ? (
                      <img
                        src={comment.author.avatar_url}
                        alt={comment.author.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-gray-900">
                          {comment.author?.username || t('posts.card.anonymousUser')}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {formatDate(comment.created_at)}
                          </span>
                          {user && comment.author?.id === user.id && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="p-1 hover:bg-red-100 rounded text-red-500 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 评论输入框 */}
        <div className="border-t border-gray-100 p-6">
          {user ? (
            <form onSubmit={handleSubmitComment} className="flex space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt={user.user_metadata?.username || user.email}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={t('posts.comments.placeholder')}
                  className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  disabled={isSubmitting}
                />
                <div className="flex justify-end mt-3">
                  <button
                    type="submit"
                    disabled={!newComment.trim() || isSubmitting}
                    className={cn(
                      'flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200',
                      newComment.trim() && !isSubmitting
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    )}
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? t('common.actions.loading') : t('posts.comments.submit')}</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-3">{t('posts.card.loginRequired')}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {t('common.actions.login')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CommentModal