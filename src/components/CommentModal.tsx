import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Send, Trash2, User } from 'lucide-react'
import { cn } from '../lib/utils'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/language'
import { socialService } from '../lib/socialService'
import type { Comment } from '../types'
import { formatDistanceToNow } from 'date-fns'
import { zhCN, enUS, vi } from 'date-fns/locale'
import { toast } from 'sonner'
import { generateDefaultAvatarUrl, getUserDefaultAvatarUrl } from '../utils/avatarGenerator'
import DeleteConfirmModal from './DeleteConfirmModal'

interface CommentModalProps {
  isOpen: boolean
  onClose: () => void
  postId: string
  postTitle: string
  onCommentSuccess?: (postId: string) => void // 新增：评论成功回调
}

const CommentModal = ({ isOpen, onClose, postId, postTitle, onCommentSuccess }: CommentModalProps) => {
  const { user, userProfile } = useAuth()
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string>('')
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    commentId: string | null
    commentContent: string
  }>({
    isOpen: false,
    commentId: null,
    commentContent: ''
  })

  // 评论字数限制
  const MAX_COMMENT_LENGTH = 500
  const commentLength = newComment.length
  const isCommentTooLong = commentLength > MAX_COMMENT_LENGTH

  const loadComments = useCallback(async () => {
    setIsLoading(true)
    
    // 添加超时处理
    const timeoutId = setTimeout(() => {
      setIsLoading(false)
      toast.error(t('posts.comments.loadTimeout'))
    }, 10000) // 10秒超时
    
    try {
      const commentsData = await socialService.getPostComments(postId)
      clearTimeout(timeoutId)
      setComments(commentsData)
      console.log(`成功加载 ${commentsData.length} 条评论`)
    } catch (error) {
      clearTimeout(timeoutId)
      console.error('加载评论失败:', error)
      toast.error(t('posts.comments.loadError'))
    } finally {
      setIsLoading(false)
    }
  }, [postId, t])

  const handleRequireAuth = (type: 'login' | 'register' = 'login') => {
    // 不关闭评论窗口，而是传递登录成功后的回调
    const onLoginSuccess = () => {
      // 登录成功后，评论模态框保持打开状态
      // 用户现在可以进行评论了
      console.log('登录成功，评论模态框保持打开状态')
    }
    
    // 触发全局认证模态框，传递登录成功回调
    window.dispatchEvent(new CustomEvent('openAuthModal', { 
      detail: { type, onLoginSuccess } 
    }))
  }

  const handleClose = useCallback(() => {
    console.log('关闭评论模态框')
    setComments([])
    setNewComment('')
    setIsLoading(false)
    setIsSubmitting(false)
    onClose()
  }, [onClose])

  useEffect(() => {
    if (isOpen && postId) {
      console.log('打开评论模态框，帖子ID:', postId)
      loadComments()
    } else if (!isOpen) {
      console.log('关闭评论模态框，清理状态')
      // 关闭时清理状态
      setComments([])
      setNewComment('')
      setIsLoading(false)
      setIsSubmitting(false)
    }
  }, [isOpen, postId, loadComments])

  // 添加键盘 ESC 键关闭功能
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // 禁止背景滚动
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      // 恢复背景滚动
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, handleClose])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    
    if (!user || !userProfile) {
      const errorMsg = t('auth.loginRequired')
      setSubmitError(errorMsg)
      toast.error(errorMsg)
      return
    }
    
    if (!newComment.trim()) {
      const errorMsg = t('posts.comments.emptyError')
      setSubmitError(errorMsg)
      return
    }
    
    if (isCommentTooLong) {
      const errorMsg = t('posts.comments.tooLongError').replace('{max}', MAX_COMMENT_LENGTH.toString())
      setSubmitError(errorMsg)
      return
    }

    setIsSubmitting(true)
    try {
      const comment = await socialService.addComment({
        post_id: postId,
        user_id: user.id,
        content: newComment.trim()
      })
      
      // 确保新评论包含正确的author信息
      const commentWithAuthor = {
        ...comment,
        author: {
          id: user.id,
          username: userProfile.username,
          full_name: userProfile.full_name,
          avatar_url: userProfile.avatar_url
        }
      }
      
      setComments(prev => [commentWithAuthor, ...prev])
      setNewComment('')
      setSubmitError('')
      toast.success(t('posts.comments.success'))
      
      // 通知父组件评论成功，更新帖子状态
      if (onCommentSuccess) {
        console.log(`📝 评论成功，通知父组件更新帖子 ${postId} 的状态`)
        onCommentSuccess(postId)
      } else {
        console.log(`⚠️ 评论成功，但父组件未提供 onCommentSuccess 回调`)
      }
    } catch (error: any) {
      console.error('评论失败:', error)
      let errorMsg = t('posts.comments.error')
      
      // 根据错误类型提供更具体的错误信息
      if (error?.message) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMsg = t('posts.comments.networkError')
        } else if (error.message.includes('unauthorized') || error.message.includes('401')) {
          errorMsg = t('posts.comments.authError')
        } else if (error.message.includes('forbidden') || error.message.includes('403')) {
          errorMsg = t('posts.comments.permissionError')
        } else if (error.message.includes('too long') || error.message.includes('length')) {
          errorMsg = t('posts.comments.tooLongError').replace('{max}', MAX_COMMENT_LENGTH.toString())
        } else {
          errorMsg = `${t('posts.comments.error')}: ${error.message}`
        }
      }
      
      setSubmitError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = (commentId: string, commentContent: string) => {
    if (!user) return
    setDeleteModal({
      isOpen: true,
      commentId,
      commentContent: commentContent.length > 50 ? commentContent.slice(0, 50) + '...' : commentContent
    })
  }

  const confirmDeleteComment = async () => {
    if (!deleteModal.commentId || !user) return
    
    try {
      await socialService.deleteComment(deleteModal.commentId, user.id)
      setComments(prev => prev.filter(comment => comment.id !== deleteModal.commentId))
      setDeleteModal({ isOpen: false, commentId: null, commentContent: '' })
      toast.success(t('posts.comments.deleteSuccess'))
    } catch (error) {
      console.error('删除评论失败:', error)
      toast.error(t('posts.comments.deleteError'))
    }
  }

  const formatDate = (dateString: string) => {
    try {
      // 根据当前语言选择对应的 locale
      let locale
      switch (language) {
        case 'zh':
          locale = zhCN
          break
        case 'zh-TW':
          locale = zhCN // 繁体中文使用相同的 locale
          break
        case 'en':
          locale = enUS
          break
        case 'vi':
          locale = vi
          break
        default:
          locale = zhCN
      }

      const result = formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: locale
      })

      // 如果当前语言不是英文，需要手动翻译后缀
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* 背景点击关闭 */}
      <div 
        className="absolute inset-0"
        onClick={handleClose}
      />
      
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col relative z-10">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{t('posts.comments.title')}</h2>
            <div className="text-sm text-gray-500 mt-1">
              {postTitle.length <= 35 ? (
                <p>{postTitle}</p>
              ) : (
                <div>
                  <p className="truncate max-w-xs">{postTitle.slice(0, 35)}...</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/post/${postId}`)
                    }}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium mt-1 transition-colors duration-200"
                  >
                    {t('posts.card.readMore')}
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* 关闭按钮 */}
            <button
              onClick={handleClose}
              className="p-3 hover:bg-red-50 hover:text-red-600 rounded-full transition-all duration-200 group border border-gray-200 hover:border-red-300"
              title="关闭评论窗口 (ESC)"
            >
              <X className="w-5 h-5 group-hover:scale-110" />
            </button>
          </div>
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
                      <img
                        src={getUserDefaultAvatarUrl(comment.author?.username || 'User', comment.author?.avatar_url)}
                        alt={comment.author?.username || 'User'}
                        className="w-full h-full rounded-full"
                      />
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
                              onClick={() => handleDeleteComment(comment.id, comment.content)}
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
                {userProfile?.avatar_url ? (
                  <img
                    src={userProfile.avatar_url}
                    alt={userProfile.username || user.email}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <img
                    src={getUserDefaultAvatarUrl(userProfile?.username || user.email?.split('@')[0] || 'User', userProfile?.avatar_url)}
                    alt={userProfile?.username || user.email}
                    className="w-full h-full rounded-full"
                  />
                )}
              </div>
              <div className="flex-1">
                <div className="relative">
                  <textarea
                    value={newComment}
                    onChange={(e) => {
                      setNewComment(e.target.value)
                      setSubmitError('') // 清除错误信息当用户开始输入
                    }}
                    placeholder={t('posts.comments.placeholder')}
                    className={cn(
                      "w-full p-3 border rounded-lg resize-none focus:ring-2 focus:border-transparent",
                      isCommentTooLong
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-200 focus:ring-purple-500"
                    )}
                    rows={3}
                    disabled={isSubmitting}
                    maxLength={MAX_COMMENT_LENGTH + 50} // 允许超出一点以显示错误
                  />
                  {/* 字数统计 */}
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white px-1 rounded">
                    <span className={cn(
                      commentLength > MAX_COMMENT_LENGTH * 0.9 ? "text-orange-500" : "text-gray-400",
                      isCommentTooLong ? "text-red-500 font-medium" : ""
                    )}>
                      {commentLength}
                    </span>
                    <span className="text-gray-300">/{MAX_COMMENT_LENGTH}</span>
                  </div>
                </div>
                
                {/* 错误提示 */}
                {submitError && (
                  <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                    {submitError}
                  </div>
                )}
                
                {/* 字数超限提示 */}
                {isCommentTooLong && (
                  <div className="mt-2 text-sm text-red-600">
                    {t('posts.comments.tooLongWarning').replace('{max}', MAX_COMMENT_LENGTH.toString())}
                  </div>
                )}
                
                <div className="flex justify-between items-center mt-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={!newComment.trim() || isSubmitting || isCommentTooLong}
                    className={cn(
                      'flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200',
                      newComment.trim() && !isSubmitting && !isCommentTooLong
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
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={() => handleRequireAuth('login')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {t('common.actions.login')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 删除确认弹窗 */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, commentId: null, commentContent: '' })}
        onConfirm={confirmDeleteComment}
        title={t('posts.comments.deleteConfirmTitle')}
        message={t('posts.comments.deleteConfirm')}
        itemName={deleteModal.commentContent}
        loading={isSubmitting}
        confirmText={t('posts.comments.delete')}
        cancelText={t('common.cancel')}
      />
    </div>
  )
}

export default CommentModal