import MediaGrid from '../MediaGrid'
import type { Post, MediaFile } from '../../types'

interface PostContentProps {
  post: Post
}

const PostContent = ({ post }: PostContentProps) => {
  // 获取媒体文件列表
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
        thumbnail_url: post.thumbnail,
        display_order: post.image_url ? 1 : 0,
        created_at: post.created_at
      })
    }
    
    return mediaFiles
  }

  return (
    <>
      {/* 帖子内容 */}
      <div className="mb-8">
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
            {post.content}
          </p>
        </div>
      </div>

      {/* 帖子媒体内容 */}
      {(() => {
        const mediaFiles = getMediaFiles(post)
        return mediaFiles.length > 0 && (
          <div className="mb-8">
            <MediaGrid mediaFiles={mediaFiles} />
          </div>
        )
      })()}
    </>
  )
}

export default PostContent
