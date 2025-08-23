import PostHeader from './PostHeader'
import PostContent from './PostContent'
import PostActions from './PostActions'
import type { Post, ContentCategory } from '../../types'

interface PostCardProps {
  post: Post
  categoryDisplayName: string
  language: string
  isLiked: boolean
  likesCount: number
  commentsCount: number
  isLoading: boolean
  onLike: () => void
  onComment: () => void
  t: (key: string) => string
}

const PostCard = ({
  post,
  categoryDisplayName,
  language,
  isLiked,
  likesCount,
  commentsCount,
  isLoading,
  onLike,
  onComment,
  t
}: PostCardProps) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 p-8">
      <PostHeader
        post={post}
        categoryDisplayName={categoryDisplayName}
        language={language}
        t={t}
      />
      
      <PostContent post={post} />
      
      <PostActions
        post={post}
        isLiked={isLiked}
        likesCount={likesCount}
        commentsCount={commentsCount}
        isLoading={isLoading}
        onLike={onLike}
        onComment={onComment}
        t={t}
      />
    </div>
  )
}

export default PostCard
