import { MessageCircle, Send } from 'lucide-react'
import { getUserDefaultAvatarUrl } from '../../utils/avatarGenerator'
import type { User, UserProfile } from '../../types'

interface CommentInputProps {
  user: UserProfile | null
  userProfile: UserProfile | null
  newComment: string
  setNewComment: (comment: string) => void
  isSubmittingComment: boolean
  onSubmit: (e: React.FormEvent) => void
  onLoginClick: () => void
  t: (key: string) => string
}

const CommentInput = ({ 
  user, 
  userProfile, 
  newComment, 
  setNewComment, 
  isSubmittingComment, 
  onSubmit, 
  onLoginClick, 
  t 
}: CommentInputProps) => {
  if (user) {
    return (
      <form onSubmit={onSubmit} className="mb-6">
        <div className="flex space-x-4">
          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
            {userProfile?.avatar_url || user?.avatar_url ? (
              <img
                src={userProfile?.avatar_url || user?.avatar_url}
                alt={userProfile?.username || user?.username || ''}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <img
                src={getUserDefaultAvatarUrl(userProfile?.username || user?.username || '')}
                alt={userProfile?.username || user?.username || ''}
                className="w-full h-full rounded-full object-cover"
              />
            )}
          </div>
          <div className="flex-1">
            <div className="relative">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={t('posts.comments.placeholder')}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-gray-700 placeholder-gray-500"
                rows={3}
                disabled={isSubmittingComment}
                maxLength={500}
              />
              <div className="absolute bottom-3 right-3">
                <div className="text-xs text-gray-400">
                  {newComment.length}/500
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmittingComment}
                className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                  newComment.trim() && !isSubmittingComment
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmittingComment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t('common.actions.loading')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('posts.comments.submit')}</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    )
  }

  return (
    <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-200 mb-6">
      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
        <MessageCircle className="w-6 h-6 text-white" />
      </div>
      <p className="text-gray-600 mb-3">{t('posts.card.loginRequired')}</p>
      <button
        onClick={onLoginClick}
        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
      >
        {t('common.actions.login')}
      </button>
    </div>
  )
}

export default CommentInput
