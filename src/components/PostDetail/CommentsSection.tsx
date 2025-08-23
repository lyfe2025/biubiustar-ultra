import { MessageCircle } from 'lucide-react'
import { headingStyles } from '../../utils/cn'
import CommentInput from './CommentInput'
import CommentList from './CommentList'
import type { Comment, User, UserProfile } from '../../types'

interface CommentsSectionProps {
  comments: Comment[]
  commentsLoading: boolean
  user: UserProfile | null
  userProfile: UserProfile | null
  newComment: string
  setNewComment: (comment: string) => void
  isSubmittingComment: boolean
  onSubmitComment: (e: React.FormEvent) => void
  onDeleteComment: (commentId: string, commentContent: string) => void
  onLoginClick: () => void
  t: (key: string) => string
}

const CommentsSection = ({
  comments,
  commentsLoading,
  user,
  userProfile,
  newComment,
  setNewComment,
  isSubmittingComment,
  onSubmitComment,
  onDeleteComment,
  onLoginClick,
  t
}: CommentsSectionProps) => {
  return (
    <div id="comments-section" className="mt-8">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <h3 className={headingStyles.h3}>
            {t('posts.comments.title')} ({comments.length})
          </h3>
        </div>

        <CommentInput
          user={user}
          userProfile={userProfile}
          newComment={newComment}
          setNewComment={setNewComment}
          isSubmittingComment={isSubmittingComment}
          onSubmit={onSubmitComment}
          onLoginClick={onLoginClick}
          t={t}
        />

        <CommentList
          comments={comments}
          commentsLoading={commentsLoading}
          user={user}
          language={'zh'}
          onDeleteComment={onDeleteComment}
          t={t}
        />
      </div>
    </div>
  )
}

export default CommentsSection
